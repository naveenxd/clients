import { css } from "@emotion/css";
import { html, nothing } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { IconProps, Option } from "../common-types";
import { spacing, themes, typography } from "../constants/styles";
import { AngleUp, AngleDown } from "../icons";

export type OptionSelectionButtonProps = {
  disabled: boolean;
  icon?: Option["icon"];
  id: string;
  text?: string;
  theme: Theme;
  toggledOn: boolean;
  handleButtonClick: (e: Event) => void;
};

export function OptionSelectionButton({
  disabled,
  icon,
  id,
  text,
  theme,
  toggledOn,
  handleButtonClick,
}: OptionSelectionButtonProps) {
  const selectedOptionIconProps: IconProps = { color: themes[theme].text.muted, theme };

  const buttonIcon = icon?.(selectedOptionIconProps);

  return html`
    <button
      class=${selectionButtonStyles({ disabled, toggledOn, theme })}
      data-testid="${id}-option-selection"
      title=${text}
      type="button"
      aria-haspopup="menu"
      aria-expanded=${toggledOn}
      aria-controls="option-menu"
      @click=${handleButtonClick}
    >
      ${buttonIcon ?? nothing}
      ${text ? html`<span class=${dropdownButtonTextStyles}>${text}</span>` : nothing}
      ${
        toggledOn
          ? AngleUp({ color: themes[theme].text.muted, theme })
          : AngleDown({ color: themes[theme].text.muted, theme })
      }
    </button>
  `;
}

const iconSize = "16px";

const selectionButtonStyles = ({
  disabled,
  toggledOn,
  theme,
}: {
  disabled: boolean;
  toggledOn: boolean;
  theme: Theme;
}) => css`
  ${typography.body2}

  gap: ${spacing["1.5"]};
  user-select: none;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  columns: ${iconSize} max-content ${iconSize};
  border-radius: 9px;
  padding: 6px 9px;
  min-height: 30px;
  max-height: fit-content;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 500;
  transition:
    background-color 140ms ease,
    border-color 140ms ease;

  ${
    disabled
      ? `
      border: 1px solid ${themes[theme].surface.border};
      background-color: ${themes[theme].secondary["300"]};
      cursor: not-allowed;
      color: ${themes[theme].text.muted};
    `
      : `
      border: 1px solid ${themes[theme].surface.border};
      background-color: ${toggledOn ? themes[theme].surface.hover : themes[theme].surface.sunken};
      cursor: pointer;
      color: ${themes[theme].text.muted};

      :hover {
        border-color: ${themes[theme].surface.borderStrong};
        background-color: ${themes[theme].surface.hover};
        color: ${themes[theme].text.main};
      }
      :focus-visible {
        outline: 2px solid ${themes[theme].primary["600"]};
        outline-offset: 1px;
      }
    `
  }

  > svg {
    max-width: ${iconSize};
    max-height: ${iconSize};
    height: auto;
  }
`;

const dropdownButtonTextStyles = css`
  overflow-x: hidden;
  text-overflow: ellipsis;
`;
