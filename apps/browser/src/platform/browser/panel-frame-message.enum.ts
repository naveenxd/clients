/**
 * Messages exchanged between the extension's privileged contexts (background
 * page, popouts, tabs) and the in-page panel iframes that host Bitwarden views.
 */
export const PanelFrameMessageCommand = {
  /**
   * Sent by a panel iframe once its document has loaded. The message carries the
   * single-use nonce that the background handed to the content script when it
   * requested the panel, so the background can verify that the sender is a panel
   * it opened itself rather than an extension page embedded in a foreign site.
   */
  Handshake: "panelFrameHandshake",
} as const;

/**
 * Search param that carries the panel trust nonce into the panel iframe URL.
 */
export const PanelFrameNonceParam = "panelNonce";

export type PanelFrameMessageCommandValue =
  (typeof PanelFrameMessageCommand)[keyof typeof PanelFrameMessageCommand];
