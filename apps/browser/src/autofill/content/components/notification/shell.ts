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
  right: 20px;
  box-sizing: border-box;
  width: 400px;
  padding: 1px;
  border-radius: 24px;
  background-color: ${themes[theme].background.alt};
  background-image:
    radial-gradient(120% 80% at 50% -20%, ${themes[theme].surface.highlight}, transparent 55%),
    linear-gradient(
      165deg,
      ${themes[theme].surface.coreFrom} 0%,
      ${themes[theme].surface.coreTo} 100%
    ),
    linear-gradient(
      155deg,
      ${themes[theme].surface.bezelFrom} 0%,
      ${themes[theme].surface.border} 46%,
      ${themes[theme].surface.bezelTo} 100%
    );
  background-origin: content-box, content-box, border-box;
  background-clip: content-box, content-box, border-box;
  box-shadow: ${elevation.overlay(theme)};
  overflow: hidden;
  color: ${themes[theme].text.main};
  -webkit-font-smoothing: antialiased;
  backdrop-filter: blur(26px) saturate(185%);
  -webkit-backdrop-filter: blur(26px) saturate(185%);
  animation: notification-enter 260ms ${motion.spring} both;

  @keyframes notification-enter {
    ${motion.enter}
  }

  ${motion.reducedMotion}
`;
