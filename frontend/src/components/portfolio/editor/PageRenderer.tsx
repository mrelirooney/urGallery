"use client";

import React, { useRef } from "react";
import MediaSlot from "../primitives/MediaSlot";


/** All supported layouts – must match Django choices */
export type LayoutType =
  | "MediaLeft_TextRight"
  | "MediaRight_TextLeft"
  | "MediaTop_TextBottom"
  | "MediaBottom_TextTop"
  | "TextOnly"
  | "MediaOnly";

/** Normalized media shape for a page */
export type MediaShapeType = "1:1" | "9:16" | "16:9" | "4:5" | "5:4";

/** Normalized page data used by the editor */
export interface PortfolioPageData {
  id: number;
  layoutType: LayoutType;
  title: string;
  description: string;
  mediaSrc?: string | null;
  mediaShape?: MediaShapeType | null;
}

export interface PageRendererProps {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  isEditor?: boolean;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
  onChangeImage?: (pageIndex: number, file: File) => void;
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
    // EDITOR MODE – input + textarea
    return (
      <div className="flex flex-col gap-6">
        <input
          className="w-full text-5xl font-bold leading-tight text-neutral-50 bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200"
          value={title}
          onChange={(e) => onChangeTitle?.(pageIndex, e.target.value)}
        />
        <textarea
          className="w-full text-lg text-neutral-100 bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200"
          value={description}
          onChange={(e) => onChangeDescription?.(pageIndex, e.target.value)}
        />
      </div>
    );
  }
  // VIEW MODE – plain text
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
  // Use Math.min to prevent index errors if currentPageIndex is out of bounds
  const safeIndex = Math.min(
    currentPageIndex,
    pages.length > 0 ? pages.length - 1 : 0
  );
  const page = pages[safeIndex];

  // **FIX 1: Critical Null/Undefined Check**
  // This prevents runtime errors when accessing properties of a missing page
  if (!page) {
    return (
      <p className="text-neutral-400 text-center py-10">
        The current page data is missing or could not be loaded.
      </p>
    );
  }
  // **End Fix 1**

  const { id, layoutType, title, description, mediaSrc, mediaShape } = page;

  // ... (rest of media click and shape logic, unchanged)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaClick = () => {
    if (isEditor) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onChangeImage) {
      onChangeImage(safeIndex, e.target.files[0]);
    }
  };

  // 1. Determine base content
  const isTwoColumn =
    layoutType === "MediaLeft_TextRight" || layoutType === "MediaRight_TextLeft";
  const isTextOnly = layoutType === "TextOnly";
  const isMediaOnly = layoutType === "MediaOnly";

  const fullWidthClass =
    isTextOnly || isMediaOnly ? "max-w-4xl w-full" : "max-w-5xl w-full";

  // Shared content components
  const textContent = (
    <TextColumn
      pageIndex={safeIndex}
      title={page.title}
      description={page.description}
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
          src={page.mediaSrc || ""}
          alt="Media Goes Here"
          shape={page.mediaShape || "16:9"}
        />
      </div>

      {/* Hidden file input */}
      {isEditor && (
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

  return (
    <div key={id} className="w-full">
      {(() => {
        // Default classes for 50/50 split
        let mediaColClass = "w-full md:w-1/2";
        let textColClass = "w-full md:w-1/2";
        let mediaOrderClass = "";
        let textOrderClass = "";

        // Handle Media Right / Text Left order
        if (layoutType === "MediaRight_TextLeft") {
          mediaOrderClass = "md:order-2";
          textOrderClass = "md:order-1";
        }

        // Handle shape-based column sizing for Two-Column layouts
        if (isTwoColumn) {
          const shape = page.mediaShape;

          if (shape === "4:5" || shape === "9:16") {
            // Taller shapes get less space
            mediaColClass = "w-full md:w-5/12";
            textColClass = "w-full md:w-7/12";
          } else if (shape === "16:9") {
            // Wider shapes get more space
            mediaColClass = "w-full md:w-7/12";
            textColClass = "w-full md:w-5/12";
          } else if (shape === "5:4") {
            // Slightly wide
            mediaColClass = "w-full md:w-6/12";
            textColClass = "w-full md:w-6/12";
          }
          // 1:1 stays 50/50
        }

        let content = null;

        if (isTextOnly) {
          // Full-width, centered text column
          content = <div className="w-full max-w-2xl mx-auto">{textContent}</div>;
        } else if (isMediaOnly) {
          // Full-width, centered media column
          content = <div className="w-full max-w-5xl">{mediaContent}</div>;
        } else if (isTwoColumn) {
          // Two-column layout (Media Left/Right)
          // **FIX 2: Use a single wrapper div instead of a fragment**
          content = (
            <div 
              // Removed key here, as the parent div has the key=id
              className="flex flex-col md:flex-row gap-16 w-full"
            >
              {/* Media */}
              <div className={`${mediaColClass} ${mediaOrderClass}`}>
                {mediaContent}
              </div>
              {/* Text */}
              <div className={`${textColClass} ${textOrderClass}`}>
                {textContent}
              </div>
            </div>
          );
          // **End Fix 2**
        } else {
          // Top/Bottom Layouts
          content = (
            <div className={`flex flex-col gap-16 items-center justify-center ${fullWidthClass}`}>
              {/* For Top/Bottom, we render them sequentially */}
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
          );
        }

        return content;
      })()}
    </div>
  );
}

