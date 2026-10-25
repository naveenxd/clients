import { sendExtensionMessage, setElementStyles } from "../../../autofill/utils";
import { BrowserApi } from "../../../platform/browser/browser-api";
import { PanelFrameNonceParam } from "../../../platform/browser/panel-frame-message.enum";
import {
  Fido2PanelCommand,
  Fido2PanelRuntimeMessage,
  Fido2PanelWindowCommand,
} from "../enums/fido2-panel-command.enum";

export type OpenFido2PanelMessage = {
  command: string;
  sessionId: string;
  fallbackSupported: boolean;
  senderTabId?: number;
  senderUrl?: string;
  panelNonce?: string;
};

const PANEL_HOST_ID = "bitwarden-fido2-panel";
const PANEL_EDGE_OFFSET = "12px";
const PANEL_WIDTH = "400px";

/**
 * Hosts the FIDO2 user interface in a fixed, in-page panel at the top right of
 * the browser window. The iframe reuses the extension's `/fido2` route, which
 * keeps the passkey flow out of an OS-level popup window.
 */
export function setupFido2Panel(globalContext: Window) {
  // The passkey panel is only hosted by the top-level document; the FIDO2 content
  // script is injected into every frame.
  if (globalContext.top !== globalContext) {
    return;
  }

  let panelHost: HTMLDivElement | null = null;
  let panelIframe: HTMLIFrameElement | null = null;
  let panelSessionId: string | null = null;
  const extensionOrigin = new URL(chrome.runtime.getURL("")).origin;

  const openPanel = (message: OpenFido2PanelMessage): boolean => {
    if (!globalContext.document.documentElement) {
      return false;
    }

    removePanel(true);

    const host = globalContext.document.createElement("div");
    host.id = PANEL_HOST_ID;
    setElementStyles(
      host,
      {
        all: "initial",
        position: "fixed",
        top: PANEL_EDGE_OFFSET,
        right: PANEL_EDGE_OFFSET,
        bottom: "auto",
        left: "auto",
        width: `min(${PANEL_WIDTH}, calc(100vw - 24px))`,
        height: "min(620px, calc(100vh - 24px))",
        maxHeight: "calc(100vh - 24px)",
        display: "block",
        zIndex: "2147483647",
        boxSizing: "border-box",
        margin: "0",
        padding: "0",
        border: "1px solid rgba(15, 23, 42, 0.12)",
        borderRadius: "16px",
        boxShadow: "0 16px 36px -6px rgba(15, 23, 42, 0.25), 0 4px 12px -2px rgba(15, 23, 42, 0.1)",
        overflow: "hidden",
        background: "transparent",
        colorScheme: "normal",
        pointerEvents: "auto",
      },
      true,
    );

    const shadow = host.attachShadow({ mode: "closed" });
    const iframe = globalContext.document.createElement("iframe");
    iframe.src = buildPanelUrl(message);
    iframe.title = chrome.i18n.getMessage("bitwardenVault") || "Bitwarden";
    iframe.setAttribute("allowtransparency", "true");
    setElementStyles(
      iframe,
      {
        display: "block",
        width: "100%",
        height: "100%",
        margin: "0",
        padding: "0",
        border: "0",
        background: "transparent",
      },
      true,
    );
    iframe.addEventListener("load", () => iframe.focus());
    shadow.appendChild(iframe);

    globalContext.document.documentElement.appendChild(host);

    panelHost = host;
    panelIframe = iframe;
    panelSessionId = message.sessionId;

    void sendExtensionMessage(Fido2PanelRuntimeMessage.Opened, {
      sessionId: message.sessionId,
    });

    return true;
  };

  const removePanel = (notifyBackground: boolean) => {
    if (!panelHost) {
      return;
    }

    const closedSessionId = panelSessionId;
    panelHost.remove();
    panelHost = null;
    panelIframe = null;
    panelSessionId = null;

    if (notifyBackground && closedSessionId) {
      void sendExtensionMessage(Fido2PanelRuntimeMessage.Closed, {
        sessionId: closedSessionId,
      });
    }
  };

  const closePanel = (sessionId?: string) => {
    if (sessionId && panelSessionId !== sessionId) {
      return;
    }

    removePanel(true);
  };

  const buildPanelUrl = (message: OpenFido2PanelMessage): string => {
    const url = new URL(chrome.runtime.getURL("popup/index.html"));
    url.searchParams.set("uilocation", "panel");
    if (message.panelNonce) {
      url.searchParams.set(PanelFrameNonceParam, message.panelNonce);
    }

    const hashParams = new URLSearchParams({
      sessionId: message.sessionId,
      fallbackSupported: String(message.fallbackSupported),
    });
    if (message.senderTabId != null) {
      hashParams.set("senderTabId", String(message.senderTabId));
    }
    if (message.senderUrl) {
      hashParams.set("senderUrl", message.senderUrl);
    }
    url.hash = `/fido2?${hashParams.toString()}`;

    return url.toString();
  };

  BrowserApi.addListener(
    chrome.runtime.onMessage,
    (message: OpenFido2PanelMessage, _sender, sendResponse) => {
      if (message?.command === Fido2PanelCommand.Open) {
        sendResponse({ opened: openPanel(message) });
        return;
      }

      if (message?.command === Fido2PanelCommand.Close) {
        closePanel(message.sessionId);
        sendResponse({ closed: true });
      }
    },
  );

  globalContext.addEventListener("message", (event: MessageEvent) => {
    if (!panelIframe || event.source !== panelIframe.contentWindow) {
      return;
    }
    if (event.origin !== extensionOrigin) {
      return;
    }
    if (event.data?.command === Fido2PanelWindowCommand.Close) {
      removePanel(true);
    }
  });

  globalContext.addEventListener("pagehide", () => removePanel(true));
}
