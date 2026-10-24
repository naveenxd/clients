import { css } from "@emotion/css";
import { html, nothing, TemplateResult } from "lit";

import { Theme } from "@bitwarden/common/platform/enums";

import { InlineMenuCipherData } from "../../../background/abstractions/overlay.background";
import { scrollbarStyles, spacing, themes, typography } from "../constants/styles";

import { InlineMenuAction, InlineMenuActionProps } from "./action";
import { InlineMenuCipherItem, InlineMenuCipherItemProps } from "./cipher-item";
import { InlineMenuContainer } from "./container";

export type InlineMenuCipherListNewItem = Pick<
  InlineMenuActionProps,
  "actionText" | "i18n" | "handleAction" | "handleKeyUp" | "icon" | "actionDataTestId"
>;

export type InlineMenuCipherListProps = Omit<
  InlineMenuCipherItemProps,
  "cipher" | "bordered" | "showTotpUsername" | "handleFillCipher" | "handleViewCipher"
> & {
  ciphers: InlineMenuCipherData[];
  handleFillCipher: (cipher: InlineMenuCipherData, e: Event) => void;
  handleViewCipher: (cipher: InlineMenuCipherData, e: Event) => void;
  passkeysText?: string;
  passwordsText?: string;
  showPasskeysLabels?: boolean;
  newItem?: InlineMenuCipherListNewItem;
};

export function InlineMenuCipherList({
  ciphers,
  theme,
  passkeysText = "",
  passwordsText = "",
  showPasskeysLabels,
  handleFillCipher,
  handleViewCipher,
  newItem,
  ...itemProps
}: InlineMenuCipherListProps) {
  const showTotpUsername =
    ciphers.filter((cipher) => cipher.login?.totpField && cipher.login?.totp).length > 1;
  const withHeadings =
    showPasskeysLabels ??
    (ciphers.some((cipher) => !!cipher.login?.passkey) &&
      ciphers.some((cipher) => !cipher.login?.passkey));
  const ordered = withHeadings ? partitionByPasskey(ciphers) : ciphers;

  return InlineMenuContainer({
    theme,
    dataTestId: "inline-menu-cipher-list",
    children: html`
      <div role="list" data-cipher-list-scroll class=${cipherListStyles(theme)}>
        ${renderItems(ordered, withHeadings, theme, passkeysText, passwordsText, (cipher, index) =>
          InlineMenuCipherItem({
            ...itemProps,
            theme,
            cipher,
            bordered: index < ordered.length - 1,
            showTotpUsername,
            handleFillCipher: (e) => handleFillCipher(cipher, e),
            handleViewCipher: (e) => handleViewCipher(cipher, e),
          }),
        )}
      </div>
      ${
        newItem
          ? InlineMenuAction({
              ...newItem,
              theme,
              borderedTop: true,
            })
          : nothing
      }
    `,
  });
}

function partitionByPasskey(ciphers: InlineMenuCipherData[]) {
  return [
    ...ciphers.filter((cipher) => cipher.login?.passkey),
    ...ciphers.filter((cipher) => !cipher.login?.passkey),
  ];
}

function renderItems(
  ciphers: InlineMenuCipherData[],
  withHeadings: boolean,
  theme: Theme,
  passkeysText: string,
  passwordsText: string,
  renderItem: (cipher: InlineMenuCipherData, index: number) => TemplateResult,
): TemplateResult[] {
  if (!withHeadings) {
    return ciphers.map(renderItem);
  }

  const items: TemplateResult[] = [];
  let sawPasskey = false;
  let sawPassword = false;

  ciphers.forEach((cipher, index) => {
    if (cipher.login?.passkey && !sawPasskey) {
      sawPasskey = true;
      items.push(heading(theme, passkeysText));
    } else if (!cipher.login?.passkey && !sawPassword) {
      sawPassword = true;
      items.push(heading(theme, passwordsText));
    }
    items.push(renderItem(cipher, index));
  });

  return items;
}

function heading(theme: Theme, text: string) {
  return html`
    <div data-cipher-heading role="presentation" class=${cipherListHeadingStyles(theme)}>
      ${text}
    </div>
  `;
}

const cipherListStyles = (theme: Theme) => {
  const scrollbars = scrollbarStyles(theme);

  return css`
    box-sizing: border-box;
    max-height: 272px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 6px 6px 10px;
    background-color: transparent;
    mask-image: linear-gradient(180deg, #000 calc(100% - 10px), transparent);
    -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - 10px), transparent);

    ${scrollbars.default}
    ${scrollbars.safari}
  `;
};

const cipherListHeadingStyles = (theme: Theme) => css`
  ${typography.helperMedium}

  position: sticky;
  top: 0;
  z-index: 1;
  box-sizing: border-box;
  width: calc(100% - 2px);
  margin: 0 1px 3px;
  padding: ${spacing["2"]} ${spacing["2"]} ${spacing["1"]};
  border-radius: 10px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${themes[theme].text.muted};
  background-image: linear-gradient(
    180deg,
    ${themes[theme].surface.coreFrom} 0%,
    ${themes[theme].surface.coreFrom} 62%,
    transparent 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;
