import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { ActionButton } from "../../buttons/action-button";
import { AdditionalTasksButtonContent } from "../../buttons/additional-tasks/button-content";
import { I18n } from "../../common-types";

export type AtRiskNotificationFooterProps = {
  i18n: I18n;
  theme: Theme;
  handleChangePasswordClick: (e: Event) => void;
};

export function AtRiskNotificationFooter({
  i18n,
  theme,
  handleChangePasswordClick,
}: AtRiskNotificationFooterProps) {
  return html`<div class=${atRiskNotificationFooterStyles}>
    ${ActionButton({
      handleClick: handleChangePasswordClick,
      buttonText: AdditionalTasksButtonContent({ buttonText: i18n.changePassword, theme }),
      dataTestId: "change-password-button",
      theme,
      fullWidth: false,
      title: i18n.changePassword,
    })}
  </div>`;
}

const atRiskNotificationFooterStyles = css`
  display: flex;
  padding: 10px 14px 14px;
`;
