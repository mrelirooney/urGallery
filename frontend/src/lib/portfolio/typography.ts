/** Portfolio title typography (layout-9 standard). Applies at all breakpoints. */
export const PORTFOLIO_PAGE_TITLE_CLASS = "portfolio-page-title";

/** Portfolio description typography (layout-9 standard). Not for details fields. */
export const PORTFOLIO_PAGE_DESCRIPTION_CLASS = "portfolio-page-description";

/** Portfolio details typography — small supplementary text (location, date, credits). */
export const PORTFOLIO_PAGE_DETAILS_CLASS = "portfolio-page-details";

/** Laptop+ page title vertical padding – shared header breathing room (layout-1 baseline). */
export const PORTFOLIO_LAPTOP_HEADER_PADDING_TOP = "1.2rem";
export const PORTFOLIO_LAPTOP_HEADER_PADDING_BOTTOM = "1.2rem";

/** Editor title textarea – auto-height via field-sizing: content (see globals.css). */
export const PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS =
  "w-full min-w-0 portfolio-page-title bg-transparent rounded-md py-2 text-left outline-none focus:ring-2 focus:ring-white/50 resize-none overflow-hidden break-words";

/** Editor description textarea – auto-height via field-sizing: content (see globals.css). */
export const PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS =
  "layout-9-text-block w-full min-w-0 portfolio-description portfolio-page-description bg-transparent rounded-md py-2 text-left outline-none focus:ring-2 focus:ring-white/50 resize-none overflow-hidden break-words whitespace-pre-line";

/** Editor details textarea – smaller type (see globals.css --portfolio-details). */
export const PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS =
  "w-full min-w-0 portfolio-page-details bg-transparent rounded-md py-2 text-left outline-none focus:ring-2 focus:ring-white/50 resize-none overflow-hidden break-words whitespace-pre-line";

/** Layout-1 title field – square accent borders, tight spacing above description block. */
export const LAYOUT_1_TITLE_FIELD_CLASS = "layout-1-title-field";

/** Layout-1 description field – internal padding matches live px-4 py-3. */
export const LAYOUT_1_DESCRIPTION_FIELD_CLASS = "layout-1-description-field";

/** Layout-2 desktop overlay textareas – bottom-anchored, grow upward, capped at 50% of image area. */
export const LAYOUT_2_OVERLAY_TEXTAREA_CLASS =
  "layout-2-overlay-text self-end max-h-[50%]";

/** Layout-3 centered text column – title + description share this width (see globals.css). */
export const LAYOUT_3_TEXT_COLUMN_CLASS = "layout-3-text-column w-full shrink-0";

/** Layout-3 overlay wrapper – vertically centers the text column as one unit. */
export const LAYOUT_3_TEXT_OVERLAY_CLASS = "layout-3-text-overlay";

/** Layout-6 right-aligned text fields (overrides shared textarea text-left). */
export const LAYOUT_6_TEXT_RIGHT_CLASS = "layout-6-text-right text-right";

/** Layout-6 header wrapper – shrink-wraps to text so accent border matches content width. */
export const LAYOUT_6_HEADER_BORDER_CLASS = "layout-6-header-border w-fit max-w-full";

/** Layout-6 header textarea – no shared min-height/padding so underline sits tight below text. */
export const LAYOUT_6_HEADER_FIELD_CLASS = "layout-6-header-field";

/** Layout-6 accent panel – description + details grouped, full-width, right-aligned text. */
export const LAYOUT_6_ACCENT_TEXT_GROUP_CLASS = "layout-6-accent-text-group w-full flex flex-col items-stretch gap-2";

/** Layout-13 row-1 header – left accent bar shrink-wraps to title text height. */
export const LAYOUT_13_HEADER_ACCENT_CLASS = "layout-13-header-accent w-fit max-w-full";

/** Layout-13 row-1 title textarea – no shared min-height/padding so accent bar matches text. */
export const LAYOUT_13_HEADER_FIELD_CLASS = "layout-13-header-field";

/** Layout-8 centered title + description (overrides shared textarea text-left). */
export const LAYOUT_8_TEXT_CENTER_CLASS = "layout-8-text-center text-center";

/** Layout-8 horizontal accent divider between title and description. */
export const LAYOUT_8_ACCENT_BAR_CLASS = "layout-8-accent-bar w-11/12 max-w-full";

/** Layout-8 title textarea – no shared min-height/padding so divider sits tight below text. */
export const LAYOUT_8_TITLE_FIELD_CLASS = "layout-8-title-field";

/** Layout-14 centered title + description in all three columns (overrides shared textarea text-left). */
export const LAYOUT_14_TEXT_CENTER_CLASS = "layout-14-text-center text-center";

/** Layout-14 title textarea – no shared min-height/padding so description box sits tight below text. */
export const LAYOUT_14_TITLE_FIELD_CLASS = "layout-14-title-field";

/** Layout-15 title textarea – no shared min-height/padding so description sits tight below text. */
export const LAYOUT_15_TITLE_FIELD_CLASS = "layout-15-title-field";
