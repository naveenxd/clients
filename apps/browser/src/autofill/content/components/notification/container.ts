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
  right: 20px;
  width: 400px;
  padding: 1px;
  border-radius: 24px;
  background-image: linear-gradient(
    155deg,
    ${themes[theme].surface.bezelFrom} 0%,
    ${themes[theme].surface.border} 46%,
    ${themes[theme].surface.bezelTo} 100%
  );
  box-shadow: ${elevation.overlay(theme)};
  animation: notification-enter 260ms ${motion.spring} both;

  @keyframes notification-enter {
    ${motion.enter}
  }

  ${motion.reducedMotion}
`;

const notificationCoreStyles = (theme: Theme) => css`
  overflow: hidden;
  border-radius: 23px;
  background-color: ${themes[theme].background.alt};
  background-image:
    radial-gradient(120% 80% at 50% -20%, ${themes[theme].surface.highlight}, transparent 55%),
    linear-gradient(
      165deg,
      ${themes[theme].surface.coreFrom} 0%,
      ${themes[theme].surface.coreTo} 100%
    );
  color: ${themes[theme].text.main};
  -webkit-font-smoothing: antialiased;
  backdrop-filter: blur(26px) saturate(185%);
  -webkit-backdrop-filter: blur(26px) saturate(185%);
  box-shadow: inset 0 0 0 1px ${themes[theme].surface.highlight};

  [class*="${notificationHeaderClassPrefix}-"] {
    border-radius: 23px 23px 0 0;
  }

  [class*="${notificationBodyClassPrefix}-"] {
    margin: 0;
    padding: 6px 10px 0;
  }
`;
