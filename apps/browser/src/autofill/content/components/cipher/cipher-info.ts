import { css } from "@emotion/css";
import { html, nothing } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { themes, typography } from "../../../content/components/constants/styles";

import { CipherInfoIndicatorIcons } from "./cipher-indicator-icons";
import { NotificationCipherData } from "./types";

export type CipherInfoProps = { cipher: NotificationCipherData; theme: Theme };

export function CipherInfo({ cipher, theme }: CipherInfoProps) {
  const { name, login, organizationCategories } = cipher;
  const hasIndicatorIcons = organizationCategories?.length;

  return html`
    <div>
      <span title=${name} class=${cipherInfoPrimaryTextStyles(theme)}>
        ${[
          name,
          hasIndicatorIcons
            ? CipherInfoIndicatorIcons({
                theme,
                organizationCategories,
              })
            : nothing,
        ]}
      </span>

      ${
        login?.username
          ? html`<span title=${login.username} class=${cipherInfoSecondaryTextStyles(theme)}
              >${login.username}</span
            >`
          : null
      }
    </div>
  `;
}

const cipherInfoPrimaryTextStyles = (theme: Theme) => css`
  ${typography.body2}

  gap: 2px;
  display: block;
  overflow-x: hidden;
  text-overflow: ellipsis;
  color: ${themes[theme].text.main};
  font-size: 13.5px;
  line-height: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const cipherInfoSecondaryTextStyles = (theme: Theme) => css`
  ${typography.helperMedium}

  display: block;
  overflow-x: hidden;
  text-overflow: ellipsis;
  color: ${themes[theme].text.muted};
  font-size: 11.5px;
  line-height: 16px;
  font-weight: 400;
`;
