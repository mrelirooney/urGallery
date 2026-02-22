"use client";

/**
 * [ur] logo mark - SVG with currentColor for theme-aware styling.
 *
 * To update the logo:
 * 1. Replace the SVG at public/Logos/urGalleryLogo-Secondary-mark.svg with your new design
 * 2. Ensure fill and stroke use currentColor (not hex values)
 * 3. Copy the <rect> and <text> elements into this component
 *
 * The parent sets color via style or className (e.g. text-[var(--foreground)] or custom theme color).
 */

type Props = React.SVGProps<SVGSVGElement>;

export default function UrLogoMarkSvg({ className = "", ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="5766 880 260 300"
      aria-hidden
      className={className}
      {...rest}
    >
      {/* Rect outline - stroke uses currentColor */}
      <rect
        x="5766.62"
        y="883.79"
        width="250"
        height="250"
        fill="none"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      {/* "ur" text - fill uses currentColor */}
      <text
        transform="translate(5812.2 1055.27)"
        fill="currentColor"
        fontFamily="Raleway, Raleway Italic, sans-serif"
        fontSize="173"
        fontWeight="400"
      >
        <tspan x="0" y="0" letterSpacing="0em">
          u
        </tspan>
        <tspan x="100.16" y="0" letterSpacing="0em">
          r
        </tspan>
      </text>
    </svg>
  );
}
