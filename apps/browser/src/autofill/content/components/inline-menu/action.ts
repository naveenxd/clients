import { css } from "@emotion/css";
import { html, nothing, TemplateResult } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { EventSecurity } from "../../../utils/event-security";
import { IconProps } from "../common-types";
import { border, elevation, motion, themes, typography } from "../constants/styles";

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
                  ${icon({ theme, color: "rgba(255, 255, 255)" })}
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
  padding: 4px 6px 6px;
  background-color: transparent;

  ${
    borderedTop
      ? css`
          &::before {
            content: "";
            display: block;
            height: 1px;
            margin: 0 5px 5px;
            background-image: linear-gradient(
              90deg,
              transparent,
              ${themes[theme].surface.borderStrong},
              transparent
            );
          }
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
  padding: 8px 14px 8px 8px;
  border: 1px solid ${themes[theme].surface.border};
  border-radius: ${border.radius.full};
  background-color: ${themes[theme].surface.glass};
  background-image: linear-gradient(135deg, ${themes[theme].primary["100"]} 0%, transparent 72%);
  box-shadow: inset 0 1px 0 ${themes[theme].surface.highlight};
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: ${themes[theme].primary["600"]};
  transition:
    background-color 180ms ${motion.easeOut},
    border-color 180ms ${motion.easeOut},
    box-shadow 180ms ${motion.easeOut},
    transform 180ms ${motion.spring};

  :hover {
    background-color: ${themes[theme].surface.cardHover};
    border-color: ${themes[theme].primary["300"]};
    box-shadow: ${elevation.card(theme)};
    transform: translateY(-1px);
  }

  :active {
    transform: translateY(0) scale(0.995);
  }

  :focus-visible {
    outline: 2px solid ${themes[theme].primary["600"]};
    outline-offset: 2px;
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
  width: 26px;
  height: 26px;
  border-radius: ${border.radius.full};
  background-image: ${themes[theme].accentGradient};
  box-shadow:
    0 4px 10px -4px rgba(37, 99, 235, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);

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
