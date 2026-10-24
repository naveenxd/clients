import { css } from "@emotion/css";
import { html, nothing } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { InlineMenuCipherData } from "../../../background/abstractions/overlay.background";
import { border, themes, typography } from "../constants/styles";
import { Passkey } from "../icons";

export type CipherDetailsProps = {
  cipher: InlineMenuCipherData;
  theme: Theme;
};

export function CipherDetails({ cipher, theme }: CipherDetailsProps) {
  const passkey = cipher.login?.passkey;
  const name = html`
    <span title=${cipher.name} class=${primaryTextStyles(theme)}>${cipher.name}</span>
  `;

  if (passkey) {
    const showRpName = cipher.name !== passkey.rpName;
    const secondary = cipher.login?.username || passkey.userName;
    const firstLine = showRpName ? passkey.rpName : secondary;
    const secondLine = showRpName ? secondary : undefined;

    return html`
      <div>
        ${name}
        ${
          firstLine
            ? html`<span title=${firstLine} class=${passkeyBadgeStyles(theme)}>
                ${Passkey({ theme, color: themes[theme].passkey["700"] })} ${firstLine}
              </span>`
            : nothing
        }
        ${
          secondLine
            ? html`<span title=${secondLine} class=${passkeySecondaryStyles(theme)}
                >${secondLine}</span
              >`
            : nothing
        }
      </div>
    `;
  }

  const subtitle =
    cipher.identity?.username ||
    cipher.identity?.fullName ||
    cipher.login?.username ||
    cipher.card ||
    "";

  return html`
    <div>
      ${name}
      ${
        subtitle
          ? html`<span title=${subtitle} class=${secondaryTextStyles(theme)}>${subtitle}</span>`
          : nothing
      }
    </div>
  `;
}

const primaryTextStyles = (theme: Theme) => css`
  ${typography.body2}

  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${themes[theme].text.main};
  font-size: 13.5px;
  line-height: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const secondaryTextStyles = (theme: Theme) => css`
  ${typography.helperMedium}

  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${themes[theme].text.muted};
  font-size: 11.5px;
  line-height: 16px;
`;

const passkeyBadgeStyles = (theme: Theme) => css`
  ${typography.helperMedium}

  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  margin-top: 3px;
  padding: 1px 8px 1px 5px;
  border: 1px solid ${themes[theme].passkey["300"]};
  border-radius: ${border.radius.full};
  background-color: ${themes[theme].passkey["100"]};
  color: ${themes[theme].passkey["700"]};
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: -0.005em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  > svg {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
  }
`;

const passkeySecondaryStyles = (theme: Theme) => css`
  ${typography.helperMedium}

  display: block;
  margin-top: 2px;
  padding-left: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${themes[theme].text.muted};
  font-size: 11px;
  line-height: 15px;
`;
