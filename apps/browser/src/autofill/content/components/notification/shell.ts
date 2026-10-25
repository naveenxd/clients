import { css } from "@emotion/css";

import { Theme } from "@bitwarden/common/platform/enums";

import { elevation, motion, themes } from "../constants/styles";

/**
 * Double-bezel shell for notification variants that render their children
 * directly. Layered backgrounds paint the 1px bezel and the inner glass core
 * without introducing an extra wrapper element, which keeps the Lit template
 * child order stable for positional tests.
 */
export const notificationShellStyles = (theme: Theme) => css`
  position: absolute;
  right: 16px;
  top: 16px;
  box-sizing: border-box;
  width: 380px;
  border-radius: 14px;
  border: 1px solid ${themes[theme].surface.borderStrong};
  background-color: ${themes[theme].background.DEFAULT};
  box-shadow: ${elevation.overlay(theme)};
  overflow: hidden;
  color: ${themes[theme].text.main};
  -webkit-font-smoothing: antialiased;
  animation: notification-enter 220ms ${motion.easeOut} both;

  @keyframes notification-enter {
    ${motion.enter}
  }

  ${motion.reducedMotion}
`;
