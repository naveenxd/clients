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
  border-radius: 24px;
  background-image: linear-gradient(
    155deg,
    ${themes[theme].surface.bezelFrom} 0%,
    ${themes[theme].surface.border} 46%,
    ${themes[theme].surface.bezelTo} 100%
  );
  box-shadow: ${elevation.overlay(theme)};
  animation: inline-menu-enter 260ms ${motion.spring} both;

  @keyframes inline-menu-enter {
    ${motion.enter}
  }

  ${motion.reducedMotion}
`;

const inlineMenuCoreStyles = (theme: Theme) => css`
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  border-radius: 23px;
  background-color: ${themes[theme].background.DEFAULT};
  background-image:
    radial-gradient(120% 90% at 50% -20%, ${themes[theme].surface.highlight}, transparent 58%),
    linear-gradient(
      165deg,
      ${themes[theme].surface.coreFrom} 0%,
      ${themes[theme].surface.coreTo} 100%
    );
  color: ${themes[theme].text.main};
  -webkit-font-smoothing: antialiased;
  backdrop-filter: blur(26px) saturate(185%);
  -webkit-backdrop-filter: blur(26px) saturate(185%);
  box-shadow: inset 0 0 0 1px ${themes[theme].surface.highlight};
`;
