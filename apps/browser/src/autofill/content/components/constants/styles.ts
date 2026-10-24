import { Theme } from "@bitwarden/common/platform/enums";

import { IconProps } from "../common-types";

const lightTheme = {
  transparent: {
    hover: `rgb(15 23 42 / 0.04)`,
  },
  shadow: `15, 23, 42`,
  primary: {
    100: `rgba(23, 93, 220 / 0.08)`,
    300: `rgba(23, 93, 220 / 0.28)`,
    600: `rgba(23, 93, 220)`,
    700: `rgba(21, 75, 178)`,
  },
  secondary: {
    100: `rgba(241, 245, 249)`,
    300: `rgba(226, 232, 240)`,
    500: `rgba(148, 163, 184)`,
    600: `rgba(100, 116, 139)`,
    700: `rgba(71, 85, 105)`,
  },
  success: {
    100: `rgba(219, 229, 246)`,
    600: `rgba(121, 161, 233)`,
    700: `rgba(26, 65, 172)`,
  },
  danger: {
    100: `rgba(255, 236, 239)`,
    600: `rgba(203, 38, 58)`,
    700: `rgba(149, 27, 42)`,
  },
  warning: {
    100: `rgba(255, 248, 228)`,
    600: `rgba(255, 191, 0)`,
    700: `rgba(172, 88, 0)`,
  },
  info: {
    100: `rgba(219, 229, 246)`,
    600: `rgba(121, 161, 233)`,
    700: `rgba(26, 65, 172)`,
  },
  art: {
    primary: `rgba(2, 15, 102)`,
    accent: `rgba(44, 221, 223)`,
  },
  text: {
    main: `rgba(15, 23, 42)`,
    muted: `rgba(100, 116, 139)`,
    contrast: `rgba(255, 255, 255)`,
    alt2: `rgba(255, 255, 255)`,
    code: `rgba(192, 17, 118)`,
  },
  background: {
    DEFAULT: `rgba(255, 255, 255)`,
    alt: `rgba(248, 250, 252)`,
    alt2: `rgba(23, 92, 219)`,
    alt3: `rgba(26, 65, 172)`,
    alt4: `rgba(2, 15, 102)`,
  },
  surface: {
    shellFrom: `rgba(255, 255, 255, 0.98)`,
    shellTo: `rgba(246, 249, 253, 0.98)`,
    raised: `rgba(255, 255, 255)`,
    sunken: `rgba(241, 245, 249)`,
    border: `rgba(15, 23, 42, 0.08)`,
    borderStrong: `rgba(15, 23, 42, 0.16)`,
    highlight: `rgba(255, 255, 255, 0.9)`,
    hover: `rgba(15, 23, 42, 0.045)`,
    bezelFrom: `rgba(255, 255, 255, 0.98)`,
    bezelTo: `rgba(23, 93, 220, 0.22)`,
    coreFrom: `rgba(255, 255, 255, 0.97)`,
    coreTo: `rgba(243, 247, 255, 0.94)`,
    glass: `rgba(255, 255, 255, 0.58)`,
    glassStrong: `rgba(255, 255, 255, 0.86)`,
    card: `rgba(255, 255, 255, 0.66)`,
    cardHover: `rgba(255, 255, 255, 0.95)`,
  },
  accentGradient: `linear-gradient(135deg, #1a41ac 0%, #175ddc 52%, #2563eb 100%)`,
  passkeyGradient: `linear-gradient(135deg, #6d4aff 0%, #4f46e5 55%, #4338ca 100%)`,
  passkey: {
    100: `rgba(99, 102, 241, 0.1)`,
    300: `rgba(99, 102, 241, 0.3)`,
    600: `rgba(79, 70, 229)`,
    700: `rgba(67, 56, 202)`,
  },
  brandLogo: `rgba(23, 93, 220)`,
  passwordSpecial: `rgba(184, 0, 23)`,
  passwordNumber: `rgba(20, 82, 193)`,
};

