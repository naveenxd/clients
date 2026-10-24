import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { I18n } from "../common-types";
import { themes } from "../constants/styles";
import { Close as CloseIcon } from "../icons";

export type CloseButtonProps = {
  i18n: I18n;
  handleCloseNotification: (e: Event) => void;
  theme: Theme;
};

export function CloseButton({ handleCloseNotification, i18n, theme }: CloseButtonProps) {
  return html`
    <button
      type="button"
      aria-label=${i18n.close}
      class=${closeButtonStyles(theme)}
      @click=${handleCloseNotification}
    >
      ${CloseIcon({ theme })}
    </button>
  `;
}

const closeButtonStyles = (theme: Theme) => css`
  flex-shrink: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background-color: transparent;
  color: ${themes[theme].text.muted};
  cursor: pointer;
  width: 28px;
  height: 28px;
  padding: 0;
  transition:
    background-color 140ms ease,
    color 140ms ease;

  :hover {
    background-color: ${themes[theme].surface.hover};
    color: ${themes[theme].text.main};
  }

  :focus-visible {
    outline: 2px solid ${themes[theme].primary["600"]};
    outline-offset: 1px;
  }

  > svg {
    width: 16px;
    height: 16px;
    vertical-align: middle;
  }
`;
