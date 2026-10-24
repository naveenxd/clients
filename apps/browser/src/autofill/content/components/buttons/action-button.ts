import { css } from "@emotion/css";
import { html, TemplateResult } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { EventSecurity } from "../../../utils/event-security";
import { border, motion, themes, typography } from "../constants/styles";
import { Spinner } from "../icons";

export type ActionButtonProps = {
  buttonText: string | TemplateResult;
  dataTestId?: string;
  disabled?: boolean;
  isLoading?: boolean;
  theme: Theme;
  handleClick: (e: Event) => void;
  fullWidth?: boolean;
  title?: string;
};

export function ActionButton({
  buttonText,
  dataTestId,
  disabled = false,
  isLoading = false,
  theme,
  handleClick,
  fullWidth = true,
  title,
}: ActionButtonProps) {
  const handleButtonClick = (event: Event) => {
    if (EventSecurity.isEventTrusted(event) && !disabled && !isLoading) {
      handleClick(event);
    }
  };

  return html`
    <button
      class=${actionButtonStyles({ disabled, fullWidth, isLoading, theme })}
      data-testid="${dataTestId}"
      title=${title ?? buttonText}
      type="button"
      @click=${handleButtonClick}
    >
      ${isLoading ? Spinner({ theme, color: themes[theme].text.muted }) : buttonText}
    </button>
  `;
}

const actionButtonStyles = ({
  disabled,
  fullWidth,
  isLoading,
  theme,
}: {
  disabled: boolean;
  fullWidth: boolean;
  isLoading: boolean;
  theme: Theme;
}) => css`
  ${typography.body2}

  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: ${border.radius.full};
  padding: 8px 16px;
  min-height: 38px;
  width: ${fullWidth ? "100%" : "auto"};
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  transition:
    filter 160ms ${motion.easeOut},
    background-color 160ms ${motion.easeOut},
    box-shadow 160ms ${motion.easeOut},
    transform 160ms ${motion.spring};

  ${
    disabled || isLoading
      ? `
    background-color: ${themes[theme].secondary["300"]};
    color: ${themes[theme].text.muted};
  `
      : `
    background-image: ${themes[theme].accentGradient};
    background-color: ${themes[theme].primary["600"]};
    cursor: pointer;
    color: rgba(255, 255, 255);
    box-shadow:
      0 8px 20px -8px rgba(37, 99, 235, 0.72),
      inset 0 1px 0 rgba(255, 255, 255, 0.28);

    :hover {
      filter: brightness(1.06);
      color: rgba(255, 255, 255);
      transform: translateY(-1px);
      box-shadow:
        0 12px 24px -8px rgba(37, 99, 235, 0.82),
        inset 0 1px 0 rgba(255, 255, 255, 0.32);
    }
    :active {
      transform: translateY(0) scale(0.985);
    }
    :focus-visible {
      outline: 2px solid ${themes[theme].primary["600"]};
      outline-offset: 2px;
    }
  `
  }

  svg {
    padding: 2px 0; /* Match line-height of button body2 typography */
    width: auto;
    height: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    :hover,
    :active {
      transform: none;
    }
  }
`;
