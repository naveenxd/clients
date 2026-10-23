import {
  BehaviorSubject,
  EmptyError,
  filter,
  firstValueFrom,
  fromEvent,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
  take,
  takeUntil,
  throwError,
} from "rxjs";

import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { UserRequestedFallbackAbortReason } from "@bitwarden/common/platform/abstractions/fido2/fido2-client.service.abstraction";
import {
  Fido2UserInterfaceService as Fido2UserInterfaceServiceAbstraction,
  Fido2UserInterfaceSession,
  NewCredentialParams,
  PickCredentialParams,
} from "@bitwarden/common/platform/abstractions/fido2/fido2-user-interface.service.abstraction";
import { Utils } from "@bitwarden/common/platform/misc/utils";

import { BrowserApi } from "../../../platform/browser/browser-api";
import { fromChromeEvent } from "../../../platform/browser/from-chrome-event";
import { PanelFrameTrustService } from "../../../platform/services/panel-frame-trust.service";
// FIXME (PM-22628): Popup imports are forbidden in background
// eslint-disable-next-line no-restricted-imports
import { closeFido2Popout, openFido2Popout } from "../../../vault/popup/utils/vault-popout-window";
import { Fido2PanelCommand } from "../enums/fido2-panel-command.enum";

const BrowserFido2MessageName = "BrowserFido2UserInterfaceServiceMessage";
const PanelConnectionTimeout = 5000;

export const BrowserFido2MessageTypes = {
  ConnectResponse: "ConnectResponse",
  NewSessionCreatedRequest: "NewSessionCreatedRequest",
  PickCredentialRequest: "PickCredentialRequest",
  PickCredentialResponse: "PickCredentialResponse",
  ConfirmNewCredentialRequest: "ConfirmNewCredentialRequest",
  ConfirmNewCredentialResponse: "ConfirmNewCredentialResponse",
  InformExcludedCredentialRequest: "InformExcludedCredentialRequest",
  InformCredentialNotFoundRequest: "InformCredentialNotFoundRequest",
  AbortRequest: "AbortRequest",
  AbortResponse: "AbortResponse",
} as const;

export type BrowserFido2MessageTypeValue =
  (typeof BrowserFido2MessageTypes)[keyof typeof BrowserFido2MessageTypes];

export class SessionClosedError extends Error {
  constructor() {
    super("Fido2UserInterfaceSession was closed");
  }
}

export type BrowserFido2Message = { sessionId: string } & (
  | /**
     * This message is used by popouts to announce that they are ready
     * to receive messages.
     **/ {
      type: typeof BrowserFido2MessageTypes.ConnectResponse;
    }
    /**
     * This message is used to announce the creation of a new session.
     * It is used by popouts to know when to close.
     **/
  | {
      type: typeof BrowserFido2MessageTypes.NewSessionCreatedRequest;
    }
  | {
      type: typeof BrowserFido2MessageTypes.PickCredentialRequest;
      cipherIds: string[];
      userVerification: boolean;
      fallbackSupported: boolean;
    }
  | {
      type: typeof BrowserFido2MessageTypes.PickCredentialResponse;
      cipherId: string;
      userVerified: boolean;
    }
  | {
      type: typeof BrowserFido2MessageTypes.ConfirmNewCredentialRequest;
      credentialName: string;
      userName: string;
      userHandle: string;
      userVerification: boolean;
      fallbackSupported: boolean;
      rpId: string;
    }
  | {
      type: typeof BrowserFido2MessageTypes.ConfirmNewCredentialResponse;
      cipherId: string;
      userVerified: boolean;
    }
  | {
      type: typeof BrowserFido2MessageTypes.InformExcludedCredentialRequest;
      existingCipherIds: string[];
      fallbackSupported: boolean;
    }
  | {
      type: typeof BrowserFido2MessageTypes.InformCredentialNotFoundRequest;
      fallbackSupported: boolean;
    }
  | {
      type: typeof BrowserFido2MessageTypes.AbortRequest;
    }
  | {
      type: typeof BrowserFido2MessageTypes.AbortResponse;
      fallbackRequested: boolean;
    }
);

