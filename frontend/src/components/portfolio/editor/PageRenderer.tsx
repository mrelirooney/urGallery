"use client";

import React, { useEffect, useRef } from "react";
import MediaSlot from "../primitives/MediaSlot";
import {
  HeroLayoutSquare00Template,
  HeroLayoutSquare01Template,
  HeroLayoutVertical01Template,
  HeroLayoutHorizontal01Template,
  TextOnlyTemplate,
  MediaOnlyTemplate,
} from "../templates";

export type LayoutType =
  | "HeroLayoutSquare00"
  | "HeroLayoutSquare01"
  | "HeroLayoutVertical01"
  | "HeroLayoutHorizontal01"
  | "TextOnly"
  | "TextOnlyCenter"
  | "MediaOnly"
  | "MediaOnlyVertical"
  | "MediaOnlyHorizontal"
  | "MediaOnlyWide";

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
  variant?: "default" | "textOnly" | "textOnlyCenter";
};

function TextColumn({
  title,
  description,
  pageIndex,
  isEditor,
  onChangeTitle,
  onChangeDescription,
  variant = "default",
}: TextColumnProps) {
  if (isEditor) {
    if (variant === "textOnlyCenter") {
      return (
        <div className="flex flex-col gap-2 w-full text-center">
          <input
            className="w-full text-2xl md:text-4xl font-bold leading-tight text-center border border-neutral-500/60 rounded-md px-4 py-1 outline-none focus:border-neutral-200"
            style={{ color: "var(--artist-text, #faf7f2)", backgroundColor: "var(--artist-background, #11100e)" }}
            value={title}
            onChange={(e) => onChangeTitle?.(pageIndex, e.target.value)}
          />
          <input
            className="w-full text-base text-center border border-neutral-500/60 rounded-md px-4 py-1 outline-none focus:border-neutral-200"
            style={{ color: "var(--artist-text, #faf7f2)", backgroundColor: "var(--artist-background, #11100e)" }}
            value={description}
            onChange={(e) => onChangeDescription?.(pageIndex, e.target.value)}
          />
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <input
          className="w-full text-5xl font-bold leading-tight border border-neutral-500/60 px-6 py-3 outline-none focus:border-neutral-200"
          style={{
            color: "var(--artist-text, #faf7f2)",
            background: "linear-gradient(to right, var(--artist-accent, #c96a4a) .5%, var(--artist-background, #11100e) .5%)",
          }}
          value={title}
          onChange={(e) => onChangeTitle?.(pageIndex, e.target.value)}
        />
        <textarea
          className="w-full text-lg border border-neutral-500/60 px-6 py-3 outline-none focus:border-neutral-200 min-h-[45vh] overflow-hidden resize-none"
          style={{
            color: "var(--artist-background, #faf7f2)",
            background: "linear-gradient(to right, var(--artist-accent, #c96a4a) .5%, var(--artist-background, #11100e) .5%, transparent 0%)",
          }}
          value={description}
          onChange={(e) =>
            onChangeDescription?.(pageIndex, e.target.value)
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2
        className="text-5xl font-bold leading-tight px-4 py-3 rounded-md"
        style={{
          color: "var(--artist-text, #faf7f2)",
          background: "linear-gradient(to right, var(--artist-accent, #c96a4a) 50%, var(--artist-background, #11100e) 50%)",
        }}
      >
        {title}
      </h2>
      <p
        className="max-w-xl whitespace-pre-line text-lg px-4 py-3 rounded-md"
        style={{
          color: "var(--artist-text, #faf7f2)",
          background: "linear-gradient(to right, var(--artist-accent, #c96a4a) 50%, var(--artist-background, #11100e) 50%)",
        }}
      >
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
      <div className="flex h-[38vh] items-center justify-center text-neutral-400">
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
    if (layoutType === "HeroLayoutSquare01" || layoutType === "HeroLayoutVertical01" || layoutType === "HeroLayoutHorizontal01") {
      adjustHeaderTextareaHeight();
      adjustSubheaderTextareaHeight();
    }
  }, [layoutType, page.title, page.title2]);

  const isTextOnly = layoutType === "TextOnly";
  const isTextOnlyCenter = layoutType === "TextOnlyCenter";
  const isMediaOnly = layoutType === "MediaOnly";
  const isMediaOnlyVertical = layoutType === "MediaOnlyVertical";
  const isMediaOnlyHorizontal = layoutType === "MediaOnlyHorizontal";
  const isMediaOnlyWide = layoutType === "MediaOnlyWide";

  const textContent = (
    <TextColumn
      title={page.title}
      description={page.description}
      pageIndex={safeIndex}
      isEditor={isEditor}
      onChangeTitle={onChangeTitle}
      onChangeDescription={onChangeDescription}
      variant={layoutType === "TextOnly" ? "textOnly" : layoutType === "TextOnlyCenter" ? "textOnlyCenter" : "default"}
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
      <div className="relative w-full min-h-[50vh]">
        <TextOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          {textContent}
        </div>
      </div>
    );
  }

  if (isTextOnlyCenter) {
    return (
      <div className="relative w-full min-h-[50vh]">
        <TextOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          {textContent}
        </div>
      </div>
    );
  }

  if (isMediaOnly) {
    return (
      <div className="relative w-full min-h-[50vh]">
        <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden lg:block" />
        <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center items-center min-h-[50vh] py-8">
          <div
            className={`shrink-0 w-[31vw] aspect-square overflow-hidden flex items-center justify-center ${isEditor ? "cursor-pointer" : ""}`}
            style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                  opacity: 0.9,
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
        </div>
      </div>
    );
  }

  if (isMediaOnlyVertical) {
    return (
      <div className="relative w-full min-h-[50vh]">
        <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden lg:block" />
        <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center items-center min-h-[50vh] py-8">
          <div
            className={`shrink-0 h-[48vh] w-[24vw] overflow-hidden flex items-center justify-center ${isEditor ? "cursor-pointer" : ""}`}
            style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                  opacity: 0.9,
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
        </div>
      </div>
    );
  }

  if (isMediaOnlyHorizontal) {
    return (
      <div className="relative w-full min-h-[50vh]">
        <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden lg:block" />
        <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center items-center min-h-[50vh] py-8">
          <div
            className={`shrink-0 w-[55vw] h-[48vh] overflow-hidden flex items-center justify-center ${isEditor ? "cursor-pointer" : ""}`}
            style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                  opacity: 0.9,
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
        </div>
      </div>
    );
  }

  if (isMediaOnlyWide) {
    return (
      <div className="relative w-full min-h-[50vh]">
        <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden lg:block" />
        <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center items-center min-h-[50vh] py-8">
          <div
            className={`shrink-0 w-[55vw] h-[48vh] overflow-hidden flex items-center justify-center ${isEditor ? "cursor-pointer" : ""}`}
            style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                  opacity: 0.9,
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
        <svg className="z-11 absolute top-0 left-[17vw]" width="39%" height="auto" viewBox="0 0 590 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="1.5" width="587" height="87" fill="var(--artist-text, #faf7f2)" stroke="var(--artist-background, #11100e)" stroke-width="2"/>
        </svg>

          {/* Image layer: centered on full page width, behind text (z-0) */}
          <div className="absolute inset-0 flex justify-center items-center z-10 pointer-events-none">
            <div
              onClick={handleMediaClick}
              className={`
                relative aspect-square w-[18.75vw] border-4
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
          <div className="absolute left-0 top-18 w-[26vw] pl-0 pr-[5vw] h-[49vh] flex flex-col gap-0 z-10">
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
            className="z-12 absolute top-[8vh] left-[17vw] px-4 py-1 "
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
  const SQ_HERO01_IMAGE_SIZE = "w-[31vw]"; // 75% of 425px – editor preview scale
  if (layoutType === "HeroLayoutSquare01") {
    return (
      <div
        className="relative w-full min-h-[50vh] "
      >
        <div className="absolute inset-0 flex justify-center items-start z-0">
          <HeroLayoutSquare01Template className="w-full h-full max-w-7xl pointer-events-none" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-[auto_1fr] gap-[3vw] md:gap-[9vw] items-stretch min-h-[50vh] px-[2vw] py-[4vh]">
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
            {/* Col B: text (right) – max-h matches image (425px), scrollbars hidden */}
            <div className="flex flex-col gap-4 min-w-0 self-center flex-1 min-h-0 max-h-[48vh] overflow-hidden">
            {isEditor ? (
                <>
                  {/* Top spacer: header grows upward into this; equal to bottom for vertical centering */}
                  <div className="flex-1 min-h-[4vh] shrink-0" aria-hidden />
                  <div className="flex flex-col gap-4 flex-1 min-h-0">
                    <textarea
                      ref={headerTextareaRef}
                      className="w-full flex-1 min-h-0 text-4xl md:text-5xl font-bold leading-tight bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200 resize-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value={page.title}
                      onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
                      onInput={adjustHeaderTextareaHeight}
                      placeholder="Header"
                      rows={1}
                      style={{ color: "var(--artist-background, #11100e)" }}
                    />
                    <textarea
                      ref={subheaderTextareaRef}
                      className="w-full flex-1 min-h-0 text-xl text-neutral-600 bg-transparent border border-neutral-500/60 rounded-md px-4 py-2 outline-none focus:border-neutral-200 resize-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value={page.title2 || ""}
                      onChange={(e) => onChangeTitle2?.(safeIndex, e.target.value)}
                      onInput={adjustSubheaderTextareaHeight}
                      placeholder="Subheader"
                      rows={1}
                      style={{ color: "var(--artist-background, #11100e)", opacity: 0.8 }}
                    />
                  </div>
                  {/* Bottom spacer: equal to top for vertical centering */}
                  <div className="flex-1 min-h-[4vh] shrink-0" aria-hidden />
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

  // HeroLayoutVertical01: Same as HeroLayoutSquare01 but vertical image (4:5, 425px height).
  const VERT_HERO01_IMAGE = "h-[48vh] w-[24vw]"; // 4:5 portrait, 75% of 425×340
  if (layoutType === "HeroLayoutVertical01") {
    return (
      <div className="relative w-full min-h-[50vh]">
        <div className="absolute inset-0 flex justify-center items-start z-0">
          <HeroLayoutVertical01Template className="w-full h-full max-w-7xl pointer-events-none" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-[auto_1fr] gap-[3vw] md:gap-[9vw] items-stretch min-h-[50vh] px-[2vw] py-[4vh]">
            {/* Col A: vertical image (left) – 425px height, 4:5 aspect */}
            <div
              className={`shrink-0 self-center ${VERT_HERO01_IMAGE} overflow-hidden flex items-center justify-center ${isEditor ? "cursor-pointer" : ""}`}
              style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                    boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)",
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
            {/* Col B: text (right) – max-h matches image (425px), scrollbars hidden */}
            <div className="flex flex-col gap-4 min-w-0 self-center flex-1 min-h-0 max-h-[48vh] overflow-hidden">
            {isEditor ? (
                <>
                  <div className="flex-1 min-h-[4vh] shrink-0" aria-hidden />
                  <div className="flex flex-col gap-4 flex-1 min-h-0">
                    <textarea
                      ref={headerTextareaRef}
                      className="w-full flex-1 min-h-0 text-4xl md:text-5xl font-bold leading-tight bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200 resize-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value={page.title}
                      onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
                      onInput={adjustHeaderTextareaHeight}
                      placeholder="Header"
                      rows={1}
                      style={{ color: "var(--artist-background, #11100e)" }}
                    />
                    <textarea
                      ref={subheaderTextareaRef}
                      className="w-full flex-1 min-h-0 text-xl text-neutral-600 bg-transparent border border-neutral-500/60 rounded-md px-4 py-2 outline-none focus:border-neutral-200 resize-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value={page.title2 || ""}
                      onChange={(e) => onChangeTitle2?.(safeIndex, e.target.value)}
                      onInput={adjustSubheaderTextareaHeight}
                      placeholder="Subheader"
                      rows={1}
                      style={{ color: "var(--artist-background, #11100e)", opacity: 0.8 }}
                    />
                  </div>
                  <div className="flex-1 min-h-[4vh] shrink-0" aria-hidden />
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

  // HeroLayoutHorizontal01: Same as HeroLayoutSquare01 but horizontal image (5:4, 425px height, 531px width).
  const HORIZ_HERO01_IMAGE = "h-[48vh] w-[38vw] min-h-[48vh] min-w-[38vw]"; // 5:4 landscape, 75% of 425×531
  if (layoutType === "HeroLayoutHorizontal01") {
    return (
      <div className="relative w-full min-h-[50vh]">
        <div className="absolute inset-0 flex justify-center items-start z-0">
          <HeroLayoutHorizontal01Template className="w-full h-full max-w-7xl pointer-events-none" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-[auto_1fr] gap-[3vw] md:gap-[9vw] items-stretch min-h-[50vh] px-[2vw] py-[4vh]">
            {/* Col A: horizontal image (left) – 425px height, 5:4 aspect */}
            <div
              className={`shrink-0 self-center ${HORIZ_HERO01_IMAGE} overflow-hidden flex items-center justify-center ${isEditor ? "cursor-pointer" : ""}`}
              style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                    boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)",
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
            {/* Col B: text (right) – same as HeroLayoutSquare01 */}
            <div className="flex flex-col gap-4 min-w-0 self-center flex-1 min-h-0 max-h-[48vh] overflow-hidden">
            {isEditor ? (
                <>
                  <div className="flex-1 min-h-[4vh] shrink-0" aria-hidden />
                  <div className="flex flex-col gap-4 flex-1 min-h-0">
                    <textarea
                      ref={headerTextareaRef}
                      className="w-full flex-1 min-h-0 text-4xl md:text-5xl font-bold leading-tight bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200 resize-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value={page.title}
                      onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
                      onInput={adjustHeaderTextareaHeight}
                      placeholder="Header"
                      rows={1}
                      style={{ color: "var(--artist-background, #11100e)" }}
                    />
                    <textarea
                      ref={subheaderTextareaRef}
                      className="w-full flex-1 min-h-0 text-xl text-neutral-600 bg-transparent border border-neutral-500/60 rounded-md px-4 py-2 outline-none focus:border-neutral-200 resize-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value={page.title2 || ""}
                      onChange={(e) => onChangeTitle2?.(safeIndex, e.target.value)}
                      onInput={adjustSubheaderTextareaHeight}
                      placeholder="Subheader"
                      rows={1}
                      style={{ color: "var(--artist-background, #11100e)", opacity: 0.8 }}
                    />
                  </div>
                  <div className="flex-1 min-h-[4vh] shrink-0" aria-hidden />
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
      <div className="max-w-6xl mx-auto py-[6vh]">
        <div className="text-center text-neutral-400">
          Layout type &quot;{layoutType}&quot; is not supported.
        </div>
      </div>
    </div>
  );
}
