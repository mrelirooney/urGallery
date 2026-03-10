// frontend/src/components/portfolio/PageRenderer.tsx
import React from "react";
import { getTextColorForBackground } from "@/lib/colorUtils";

/** All supported layouts – must match Django choices exactly */
export type LayoutType = "layout-1";

export type MediaShapeType = "1:1" | "9:16" | "16:9" | "4:5" | "5:4" | "21:9";

/** Normalized shape the frontend uses for a page */
export type PortfolioPageData = {
  id?: number;
  pageNumber: number;
  layoutType: LayoutType;
  title: string;
  description: string;
  mediaSrc?: string | null;
  mediaShape?: MediaShapeType;
  mediaSrc2?: string | null;
  mediaShape2?: MediaShapeType;
  title2?: string;
  description2?: string;
};

type PageRendererProps = {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  isEditor?: boolean;
  customColors?: {
    text?: string;
    background?: string;
  };
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
};

export default function PageRenderer({
  pages,
  currentPageIndex,
  isEditor,
  customColors,
  onChangeTitle,
  onChangeDescription,
}: PageRendererProps) {
  const page = pages[currentPageIndex];
  if (!page) return null;

  const { title, description, mediaSrc } = page;

  // layout-1: Magazine-style – vertical on mobile/tablet, horizontal split on desktop
  // Header: off-white on dark bg, off-black on light bg (contrasts with portfolio bg)
  const portfolioBg = customColors?.text || "#11100e";
  const headerStyle = {
    color: getTextColorForBackground(portfolioBg),
    borderTop: "6px solid var(--artist-accent, #c96a4a)",
    borderBottom: "6px solid var(--artist-accent, #c96a4a)",
    borderLeft: "none",
    borderRight: "none",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
  };

  const headerEl = isEditor ? (
    <input
      className="w-full portfolio-header-massive bg-transparent rounded-md px-4 py-2 outline-none focus:border-neutral-200"
      style={headerStyle}
      value={title}
      onChange={(e) => onChangeTitle?.(currentPageIndex, e.target.value)}
    />
  ) : (
    <h2 className="portfolio-header-massive" style={headerStyle}>
      {title}
    </h2>
  );

  const bodyContent = isEditor ? (
    <textarea
      className="w-full portfolio-description whitespace-pre-line bg-transparent border border-neutral-500/60 rounded-md px-4 py-2 outline-none focus:border-neutral-200 min-h-[120px]"
      style={{ color: "var(--artist-accent-text, #faf7f2)" }}
      value={description}
      onChange={(e) => onChangeDescription?.(currentPageIndex, e.target.value)}
    />
  ) : (
    <p className="w-full whitespace-pre-line portfolio-description px-4 py-3" style={{ color: "var(--artist-accent-text, #faf7f2)" }}>
      {description}
    </p>
  );

  const imageEl = mediaSrc ? (
    <img
      src={mediaSrc}
      alt="Portfolio media"
      className="w-full h-full object-cover"
      loading="lazy"
    />
  ) : (
    <div
      className="w-full h-full min-h-[200px] flex items-center justify-center text-sm"
      style={{
        backgroundColor: "rgb(130, 130, 130)",
        color: "var(--artist-accent-text, #faf7f2)",
        opacity: 0.8,
      }}
    >
      No media selected
    </div>
  );

  return (
    <div className="w-full layout-1-magazine" data-layout="layout-1">
      {/* Vertical: mobile + tablet (below lg) – image → header → orange block */}
      <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
        {/* Image – vertical frame, fills slot, no expansion */}
        <div className="w-full aspect-[9/16] max-h-[60vh] overflow-hidden">
          {imageEl}
        </div>
        {/* Header – centered */}
        <div className="px-4 py-6 text-center">
          {headerEl}
        </div>
        {/* Orange block – body text */}
        <div className="mx-4 mb-6 rounded-xs overflow-hidden" style={{ backgroundColor: "var(--artist-accent, #c96a4a)" }}>
          {bodyContent}
        </div>
      </div>

      {/* Horizontal: desktop (lg+) – text left ~57%, image right ~43% */}
      <div className="hidden lg:grid lg:grid-cols-[4fr_3fr] lg:min-h-[calc(100dvh-12rem)] lg:gap-0 w-full">
        {/* Left: text column */}
        <div className="flex flex-col justify-center pl-4 pr-6 lg:pl-0 lg:pr-10 xl:pl-0 xl:pr-12 py-8">
          {headerEl}
          {/* Orange block – full accent background */}
          <div
            className="relative rounded-xs overflow-hidden mt-4"
            style={{ backgroundColor: "var(--artist-accent, #c96a4a)" }}
          >
            {bodyContent}
          </div>
        </div>
        {/* Right: vertical frame, fills slot */}
        <div className="w-full aspect-[9/16] max-h-full overflow-hidden">
          {imageEl}
        </div>
      </div>
    </div>
  );
}
