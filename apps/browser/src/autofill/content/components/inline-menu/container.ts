import { css } from "@emotion/css";
import { html, TemplateResult } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { elevation, motion, themes } from "../constants/styles";

export type InlineMenuContainerProps = {
  children: TemplateResult | TemplateResult[];
  dataTestId?: string;
  theme: Theme;
};

export function InlineMenuContainer({ children, dataTestId, theme }: InlineMenuContainerProps) {
  return html`
    <div data-testid="${dataTestId}" class=${inlineMenuShellStyles(theme)}>
      <div class=${inlineMenuCoreStyles(theme)}>${children}</div>
    </div>
  `;
}

const inlineMenuShellStyles = (theme: Theme) => css`
  box-sizing: border-box;
  width: 100%;
  padding: 1px;
  border-radius: 14px;
  background-color: ${themes[theme].surface.borderStrong};
  box-shadow: ${elevation.overlay(theme)};
  animation: inline-menu-enter 200ms ${motion.easeOut} both;

  @keyframes inline-menu-enter {
    ${motion.enter}
  }

  ${motion.reducedMotion}
`;

const inlineMenuCoreStyles = (theme: Theme) => css`
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  border-radius: 13px;
  background-color: ${themes[theme].background.DEFAULT};
  color: ${themes[theme].text.main};
  -webkit-font-smoothing: antialiased;
`;
