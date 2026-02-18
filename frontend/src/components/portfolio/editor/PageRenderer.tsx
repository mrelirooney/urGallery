"use client";

import React, { useEffect, useRef } from "react";
import MediaSlot from "../primitives/MediaSlot";
import {
  HeroLayoutSquare00Template,
  HeroLayoutSquare01Template,
  TextOnlyTemplate,
  MediaOnlyTemplate,
} from "../templates";

export type LayoutType =
  | "HeroLayoutSquare00"
  | "HeroLayoutSquare01"
  | "TextOnly"
  | "MediaOnly";

export type MediaShapeType =
  | "1:1"
  | "4:5"
  | "9:16"
  | "16:9"
  | "5:4"
  | "21:9";

export interface PortfolioPageData {
  id: number | string;
  layoutType: LayoutType;
  title: string;
  description: string;
  mediaSrc: string | null;
  mediaShape2?: MediaShapeType;
  title2?: string;
  // Kept for API compatibility (backend may send these)
  mediaSrc2?: string | null;
  mediaShape2_2?: MediaShapeType;
  description2?: string;
}

export interface PageRendererProps {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  isEditor?: boolean;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
  onChangeImage?: (pageIndex: number, file: File | null) => void;
  onChangeTitle2?: (pageIndex: number, newTitle: string) => void;
  onChangeLayout?: (pageIndex: number, layout: LayoutType) => void;
  onChangeMediaShape?: (pageIndex: number, shape: MediaShapeType) => void;
}

type TextColumnProps = {
  title: string;
  description: string;
  pageIndex: number;
  isEditor?: boolean;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
};

