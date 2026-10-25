import { css } from "@emotion/css";
import { html, nothing, TemplateResult } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { EventSecurity } from "../../../utils/event-security";
import { IconProps } from "../common-types";
import { motion, themes, typography } from "../constants/styles";

export type InlineMenuActionI18n = {
  actionAria: string;
};

export type InlineMenuActionProps = {
  actionText: string;
  i18n: InlineMenuActionI18n;
  theme: Theme;
  handleAction: (e: Event) => void;
  handleKeyUp?: (e: KeyboardEvent) => void;
  icon?: (props: IconProps) => TemplateResult;
  actionDataTestId?: string;
  borderedTop?: boolean;
};

export function InlineMenuAction({
  actionText,
  i18n,
  theme,
  handleAction,
  handleKeyUp,
  icon,
  actionDataTestId,
  borderedTop = false,
}: InlineMenuActionProps) {
  const handleButtonClick = (event: Event) => {
    if (EventSecurity.isEventTrusted(event)) {
      handleAction(event);
    }
  };

  const handleButtonKeyUp = (event: KeyboardEvent) => {
    if (handleKeyUp && EventSecurity.isEventTrusted(event)) {
      handleKeyUp(event);
    }
  };

  return html`
    <div class=${actionContainerStyles(theme, borderedTop)}>
      <button
        type="button"
        class=${actionButtonStyles(theme)}
        tabindex="-1"
        data-testid="${actionDataTestId}"
        aria-label=${i18n.actionAria}
        @click=${handleButtonClick}
        @keyup=${handleButtonKeyUp}
      >
        ${
          icon
            ? html`
                <span class=${actionIconStyles(theme)}>
                  ${icon({ theme, color: themes[theme].primary["600"] })}
                </span>
              `
            : nothing
        }
        <span>${actionText}</span>
      </button>
    </div>
  `;
}

const actionContainerStyles = (theme: Theme, borderedTop: boolean) => css`
  box-sizing: border-box;
  width: 100%;
  padding: 3px 4px;
  background-color: transparent;

  ${
    borderedTop
      ? css`
          border-top: 1px solid ${themes[theme].surface.border};
          margin-top: 3px;
          padding-top: 4px;
        `
      : css``
  }
`;

const actionButtonStyles = (theme: Theme) => css`
  ${typography.body2}

  user-select: none;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 550;
  color: ${themes[theme].primary["600"]};
  transition:
    background-color 140ms ${motion.easeOut},
    border-color 140ms ${motion.easeOut};

  :hover {
    background-color: ${themes[theme].surface.hover};
    border-color: ${themes[theme].surface.border};
  }

  :active {
    transform: scale(0.995);
  }

  :focus-visible {
    outline: 2px solid ${themes[theme].primary["600"]};
    outline-offset: 1px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    :hover,
    :active {
      transform: none;
    }
  }
`;

const actionIconStyles = (theme: Theme) => css`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: ${themes[theme].primary["100"]};

  > svg,
  > span {
    width: 14px;
    height: 14px;
  }

  svg {
    width: 14px;
    height: 14px;
    vertical-align: middle;
  }
`;
