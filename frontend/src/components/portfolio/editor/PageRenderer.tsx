"use client";

import React, { useRef } from "react";
import { getTextColorForBackground } from "@/lib/colorUtils";

export type LayoutType = "layout-1";

export type MediaShapeType = "1:1" | "4:5" | "9:16" | "16:9" | "5:4" | "21:9";

export interface PortfolioPageData {
  id: number | string;
  layoutType: LayoutType;
  title: string;
  description: string;
  mediaSrc: string | null;
  mediaShape?: MediaShapeType;
  title2?: string;
  mediaSrc2?: string | null;
  mediaShape2?: MediaShapeType;
  mediaShape2_2?: MediaShapeType;
  description2?: string;
}

export interface PageRendererProps {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  isEditor?: boolean;
  customColors?: {
    text?: string;
    background?: string;
  };
  layoutOverride?: LayoutType | null;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
  onChangeImage?: (pageIndex: number, file: File | null) => void;
  onChangeTitle2?: (pageIndex: number, newTitle: string) => void;
  onChangeLayout?: (pageIndex: number, layout: LayoutType) => void;
  onChangeMediaShape?: (pageIndex: number, shape: MediaShapeType) => void;
}

export default function PageRenderer({
  pages,
  currentPageIndex,
  isEditor = false,
  customColors,
  layoutOverride,
  onChangeTitle,
  onChangeDescription,
  onChangeImage,
}: PageRendererProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!pages || pages.length === 0) {
    return (
      <div className="flex h-[38vh] items-center justify-center text-neutral-400">
        No pages yet.
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(currentPageIndex, 0), pages.length - 1);
  const page = pages[safeIndex];
  if (!page) return null;

  const layoutType = layoutOverride ?? page.layoutType;
  const { title, description, mediaSrc } = page;

  const handleMediaClick = () => {
    if (isEditor && onChangeImage) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChangeImage) return;
    onChangeImage(safeIndex, e.target.files?.[0] ?? null);
  };

  // layout-1: Magazine-style – same structure as view PageRenderer
  // Header: off-white on dark bg, off-black on light bg (contrasts with editor canvas bg)
  const canvasBg = customColors?.background ?? "#faf7f2";
  const headerStyle = {
    color: getTextColorForBackground(canvasBg),
    borderTop: "6px solid var(--artist-accent, #c96a4a)",
    borderBottom: "6px solid var(--artist-accent, #c96a4a)",
    borderLeft: "none",
    borderRight: "none",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
  };

  const headerEl = (
    <input
      className="w-full portfolio-header-massive bg-transparent rounded-md px-4 py-2 outline-none focus:border-neutral-200"
      style={headerStyle}
      value={title}
      onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
    />
  );

  const bodyContent = (
    <textarea
      className="w-full portfolio-description whitespace-pre-line bg-transparent border border-neutral-500/60 rounded-md px-4 py-2 outline-none focus:border-neutral-200 min-h-[120px]"
      style={{ color: "var(--artist-accent-text, #faf7f2)" }}
      value={description}
      onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
    />
  );

  const mediaContent = (
    <div
      onClick={handleMediaClick}
      className={`w-full h-full min-h-[200px] flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
    >
      {mediaSrc ? (
        <img
          src={mediaSrc}
          alt="Portfolio media"
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full min-h-[200px] items-center justify-center text-sm border-2 border-dashed border-neutral-500/50 rounded-md"
          style={{ color: "var(--artist-accent-text, #faf7f2)", opacity: 0.9 }}
        >
          {isEditor ? "Click to add image" : "No media"}
        </div>
      )}
      {isEditor && onChangeImage && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </div>
  );

  return (
    <div className="w-full layout-1-magazine" data-layout="layout-1">
      {/* Vertical: mobile + tablet (below lg) – image → header → orange block */}
      <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
        <div className="w-full aspect-[9/16] max-h-[60vh] overflow-hidden">
          {mediaContent}
        </div>
        <div className="px-4 py-6 text-center">
          {headerEl}
        </div>
        <div className="mx-4 mb-6 rounded-xs overflow-hidden" style={{ backgroundColor: "var(--artist-accent, #c96a4a)" }}>
          {bodyContent}
        </div>
      </div>

      {/* Horizontal: desktop (lg+) – text left ~57%, image right ~43% */}
      <div className="hidden lg:grid lg:grid-cols-[4fr_3fr] lg:min-h-[calc(100dvh-12rem)] lg:gap-0 w-full">
        <div className="flex flex-col justify-center pl-4 pr-6 lg:pl-8 lg:pr-10 xl:pl-10 xl:pr-12 py-8">
          {headerEl}
          <div
            className="relative rounded-xs overflow-hidden mt-4"
            style={{ backgroundColor: "var(--artist-accent, #c96a4a)" }}
          >
            {bodyContent}
          </div>
        </div>
        <div className="w-full aspect-[9/16] max-h-full overflow-hidden">
          {mediaContent}
        </div>
      </div>
    </div>
  );
}
