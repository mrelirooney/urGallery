// frontend/src/components/portfolio/PageRenderer.tsx
import React from "react";
import MediaSlot from "./primitives/MediaSlot";

/** All supported layouts – must match Django choices exactly */
export type LayoutType =
  | "MediaLeft_TextRight"
  | "MediaRight_TextLeft"
  | "MediaTop_TextBottom"
  | "MediaBottom_TextTop"
  | "MediaOnly"
  | "TextOnly";

export type MediaShapeType = "1:1" | "9:16" | "16:9" | "4:5" | "5:4";

export type PortfolioPageData = {
  layoutType: LayoutType;
  title: string;
  description: string;
  mediaSrc?: string | null;
  mediaShape?: MediaShapeType | null;
};

type PageRendererProps = {
  pages: PortfolioPageData[];
  currentPageIndex: number;
};

function TextColumn({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-5xl font-bold leading-tight text-neutral-50">
        {title}
      </h2>
      <p className="text-lg text-neutral-300 max-w-xl whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}

export default function PageRenderer({ pages, currentPageIndex }: PageRendererProps) {
  const page = pages[currentPageIndex];
  if (!page) return null;

  const { layoutType, title, description, mediaSrc, mediaShape } = page;

  // Default to square if shape missing
  const shape: MediaShapeType = mediaShape ?? "1:1";

  const text = <TextColumn title={title} description={description} />;

  // ------------------------------
  // Shape-aware media sizing
  // ------------------------------
  // Tailwind can't handle dynamic "col-span-${x}", so we map manually
  let mediaCols = "col-span-6";
  let textCols = "col-span-6";

  // Portrait / vertical → media narrower
  if (shape === "9:16" ) {
    mediaCols = "col-span-4";
    textCols = "col-span-8";
  }

  else if (shape === "4:5") {
    mediaCols = "col-span-5";
    textCols = "col-span-7";
  }

  // Ultra wide → media a bit wider
  else if (shape === "16:9") {
    mediaCols = "col-span-7";
    textCols = "col-span-5";
  }
  // "1:1" and "5:4" fall back to 6 / 6

  // Media block (or placeholder if no src yet)
  const media = mediaSrc ? (
    <MediaSlot src={mediaSrc} alt="Media" shape={shape} />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-neutral-800/60 text-neutral-500 text-sm">
      {/* Empty media placeholder */}
      No media selected
    </div>
  );

  // ------------------------------
  // Layout switch
  // ------------------------------
  switch (layoutType) {
    case "MediaLeft_TextRight":
      return (
        <div className="grid grid-cols-12 gap-10 items-center">
          <div className={mediaCols}>{media}</div>
          <div className={textCols}>{text}</div>
        </div>
      );

    case "MediaRight_TextLeft":
      return (
        <div className="grid grid-cols-12 gap-10 items-center">
          <div className={textCols}>{text}</div>
          <div className={mediaCols}>{media}</div>
        </div>
      );

    case "MediaTop_TextBottom":
      return (
        <div className="flex flex-col gap-10 items-stretch">
          <div className="w-full">{media}</div>
          <div className="w-full">{text}</div>
        </div>
      );

    case "MediaBottom_TextTop":
      return (
        <div className="flex flex-col gap-10 items-stretch">
          <div className="w-full">{text}</div>
          <div className="w-full">{media}</div>
        </div>
      );

    case "MediaOnly":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="max-w-6xl w-full">{media}</div>
        </div>
      );

    case "TextOnly":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="max-w-6xl w-full text-align">{text}</div>
        </div>
      );

    default:
      // Safety fallback if a new layout gets added in Django but not here
      return (
        <div className="w-full h-full flex items-center justify-center text-red-400">
          Unknown layout:
          <span className="ml-2 font-mono">{String(layoutType)}</span>
        </div>
      );
  }
}
