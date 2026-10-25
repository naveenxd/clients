import { css } from "@emotion/css";
import { html, nothing } from "lit";

import { Theme, ThemeTypes } from "@bitwarden/common/platform/enums";

import {
  NotificationBarIframeInitData,
  NotificationTypes,
  NotificationType,
} from "../../../notification/abstractions/notification-bar";
import { NotificationCipherData } from "../cipher/types";
import { CollectionView, FolderView, I18n, OrgView } from "../common-types";
import { elevation, motion, themes } from "../constants/styles";

import { NotificationBody, componentClassPrefix as notificationBodyClassPrefix } from "./body";
import { NotificationFooter } from "./footer";
import {
  NotificationHeader,
  componentClassPrefix as notificationHeaderClassPrefix,
} from "./header";

export type NotificationContainerProps = NotificationBarIframeInitData & {
  handleCloseNotification: (e: Event) => void;
  handleSaveAction: (e: Event) => void;
  handleEditOrUpdateAction: (e: Event) => void;
} & {
  ciphers?: NotificationCipherData[];
  collections?: CollectionView[];
  folders?: FolderView[];
  headerMessage?: string;
  i18n: I18n;
  isLoading?: boolean;
  organizations?: OrgView[];
  personalVaultIsAllowed?: boolean;
  notificationTestId: string;
  type: NotificationType; // @TODO typing override for generic `NotificationBarIframeInitData.type`
};

export function NotificationContainer({
  handleCloseNotification,
  handleEditOrUpdateAction,
  handleSaveAction,
  ciphers,
  collections,
  folders,
  headerMessage,
  i18n,
  isLoading,
  organizations,
  personalVaultIsAllowed = true,
  notificationTestId,
  theme = ThemeTypes.Light,
  type,
}: NotificationContainerProps) {
  const showBody = type !== NotificationTypes.Unlock;

  return html`
    <div data-testid="${notificationTestId}" class=${notificationShellStyles(theme)}>
      <div class=${notificationCoreStyles(theme)}>
        ${NotificationHeader({
          handleCloseNotification,
          i18n,
          message: headerMessage,
          theme,
        })}
        ${
          showBody
            ? NotificationBody({
                handleEditOrUpdateAction,
                ciphers,
                notificationType: type,
                theme,
                i18n,
              })
            : nothing
        }
        ${NotificationFooter({
          handleSaveAction,
          collections,
          folders,
          i18n,
          isLoading,
          notificationType: type,
          organizations,
          personalVaultIsAllowed,
          theme,
        })}
      </div>
    </div>
  `;
}

const notificationShellStyles = (theme: Theme) => css`
  position: absolute;
  right: 16px;
  top: 16px;
  width: 380px;
  padding: 1px;
  border-radius: 14px;
  background-color: ${themes[theme].surface.borderStrong};
  box-shadow: ${elevation.overlay(theme)};
  animation: notification-enter 220ms ${motion.easeOut} both;

  @keyframes notification-enter {
    ${motion.enter}
  }

  ${motion.reducedMotion}
`;

const notificationCoreStyles = (theme: Theme) => css`
  overflow: hidden;
  border-radius: 13px;
  background-color: ${themes[theme].background.DEFAULT};
  color: ${themes[theme].text.main};
  -webkit-font-smoothing: antialiased;

  [class*="${notificationHeaderClassPrefix}-"] {
    border-radius: 13px 13px 0 0;
  }

  [class*="${notificationBodyClassPrefix}-"] {
    margin: 0;
    padding: 6px 10px 0;
  }
`;
