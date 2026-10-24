import { css } from "@emotion/css";
import { html } from "lit";

import { Theme, ThemeTypes } from "@bitwarden/common/platform/enums";

import { spacing, themes, typography } from "../../../content/components/constants/styles";

export type ActionRowProps = {
  itemText: string;
  handleAction?: (e: Event) => void;
  theme: Theme;
};

export function ActionRow({ handleAction, itemText, theme = ThemeTypes.Light }: ActionRowProps) {
  return html`
    <button type="button" @click=${handleAction} class=${actionRowStyles(theme)} title=${itemText}>
      <span>${itemText}</span>
    </button>
  `;
}

const actionRowStyles = (theme: Theme) => css`
  ${typography.body2}

  user-select: none;
  border: 1px solid ${themes[theme].surface.border};
  border-radius: 10px;
  background-color: ${themes[theme].surface.raised};
  cursor: pointer;
  padding: ${spacing["2"]} 10px;
  width: 100%;
  min-height: 40px;
  text-align: left;
  color: ${themes[theme].primary["600"]};
  font-size: 13px;
  font-weight: 600;
  transition:
    background-color 140ms ease,
    border-color 140ms ease;

  > span {
    display: block;
    width: calc(100% - 5px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :hover {
    border-color: ${themes[theme].surface.borderStrong};
    background-color: ${themes[theme].surface.hover};
    color: ${themes[theme].primary["600"]};
  }

  :focus-visible {
    outline: 2px solid ${themes[theme].primary["600"]};
    outline-offset: 1px;
  }
`;