function TextColumn({
  title,
  description,
  pageIndex,
  isEditor,
  onChangeTitle,
  onChangeDescription,
}: TextColumnProps) {
  if (isEditor) {
    return (
      <div className="flex flex-col">
        <input
          className="w-full text-5xl font-bold leading-tight text-neutral-50 bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200"
          value={title}
          onChange={(e) => onChangeTitle?.(pageIndex, e.target.value)}
        />
        <textarea
          className="w-full text-lg text-neutral-100 bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200 min-h-[200px] overflow-hidden resize-none"
          value={description}
          onChange={(e) =>
            onChangeDescription?.(pageIndex, e.target.value)
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-5xl font-bold leading-tight text-neutral-50">
        {title}
      </h2>
      <p className="max-w-xl whitespace-pre-line text-lg text-neutral-300">
        {description}
      </p>
    </div>
  );
}

export default function PageRenderer({
  pages,
  currentPageIndex,
  isEditor = false,
  onChangeTitle,
  onChangeDescription,
  onChangeImage,
  onChangeTitle2,
}: PageRendererProps) {
  if (!pages || pages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-neutral-400">
        No pages yet.
      </div>
    );
  }

  const safeIndex = Math.min(
    Math.max(currentPageIndex, 0),
    pages.length - 1,
  );
  const page = pages[safeIndex];

  if (!page) {
    return null;
  }

  const { layoutType, mediaShape2 } = page;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const headerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const subheaderTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleMediaClick = () => {
    if (!isEditor || !onChangeImage) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!onChangeImage) return;
    const file = event.target.files?.[0] ?? null;
    onChangeImage(safeIndex, file);
  };

  const adjustHeaderTextareaHeight = () => {
    const el = headerTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const adjustSubheaderTextareaHeight = () => {
    const el = subheaderTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (layoutType === "HeroLayoutSquare01") {
      adjustHeaderTextareaHeight();
      adjustSubheaderTextareaHeight();
    }
  }, [layoutType, page.title, page.title2]);

  const isTextOnly = layoutType === "TextOnly";
  const isMediaOnly = layoutType === "MediaOnly";

  const textContent = (
    <TextColumn
      title={page.title}
      description={page.description}
      pageIndex={safeIndex}
      isEditor={isEditor}
      onChangeTitle={onChangeTitle}
      onChangeDescription={onChangeDescription}
    />
  );

  const mediaContent = (
    <>
      <div
        onClick={handleMediaClick}
        className={isEditor ? "cursor-pointer" : ""}
      >
        <MediaSlot
          src={page.mediaSrc}
          alt="Portfolio media"
          shape={mediaShape2 || "1:1"}
        />
      </div>
      {isEditor && onChangeImage && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </>
  );

  // Layout rendering
  if (isTextOnly) {
    return (
      <div className="relative w-full min-h-[40vh]">
        <TextOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
        <div className="relative z-10 flex justify-center w-full">
          <div className="w-full max-w-4xl">
            {textContent}
          </div>
        </div>
      </div>
    );
  }

  if (isMediaOnly) {
    return (
      <div className="relative w-full min-h-[40vh]">
        <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
        <div className="relative z-10 flex justify-center w-full">
          <div className="w-full max-w-5xl">
            {mediaContent}
          </div>
        </div>
      </div>
    );
  }

  // Hero layout (Title Page 1): Headline + large centered square image + subtitle overlay + decorative lines
  if (layoutType === "HeroLayoutSquare00") {
    const heroHeadlineContent = isEditor ? (
      <textarea
        className="w-full h-[33vh] uppercase overflow-hidden resize-none text-5xl md:text-6xl font-bold leading-tight tracking-wide bg-transparent border border-neutral-500/60 rounded-md pl-0 pr-1 py-1 outline-none focus:border-neutral-200"
        value={page.title}
        onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
        placeholder="Headline"
        style={{ 
          color: "transparent",
          WebkitTextStroke: "1.5px var(--artist-background, #11100e)", 
          caretColor: "var(--artist-background, #11100e)",
        }}
        />
    ) : (
      <h2
        className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
        style={{
          color: "transparent",
          WebkitTextStroke: "2px var(--artist-background, #11100e)",
          textShadow: "-1px -1px 0 var(--artist-background, #11100e), 1px -1px 0 var(--artist-text, #faf7f2), -1px 1px 0 var(--artist-text, #faf7f2), 1px 1px 0 var(--artist-text, #faf7f2)",
        }}
      >
        {page.title}
      </h2>
    );

    return (
      <div
        className="relative w-full h-full"
        style={{ backgroundColor: "var(--artist-text, #faf7f2)" }}
      >
        <div className="absolute inset-0 flex justify-start items-start z-0">
        <HeroLayoutSquare00Template className="w-full h-full max-w-6xl pointer-events-none" />
        </div>
        {/* Content wrapper: same max-w-6xl as footer, full height */}
        <div className="relative z-10 h-[50vh] md:h-[55vh] lg:h-[60vh] xl:h-[66vh] w-full pt-0">
        <svg className="z-11 absolute top-0 left-170" width="39%" height="auto" viewBox="0 0 590 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="1.5" width="587" height="87" fill="var(--artist-text, #faf7f2)" stroke="var(--artist-background, #11100e)" stroke-width="2"/>
        </svg>

          {/* Image layer: centered on full page width, behind text (z-0) */}
          <div className="absolute inset-0 flex justify-center items-center z-10 pointer-events-none">
            <div
              onClick={handleMediaClick}
              className={`
                relative aspect-square w-[25vw] border-4
                flex items-center justify-center overflow-hidden
                ${isEditor ? "cursor-pointer pointer-events-auto" : ""}
              `}
              style={{ borderColor: "var(--artist-accent, #c96a4a)" }}
            >
              {page.mediaSrc ? (
                <img
                  src={page.mediaSrc}
                  alt="Portfolio media"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm border-2 border-dashed"
                  style={{ color: "var(--artist-text, #faf7f2)", opacity: 0.6, borderColor: "var(--artist-accent, #c96a4a)" }}
                >
                  No image
                </div>
              )}
            </div>
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

          {/* Text layer: fixed width on left, same position as before (z-10) */}
          <div className="absolute left-0 top-18 w-[360px] pl-0 pr-14 h-[49vh] flex flex-col gap-0 z-10">
            {heroHeadlineContent}
            {isEditor ? (
              <textarea
                className="w-full overflow-hidden resize-none flex-1 leading-tight tracking-wide text-md bg-transparent border border-neutral-500/60 rounded-md px-0 py-2.5 outline-none focus:border-neutral-200"
                value={page.description}
                onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
                placeholder="Paragraph text"
                style={{ color: "var(--artist-background, #11100e)" }}
              />
            ) : (
              <p
                className="flex-1 max-w-xl whitespace-pre-line text-lg"
                style={{ color: "var(--artist-background, #11100e)"}}
              >
                {page.description}
              </p>
            )}
          </div>
          {/* Subtitle overlay box - over the white rectangle area */}
          <div
            className="z-12 absolute top-54 left-170 px-4 py-1 "
            onClick={(e) => e.stopPropagation()}
            style={{
              color: "var(--artist-accent, #c96a4a)",
            }}
          >
            {isEditor && onChangeTitle2 ? (
              <input
                type="text"
                value={page.title2 || ""}
                onChange={(e) => onChangeTitle2?.(safeIndex, e.target.value)}
                placeholder="Subtitle"
                className="bg-transparent text-[36px] uppercase tracking-wide w-100"
                style={{ color: "var(--artist-accent, #c96a4a)" }}
              />
            ) : (
              <span
                className="text-[36px] uppercase tracking-wide"
                style={{ color: "var(--artist-accent, #c96a4a)" }}
              >
                {page.title2 || "SUB TITLE"}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // HeroLayoutSquare01: Grid layout – text left, image right. Always side-by-side.
  // Copy-paste template: swap grid-cols to [auto_1fr] for image-left; change IMAGE_SIZE for media size.
  const SQ_HERO01_IMAGE_SIZE = "w-[425px]"; // Fixed size – no flex weirdness. Change to w-[280px] or w-[400px] as needed.
  if (layoutType === "HeroLayoutSquare01") {
    return (
      <div
        className="relative w-full min-h-[50vh] "
        style={{ backgroundColor: "var(--artist-text, #faf7f2)" }}
      >
        <div className="absolute inset-0 flex justify-center items-start z-0">
          <HeroLayoutSquare01Template className="w-full h-full max-w-7xl pointer-events-none" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-[auto_1fr] gap-8 md:gap-24 items-stretch min-h-[50vh] py-8">
            {/* Col A: image (left) – fixed size via SQ_HERO01_IMAGE_SIZE */}
            <div
              className={`shrink-0 self-center ${SQ_HERO01_IMAGE_SIZE} aspect-square overflow-hidden flex items-center justify-center ${isEditor ? "cursor-pointer" : ""}`}
              style={{ boxShadow: '0 0 0 15px var(--artist-accent, #c96a4a)' }}
              onClick={handleMediaClick}
            >
              {page.mediaSrc ? (
                <img
                  src={page.mediaSrc}
                  alt="Portfolio media"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm"
                  style={{
                    color: "var(--artist-text, #faf7f2)",
                    backgroundColor: "rgb(130, 130, 130)", 
                    opacity: 1,
                    boxShadow: '0 0 0 15px var(--artist-accent, #c96a4a)',
                  }}
                >
                  No image
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
            {/* Col B: text (right) – header grows upward; text boxes centered vertically */}
            <div className="flex flex-col gap-4 min-w-0 self-stretch flex-1 min-h-0">
              {isEditor ? (
                <>
                  {/* Top spacer: header grows upward into this; equal to bottom for vertical centering */}
                  <div className="flex-1 min-h-[2rem]" aria-hidden />
                  <div className="flex flex-col gap-4">
                    <textarea
                      ref={headerTextareaRef}
                      className="w-full text-4xl md:text-5xl font-bold leading-tight bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200 resize-none overflow-hidden"
                      value={page.title}
                      onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
                      onInput={adjustHeaderTextareaHeight}
                      placeholder="Header"
                      rows={1}
                      style={{ color: "var(--artist-background, #11100e)" }}
                    />
                    <textarea
                      ref={subheaderTextareaRef}
                      className="w-full text-xl text-neutral-600 bg-transparent border border-neutral-500/60 rounded-md px-4 py-2 outline-none focus:border-neutral-200 resize-none overflow-hidden"
                      value={page.title2 || ""}
                      onChange={(e) => onChangeTitle2?.(safeIndex, e.target.value)}
                      onInput={adjustSubheaderTextareaHeight}
                      placeholder="Subheader"
                      rows={1}
                      style={{ color: "var(--artist-background, #11100e)", opacity: 0.8 }}
                    />
                  </div>
                  {/* Bottom spacer: equal to top for vertical centering */}
                  <div className="flex-1 min-h-[2rem]" aria-hidden />
                </>
              ) : (
                <>
                  <h2
                    className="text-4xl md:text-5xl font-bold leading-tight"
                    style={{ color: "var(--artist-background, #11100e)" }}
                  >
                    {page.title || "Header"}
                  </h2>
                  <p
                    className="text-xl"
                    style={{ color: "var(--artist-background, #11100e)", opacity: 0.8 }}
                  >
                    {page.title2 || "Subheader"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for any unknown layout
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-6xl mx-auto py-10">
        <div className="text-center text-neutral-400">
          Layout type &quot;{layoutType}&quot; is not supported.
        </div>
      </div>
    </div>
  );
}
