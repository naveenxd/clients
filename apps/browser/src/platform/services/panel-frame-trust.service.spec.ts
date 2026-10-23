import { mock } from "jest-mock-extended";

import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

import { BrowserApi } from "../browser/browser-api";
import { PanelFrameNonceParam } from "../browser/panel-frame-message.enum";

import { PanelFrameTrustService } from "./panel-frame-trust.service";

const EXTENSION_ORIGIN = "moz-extension://extension-id";
const PANEL_URL = `${EXTENSION_ORIGIN}/popup/index.html`;
const TAB_ID = 1;
const FRAME_ID = 100;

describe("PanelFrameTrustService", () => {
  let logService: LogService;
  let service: PanelFrameTrustService;

  const panelUrlFor = (nonce: string, uilocation = "panel") =>
    `${PANEL_URL}?uilocation=${uilocation}&${PanelFrameNonceParam}=${nonce}#/fido2`;

  const sender = (overrides: Partial<chrome.runtime.MessageSender> = {}) =>
    ({
      origin: EXTENSION_ORIGIN,
      tab: { id: TAB_ID },
      frameId: FRAME_ID,
      url: panelUrlFor("NONCE"),
      ...overrides,
    }) as chrome.runtime.MessageSender;

  const handshake = (nonce: string, overrides: Partial<chrome.runtime.MessageSender> = {}) =>
    service.verifyHandshake(nonce, sender({ url: panelUrlFor(nonce), ...overrides }));

  beforeEach(() => {
    logService = mock<LogService>();
    jest
      .spyOn(BrowserApi, "getRuntimeURL")
      .mockImplementation((path: string) => (path ? PANEL_URL : `${EXTENSION_ORIGIN}/`));
    jest.spyOn(BrowserApi, "addListener").mockImplementation(() => undefined);

    service = new PanelFrameTrustService(logService);
  });

  afterEach(() => {
    BrowserApi.panelFrameTrustChecker = undefined;
  });

  it("registers the panel frame trust checker on BrowserApi", () => {
    expect(BrowserApi.panelFrameTrustChecker).toBeDefined();
  });

  it("does not trust frames before they hand shook", () => {
    expect(service.isTrustedFrame(sender())).toBe(false);
  });

  it("trusts the frame that hands shakes with a valid nonce", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");

    const trusted = handshake(nonce);

    expect(trusted).toBe(true);
    expect(service.isTrustedFrame(sender())).toBe(true);
  });

  it("keeps trusting the panel frame while the session is active", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);

    // A later message from the same frame, e.g. after a reload of the panel.
    expect(service.isTrustedFrame(sender())).toBe(true);
    expect(handshake(nonce)).toBe(true);
  });

  it("rejects an unknown nonce", () => {
    expect(service.verifyHandshake("NOT-A-NONCE", sender())).toBe(false);
    expect(service.isTrustedFrame(sender())).toBe(false);
    expect(logService.warning).toHaveBeenCalledWith(expect.stringContaining("unknown nonce"));
  });

  it("rejects non-string nonces", () => {
    expect(service.verifyHandshake(undefined, sender())).toBe(false);
    expect(service.verifyHandshake(42 as unknown as string, sender())).toBe(false);
  });

  it("rejects an expired nonce", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    jest.useFakeTimers();

    try {
      jest.advanceTimersByTime(6 * 60 * 1000);

      expect(service.verifyHandshake(nonce, sender())).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it("rejects a nonce that belongs to another tab", () => {
    const nonce = service.createNonce(TAB_ID + 1, "session-1");

    expect(service.verifyHandshake(nonce, sender())).toBe(false);
    expect(service.isTrustedFrame(sender())).toBe(false);
    expect(logService.warning).toHaveBeenCalledWith(expect.stringContaining("different tab"));
  });

  it("rejects a handshake from a top-level frame", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");

    expect(service.verifyHandshake(nonce, sender({ frameId: 0 }))).toBe(false);
    expect(service.isTrustedFrame({ tab: { id: TAB_ID }, frameId: 0 })).toBe(false);
  });

  it("rejects a handshake from a sender without tab information", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");

    expect(service.verifyHandshake(nonce, sender({ tab: undefined }))).toBe(false);
  });

  it.each([
    ["a non-panel popup url", `${PANEL_URL}?uilocation=popup&${PanelFrameNonceParam}=NONCE`],
    ["a url without a nonce", `${PANEL_URL}?uilocation=panel`],
    ["a url outside of the popup", `${EXTENSION_ORIGIN}/other.html?uilocation=panel`],
    ["an empty url", undefined],
  ])("rejects a handshake from %s", (_, url) => {
    const nonce = service.createNonce(TAB_ID, "session-1");

    expect(service.verifyHandshake(nonce, sender({ url }))).toBe(false);
    expect(logService.warning).toHaveBeenCalledWith(expect.stringContaining("unexpected url"));
  });

  it("stops trusting the panel once its session is revoked", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);
    expect(service.isTrustedFrame(sender())).toBe(true);

    service.revokeSession("session-1");

    expect(service.isTrustedFrame(sender())).toBe(false);
    expect(service.verifyHandshake(nonce, sender())).toBe(false);
  });

  it("keeps trusting panels of other sessions when a session is revoked", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);
    const otherNonce = service.createNonce(TAB_ID, "session-2");
    handshake(otherNonce, { frameId: FRAME_ID + 1 });

    service.revokeSession("session-1");

    expect(service.isTrustedFrame(sender())).toBe(false);
    expect(service.isTrustedFrame(sender({ frameId: FRAME_ID + 1 }))).toBe(true);
  });

  it("stops trusting the panel once its tab is closed", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);

    service.revokeTab(TAB_ID);

    expect(service.isTrustedFrame(sender())).toBe(false);
  });

  it("keeps trusting panels of other tabs when a tab is closed", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);
    const otherNonce = service.createNonce(TAB_ID + 1, "session-2");
    handshake(otherNonce, { tab: { id: TAB_ID + 1 } });

    service.revokeTab(TAB_ID);

    expect(service.isTrustedFrame(sender())).toBe(false);
    expect(service.isTrustedFrame(sender({ tab: { id: TAB_ID + 1 } }))).toBe(true);
  });

  it("resolves the frame that hosts the panel of a session", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);

    expect(service.getPanelFrame("session-1")).toEqual({ tabId: TAB_ID, frameId: FRAME_ID });
  });

  it("updates the panel frame when the panel is reloaded into a new frame", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);
    handshake(nonce, { frameId: FRAME_ID + 1 });

    expect(service.getPanelFrame("session-1")).toEqual({ tabId: TAB_ID, frameId: FRAME_ID + 1 });
  });

  it("does not resolve a panel frame for sessions without a panel", () => {
    expect(service.getPanelFrame("session-1")).toBeUndefined();
  });

  it("forgets the panel frame once its session is revoked", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);

    service.revokeSession("session-1");

    expect(service.getPanelFrame("session-1")).toBeUndefined();
  });

  it("forgets the panel frame once its tab is closed", () => {
    const nonce = service.createNonce(TAB_ID, "session-1");
    handshake(nonce);

    service.revokeTab(TAB_ID);

    expect(service.getPanelFrame("session-1")).toBeUndefined();
  });

  it("issues unique nonces", () => {
    const first = service.createNonce(TAB_ID, "session-1");
    const second = service.createNonce(TAB_ID, "session-2");

    expect(first).not.toEqual(second);
  });
});
