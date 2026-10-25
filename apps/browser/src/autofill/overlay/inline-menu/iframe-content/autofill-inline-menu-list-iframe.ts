import { AutofillOverlayPort } from "../../../enums/autofill-overlay.enum";

import { AutofillInlineMenuIframeElement } from "./autofill-inline-menu-iframe-element";

export class AutofillInlineMenuListIframe extends AutofillInlineMenuIframeElement {
  constructor(element: HTMLElement) {
    super(
      element,
      AutofillOverlayPort.List,
      {
        height: "0px",
        minWidth: "260px",
        maxHeight: "180px",
        // The list page draws its own bezel; the iframe only supplies the outer shadow.
        boxShadow:
          "0 14px 32px -6px rgba(15, 23, 42, 0.22), 0 4px 10px -2px rgba(15, 23, 42, 0.08)",
        borderRadius: "14px",
        borderWidth: "0px",
        borderStyle: "solid",
        borderColor: "transparent",
      },
      chrome.i18n.getMessage("bitwardenVault"),
    );
  }
}
