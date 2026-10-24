import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { EventSecurity } from "../../../utils/event-security";
import { themes, spacing } from "../constants/styles";
import { PencilSquare } from "../icons";

const editButtonIconSize = "16px";
const editButtonInset = spacing["1"];
const editButtonSize = `calc(${editButtonIconSize} + (${editButtonInset} * 2))`;

export type EditButtonProps = {
  buttonAction: (e: Event) => void;
  buttonText: string;
  disabled?: boolean;
  theme: Theme;
};

export function EditButton({ buttonAction, buttonText, disabled = false, theme }: EditButtonProps) {
  return html`
    <button
      type="button"
      title=${buttonText}
      aria-label=${buttonText}
      class=${editButtonStyles({ disabled, theme })}
      @click=${(event: Event) => {
        if (EventSecurity.isEventTrusted(event) && !disabled) {
          buttonAction(event);
        }
      }}
    >
      ${PencilSquare({ disabled, theme })}
    </button>
  `;
}

const editButtonStyles = ({ disabled, theme }: { disabled?: boolean; theme: Theme }) => css`
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${editButtonSize};
  height: ${editButtonSize};
  border: 1px solid transparent;
  border-radius: 8px;
  background-color: transparent;
  color: ${themes[theme].text.muted};
  padding: ${editButtonInset};
  transition:
    background-color 140ms ease,
    color 140ms ease;

  ${
    !disabled
      ? `
    cursor: pointer;

    :hover {
      background-color: ${themes[theme].surface.hover};
      color: ${themes[theme].text.main};
    }
    :focus-visible {
      outline: 2px solid ${themes[theme].primary["600"]};
      outline-offset: 1px;
    }
  `
      : ""
  }

  > svg {
    width: ${editButtonIconSize};
    height: ${editButtonIconSize};
  }
`;
