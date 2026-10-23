/**
 * Commands sent from the background to the FIDO2 content script to control the
 * in-page passkey panel.
 */
export const Fido2PanelCommand = {
  Open: "openFido2Panel",
  Close: "closeFido2Panel",
} as const;

/**
 * Commands sent from the FIDO2 panel iframe to its parent content script.
 */
export const Fido2PanelWindowCommand = {
  Close: "closeFido2Panel",
} as const;

/**
 * Runtime messages sent by the FIDO2 content script so the autofill overlay can
 * yield to the passkey panel.
 */
export const Fido2PanelRuntimeMessage = {
  Opened: "fido2PanelOpened",
  Closed: "fido2PanelClosed",
} as const;
