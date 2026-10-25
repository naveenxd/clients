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
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${themes[theme].primary["600"]};
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);

  > svg {
    width: 15px;
    height: 17px;
    flex-shrink: 0;
  }
`;
