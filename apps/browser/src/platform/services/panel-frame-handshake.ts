import {
  PanelFrameMessageCommand,
  PanelFrameNonceParam,
} from "../browser/panel-frame-message.enum";

const HANDSHAKE_TIMEOUT_MS = 3000;

/** Window command understood by the content script that hosts the FIDO2 panel. */
const ClosePanelWindowCommand = "closeFido2Panel";

/**
 * Proves to the background that the current document is a panel it opened itself.
 *
 * Panels reuse the popup application inside an iframe, which makes them a subframe of
 * the tab they are embedded into. The background does not trust subframes until they
 * echo the nonce that was issued when the panel was requested, because that is the only
 * way to tell Bitwarden's own panels apart from extension pages embedded into foreign
 * sites. See `PanelFrameTrustService`.
 *
 * When the handshake fails the panel cannot reach background state, so it asks the
 * content script to close it and the background falls back to the popout window.
 */
export async function completePanelFrameHandshake(win: Window): Promise<void> {
  const nonce = readPanelNonce(win);
  if (!nonce) {
    return;
  }

  if (await sendHandshake(nonce)) {
    return;
  }

  win.parent?.postMessage({ command: ClosePanelWindowCommand }, "*");
}

function readPanelNonce(win: Window): string | undefined {
  try {
    const url = new URL(win.location.href);
    if (url.searchParams.get("uilocation") !== "panel") {
      return undefined;
    }

    return url.searchParams.get(PanelFrameNonceParam) ?? undefined;
  } catch {
    return undefined;
  }
}

function sendHandshake(nonce: string): Promise<boolean> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(false), HANDSHAKE_TIMEOUT_MS);

    try {
      chrome.runtime.sendMessage(
        { command: PanelFrameMessageCommand.Handshake, nonce },
        (response) => {
          clearTimeout(timeoutId);
          // Reading lastError keeps Firefox from logging an unchecked runtime error.
          void chrome.runtime.lastError;
          resolve(response?.trusted === true);
        },
      );
    } catch {
      clearTimeout(timeoutId);
      resolve(false);
    }
  });
}
