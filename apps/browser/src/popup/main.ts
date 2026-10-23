import { enableProdMode, provideZoneChangeDetection } from "@angular/core";
import { platformBrowser } from "@angular/platform-browser";

import { PopupSizeService } from "../platform/popup/layout/popup-size.service";
import { completePanelFrameHandshake } from "../platform/services/panel-frame-handshake";
import { BrowserPlatformUtilsService } from "../platform/services/platform-utils/browser-platform-utils.service";

import { AppModule } from "./app.module";

import "./scss";

// We put these first to minimize the delay in window changing.
PopupSizeService.initBodyWidthFromLocalStorage();
// Should be removed once we deprecate support for Safari 16.0 and older. See Jira ticket [PM-1861]
if (BrowserPlatformUtilsService.shouldApplySafariHeightFix(window)) {
  document.documentElement.classList.add("safari_height_fix");
}

if (process.env.ENV === "production") {
  enableProdMode();
}

function init() {
  void completePanelFrameHandshake(window).then(() => {
    void platformBrowser().bootstrapModule(AppModule, {
      applicationProviders: [provideZoneChangeDetection()],
    });
  });
}

init();
