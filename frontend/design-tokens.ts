/**
 * urGallery Design Tokens — Source of Truth
 *
 * Use this file as the single reference for breakpoints, containers, typography,
 * and spacing. No existing Tailwind usage has been changed; adopt these tokens
 * gradually when adding or refactoring components.
 *
 * To use in Tailwind: import this file and spread into theme.extend in tailwind.config.ts
 */

export const designTokens = {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "xl-lg": "1440px",
      "2xl": "1536px",
    },
  
    maxWidth: {
      content: "36rem",   // 576px — prose/body text (replaces max-w-xl)
      medium: "42rem",   // 672px — search, settings sections
      wide: "72rem",     // 1152px — navbar, footer, hero (replaces max-w-6xl)
      site: "80rem",     // 1280px — main content, portfolio (replaces max-w-7xl)
      "7.5xl": "85rem",  // 1360px — between 7xl (1280px) and 8xl (1536px)
    },
  
    fontSize: {
      caption: ["0.75rem", { lineHeight: "1rem" }],
      "body-sm": ["0.875rem", { lineHeight: "1.25rem" }],
      body: ["1rem", { lineHeight: "1.5rem" }],
      "body-lg": ["1.125rem", { lineHeight: "1.75rem" }],
      subheading: ["1.25rem", { lineHeight: "1.75rem" }],
      "heading-sm": ["1.5rem", { lineHeight: "2rem" }],
      heading: ["1.875rem", { lineHeight: "2.25rem" }],
      "display-sm": ["2.25rem", { lineHeight: "2.5rem" }],
      display: ["3rem", { lineHeight: "1.1" }],
      "display-lg": ["3.75rem", { lineHeight: "1.1" }],
      "display-xl": ["4.5rem", { lineHeight: "1.1" }],
    },
  
    spacing: {
      "page-sm": "1rem",    // 16px — mobile page padding
      page: "1.5rem",       // 24px — tablet
      "page-lg": "2.5rem",  // 40px — desktop
      "page-xl": "4rem",    // 64px — large desktop
    },
  } as const;
  
  /** Tailwind theme.extend object — ready to spread into tailwind.config.ts */
  export const tailwindThemeExtend = {
    screens: designTokens.screens,
    maxWidth: designTokens.maxWidth,
    fontSize: designTokens.fontSize,
    spacing: designTokens.spacing,
  } as const;