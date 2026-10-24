import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { EventSecurity } from "../../../utils/event-security";
import { themes, typography } from "../constants/styles";

export type BadgeButtonProps = {
  buttonAction: (e: Event) => void;
  buttonText: string;
  itemName: string;
  disabled?: boolean;
  theme: Theme;
  username?: string;
};

export function BadgeButton({
  buttonAction,
  buttonText,
  disabled = false,
  itemName,
  theme,
  username,
}: BadgeButtonProps) {
  const handleButtonClick = (event: Event) => {
    if (EventSecurity.isEventTrusted(event) && !disabled) {
      buttonAction(event);
    }
  };

  return html`
    <button
      type="button"
      title=${buttonText}
      aria-label=${[buttonText, [itemName, username].filter(Boolean).join(" ")]}
      class=${badgeButtonStyles({ disabled, theme })}
      @click=${handleButtonClick}
    >
      ${buttonText}
    </button>
  `;
}

const badgeButtonStyles = ({ disabled, theme }: { disabled: boolean; theme: Theme }) => css`
  ${typography.helperMedium}

  user-select: none;
  border-radius: 8px;
  padding: 5px 10px;
  max-height: fit-content;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;

  ${
    disabled
      ? `
    border: 1px solid ${themes[theme].surface.border};
    background-color: ${themes[theme].secondary["300"]};
    color: ${themes[theme].text.muted};
  `
      : `
    border: 1px solid ${themes[theme].passkey["300"]};
    background-color: ${themes[theme].passkey["100"]};
    cursor: pointer;
    color: ${themes[theme].passkey["600"]};

    :hover {
      border-color: ${themes[theme].passkey["600"]};
      background-color: ${themes[theme].passkey["600"]};
      color: ${theme === "dark" ? themes[theme].text.contrast : themes[theme].text.alt2};
    }
    :focus-visible {
      outline: 2px solid ${themes[theme].primary["600"]};
      outline-offset: 2px;
    }
  `
  }
`;
