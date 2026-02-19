// frontend/src/components/portfolio/PageRenderer.tsx
import React from "react";
import MediaSlot from "./primitives/MediaSlot";
import {
  HeroLayoutSquare00Template,
  HeroLayoutSquare01Template,
  HeroLayoutVertical01Template,
  HeroLayoutHorizontal01Template,
  TextOnlyTemplate,
  MediaOnlyTemplate,
} from "./templates";

/** All supported layouts – must match Django choices exactly */
export type LayoutType =
  | "MediaLeft_TextRight"
  | "MediaRight_TextLeft"
  | "TwoColumnMediaOnly"
  | "TwoColumnMediaWithText"
  | "TextOnly"
  | "TextOnlyCenter"
  | "MediaOnly"
  | "MediaOnlyVertical"
  | "MediaOnlyHorizontal"
  | "MediaOnlyWide"
  | "HeroLayoutSquare00"
  | "HeroLayoutSquare01"
  | "HeroLayoutVertical01"
  | "HeroLayoutHorizontal01";

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
  /** When "textOnly", uses gradient backgrounds and full width (for Text Only layout) */
  /** When "textOnlyCenter", centered text, single-line height, no accent bands */
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
    // EDITOR MODE – input + textarea
    if (variant === "textOnlyCenter") {
      return (
        <div className="flex flex-col gap-2 w-full text-center">
          <input
            className="w-full text-2xl md:text-4xl font-bold leading-tight text-center bg-transparent border border-neutral-500/60 rounded-md px-4 py-1 outline-none focus:border-neutral-200"
            style={{ color: "var(--artist-text, #faf7f2)", backgroundColor: "var(--artist-background, #11100e)" }}
            value={title}
            onChange={(e) => onChangeTitle?.(pageIndex, e.target.value)}
          />
          <input
            className="w-full text-base text-center bg-transparent border border-neutral-500/60 rounded-md px-4 py-1 outline-none focus:border-neutral-200"
            style={{ color: "var(--artist-text, #faf7f2)", backgroundColor: "var(--artist-background, #11100e)" }}
            value={description}
            onChange={(e) => onChangeDescription?.(pageIndex, e.target.value)}
          />
        </div>
      );
    }
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
  if (variant === "textOnlyCenter") {
    return (
      <div className="flex flex-col gap-2 w-full text-center">
        <h2
          className="w-full text-2xl md:text-4xl font-bold leading-tight px-4 py-1"
          style={{
            color: "var(--artist-text, #faf7f2)",
            backgroundColor: "var(--artist-background, #11100e)",
          }}
        >
          {title}
        </h2>
        <p
          className="w-full whitespace-pre-line text-sm md:text-base px-4 py-1"
          style={{
            color: "var(--artist-text, #faf7f2)",
            backgroundColor: "var(--artist-background, #11100e)",
          }}
        >
          {description}
        </p>
      </div>
    );
  }

  if (variant === "textOnly") {
    return (
      <div className="flex flex-col gap-4 w-full">
        <h2
          className="w-full text-2xl md:text-4xl lg:text-5xl font-bold leading-tight px-6 py-3"
          style={{
            color: "var(--artist-text, #faf7f2)",
            background: "linear-gradient(to right, var(--artist-accent, #c96a4a) .5%, var(--artist-background, #11100e) .5%)",
          }}
        >
          {title}
        </h2>
        <p
          className="w-full whitespace-pre-line text-sm sm:text-base md:text-lg px-6 py-3"
          style={{
            color: "var(--artist-background, #faf7f2)",
            background: "linear-gradient(to right, var(--artist-accent, #c96a4a) .5%, var(--artist-background, #11100e) .5%, transparent 0%)",
          }}
        >
          {description}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 md:gap-6">
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-(var(--artist-text))">
        {title}
      </h2>
      <p className="max-w-xl whitespace-pre-line text-sm sm:text-base md:text-lg text-(var(--artist-text))">
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
      variant={layoutType === "TextOnly" ? "textOnly" : layoutType === "TextOnlyCenter" ? "textOnlyCenter" : "default"}
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
        <div className="flex flex-col md:grid md:items-center gap-3 md:gap-10 md:grid-cols-12">
          <div className={`order-1 md:order-none ${mediaCols}`}>{media}</div>
          <div className={`order-2 md:order-none px-4 md:px-0 ${textCols}`}>{text}</div>
        </div>
      );

    case "MediaRight_TextLeft":
      return (
        <div className="flex flex-col md:grid md:items-center gap-3 md:gap-10 md:grid-cols-12">
          <div className={`order-1 md:order-none ${mediaCols}`}>{media}</div>
          <div className={`order-2 md:order-none px-4 md:px-0 ${textCols}`}>{text}</div>
        </div>
      );

    case "TwoColumnMediaOnly":
      return (
        <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-2 gap-8 ">
          <div className="order-1 md:order-none max-h-[50vh]">{media}</div>
          <div className="order-2 md:order-none max-h-[50vh]">{media2}</div>
        </div>
      );

    case "TwoColumnMediaWithText":
      return (
        <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6 order-1 md:order-none">
            <div className="max-h-[45vh]">{media}</div>
            {text}
          </div>
          <div className="flex flex-col gap-6 order-2 md:order-none">
            <div className="max-h-[45vh]">{media2}</div>
            {text2}
          </div>
        </div>
      );

    case "MediaOnly":
      return (
        <div className="relative w-full min-h-[50vh]">
          <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
          <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center items-center min-h-[50vh] py-8">
            <div
              className="shrink-0 w-[425px] aspect-square overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
            >
              {mediaSrc ? (
                <img
                  src={mediaSrc}
                  alt="Portfolio media"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm"
                  style={{
                    color: "var(--artist-text, #faf7f2)",
                    backgroundColor: "rgb(130, 130, 130)",
                    opacity: 0.8,
                  }}
                >
                  No media
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "MediaOnlyVertical":
      return (
        <div className="relative w-full min-h-[50vh]">
          <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
          <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center items-center min-h-[50vh] py-8">
            <div
              className="shrink-0 h-[425px] w-[340px] overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
            >
              {mediaSrc ? (
                <img
                  src={mediaSrc}
                  alt="Portfolio media"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm"
                  style={{
                    color: "var(--artist-text, #faf7f2)",
                    backgroundColor: "rgb(130, 130, 130)",
                    opacity: 0.8,
                  }}
                >
                  No media
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "MediaOnlyHorizontal":
      return (
        <div className="relative w-full min-h-[50vh]">
          <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
          <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center items-center min-h-[50vh] py-8">
            <div
              className="shrink-0 w-[756px] h-[425px] overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
            >
              {mediaSrc ? (
                <img
                  src={mediaSrc}
                  alt="Portfolio media"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm"
                  style={{
                    color: "var(--artist-text, #faf7f2)",
                    backgroundColor: "rgb(130, 130, 130)",
                    opacity: 0.8,
                  }}
                >
                  No media
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "MediaOnlyWide":
      return (
        <div className="relative w-full min-h-[50vh]">
          <MediaOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
          <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center items-center min-h-[50vh] py-8">
            <div
              className="shrink-0 w-[756px] h-[425px] overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
            >
              {mediaSrc ? (
                <img
                  src={mediaSrc}
                  alt="Portfolio media"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm"
                  style={{
                    color: "var(--artist-text, #faf7f2)",
                    backgroundColor: "rgb(130, 130, 130)",
                    opacity: 0.8,
                  }}
                >
                  No media
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "TextOnly":
      return (
        <div className="relative w-full min-h-[50vh]">
          <TextOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
          <div className="relative z-10 w-full max-w-7xl mx-auto">{text}</div>
        </div>
      );

    case "TextOnlyCenter":
      return (
        <div className="relative w-full min-h-[50vh]">
          <TextOnlyTemplate className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6">{text}</div>
        </div>
      );

    case "HeroLayoutSquare01":
      return (
        <div
          className="relative w-full min-h-[50vh]">
          <div className="absolute inset-0 flex justify-center items-start z-0">
            <HeroLayoutSquare01Template className="w-full h-full max-w-7xl pointer-events-none" />
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-0">
          <div className="grid grid-cols-[1fr_1fr] gap-8 md:gap-4 items-stretch min-h-[50vh] px-4 py-8 ">
              {/* Col A: image (left) – matches editor */}
              <div
                className="shrink-0 self-center w-[425px] aspect-square overflow-hidden flex items-center justify-center"
                style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                      opacity: 0.6,
                      boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)",
                    }}
                  >
                    No media
                  </div>
                )}
              </div>
              {/* Col B: text (right) – vertically centered, matches editor */}
              <div className="flex flex-col gap-4 min-w-0 self-stretch flex-1 min-h-0">
                <div className="flex-1 min-h-[2rem]" aria-hidden />
                <div className="flex flex-col gap-4">
                  <h2
                    className="text-4xl md:text-5xl font-bold leading-tight"
                    style={{ color: "var(--artist-background, #11100e)" }}
                  >
                    {page.title || "Header"}
                  </h2>
                  <p
                    className="text-xl whitespace-pre-line"
                    style={{ color: "var(--artist-background, #11100e)", opacity: 0.8 }}
                  >
                    {page.title2 || "Subheader"}
                  </p>
                </div>
                <div className="flex-1 min-h-[2rem]" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      );

    case "HeroLayoutVertical01":
      return (
        <div className="relative w-full min-h-[50vh]">
          <div className="absolute inset-0 flex justify-center items-start z-0">
            <HeroLayoutVertical01Template className="w-full h-full max-w-7xl pointer-events-none" />
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-0">
            <div className="grid grid-cols-[auto_1fr] gap-4 md:gap-16 items-stretch min-h-[50vh] px-4 py-8">
              {/* Col A: vertical image (left) – auto width fits 340px image, text closer */}
              <div
                className="shrink-0 self-center h-[425px] w-[340px] overflow-hidden flex items-center justify-center"
                style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                      opacity: 0.6,
                      boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)",
                    }}
                  >
                    No media
                  </div>
                )}
              </div>
              {/* Col B: text (right) – same as HeroLayoutSquare01 */}
              <div className="flex flex-col min-w-0 self-stretch flex-1 min-h-0">
                <div className="flex-1 min-h-[2rem]" aria-hidden />
                <div className="flex flex-col gap-4">
                  <h2
                    className="text-4xl md:text-5xl font-bold leading-tight"
                    style={{ color: "var(--artist-background, #11100e)" }}
                  >
                    {page.title || "Header"}
                  </h2>
                  <p
                    className="text-xl whitespace-pre-line"
                    style={{ color: "var(--artist-background, #11100e)", opacity: 0.8 }}
                  >
                    {page.title2 || "Subheader"}
                  </p>
                </div>
                <div className="flex-1 min-h-[2rem]" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      );

    case "HeroLayoutHorizontal01":
      return (
        <div className="relative w-full min-h-[50vh]">
          <div className="absolute inset-0 flex justify-center items-start z-0">
            <HeroLayoutHorizontal01Template className="w-full h-full max-w-7xl pointer-events-none" />
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-0">
            <div className="grid grid-cols-[auto_1fr] gap-4 md:gap-16 items-stretch min-h-[50vh] px-4 py-8">
              {/* Col A: horizontal image (left) – 425px height, 5:4 aspect */}
              <div
                className="shrink-0 self-center h-[425px] w-[531px] min-h-[425px] min-w-[531px] overflow-hidden flex items-center justify-center"
                style={{ boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)" }}
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
                      opacity: 0.6,
                      boxShadow: "0 0 0 15px var(--artist-accent, #c96a4a)",
                    }}
                  >
                    No media
                  </div>
                )}
              </div>
              {/* Col B: text (right) – same as HeroLayoutSquare01 */}
              <div className="flex flex-col gap-4 min-w-0 self-stretch flex-1 min-h-0">
                <div className="flex-1 min-h-[2rem]" aria-hidden />
                <div className="flex flex-col gap-4">
                  <h2
                    className="text-4xl md:text-5xl font-bold leading-tight"
                    style={{ color: "var(--artist-background, #11100e)" }}
                  >
                    {page.title || "Header"}
                  </h2>
                  <p
                    className="text-xl whitespace-pre-line"
                    style={{ color: "var(--artist-background, #11100e)", opacity: 0.8 }}
                  >
                    {page.title2 || "Subheader"}
                  </p>
                </div>
                <div className="flex-1 min-h-[2rem]" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      );

    case "HeroLayoutSquare00":
      return (
        <div
          className="relative w-full"
          style={{ backgroundColor: "var(--artist-background, #11100e)" }}
        >
          <HeroLayoutSquare00Template className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left column: headline + paragraph */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-0.5 w-12"
                  style={{ backgroundColor: "var(--artist-text, #faf7f2)" }}
                />
                <div
                  className="h-1 w-8"
                  style={{ backgroundColor: "var(--artist-accent, #c96a4a)" }}
                />
              </div>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "2px var(--artist-text, #faf7f2)",
                  textShadow: "-1px -1px 0 var(--artist-text, #faf7f2), 1px -1px 0 var(--artist-text, #faf7f2), -1px 1px 0 var(--artist-text, #faf7f2), 1px 1px 0 var(--artist-text, #faf7f2)",
                }}
              >
                {page.title}
              </h2>
              <p
                className="max-w-xl whitespace-pre-line text-lg"
                style={{ color: "var(--artist-text, #faf7f2)", opacity: 0.9 }}
              >
                {page.description}
              </p>
            </div>
            {/* Center: large centered square image with overlay */}
            <div className="md:col-span-7 flex justify-center items-center">
              <div className="relative w-full max-w-lg">
                <div
                  className="relative aspect-square w-full max-w-lg mx-auto overflow-hidden border-4"
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
                      className="flex h-full w-full items-center justify-center text-sm"
                      style={{ color: "var(--artist-text, #faf7f2)", opacity: 0.6 }}
                    >
                      No media
                    </div>
                  )}
                  <div
                    className="absolute bottom-4 right-4 z-20 px-4 py-2 border"
                    style={{
                      backgroundColor: "var(--artist-background, #11100e)",
                      borderColor: "var(--artist-text, #faf7f2)",
                    }}
                  >
                    <span
                      className="text-sm uppercase tracking-wide"
                      style={{ color: "var(--artist-text, #faf7f2)" }}
                    >
                      {page.title2 || ""}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col items-end">
                  <div
                    className="h-1.5 w-16"
                    style={{ backgroundColor: "var(--artist-accent, #c96a4a)" }}
                  />
                  <div
                    className="h-0.5 w-full mt-1"
                    style={{ backgroundColor: "var(--artist-text, #faf7f2)", opacity: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      // Fallback so unknown layout still shows *something*
      return (
        <div className="flex flex-col gap-8 px-4 md:px-0">
          <div className="order-1 md:order-none">{media}</div>
          <div className="order-2 md:order-none">{text}</div>
        </div>
      );
  }
}