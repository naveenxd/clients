import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { NotificationType } from "../../../notification/abstractions/notification-bar";
import { CipherItem } from "../cipher/cipher-item";
import { NotificationCipherData } from "../cipher/types";
import { I18n } from "../common-types";
import { elevation, motion, spacing, themes, typography } from "../constants/styles";

export type CipherItemRowProps = {
  cipher: NotificationCipherData;
  i18n: I18n;
  notificationType?: NotificationType;
  theme: Theme;
  handleAction: (e: Event) => void;
};

export function CipherItemRow({
  cipher,
  i18n,
  notificationType,
  theme,
  handleAction,
}: CipherItemRowProps) {
  return html`
    <div class=${cipherItemRowStyles({ theme })}>
      ${CipherItem({
        cipher,
        i18n,
        notificationType,
        theme,
        handleAction,
      })}
    </div>
  `;
}

const cipherItemRowStyles = ({ theme }: { theme: Theme }) => css`
  ${typography.body1}

  gap: ${spacing["2"]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${themes[theme].surface.border};
  border-radius: 15px;
  background-color: ${themes[theme].surface.glass};
  padding: ${spacing["2"]} 10px;
  min-height: min-content;
  min-height: 54px; /* fallback for Firefox, which doesn't support min-height: min-content on flex items */
  max-height: 62px;
  overflow-x: hidden;
  white-space: nowrap;
  color: ${themes[theme].text.main};
  font-weight: 400;
  box-shadow: inset 0 1px 0 ${themes[theme].surface.highlight};
  transition:
    background-color 180ms ${motion.easeOut},
    border-color 180ms ${motion.easeOut},
    box-shadow 180ms ${motion.easeOut},
    transform 180ms ${motion.spring};

  :hover {
    border-color: ${themes[theme].primary["300"]};
    background-color: ${themes[theme].surface.cardHover};
    box-shadow: ${elevation.card(theme)};
    transform: translateY(-1px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    :hover {
      transform: none;
    }
  }

  > div {
    :first-child {
      flex: 3 3 75%;
      min-width: 25%;
    }

    :not(:first-child) {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: flex-end;
      max-width: 25%;

      > button {
        max-width: min-content;
      }
    }
  }
`;
