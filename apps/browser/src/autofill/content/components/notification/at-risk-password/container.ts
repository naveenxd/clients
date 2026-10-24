import { html, nothing } from "lit";

import { ThemeTypes } from "@bitwarden/common/platform/enums";

import {
  AtRiskPasswordNotificationParams,
  NotificationBarIframeInitData,
} from "../../../../notification/abstractions/notification-bar";
import { I18n } from "../../common-types";
import { NotificationHeader } from "../header";
import { notificationShellStyles } from "../shell";

import { AtRiskNotificationBody } from "./body";
import { AtRiskNotificationFooter } from "./footer";

export type AtRiskNotificationProps = NotificationBarIframeInitData & {
  /**
   * Click handler for the "Change password" button. When omitted, the button
   * is not rendered and the notification body instructs the user to navigate
   * to the site manually.
   */
  handleChangePasswordClick?: (e: Event) => void;
  handleCloseNotification: (e: Event) => void;
  i18n: I18n;
  notificationTestId: string;
  params: AtRiskPasswordNotificationParams;
};

export function AtRiskNotification({
  handleChangePasswordClick,
  handleCloseNotification,
  i18n,
  notificationTestId,
  theme = ThemeTypes.Light,
  params,
}: AtRiskNotificationProps) {
  const { hasPasswordChangeUri, organizationName } = params;
  const riskMessage = chrome.i18n.getMessage(
    hasPasswordChangeUri ? "atRiskChangePrompt" : "atRiskNavigatePromptV2",
    organizationName,
  );

  return html`
    <div data-testid="${notificationTestId}" class=${notificationShellStyles(theme)}>
      ${NotificationHeader({
        handleCloseNotification,
        i18n,
        message: i18n.atRiskPassword,
        theme,
      })}
      ${AtRiskNotificationBody({
        theme,
        riskMessage,
      })}
      ${
        handleChangePasswordClick
          ? AtRiskNotificationFooter({
              i18n,
              theme,
              handleChangePasswordClick,
            })
          : nothing
      }
    </div>
  `;
}
