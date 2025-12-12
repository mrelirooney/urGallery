// frontend/src/components/portfolio/PageRenderer.tsx
import React from "react";
import MediaSlot from "./primitives/MediaSlot";

/** All supported layouts – must match Django choices exactly */
export type LayoutType =
  | "MediaLeft_TextRight"
  | "MediaRight_TextLeft"
  | "TwoColumnMediaOnly"
  | "TwoColumnMediaWithText"
  | "TextOnly"
  | "MediaOnly";

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
  // Second column fields (for two-column layouts)
  mediaSrc2?: string | null;
  mediaShape2?: MediaShapeType;
  title2?: string;
  description2?: string;
};

type PageRendererProps = {
  pages: PortfolioPageData[];
  currentPageIndex: number;

  // editor-only props (optional in view mode)
  isEditor?: boolean;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
};

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
  isEditor,
  onChangeTitle,
  onChangeDescription,
}: PageRendererProps) {
  const page = pages[currentPageIndex];
  if (!page) return null;

  const { layoutType, title, description, mediaSrc, mediaShape } = page;

  // Default to square if missing
  const shape: MediaShapeType = mediaShape ?? "1:1";

  const text = (
    <TextColumn
      title={title}
      description={description}
      pageIndex={currentPageIndex}
      isEditor={isEditor}
      onChangeTitle={onChangeTitle}
      onChangeDescription={onChangeDescription}
    />
  );

  // ----- shape-aware column widths -----
  let mediaCols = "col-span-5";
  let textCols = "col-span-7";

  if (shape === "9:16") {
    // tall, vertical – narrower media
    mediaCols = "col-span-4";
    textCols = "col-span-8";
  } else if (shape === "4:5") {
    mediaCols = "col-span-5";
    textCols = "col-span-7";
  } else if (shape === "16:9") {
    // wide – give media more room
    mediaCols = "col-span-7";
    textCols = "col-span-5";
  }
  // "1:1" and "5:4" stay 6/6

  const media = mediaSrc ? (
    <MediaSlot src={mediaSrc} alt="Media" shape={shape} />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-neutral-800/60 text-sm text-neutral-500">
      No media selected
    </div>
  );

  // Second column media (for two-column layouts)
  const media2 = page.mediaSrc2 ? (
    <MediaSlot src={page.mediaSrc2} alt="Media 2" shape={page.mediaShape2 ?? "1:1"} />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-neutral-800/60 text-sm text-neutral-500">
      No media
    </div>
  );

  // Second column text (for TwoColumnMediaWithText)
  const text2 = (
    <div className="flex flex-col gap-4">
      <h3 className="text-3xl font-bold leading-tight text-neutral-50">
        {page.title2 || ""}
      </h3>
      <p className="whitespace-pre-line text-base text-neutral-300">
        {page.description2 || ""}
      </p>
    </div>
  );

  // ----- layout switch -----
  switch (layoutType) {
    case "MediaLeft_TextRight":
      return (
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className={mediaCols}>{media}</div>
          <div className={textCols}>{text}</div>
        </div>
      );

    case "MediaRight_TextLeft":
      return (
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className={textCols}>{text}</div>
          <div className={mediaCols}>{media}</div>
        </div>
      );

    case "TwoColumnMediaOnly":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>{media}</div>
          <div>{media2}</div>
        </div>
      );

    case "TwoColumnMediaWithText":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            {media}
            {text}
          </div>
          <div className="flex flex-col gap-6">
            {media2}
            {text2}
          </div>
        </div>
      );

    case "MediaOnly":
      return <div className="w-full">{media}</div>;

    case "TextOnly":
      return <div className="w-full">{text}</div>;

    default:
      // Fallback so unknown layout still shows *something*
      return (
        <div className="flex flex-col gap-8">
          {media}
          {text}
        </div>
      );
  }
}