export type BrowserFido2ParentWindowReference = chrome.tabs.Tab;

/**
 * Browser implementation of the {@link Fido2UserInterfaceService}.
 * The user interface is implemented as a popout and the service uses the browser's messaging API to communicate with it.
 */
export class BrowserFido2UserInterfaceService implements Fido2UserInterfaceServiceAbstraction<BrowserFido2ParentWindowReference> {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private panelFrameTrustService: PanelFrameTrustService,
  ) {}

  async newSession(
    fallbackSupported: boolean,
    tab: chrome.tabs.Tab,
    abortController?: AbortController,
  ): Promise<Fido2UserInterfaceSession> {
    return await BrowserFido2UserInterfaceSession.create(
      this.authService,
      fallbackSupported,
      tab,
      abortController,
      await this.useInPagePanel(),
      this.panelFrameTrustService,
    );
  }

  /**
   * The in-page passkey panel is a Firefox-only treatment. Other browsers keep the
   * existing popout so this feature cannot affect their FIDO2 flows.
   */
  private async useInPagePanel(): Promise<boolean> {
    if (!BrowserApi.isFirefox || BrowserApi.isFirefoxOnAndroid) {
      return false;
    }

    return await this.configService.getFeatureFlag(FeatureFlag.FirefoxTopRightPanels);
  }
}

export class BrowserFido2UserInterfaceSession implements Fido2UserInterfaceSession {
  static async create(
    authService: AuthService,
    fallbackSupported: boolean,
    tab: chrome.tabs.Tab,
    abortController?: AbortController,
    panelSupported = false,
    panelFrameTrustService?: PanelFrameTrustService,
  ): Promise<BrowserFido2UserInterfaceSession> {
    return new BrowserFido2UserInterfaceSession(
      authService,
      fallbackSupported,
      tab,
      abortController,
      undefined,
      panelSupported,
      panelFrameTrustService,
    );
  }

  static sendMessage(msg: BrowserFido2Message) {
    void BrowserApi.sendMessage(BrowserFido2MessageName, msg);
  }

  static abortPopout(sessionId: string, fallbackRequested = false) {
    this.sendMessage({
      sessionId: sessionId,
      type: BrowserFido2MessageTypes.AbortResponse,
      fallbackRequested: fallbackRequested,
    });
  }

  static confirmNewCredentialResponse(sessionId: string, cipherId: string, userVerified: boolean) {
    this.sendMessage({
      sessionId: sessionId,
      type: BrowserFido2MessageTypes.ConfirmNewCredentialResponse,
      cipherId,
      userVerified,
    });
  }

  private closed = false;
  private panelIsOpen = false;
  private messages$ = (BrowserApi.messageListener$() as Observable<BrowserFido2Message>).pipe(
    filter((msg) => msg.sessionId === this.sessionId),
  );
  private connected$ = new BehaviorSubject(false);
  private windowClosed$: Observable<number>;
  private destroy$ = new Subject<void>();

  private constructor(
    private readonly authService: AuthService,
    private readonly fallbackSupported: boolean,
    private readonly tab: chrome.tabs.Tab,
    readonly abortController = new AbortController(),
    readonly sessionId = Utils.newGuid(),
    private readonly panelSupported = false,
    private readonly panelFrameTrustService?: PanelFrameTrustService,
  ) {
    this.messages$
      .pipe(
        filter((msg) => msg.type === BrowserFido2MessageTypes.ConnectResponse),
        take(1),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.connected$.next(true);
      });

