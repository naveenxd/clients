import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

import { BrowserApi } from "../browser/browser-api";
import {
  PanelFrameMessageCommand,
  PanelFrameNonceParam,
} from "../browser/panel-frame-message.enum";

type PanelFrameNonce = {
  tabId: number;
  sessionId: string;
  expiresAt: number;
};

type TrustedPanelFrame = {
  sessionId: string;
  expiresAt: number;
};

type PanelFrameReference = {
  tabId: number;
  frameId: number;
};

const NONCE_TTL_MS = 5 * 60 * 1000;
const FRAME_TRUST_TTL_MS = 30 * 60 * 1000;

/**
 * Grants privileged extension access to the in-page panels Bitwarden opens itself.
 *
 * Panels are extension pages embedded as iframes into a web page, which makes them
 * subframes of the tab. {@link BrowserApi.senderIsInternal} rejects subframes to
 * prevent extension pages embedded into foreign sites from reaching background
 * state, so panels cannot read `chrome.storage` backed state through the background.
 *
 * To keep that protection in place the background issues a single-use nonce every
 * time it asks a content script to open a panel. The panel echoes the nonce over
 * `chrome.runtime.sendMessage` once its document loaded, which allows the background
 * to tell its own panels apart from extension pages embedded into foreign sites.
 * Only then are ports and messages from that frame treated as internal.
 */
export class PanelFrameTrustService {
  private readonly nonces = new Map<string, PanelFrameNonce>();
  private readonly trustedFrames = new Map<string, TrustedPanelFrame>();
  private readonly sessionFrames = new Map<string, PanelFrameReference>();

  constructor(private readonly logService: LogService) {
    BrowserApi.panelFrameTrustChecker = (sender) => this.isTrustedFrame(sender);

    BrowserApi.addListener(chrome.runtime.onMessage, (message, sender, sendResponse) => {
      if (message?.command !== PanelFrameMessageCommand.Handshake) {
        return;
      }

      sendResponse({ trusted: this.verifyHandshake(message.nonce, sender) });
      return true;
    });

    BrowserApi.addListener(chrome.tabs.onRemoved, (tabId) => this.revokeTab(tabId));
  }

  /**
   * Issues the nonce that the panel opened for the given tab has to echo back. The
   * nonce is only ever handed to the content script that hosts the panel, so panels
   * embedded into foreign sites cannot obtain one.
   */
  createNonce(tabId: number, sessionId: string): string {
    this.sweepExpired();

    const nonce = this.createNonceValue();
    this.nonces.set(nonce, {
      tabId,
      sessionId,
      expiresAt: Date.now() + NONCE_TTL_MS,
    });

    return nonce;
  }

  /**
   * Verifies the nonce a panel echoed back and starts trusting messages from its frame.
   */
  verifyHandshake(nonce: unknown, sender?: chrome.runtime.MessageSender): boolean {
    if (typeof nonce !== "string" || nonce.length === 0) {
      this.logService.warning("[PanelFrameTrust] Panel handshake did not carry a nonce");
      return false;
    }

    const record = this.nonces.get(nonce);
    if (!record || record.expiresAt <= Date.now()) {
      this.logService.warning("[PanelFrameTrust] Panel handshake carried an unknown nonce");
      return false;
    }

    const frame = this.getFrame(sender);
    if (!frame) {
      this.logService.warning("[PanelFrameTrust] Panel handshake was not sent by a frame");
      return false;
    }

    if (frame.tabId !== record.tabId) {
      this.logService.warning("[PanelFrameTrust] Panel handshake came from a different tab");
      return false;
    }

    if (!this.isPanelUrl(sender?.url, nonce)) {
      this.logService.warning("[PanelFrameTrust] Panel handshake came from an unexpected url");
      return false;
    }

    // The nonce stays valid for the lifetime of the session so that reloading the
    // panel can hand shake again.
    this.trustedFrames.set(this.frameKey(frame.tabId, frame.frameId), {
      sessionId: record.sessionId,
      expiresAt: Date.now() + FRAME_TRUST_TTL_MS,
    });
    this.sessionFrames.set(record.sessionId, {
      tabId: frame.tabId,
      frameId: frame.frameId,
    });

    return true;
  }

