import { css } from "@emotion/css";
import { html } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { themes } from "../constants/styles";

export function NotificationHeaderMessage({ message, theme }: { message: string; theme: Theme }) {
  return html`
    <span title=${message} class=${notificationHeaderMessageStyles(theme)}>${message}</span>
  `;
}

const notificationHeaderMessageStyles = (theme: Theme) => css`
  flex-grow: 1;
  overflow-x: hidden;
  text-align: left;
  text-overflow: ellipsis;
  line-height: 20px;
  white-space: nowrap;
  color: ${themes[theme].text.main};
  font-family: Inter, sans-serif;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
`;