const darkTheme = {
  transparent: {
    hover: `rgb(255 255 255 / 0.04)`,
  },
  shadow: `0, 0, 0`,
  primary: {
    100: `rgba(59, 130, 246 / 0.14)`,
    300: `rgba(59, 130, 246 / 0.32)`,
    600: `rgba(96, 165, 250)`,
    700: `rgba(147, 197, 253)`,
  },
  secondary: {
    100: `rgba(255, 255, 255 / 0.06)`,
    300: `rgba(255, 255, 255 / 0.11)`,
    500: `rgba(100, 116, 139)`,
    600: `rgba(148, 163, 184)`,
    700: `rgba(203, 213, 225)`,
  },
  success: {
    100: `rgba(11, 111, 21)`,
    600: `rgba(107, 241, 120)`,
    700: `rgba(191, 236, 195)`,
  },
  danger: {
    100: `rgba(149, 27, 42)`,
    600: `rgba(255, 78, 99)`,
    700: `rgba(255, 236, 239)`,
  },
  warning: {
    100: `rgba(172, 88, 0)`,
    600: `rgba(255, 191, 0)`,
    700: `rgba(255, 248, 228)`,
  },
  info: {
    100: `rgba(26, 65, 172)`,
    600: `rgba(121, 161, 233)`,
    700: `rgba(219, 229, 246)`,
  },
  art: {
    primary: `rgba(243, 246, 249)`,
    accent: `rgba(44, 221, 233)`,
  },
  text: {
    main: `rgba(241, 245, 249)`,
    muted: `rgba(148, 163, 184)`,
    contrast: `rgba(9, 13, 22)`,
    alt2: `rgba(255, 255, 255)`,
    code: `rgba(255, 143, 208)`,
  },
  background: {
    DEFAULT: `rgba(24, 32, 47)`,
    alt: `rgba(13, 18, 29)`,
    alt2: `rgba(47, 52, 61)`,
    alt3: `rgba(48, 57, 70)`,
    alt4: `rgba(9, 13, 22)`,
  },
  surface: {
    shellFrom: `rgba(20, 27, 41, 0.96)`,
    shellTo: `rgba(11, 16, 26, 0.96)`,
    raised: `rgba(255, 255, 255, 0.045)`,
    sunken: `rgba(255, 255, 255, 0.025)`,
    border: `rgba(255, 255, 255, 0.09)`,
    borderStrong: `rgba(255, 255, 255, 0.18)`,
    highlight: `rgba(255, 255, 255, 0.07)`,
    hover: `rgba(255, 255, 255, 0.07)`,
    bezelFrom: `rgba(255, 255, 255, 0.24)`,
    bezelTo: `rgba(129, 140, 248, 0.18)`,
    coreFrom: `rgba(23, 31, 47, 0.97)`,
    coreTo: `rgba(11, 16, 27, 0.96)`,
    glass: `rgba(255, 255, 255, 0.045)`,
    glassStrong: `rgba(255, 255, 255, 0.085)`,
    card: `rgba(255, 255, 255, 0.04)`,
    cardHover: `rgba(255, 255, 255, 0.085)`,
  },
  accentGradient: `linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #60a5fa 100%)`,
  passkeyGradient: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 55%, #6366f1 100%)`,
  passkey: {
    100: `rgba(129, 140, 248, 0.16)`,
    300: `rgba(129, 140, 248, 0.35)`,
    600: `rgba(165, 180, 252)`,
    700: `rgba(199, 210, 254)`,
  },
  brandLogo: `rgba(255, 255, 255)`,
  passwordSpecial: `rgba(255, 141, 133)`,
  passwordNumber: `rgba(111, 157, 241)`,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,

  // For compatibility
  system: lightTheme,
};

export const spacing = {
  4: `16px`,
  3: `12px`,
  2: `8px`,
  "1.5": `6px`,
  1: `4px`,
};

export const border = {
  radius: {
    large: `12px`,
    xlarge: `18px`,
    xxl: `24px`,
    full: `9999px`,
  },
};

export const motion = {
  easeOut: `cubic-bezier(0.23, 1, 0.32, 1)`,
  spring: `cubic-bezier(0.34, 1.56, 0.64, 1)`,
  enter: `
    0% {
      opacity: 0;
      transform: translateY(-8px) scale(0.97);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  `,
  reducedMotion: `
    @media (prefers-reduced-motion: reduce) {
      animation: none;
      transition: none;
    }
  `,
};

export const elevation = {
  overlay: (theme: Theme) => `
    0 32px 64px -24px rgba(${themes[theme].shadow}, ${theme === "dark" ? "0.85" : "0.4"}),
    0 12px 26px -16px rgba(${themes[theme].shadow}, ${theme === "dark" ? "0.6" : "0.22"}),
    inset 0 1px 0 ${themes[theme].surface.highlight}
  `,
  raised: (theme: Theme) => `
    0 1px 2px rgba(${themes[theme].shadow}, ${theme === "dark" ? "0.35" : "0.06"})
  `,
  card: (theme: Theme) => `
    0 1px 2px rgba(${themes[theme].shadow}, ${theme === "dark" ? "0.3" : "0.05"}),
    0 10px 22px -16px rgba(${themes[theme].shadow}, ${theme === "dark" ? "0.55" : "0.28"}),
    inset 0 1px 0 ${themes[theme].surface.highlight}
  `,
};

export const typography = {
  body1: `
    line-height: 24px;
    font-family: Inter, sans-serif;
    font-size: 16px;
  `,
  body2: `
    line-height: 20px;
    font-family: Inter, sans-serif;
    font-size: 14px;
  `,
  helperMedium: `
    line-height: 16px;
    font-family: Inter, sans-serif;
    font-size: 12px;
  `,
};

export const ruleNames = {
  fill: "fill",
  stroke: "stroke",
} as const;

type RuleName = (typeof ruleNames)[keyof typeof ruleNames];

/*
 * `color` is an intentionally generic name here, since either fill or stroke may apply, due to
 * inconsistent SVG construction. This consequently precludes dynamic multi-colored icons here.
 */
export const buildIconColorRule = (color: string, rule: RuleName = ruleNames.fill) => `
  ${rule}: ${color};
`;

export const resolveIconColor = ({ color, disabled, theme }: IconProps) =>
  disabled ? themes[theme].secondary["300"] : color || themes[theme].text.main;

export const animations = {
  spin: `
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(359deg);
    }
  `,
};

export function scrollbarStyles(theme: Theme, color?: { thumb?: string; track?: string }) {
  const thumbColor = color?.thumb || themes[theme].secondary["500"];
  const trackColor = color?.track || themes[theme].background.alt;

  return {
    /* FireFox & Chrome support */
    default: `
      scrollbar-color: ${thumbColor} ${trackColor};
    `,
    /* Safari Support */
    safari: `
      ::-webkit-scrollbar {
        overflow: auto;
      }
      ::-webkit-scrollbar-thumb {
        border-width: 4px;
        border-style: solid;
        border-radius: 0.5rem;
        border-color: transparent;
        background-clip: content-box;
        background-color: ${thumbColor};
      }
      ::-webkit-scrollbar-track {
        ${trackColor};
      }
      ::-webkit-scrollbar-thumb:hover {
        ${themes[theme].secondary["600"]};
      }
    `,
  };
}
