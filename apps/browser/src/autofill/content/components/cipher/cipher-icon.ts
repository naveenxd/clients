import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { Globe } from "../../../content/components/icons";
import { themes } from "../constants/styles";

export type CipherIconProps = {
  color: string;
  size: string;
  theme: Theme;
  uri?: string;
  variant?: "brand" | "passkey";
};

/**
 * @param {string} props.color contextual color override if no icon URI is available
 * @param {string} props.size valid CSS `width` value, represents the width-basis of the graphic, with height maintaining original aspect-ratio
 * @param {"brand" | "passkey"} props.variant selects the accent used by the icon tile
 */
export function CipherIcon({ color, size, theme, uri, variant = "brand" }: CipherIconProps) {
  const iconClass = cipherIconStyle({ size, theme, variant });

  return uri
    ? html`<img class=${iconClass} src=${uri} alt="" data-icon-image />`
    : html`<span class=${iconClass}>${Globe({ color, theme })}</span>`;
}

const cipherIconStyle = ({
  size,
  theme,
  variant,
}: {
  size: string;
  theme: Theme;
  variant: "brand" | "passkey";
}) => {
  const accent = variant === "passkey" ? themes[theme].passkey : themes[theme].primary;

  return css`
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: ${size};
    height: ${size};
    padding: 7px;
    border: 1px solid ${accent["300"]};
    border-radius: 12px;
    background-color: ${themes[theme].surface.sunken};
    background-image: linear-gradient(150deg, ${accent["100"]} 0%, transparent 82%);
    box-shadow:
      inset 0 1px 0 ${themes[theme].surface.highlight},
      0 4px 10px -8px ${accent["600"]};
    overflow: hidden;
    object-fit: contain;
    transition:
      transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1);

    &[data-icon-image] {
      padding: 4px;
      border-color: ${themes[theme].surface.border};
      background-color: rgba(255, 255, 255, 0.92);
      background-image: none;
      box-shadow: 0 1px 2px rgba(${themes[theme].shadow}, 0.08);
    }

    > svg {
      width: 100%;
      height: 100%;
    }
  `;
};
