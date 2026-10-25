import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { EventSecurity } from "../../../utils/event-security";
import { elevation, motion, spacing, themes, typography } from "../constants/styles";
import { Key, Refresh } from "../icons";

import { ColorizedPassword, ColorizedPasswordI18n } from "./colorized-password";
import { InlineMenuContainer } from "./container";

const ACTIONS_SELECTOR = "[data-password-generator-actions]";
const FILL_SELECTOR = "[data-fill-generated-password]";
const REFRESH_SELECTOR = "[data-refresh-generated-password]";

export type InlineMenuPasswordGeneratorI18n = ColorizedPasswordI18n & {
  regeneratePassword: string;
};

export type InlineMenuPasswordGeneratorProps = {
  password: string;
  headingText: string;
  theme: Theme;
  i18n: InlineMenuPasswordGeneratorI18n;
  handleFillPassword: (e: Event) => void;
  handleRefreshPassword: (e: Event) => void;
};

export function InlineMenuPasswordGenerator({
  password,
  headingText,
  theme,
  i18n,
  handleFillPassword,
  handleRefreshPassword,
}: InlineMenuPasswordGeneratorProps) {
  const onFill = (event: Event) => {
    if (EventSecurity.isEventTrusted(event)) {
      handleFillPassword(event);
    }
  };

  const onRefresh = (event: Event) => {
    if (EventSecurity.isEventTrusted(event) && event.target instanceof Element) {
      const actions = event.target.closest(ACTIONS_SELECTOR);
      actions?.classList.add("remove-outline");
      handleRefreshPassword(event);
    }
  };

  return InlineMenuContainer({
    theme,
    dataTestId: "inline-menu-password-generator",
    children: html`
      <div class=${containerStyles}>
        <div data-password-generator-actions class=${actionsStyles(theme)}>
          <button
            type="button"
            data-fill-generated-password
            tabindex="-1"
            class=${fillButtonStyles}
            aria-label=${headingText}
            @click=${onFill}
            @keyup=${(event: KeyboardEvent) => handleActionKeyUp(event, "ArrowRight")}
          >
            <span class=${keyIconStyles(theme)}>
              ${Key({ theme, color: themes[theme].primary["600"] })}
            </span>
            <div class=${contentStyles}>
              <div class=${headingStyles(theme)}>${headingText}</div>
              ${ColorizedPassword({ password, theme, i18n })}
            </div>
          </button>
          <button
            type="button"
            data-refresh-generated-password
            tabindex="-1"
            class=${refreshButtonStyles(theme)}
            aria-label=${i18n.regeneratePassword}
            @click=${onRefresh}
            @keyup=${(event: KeyboardEvent) => handleActionKeyUp(event, "ArrowLeft")}
          >
            ${Refresh({ theme, color: themes[theme].primary["600"] })}
          </button>
        </div>
      </div>
    `,
  });
}

function isTrustedActionKey(
  event: KeyboardEvent,
  arrowCode: "ArrowLeft" | "ArrowRight",
): event is KeyboardEvent & { target: HTMLElement } {
  return (
    EventSecurity.isEventTrusted(event) &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    !event.shiftKey &&
    event.target instanceof HTMLElement &&
    event.code === arrowCode
  );
}

function handleActionKeyUp(event: KeyboardEvent, arrowCode: "ArrowLeft" | "ArrowRight") {
  if (!isTrustedActionKey(event, arrowCode)) {
    return;
  }

  const actions = event.target.closest(ACTIONS_SELECTOR);
  const target =
    actions?.querySelector<HTMLElement>(
      arrowCode === "ArrowRight" ? REFRESH_SELECTOR : FILL_SELECTOR,
    ) ?? null;
  target?.focus();
  actions?.classList.toggle("remove-outline", arrowCode === "ArrowRight");
}

const containerStyles = css`
  box-sizing: border-box;
  padding: 6px;
`;

const actionsStyles = (theme: Theme) => css`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px;
  border: 1px solid ${themes[theme].surface.border};
  border-radius: 10px;
  background-color: ${themes[theme].surface.card};
  transition:
    background-color 140ms ${motion.easeOut},
    border-color 140ms ${motion.easeOut},
    box-shadow 140ms ${motion.easeOut};

  :hover {
    background-color: ${themes[theme].surface.cardHover};
    border-color: ${themes[theme].primary["300"]};
    box-shadow: ${elevation.card(theme)};
  }

  :has(:focus-visible):not(.remove-outline) {
    outline: 2px solid ${themes[theme].primary["600"]};
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const fillButtonStyles = css`
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin: 0;
  padding: 0 ${spacing["1"]} 0 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  outline: none;
  overflow: hidden;
`;

const KEY_ICON_SIZE = `30px`;
const REFRESH_ICON_SIZE = `16px`;

const keyIconStyles = (theme: Theme) => css`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${KEY_ICON_SIZE};
  height: ${KEY_ICON_SIZE};
  border-radius: 7px;
  background-color: ${themes[theme].primary["100"]};

  > svg {
    width: 16px;
    height: 16px;
  }
`;

const contentStyles = css`
  text-align: left;
`;

const headingStyles = (theme: Theme) => css`
  ${typography.helperMedium}

  margin-bottom: 3px;
  color: ${themes[theme].text.muted};
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
`;

const refreshButtonStyles = (theme: Theme) => css`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin: 0;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 10px;
  background-color: transparent;
  color: ${themes[theme].text.muted};
  cursor: pointer;
  line-height: 0;
  transition:
    background-color 160ms ${motion.easeOut},
    border-color 160ms ${motion.easeOut},
    color 160ms ${motion.easeOut};

  :hover {
    border-color: ${themes[theme].primary["300"]};
    background-color: ${themes[theme].primary["100"]};
    color: ${themes[theme].primary["600"]};
  }

  :focus-visible {
    outline: 2px solid ${themes[theme].primary["600"]};
    outline-offset: 1px;
  }

  > svg {
    width: ${REFRESH_ICON_SIZE};
    height: ${REFRESH_ICON_SIZE};
    transition: transform 260ms ${motion.spring};
  }

  :hover > svg {
    transform: rotate(90deg);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    :hover > svg {
      transform: none;
    }
  }
`;
