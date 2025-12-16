"use client";

import React, { useRef } from "react";
import MediaSlot from "../primitives/MediaSlot";

export type LayoutType =
  | "MediaLeft_TextRight"
  | "MediaRight_TextLeft"
  | "TwoColumnMediaOnly"
  | "TwoColumnMediaWithText"
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

  // Second column fields (for two-column layouts)
  mediaSrc2?: string | null;
  mediaShape2_2?: MediaShapeType;  // or name it mediaShape2
  title2?: string;
  description2?: string;
}

export interface PageRendererProps {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  isEditor?: boolean;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
  onChangeImage?: (pageIndex: number, file: File | null) => void;
  // Second column handlers
  onChangeImage2?: (pageIndex: number, file: File | null) => void;
  onChangeTitle2?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription2?: (pageIndex: number, newDesc: string) => void;
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
      <div className="flex flex-col">
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
  onChangeImage2,
  onChangeTitle2,
  onChangeDescription2,
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
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);

  const handleMediaClick = () => {
    if (!isEditor || !onChangeImage) return;
    fileInputRef.current?.click();
  };

  const handleMediaClick2 = () => {
    if (!isEditor || !onChangeImage2) return;
    fileInputRef2.current?.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!onChangeImage) return;
    const file = event.target.files?.[0] ?? null;
    onChangeImage(safeIndex, file);
  };

  const handleFileChange2 = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!onChangeImage2) return;
    const file = event.target.files?.[0] ?? null;
    onChangeImage2(safeIndex, file);
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
    <div className="w-full h-full bg-neutral-800">
      <div className="
        max-w-6xl mx-auto flex items-center
        h-[50vh]        /* laptop canvas height */
        md:h-[55vh]     /* medium screens */
        lg:h-[60vh]     /* large screens */
        xl:h-[66vh]     /* optional if you want bigger screens */
      ">
        <div className="grid items-end md:items-center md:grid-cols-12">
          {/* Text column */}
          <div
            className={`
              w-full
              md:col-span-6
              ${mediaOnRight ? "md:order-1" : "md:order-2"}
            `}
          >
            {textContent}
          </div>

          {/* Media column */}
          <div
            className={`
              w-full
              md:col-span-6
              
              flex
              ${mediaOnRight ? "justify-end" : "justify-start"}
              ${mediaOnRight ? "md:order-2" : "md:order-1"}
            `}
          >
            <div className="border-2 border-neutral-100 rounded-md">{mediaContent}</div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

  // Two Column Media Only layout
  if (layoutType === "TwoColumnMediaOnly") {
    const mediaContent2 = (
      <>
        <div
          onClick={handleMediaClick2}
          className={isEditor ? "cursor-pointer" : ""}
        >
          <MediaSlot
            src={page.mediaSrc2 || null}
            alt="Portfolio media 2"
            shape={page.mediaShape2_2 || "1:1"}
          />
        </div>
        {isEditor && onChangeImage2 && (
          <input
            ref={fileInputRef2}
            type="file"
            accept="image/*"
            onChange={handleFileChange2}
            className="hidden"
          />
        )}
      </>
    );

    return (
      <div className="w-full h-full">
        <div className="max-w-6xl mx-auto flex items-center h-[40vh] md:h-[45vh] lg:h-[50vh] xl:h-[55vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="border-2 border-neutral-100 rounded-md">
              {mediaContent}
            </div>
            <div className="border-2 border-neutral-100 rounded-md">
              {mediaContent2}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Two Column Media With Text layout
  {/* This layout is not supported yet 
  if (layoutType === "TwoColumnMediaWithText") {
    const textContent2 = (
      <div className="flex flex-col gap-4">
        {isEditor ? (
          <>
            <input
              className="w-full text-3xl font-bold leading-tight text-neutral-50 bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200"
              value={page.title2 || ""}
              onChange={(e) => onChangeTitle2?.(safeIndex, e.target.value)}
              placeholder="Second column title"
            />
            <textarea
              className="w-full text-base text-neutral-100 bg-transparent border border-neutral-500/60 rounded-md px-4 py-3 outline-none focus:border-neutral-200 min-h-[150px]"
              value={page.description2 || ""}
              onChange={(e) => onChangeDescription2?.(safeIndex, e.target.value)}
              placeholder="Second column description"
            />
          </>
        ) : (
          <>
            <h3 className="text-3xl font-bold leading-tight text-neutral-50">
              {page.title2}
            </h3>
            <p className="whitespace-pre-line text-base text-neutral-300">
              {page.description2}
            </p>
          </>
        )}
      </div>
    );

    const mediaContent2 = (
      <>
        <div
          onClick={handleMediaClick2}
          className={isEditor ? "cursor-pointer" : ""}
        >
          <MediaSlot
            src={page.mediaSrc2 || null}
            alt="Portfolio media 2"
            shape={page.mediaShape2_2 || "1:1"}
          />
        </div>
        {isEditor && onChangeImage2 && (
          <input
            ref={fileInputRef2}
            type="file"
            accept="image/*"
            onChange={handleFileChange2}
            className="hidden"
          />
        )}
      </>
    );

    return (
     <div className="w-full h-full">
        <div className="max-w-6xl mx-auto flex items-center h-[50vh] md:h-[55vh] lg:h-[60vh] xl:h-[66vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* First column 
            <div className="flex flex-col gap-4">
              <div className="border-2 border-neutral-100 rounded-md">
                {mediaContent}
              </div>
              {textContent}
            </div>
            {/* Second column 
            <div className="flex flex-col gap-4">
              <div className="border-2 border-neutral-100 rounded-md">
                {mediaContent2}
              </div>
              {textContent2}
            </div>
          </div>
        </div>
      </div>
    );
  }
*/}
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
