import { css } from "@emotion/css";
import { html, TemplateResult } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { EventSecurity } from "../../../utils/event-security";
import { motion, themes, typography } from "../constants/styles";
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
  border-radius: 8px;
  padding: 8px 16px;
  min-height: 36px;
  width: ${fullWidth ? "100%" : "auto"};
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  transition:
    background-color 140ms ${motion.easeOut},
    box-shadow 140ms ${motion.easeOut},
    transform 140ms ${motion.easeOut};

  ${
    disabled || isLoading
      ? `
    background-color: ${themes[theme].secondary["300"]};
    color: ${themes[theme].text.muted};
  `
      : `
    background-color: ${themes[theme].primary["600"]};
    cursor: pointer;
    color: rgba(255, 255, 255);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(23, 93, 220, 0.25);

    :hover {
      background-color: ${themes[theme].primary["700"]};
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1), 0 4px 8px -1px rgba(23, 93, 220, 0.35);
    }
    :active {
      transform: scale(0.985);
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