  /**
   * Resolves the frame that currently hosts the panel of the given session. Runtime
   * broadcasts do not reach extension frames embedded into web pages, so messages for
   * the panel have to be addressed to its frame.
   */
  getPanelFrame(sessionId: string): PanelFrameReference | undefined {
    return this.sessionFrames.get(sessionId);
  }

  /**
   * Checks whether the given sender is a frame of a panel this background opened.
   */
  isTrustedFrame(sender?: chrome.runtime.MessageSender): boolean {
    const frame = this.getFrame(sender);
    if (!frame) {
      return false;
    }

    const key = this.frameKey(frame.tabId, frame.frameId);
    const trustedFrame = this.trustedFrames.get(key);
    if (!trustedFrame) {
      return false;
    }

    if (trustedFrame.expiresAt <= Date.now()) {
      this.trustedFrames.delete(key);
      return false;
    }

    trustedFrame.expiresAt = Date.now() + FRAME_TRUST_TTL_MS;

    return true;
  }

  /**
   * Revokes the trust granted to the panels of a finished FIDO2 session.
   */
  revokeSession(sessionId: string): void {
    this.nonces.forEach((record, nonce) => {
      if (record.sessionId === sessionId) {
        this.nonces.delete(nonce);
      }
    });

    this.trustedFrames.forEach((frame, key) => {
      if (frame.sessionId === sessionId) {
        this.trustedFrames.delete(key);
      }
    });

    this.sessionFrames.delete(sessionId);
  }

  /**
   * Revokes the trust granted to the panels of a closed tab.
   */
  revokeTab(tabId: number): void {
    this.nonces.forEach((record, nonce) => {
      if (record.tabId === tabId) {
        this.nonces.delete(nonce);
      }
    });

    this.trustedFrames.forEach((_frame, key) => {
      if (key.startsWith(`${tabId}:`)) {
        this.trustedFrames.delete(key);
      }
    });

    this.sessionFrames.forEach((frame, sessionId) => {
      if (frame.tabId === tabId) {
        this.sessionFrames.delete(sessionId);
      }
    });
  }

  private getFrame(
    sender?: chrome.runtime.MessageSender,
  ): { tabId: number; frameId: number } | undefined {
    const tabId = sender?.tab?.id;
    const frameId = sender?.frameId;

    if (tabId == null || frameId == null || frameId === 0) {
      // Top level frames are handled by the regular internal sender checks.
      return undefined;
    }

    return { tabId, frameId };
  }

  private isPanelUrl(url: string | undefined, nonce: string): boolean {
    const panelUrl = BrowserApi.getRuntimeURL("popup/index.html");
    if (!panelUrl || !url) {
      return false;
    }

    const [urlWithoutHash] = url.split("#");
    if (!urlWithoutHash.startsWith(panelUrl)) {
      return false;
    }

    const queryIndex = urlWithoutHash.indexOf("?");
    if (queryIndex === -1) {
      return false;
    }

    const params = new URLSearchParams(urlWithoutHash.slice(queryIndex + 1));

    return params.get("uilocation") === "panel" && params.get(PanelFrameNonceParam) === nonce;
  }

  private sweepExpired(): void {
    const now = Date.now();

    this.nonces.forEach((record, nonce) => {
      if (record.expiresAt <= now) {
        this.nonces.delete(nonce);
      }
    });

    this.trustedFrames.forEach((frame, key) => {
      if (frame.expiresAt <= now) {
        this.trustedFrames.delete(key);
      }
    });
  }

  private frameKey(tabId: number, frameId: number): string {
    return `${tabId}:${frameId}`;
  }

  private createNonceValue(): string {
    if (typeof crypto?.randomUUID === "function") {
      return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
}
