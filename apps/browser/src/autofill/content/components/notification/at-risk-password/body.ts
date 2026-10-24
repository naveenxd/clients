import createEmotion from "@emotion/css/create-instance";
import { html, nothing } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { spacing } from "../../constants/styles";

import { AtRiskNotificationMessage } from "./message";

export const componentClassPrefix = "at-risk-notification-body";

const { css } = createEmotion({
  key: componentClassPrefix,
});

export type AtRiskNotificationBodyProps = {
  riskMessage: string;
  theme: Theme;
};

export function AtRiskNotificationBody({ riskMessage, theme }: AtRiskNotificationBodyProps) {
  return html`
    <div class=${atRiskNotificationBodyStyles}>
      ${
        riskMessage
          ? AtRiskNotificationMessage({
              message: riskMessage,
              theme,
            })
          : nothing
      }
    </div>
  `;
}

const atRiskNotificationBodyStyles = css`
  gap: ${spacing[4]};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: transparent;
  padding: 12px 14px;
`;
