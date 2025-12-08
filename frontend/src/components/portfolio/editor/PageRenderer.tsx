"use client";

import React, { useRef } from "react";
import MediaSlot from "../primitives/MediaSlot";

export type LayoutType =
  | "MediaLeft_TextRight"
  | "MediaRight_TextLeft"
  | "MediaTop_TextBottom"
  | "MediaBottom_TextTop"
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
}

export interface PageRendererProps {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  isEditor?: boolean;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
  onChangeImage?: (pageIndex: number, file: File | null) => void;
  // These are here so PortfolioEditorShell can pass them,
  // even though layout & shape are controlled by the modals.
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
      <div className="flex flex-col gap-6">
        <input
          className="w-full text-5xl font-bold leading-tight text-neutral-50 bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200"
          value={title}
          onChange={(e) => onChangeTitle?.(pageIndex, e.target.value)}
        />
        <textarea
          className="w-full text-lg text-neutral-100 bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200 min-h-[200px]"
          value={description}
          onChange={(e) =>
            onChangeDescription?.(pageIndex, e.target.value)
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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

  const { layoutType, mediaShape2, mediaSrc } = page;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const isTwoColumn =
    layoutType === "MediaLeft_TextRight" ||
    layoutType === "MediaRight_TextLeft";
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
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl">
          {textContent}
        </div>
      </div>
    );
  }

  if (isMediaOnly) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-5xl">
          {mediaContent}
        </div>
      </div>
    );
  }

  if (isTwoColumn) {
  const mediaOnRight = layoutType === "MediaRight_TextLeft";

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 bg-neutral-900">
        <div className="grid items-start md:items-center gap-10 md:gap-16 md:grid-cols-12">
          {/* Text column */}
          <div
            className={`
              w-full
              md:col-span-7
              ${mediaOnRight ? "md:order-1" : "md:order-2"}
            `}
          >
            {textContent}
          </div>

          {/* Media column */}
          <div
            className={`
              w-full
              md:col-span-5
              ${mediaOnRight ? "md:order-2" : "md:order-1"}
            `}
          >
            {mediaContent}
          </div>
        </div>
      </div>
    </div>
  );
}

  // Stacked layouts
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-10">
        {layoutType === "MediaTop_TextBottom" && (
          <>
            <div className="w-full">{mediaContent}</div>
            <div className="w-full max-w-2xl">
              {textContent}
            </div>
          </>
        )}
        {layoutType === "MediaBottom_TextTop" && (
          <>
            <div className="w-full max-w-2xl">
              {textContent}
            </div>
            <div className="w-full">{mediaContent}</div>
          </>
        )}
      </div>
    </div>
  );
}
