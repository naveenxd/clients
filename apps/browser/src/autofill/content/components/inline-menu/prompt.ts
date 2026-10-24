import { css } from "@emotion/css";
import { html, nothing } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { themes, typography } from "../constants/styles";

import { InlineMenuAction, InlineMenuActionProps } from "./action";
import { InlineMenuContainer } from "./container";

export type InlineMenuPromptI18n = InlineMenuActionProps["i18n"];

export type InlineMenuPromptProps = Omit<InlineMenuActionProps, "borderedTop"> & {
  /** When omitted, renders action-only for scenarios like "Save to Bitwarden". */
  message?: string;
  dataTestId?: string;
};

export function InlineMenuPrompt({ message, dataTestId, ...actionProps }: InlineMenuPromptProps) {
  return InlineMenuContainer({
    theme: actionProps.theme,
    dataTestId,
    children: html`
      ${
        message
          ? html`<div class=${messageStyles(actionProps.theme)} title=${message}>${message}</div>`
          : nothing
      }
      ${InlineMenuAction({ ...actionProps, borderedTop: !!message })}
    `,
  });
}

const messageStyles = (theme: Theme) => css`
  ${typography.body2}

  box-sizing: border-box;
  width: 100%;
  padding: 12px 12px 8px;
  color: ${themes[theme].text.main};
  font-size: 13px;
  line-height: 18px;
`;
