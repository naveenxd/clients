import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { themes } from "../constants/styles";

import { Shield } from "./shield";

export function BrandIconContainer({ iconLink, theme }: { iconLink?: URL; theme: Theme }) {
  const Icon = html`<div class=${brandIconContainerStyles(theme)}>
    ${Shield({ theme, color: "rgba(255, 255, 255)" })}
  </div>`;

  return iconLink ? html`<a href="${iconLink}" target="_blank" rel="noreferrer">${Icon}</a>` : Icon;
}

const brandIconContainerStyles = (theme: Theme) => css`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background-image: ${themes[theme].accentGradient};
  box-shadow:
    0 6px 16px -6px rgba(37, 99, 235, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);

  > svg {
    width: 15px;
    height: 17px;
    flex-shrink: 0;
  }

  ${
    theme === "dark"
      ? css`
          box-shadow:
            0 6px 18px -6px rgba(59, 130, 246, 0.8),
            inset 0 1px 0 rgba(255, 255, 255, 0.34);
        `
      : css``
  }
`;