    // Handle session aborted by RP
    fromEvent(abortController.signal, "abort")
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        void this.close();
        BrowserFido2UserInterfaceSession.sendMessage({
          type: BrowserFido2MessageTypes.AbortRequest,
          sessionId: this.sessionId,
        });
      });

    // Handle session aborted by user
    this.messages$
      .pipe(
        filter((msg) => msg.type === BrowserFido2MessageTypes.AbortResponse),
        take(1),
        takeUntil(this.destroy$),
      )
      .subscribe((msg) => {
        if (msg.type === BrowserFido2MessageTypes.AbortResponse) {
          void this.close();
          void this.abort(msg.fallbackRequested);
        }
      });

    this.windowClosed$ = fromChromeEvent(chrome.windows.onRemoved).pipe(
      map(([windowId]) => windowId),
    );

    BrowserFido2UserInterfaceSession.sendMessage({
      type: BrowserFido2MessageTypes.NewSessionCreatedRequest,
      sessionId,
    });
  }

  async pickCredential({
    cipherIds,
    userVerification,
    assumeUserPresence,
    masterPasswordRepromptRequired,
  }: PickCredentialParams): Promise<{ cipherId: string; userVerified: boolean }> {
    // NOTE: For now, we are defaulting to a userVerified status of `true` when the request
    // is for a conditionally mediated authentication. This will allow for mediated conditional
    // authentication to function without requiring user interaction. This is a product
    // decision, rather than a decision based on the expected technical specifications.
    if (assumeUserPresence && cipherIds.length === 1 && !masterPasswordRepromptRequired) {
      return { cipherId: cipherIds[0], userVerified: userVerification };
    }

    const data: BrowserFido2Message = {
      type: BrowserFido2MessageTypes.PickCredentialRequest,
      cipherIds,
      sessionId: this.sessionId,
      userVerification,
      fallbackSupported: this.fallbackSupported,
    };

    await this.send(data);
    const response = await this.receive(BrowserFido2MessageTypes.PickCredentialResponse);

    return { cipherId: response.cipherId, userVerified: response.userVerified };
  }

  async confirmNewCredential({
    credentialName,
    userName,
    userHandle,
    userVerification,
    rpId,
  }: NewCredentialParams): Promise<{ cipherId: string; userVerified: boolean }> {
    const data: BrowserFido2Message = {
      type: BrowserFido2MessageTypes.ConfirmNewCredentialRequest,
      sessionId: this.sessionId,
      credentialName,
      userName,
      userHandle,
      userVerification,
      fallbackSupported: this.fallbackSupported,
      rpId,
    };

    await this.send(data);
    const response = await this.receive(BrowserFido2MessageTypes.ConfirmNewCredentialResponse);

    return { cipherId: response.cipherId, userVerified: response.userVerified };
  }

  async informExcludedCredential(existingCipherIds: string[]): Promise<void> {
    const data: BrowserFido2Message = {
      type: BrowserFido2MessageTypes.InformExcludedCredentialRequest,
      sessionId: this.sessionId,
      existingCipherIds,
      fallbackSupported: this.fallbackSupported,
    };

    await this.send(data);
    await this.receive(BrowserFido2MessageTypes.AbortResponse);
  }

  async ensureUnlockedVault(): Promise<void> {
    if ((await this.authService.getAuthStatus()) !== AuthenticationStatus.Unlocked) {
      await this.connect();
    }
  }

  async informCredentialNotFound(): Promise<void> {
    const data: BrowserFido2Message = {
      type: BrowserFido2MessageTypes.InformCredentialNotFoundRequest,
      sessionId: this.sessionId,
      fallbackSupported: this.fallbackSupported,
    };

    await this.send(data);
    await this.receive(BrowserFido2MessageTypes.AbortResponse);
  }

  async close() {
    if (this.panelIsOpen) {
      this.panelIsOpen = false;
      await this.closePanel();
    }
    this.panelFrameTrustService?.revokeSession(this.sessionId);
    await closeFido2Popout(this.sessionId);
    this.closed = true;
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async abort(fallback = false) {
    this.abortController.abort(fallback ? UserRequestedFallbackAbortReason : undefined);
  }

  private async send(msg: BrowserFido2Message): Promise<void> {
    if (!this.connected$.value) {
      await this.connect();
    }

    this.sendToUserInterface(msg);
  }

  /**
   * Delivers a message to the user interface that hosts the session. Runtime broadcasts
   * do not reach extension frames embedded into web pages, so an open panel is addressed
   * through its frame directly.
   */
  private sendToUserInterface(msg: BrowserFido2Message): void {
    const panelFrame = this.panelIsOpen
      ? this.panelFrameTrustService?.getPanelFrame(this.sessionId)
      : undefined;

    if (panelFrame) {
      void BrowserApi.tabSendMessage(this.tab, msg, { frameId: panelFrame.frameId });
      return;
    }

    BrowserFido2UserInterfaceSession.sendMessage(msg);
  }

  private async receive<T extends BrowserFido2Message["type"]>(
    type: T,
  ): Promise<BrowserFido2Message & { type: T }> {
    try {
      const response = await firstValueFrom(
        this.messages$.pipe(
          filter((msg) => msg.sessionId === this.sessionId && msg.type === type),
          takeUntil(this.destroy$),
        ),
      );
      return response as BrowserFido2Message & { type: T };
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new SessionClosedError();
      }
      throw error;
    }
  }

  private async connect(): Promise<void> {
    if (this.closed) {
      throw new Error("Cannot re-open closed session");
    }

    const connectPromise = firstValueFrom(
      merge(
        this.connected$.pipe(filter((connected) => connected === true)),
        fromEvent(this.abortController.signal, "abort").pipe(
          switchMap(() => throwError(() => new SessionClosedError())),
        ),
      ),
    );

    // Defensive measure in case an existing notification appeared before the passkey panel
    await BrowserApi.tabSendMessageData(this.tab, "closeNotificationBar");

    if (this.panelSupported) {
      const panelOpened = await this.openPanel();
      if (panelOpened) {
        this.panelIsOpen = true;
        if (await this.waitForPanelConnection(connectPromise)) {
          return;
        }

        this.panelIsOpen = false;
        await this.closePanel();
      }
    }

    const popoutId = await openFido2Popout(this.tab, {
      sessionId: this.sessionId,
      fallbackSupported: this.fallbackSupported,
    });

    this.windowClosed$
      .pipe(
        filter((windowId) => {
          return popoutId === windowId;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        void this.close();
        void this.abort(true);
      });

    await connectPromise;
  }

  /**
   * Asks the content script to host the passkey UI in the in-page panel. Returns
   * false when the page has no content script, in which case the caller falls
   * back to the existing popout window.
   */
  private async openPanel(): Promise<boolean> {
    if (this.tab.id == null) {
      // Without a tab id the panel cannot be bound to this session, so it cannot
      // be trusted with background state. Use the popout instead.
      return false;
    }

    try {
      const response = await BrowserApi.tabSendMessage<
        Record<string, unknown>,
        { opened?: boolean }
      >(
        this.tab,
        {
          command: Fido2PanelCommand.Open,
          sessionId: this.sessionId,
          fallbackSupported: this.fallbackSupported,
          senderTabId: this.tab.id,
          senderUrl: this.tab.url,
          panelNonce: this.panelFrameTrustService?.createNonce(this.tab.id, this.sessionId),
        },
        { frameId: 0 },
        true,
      );

      return response?.opened === true;
    } catch {
      return false;
    }
  }

  /**
   * Waits for the panel iframe to connect back to the background. If it does not
   * connect in time the panel is treated as failed and the popout fallback runs.
   */
  private async waitForPanelConnection(connectPromise: Promise<unknown>): Promise<boolean> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<boolean>((resolve) => {
      timeoutId = setTimeout(() => resolve(false), PanelConnectionTimeout);
    });

    try {
      return await Promise.race([connectPromise.then(() => true), timeoutPromise]);
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }

  private async closePanel(): Promise<void> {
    if (!this.panelSupported) {
      return;
    }

    await BrowserApi.tabSendMessage(
      this.tab,
      {
        command: Fido2PanelCommand.Close,
        sessionId: this.sessionId,
      },
      { frameId: 0 },
    ).catch(() => {
      // The tab may have navigated or closed; there is nothing left to clean up.
    });
  }
}
