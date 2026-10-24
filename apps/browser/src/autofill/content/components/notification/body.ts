import createEmotion from "@emotion/css/create-instance";
import { html } from "lit";

import { Theme, ThemeTypes } from "@bitwarden/common/platform/enums";

import { NotificationType } from "../../../notification/abstractions/notification-bar";
import { NotificationCipherData } from "../cipher/types";
import { I18n } from "../common-types";
import { scrollbarStyles, themes, typography } from "../constants/styles";
import { CipherItemRow } from "../rows/cipher-item-row";

export const componentClassPrefix = "notification-body";

const { css } = createEmotion({
  key: componentClassPrefix,
});

export type NotificationBodyProps = {
  ciphers?: NotificationCipherData[];
  i18n: I18n;
  notificationType?: NotificationType;
  theme: Theme;
  handleEditOrUpdateAction: (e: Event) => void;
};

export function NotificationBody({
  ciphers = [],
  i18n,
  notificationType,
  theme = ThemeTypes.Light,
  handleEditOrUpdateAction,
}: NotificationBodyProps) {
  // @TODO get client vendor from context
  const isSafari = false;

  return html`
    <div class=${notificationBodyStyles({ isSafari, theme })}>
      ${ciphers.map((cipher) =>
        CipherItemRow({
          cipher,
          theme,
          i18n,
          notificationType,
          handleAction: handleEditOrUpdateAction,
        }),
      )}
    </div>
  `;
}

const notificationBodyStyles = ({ isSafari, theme }: { isSafari: boolean; theme: Theme }) => css`
  ${typography.body1}

  gap: 4px;
  display: flex;
  flex-flow: column;
  background-color: transparent;
  max-height: 232px;
  overflow-x: hidden;
  overflow-y: auto;
  white-space: nowrap;
  color: ${themes[theme].text.main};
  font-weight: 400;

  :last-child {
    border-radius: 0 0 24px 24px;
  }

  ${isSafari ? scrollbarStyles(theme).safari : scrollbarStyles(theme).default}
`;
