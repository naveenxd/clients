import createEmotion from "@emotion/css/create-instance";
import { html, nothing } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { spacing } from "../../constants/styles";
import { Celebrate, Keyhole, Warning } from "../../illustrations";

import { NotificationConfirmationMessage } from "./message";

export const componentClassPrefix = "notification-confirmation-body";

const { css } = createEmotion({
  key: componentClassPrefix,
});

export type NotificationConfirmationBodyProps = {
  buttonAria: string;
  buttonText: string;
  confirmationMessage: string;
  error?: string;
  itemName?: string;
  messageDetails?: string;
  tasksAreComplete?: boolean;
  theme: Theme;
  handleOpenVault: (e: Event) => void;
};

export function NotificationConfirmationBody({
  buttonAria,
  buttonText,
  confirmationMessage,
  error,
  itemName,
  messageDetails,
  tasksAreComplete,
  theme,
  handleOpenVault,
}: NotificationConfirmationBodyProps) {
  const IconComponent = error ? Warning : tasksAreComplete ? Celebrate : Keyhole;

  const showConfirmationMessage = confirmationMessage || buttonText || messageDetails;

  return html`
    <div class=${notificationConfirmationBodyStyles}>
      <div class=${iconContainerStyles(error)}>${IconComponent({ theme })}</div>
      ${
        showConfirmationMessage
          ? NotificationConfirmationMessage({
              buttonAria,
              buttonText,
              itemName: error ? undefined : itemName,
              message: confirmationMessage,
              messageDetails,
              theme,
              handleClick: handleOpenVault,
            })
          : nothing
      }
    </div>
  `;
}

const iconContainerStyles = (error?: string) => css`
  > svg {
    width: ${!error ? "50px" : "40px"};
    height: auto;
  }
`;
const notificationConfirmationBodyStyles = css`
  gap: ${spacing[4]};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: transparent;
  padding: 12px 14px;
`;
