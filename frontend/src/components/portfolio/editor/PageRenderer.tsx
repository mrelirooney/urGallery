"use client";

import React, { useRef } from "react";
import { getTextColorForBackground } from "@/lib/colorUtils";
import { LAYOUT_14_LIMITS, LAYOUT_15_LIMITS, UNIVERSAL_LAYOUT_LIMITS } from "@/lib/portfolio/layoutLimits";
import {
  LAYOUT_1_TITLE_FIELD_CLASS,
  LAYOUT_1_DESCRIPTION_FIELD_CLASS,
  LAYOUT_2_OVERLAY_TEXTAREA_CLASS,
  LAYOUT_3_TEXT_COLUMN_CLASS,
  LAYOUT_3_TEXT_OVERLAY_CLASS,
  LAYOUT_6_ACCENT_TEXT_GROUP_CLASS,
  LAYOUT_6_HEADER_BORDER_CLASS,
  LAYOUT_6_HEADER_FIELD_CLASS,
  LAYOUT_6_TEXT_RIGHT_CLASS,
  LAYOUT_8_ACCENT_BAR_CLASS,
  LAYOUT_8_TEXT_CENTER_CLASS,
  LAYOUT_8_TITLE_FIELD_CLASS,
  LAYOUT_14_TEXT_CENTER_CLASS,
  LAYOUT_14_TITLE_FIELD_CLASS,
  LAYOUT_15_TITLE_FIELD_CLASS,
  LAYOUT_13_HEADER_ACCENT_CLASS,
  LAYOUT_13_HEADER_FIELD_CLASS,
  PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS,
  PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS,
  PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS,
  PORTFOLIO_PAGE_DESCRIPTION_CLASS,
  PORTFOLIO_PAGE_DETAILS_CLASS,
} from "@/lib/portfolio/typography";

function confirmTitleTextOnEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    e.currentTarget.blur();
  }
}

export type LayoutType = "layout-1" | "layout-2" | "layout-3" | "layout-4" | "layout-5" | "layout-6" | "layout-8" | "layout-9" | "layout-11" | "layout-12" | "layout-13" | "layout-14" | "layout-15";

export type MediaShapeType = "1:1" | "4:5" | "9:16" | "16:9" | "5:4" | "21:9";

export interface PortfolioPageData {
  id: number | string;
  layoutType: LayoutType;
  title: string;
  description: string;
  details?: string;
  mediaSrc: string | null;
  mediaShape?: MediaShapeType;
  title2?: string;
  mediaSrc2?: string | null;
  mediaShape2?: MediaShapeType;
  mediaShape2_2?: MediaShapeType;
  description2?: string;
  title3?: string;
  description3?: string;
}

export interface PageRendererProps {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  isEditor?: boolean;
  customColors?: {
    text?: string;
    background?: string;
    accent?: string;
  };
  layoutOverride?: LayoutType | null;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
  onChangeDetails?: (pageIndex: number, newDesc: string) => void;
  onChangeImage?: (pageIndex: number, file: File | null) => void;
  onChangeTitle2?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription2?: (pageIndex: number, newDesc: string) => void;
  onChangeTitle3?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription3?: (pageIndex: number, newDesc: string) => void;
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
  onChangeDetails,
  onChangeImage,
  onChangeTitle2,
  onChangeDescription2,
  onChangeTitle3,
  onChangeDescription3,
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
  const { title, description, details = "", mediaSrc } = page;

  const handleMediaClick = () => {
    if (isEditor && onChangeImage) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChangeImage) return;
    onChangeImage(safeIndex, e.target.files?.[0] ?? null);
  };

  // layout-1: Fixed frame – two equal panels, text left, image right (laptop)
  const portfolioBg = customColors?.text ?? "#11100e";
  const accentHex = customColors?.accent || "#c96a4a";
  const headerStyle = {
    color: getTextColorForBackground(portfolioBg),
    borderTop: `6px solid ${accentHex}`,
    borderBottom: `6px solid ${accentHex}`,
    borderRadius: 0,
  };

  const headerEl = (
    <textarea
      className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} ${LAYOUT_1_TITLE_FIELD_CLASS} portfolio-header-massive text-center rounded-none`}
      style={headerStyle}
      value={title}
      maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
      onChange={(e) =>
        onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
      }
      onKeyDown={confirmTitleTextOnEnter}
      placeholder="Page title"
    />
  );

  const accentTextColor = getTextColorForBackground(accentHex);
  const bodyContent = (
    <textarea
      className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} ${LAYOUT_1_DESCRIPTION_FIELD_CLASS}`}
      style={{ color: accentTextColor }}
      value={description}
      maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
      onChange={(e) =>
        onChangeDescription?.(
          safeIndex,
          e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
        )
      }
      onKeyDown={confirmTitleTextOnEnter}
      placeholder="Description"
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

  // layout-2: Image full height between accent bands, text overlay on image (tablet/laptop)
  if (layoutType === "layout-2") {
    const portfolioBgL2 = customColors?.text ?? "#11100e";
    const accentHex = customColors?.accent || "#c96a4a";
    const textColor = getTextColorForBackground(portfolioBgL2);
    const overlayTextStyle = {
      color: "#faf7f2",
      textShadow: "0 1px 3px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
    };
    const accentStyle = { backgroundColor: accentHex };
    const rightBandStyle = { ...accentStyle, borderLeft: "1px solid rgba(255,255,255,0.35)" };

    return (
      <div className="w-full h-full layout-2-horizontal" data-layout="layout-2">
        <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
          <div className="w-full aspect-video overflow-hidden">{mediaContent}</div>
          <div className="flex flex-1">
            <div className="flex-1 px-4 py-6">
              <textarea
                className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} focus:ring-neutral-400/50`}
                style={{ color: textColor, fontFamily: "inherit" }}
                value={title}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Page title"
              />
              <textarea
                className={PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS}
                style={{ color: textColor, opacity: 0.9 }}
                value={description}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                onChange={(e) =>
                  onChangeDescription?.(
                    safeIndex,
                    e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
                  )
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Description"
              />
            </div>
            <div className="w-8 shrink-0" style={accentStyle} />
          </div>
        </div>
        <div className="hidden md:flex md:h-full md:min-h-0 w-full">
          <div className="w-12 shrink-0" style={accentStyle} />
          <div className="flex-1 relative min-w-0 min-h-0 overflow-hidden">
            <div className="absolute inset-0">{mediaContent}</div>
            <div className="absolute inset-0 z-10 flex items-end justify-between px-6 lg:px-8 xl:px-10 pb-6 lg:pb-8 pointer-events-none">
              <textarea
                className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} ${LAYOUT_2_OVERLAY_TEXTAREA_CLASS} max-w-[45%] pointer-events-auto`}
                style={{ ...overlayTextStyle, fontFamily: "inherit" }}
                value={title}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Page title"
              />
              <textarea
                className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} ${LAYOUT_2_OVERLAY_TEXTAREA_CLASS} max-w-[45%] text-right pointer-events-auto`}
                style={{ ...overlayTextStyle, opacity: 0.95, fontFamily: "inherit" }}
                value={description}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                onChange={(e) =>
                  onChangeDescription?.(
                    safeIndex,
                    e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
                  )
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Description"
              />
            </div>
          </div>
          <div className="w-12 shrink-0" style={rightBandStyle} />
        </div>
      </div>
    );
  }

  // layout-3: Full-bleed media, centered text + orange bar overlay, four corner accents (laptop)
  if (layoutType === "layout-3") {
    const accentHex = customColors?.accent || "#c96a4a";
    const accentColor = accentHex;
    const accentTextColor = getTextColorForBackground(accentHex);
    const overlayTextStyle = {
      color: "#faf7f2",
      textShadow: "0 1px 3px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
    };

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-3">
        {/* Media: fills entire content area, z-0 */}
        <div
          className="absolute inset-0 z-0"
          onClick={handleMediaClick}
          style={{ cursor: isEditor && onChangeImage ? "pointer" : undefined }}
        >
          {mediaSrc ? (
            <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full min-h-[200px] flex items-center justify-center text-sm"
              style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
            >
              {isEditor ? "Click to add image" : "No media selected"}
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

        {/* Four orange corner markers, z-10 */}
        <div className="absolute top-4 left-4 w-3 h-3 z-10" style={{ backgroundColor: accentColor }} aria-hidden />
        <div className="absolute top-4 right-4 w-3 h-3 z-10" style={{ backgroundColor: accentColor }} aria-hidden />
        <div className="absolute bottom-4 left-4 w-3 h-3 z-10" style={{ backgroundColor: accentColor }} aria-hidden />
        <div className="absolute bottom-4 right-4 w-3 h-3 z-10" style={{ backgroundColor: accentColor }} aria-hidden />

        {/* Centered text overlay: editable title + sub-header in orange bar, z-10 */}
        <div className={`absolute inset-0 z-10 pointer-events-none ${LAYOUT_3_TEXT_OVERLAY_CLASS}`}>
          <div className={`${LAYOUT_3_TEXT_COLUMN_CLASS} text-center pointer-events-auto`}>
            {isEditor ? (
              <>
                <textarea
                  className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-massive font-bold text-center w-full`}
                  style={{ ...overlayTextStyle, fontFamily: "inherit" }}
                  value={title}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Page title"
                />
                <div
                  className="px-6 py-2 rounded-xs w-full"
                  style={{ backgroundColor: accentColor }}
                >
                  <textarea
                    className="layout-3-sub-header-field w-full min-w-0 portfolio-header-sub bg-transparent rounded-md py-2 text-center outline-none focus:ring-2 focus:ring-white/50 resize-none overflow-hidden break-words whitespace-pre-wrap"
                    style={{ color: accentTextColor, fontFamily: "inherit" }}
                    value={page.title2 ?? ""}
                    maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                    onChange={(e) =>
                      onChangeTitle2?.(
                        safeIndex,
                        e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title),
                      )
                    }
                    onKeyDown={confirmTitleTextOnEnter}
                    placeholder="Sub-header"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="portfolio-header-massive font-bold portfolio-page-title w-full text-center" style={overlayTextStyle}>
                  {title}
                </h2>
                <div
                  className="px-6 py-2 rounded-xs w-full"
                  style={{ backgroundColor: accentColor, color: accentTextColor }}
                >
                  <h3 className="portfolio-header-sub w-full text-center whitespace-pre-wrap break-words">
                    {page.title2?.trim() ? page.title2 : "\u00A0"}
                  </h3>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  }

  // layout-4: Full-bleed two columns – left ~42% orange (title, body), right ~58% media
  if (layoutType === "layout-4") {
    const accentHex = customColors?.accent || "#c96a4a";
    const accentColor = accentHex;
    const textColor = getTextColorForBackground(accentHex);

    const mediaContent = (
      <div
        onClick={handleMediaClick}
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
      >
        {mediaSrc ? (
          <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full min-h-[200px] items-center justify-center text-sm border-2 border-dashed border-neutral-500/50 rounded-md"
            style={{ color: "#faf7f2", opacity: 0.9 }}
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

    const orangePanel = (
      <div
        className="flex flex-col justify-center px-8 lg:px-12 xl:px-16 py-8 overflow-y-auto"
        style={{ backgroundColor: accentColor, color: textColor }}
      >
        <textarea
          className={PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS}
          style={{ color: textColor, fontFamily: "inherit" }}
          value={title}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
          onChange={(e) =>
            onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
          }
          onKeyDown={confirmTitleTextOnEnter}
          placeholder="Page title"
        />
        <textarea
          className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} mt-4`}
          style={{ color: textColor, fontFamily: "inherit", opacity: 0.9 }}
          value={description}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
          onChange={(e) =>
            onChangeDescription?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
          onKeyDown={confirmTitleTextOnEnter}
          placeholder="Description"
        />
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-4">
          {/* Phone: stacked media + accent */}
          <div className="relative z-10 flex md:hidden flex-col w-full min-h-[70vh]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0">
              {mediaContent}
            </div>
            <div className="flex-1 min-h-0">{orangePanel}</div>
          </div>
          {/* Tablet: layout-6 pattern – full-bleed bg layer + image top / text in accent bottom */}
          <div
            className="absolute inset-0 z-0 pointer-events-none hidden md:block lg:hidden"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, transparent 60%, ${accentHex} 60%, ${accentHex} 100%)`,
            }}
          />
          <div className="relative z-10 hidden md:grid lg:hidden grid-rows-[3fr_2fr] h-full w-full min-h-[70vh]">
            <div className="relative min-h-0 overflow-hidden">
              {mediaContent}
            </div>
            <div
              className="flex min-h-0 flex-col items-start justify-center px-8 lg:px-12 py-8 text-left"
              style={{ color: textColor }}
            >
              <textarea
                className={PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS}
                style={{ color: textColor, fontFamily: "inherit" }}
                value={title}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Page title"
              />
              <textarea
                className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} mt-4`}
                style={{ color: textColor, fontFamily: "inherit", opacity: 0.9 }}
                value={description}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                onChange={(e) =>
                  onChangeDescription?.(
                    safeIndex,
                    e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
                  )
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Description"
              />
            </div>
          </div>
          {/* Laptop: two columns side by side */}
          <div className="hidden lg:grid lg:grid-cols-[2fr_3fr] lg:h-full lg:min-h-0 w-full relative z-10">
            {orangePanel}
            <div className="relative min-h-0 overflow-hidden bg-neutral-600">
              {mediaContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-5: Constrained frame – left text with L-shaped accent border, right media (no bg)
  if (layoutType === "layout-5") {
    const portfolioBg = customColors?.text ?? "#11100e";
    const accentHex = customColors?.accent || "#c96a4a";
    const textColor = getTextColorForBackground(portfolioBg);
    const lBorderStyle = { borderLeft: `20px solid ${accentHex}`, borderBottom: `20px solid ${accentHex}` };
    const uBorderStyle = {
      borderLeft: `20px solid ${accentHex}`,
      borderRight: `20px solid ${accentHex}`,
      borderBottom: `20px solid ${accentHex}`,
    };

    const layout5Media = (
      <div
        onClick={handleMediaClick}
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
      >
        {mediaSrc ? (
          <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full min-h-[200px] items-center justify-center text-sm border-2 border-dashed border-neutral-500/50 rounded-md"
            style={{ color: "#faf7f2", opacity: 0.9 }}
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

    const textBlock = (
      <div className="flex flex-col px-6 py-4" style={lBorderStyle}>
        <textarea
          className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-big font-bold focus:ring-neutral-400/50`}
          style={{ color: textColor, fontFamily: "inherit" }}
          value={title}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
          onChange={(e) =>
            onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
          }
          onKeyDown={confirmTitleTextOnEnter}
          placeholder="Page title"
        />
        <textarea
          className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-2 focus:ring-neutral-400/50`}
          style={{ color: textColor, opacity: 0.9, fontFamily: "inherit" }}
          value={description}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
          onChange={(e) =>
            onChangeDescription?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
          onKeyDown={confirmTitleTextOnEnter}
          placeholder="Description"
        />
      </div>
    );

    const textBlockU = (
      <div className="flex flex-col px-6 py-4" style={uBorderStyle}>
        <textarea
          className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-big font-bold focus:ring-neutral-400/50`}
          style={{ color: textColor, fontFamily: "inherit" }}
          value={title}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
          onChange={(e) =>
            onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
          }
          onKeyDown={confirmTitleTextOnEnter}
          placeholder="Page title"
        />
        <textarea
          className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-2 focus:ring-neutral-400/50`}
          style={{ color: textColor, opacity: 0.9, fontFamily: "inherit" }}
          value={description}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
          onChange={(e) =>
            onChangeDescription?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
          onKeyDown={confirmTitleTextOnEnter}
          placeholder="Description"
        />
      </div>
    );

    return (
      <div className="w-full h-full" data-layout="layout-5">
        {/* Tablet: full-bleed image on top, text below with U-frame */}
        <div className="flex flex-col lg:hidden w-screen relative left-1/2 -translate-x-1/2 min-h-[70vh]">
          <div className="w-full aspect-video overflow-hidden relative shrink-0">
            {layout5Media}
          </div>
          <div className="flex-1 px-4 py-6">{textBlockU}</div>
        </div>
        {/* Laptop: two columns – left text with L-border, right media */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-0 lg:h-full lg:min-h-0 w-full">
          <div className="flex flex-col justify-end pl-0 pr-4 pb-16 overflow-hidden min-h-0">
            {textBlock}
          </div>
          <div className="relative min-h-0 overflow-hidden">
            {layout5Media}
          </div>
        </div>
      </div>
    );
  }

  // layout-6: 40/60 split – left full-height media, right 50/50 panels (header top, sub-header + description bottom on tablet+)
  if (layoutType === "layout-6") {
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text ?? "#faf7f2";
    const headerTextColor = getTextColorForBackground(portfolioBg);
    const accentTextColor = getTextColorForBackground(accentHex);
    const layout6HeaderStyle = { color: headerTextColor };
    const layout6HeaderBorderStyle = {
      borderBottom: `4px solid ${accentHex}`,
      paddingBottom: "0.15rem",
    };

    const layout6HeaderBorderWrap = (child: React.ReactNode) => (
      <div className="w-full flex justify-end">
        <div className={LAYOUT_6_HEADER_BORDER_CLASS} style={layout6HeaderBorderStyle}>
          {child}
        </div>
      </div>
    );

    const layout6Media = (
      <div
        onClick={handleMediaClick}
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
      >
        {mediaSrc ? (
          <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover object-center" />
        ) : (
          <div
            className="flex h-full w-full min-h-[200px] items-center justify-center text-sm border-2 border-dashed border-neutral-500/50 rounded-md"
            style={{ color: "#faf7f2", opacity: 0.9 }}
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

    const layout6HeaderEditor = (
      <textarea
        className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS} ${LAYOUT_6_HEADER_FIELD_CLASS} portfolio-header-big font-bold`}
        style={{ ...layout6HeaderStyle, fontFamily: "inherit" }}
        value={title}
        maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
        onChange={(e) =>
          onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
        }
        onKeyDown={confirmTitleTextOnEnter}
        placeholder="Header"
      />
    );

    const layout6HeaderLive = (
      <h2
        className={`${LAYOUT_6_TEXT_RIGHT_CLASS} portfolio-header-big font-bold portfolio-page-title`}
        style={layout6HeaderStyle}
      >
        {title || "\u00A0"}
      </h2>
    );

    const layout6SubHeaderEditor = (
      <textarea
        className={`layout-6-sub-header-field w-full min-w-0 portfolio-header-sub ${LAYOUT_6_TEXT_RIGHT_CLASS} bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50 resize-none overflow-hidden break-words whitespace-pre-wrap`}
        style={{ color: accentTextColor, fontFamily: "inherit" }}
        value={page.title2 ?? ""}
        maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
        onChange={(e) =>
          onChangeTitle2?.(
            safeIndex,
            e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title),
          )
        }
        onKeyDown={confirmTitleTextOnEnter}
        placeholder="Sub-header"
      />
    );

    const layout6SubHeaderLive = (
      <h3 className={`portfolio-header-sub ${LAYOUT_6_TEXT_RIGHT_CLASS} w-full whitespace-pre-wrap break-words`}>
        {page.title2?.trim() ? page.title2 : "\u00A0"}
      </h3>
    );

    const layout6DescriptionEditor = (
      <textarea
        className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS} w-full`}
        style={{ color: accentTextColor, fontFamily: "inherit" }}
        value={description}
        maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
        onChange={(e) =>
          onChangeDescription?.(
            safeIndex,
            e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
          )
        }
        onKeyDown={confirmTitleTextOnEnter}
        placeholder="Description"
      />
    );

    const layout6DescriptionLive = (
      <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DESCRIPTION_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS} w-full`}>
        {description || "\u00A0"}
      </p>
    );

    const layout6DetailsEditor = (
      <textarea
        className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS} w-full`}
        style={{ color: accentTextColor, opacity: 0.9, fontFamily: "inherit" }}
        value={details}
        maxLength={UNIVERSAL_LAYOUT_LIMITS.details}
        onChange={(e) =>
          onChangeDetails?.(
            safeIndex,
            e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.details),
          )
        }
        onKeyDown={confirmTitleTextOnEnter}
        placeholder="Details"
      />
    );

    const layout6DetailsLive = (
      <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DETAILS_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS} w-full opacity-90`}>
        {details || "\u00A0"}
      </p>
    );

    const layout6AccentPanelPhone = (
      <div className={LAYOUT_6_ACCENT_TEXT_GROUP_CLASS}>
        {isEditor ? layout6DescriptionEditor : layout6DescriptionLive}
        {isEditor ? layout6DetailsEditor : layout6DetailsLive}
      </div>
    );

    const layout6AccentPanelTabletDesktop = (
      <div className={LAYOUT_6_ACCENT_TEXT_GROUP_CLASS}>
        {isEditor ? layout6SubHeaderEditor : layout6SubHeaderLive}
        {isEditor ? layout6DescriptionEditor : layout6DescriptionLive}
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-6">
          {/* Split background: top portfolio color, bottom accent (image sits on top at left) */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${portfolioBg} 0%, ${portfolioBg} 50%, ${accentHex} 50%, ${accentHex} 100%)`,
            }}
          />
          {/* Phone: stacked fallback */}
          <div className="relative z-10 flex md:hidden flex-col w-full min-h-[70vh] px-[2vw] pointer-events-auto">
            <div className="w-full aspect-[9/16] max-h-[40vh] max-w-[200px] mx-auto overflow-hidden relative shrink-0">
              <div className="relative w-full h-full min-h-[200px]">{layout6Media}</div>
            </div>
            <div className="flex-1 px-4 py-6 text-right">
              {layout6HeaderBorderWrap(isEditor ? layout6HeaderEditor : layout6HeaderLive)}
              <div className="mt-4">{layout6AccentPanelPhone}</div>
            </div>
          </div>
          {/* Tablet: 40% media (flush left) | 60% split text panels */}
          <div className="hidden md:grid md:grid-cols-2 lg:hidden md:h-full md:min-h-[70vh] w-full relative z-10 pointer-events-auto">
            <div className="relative min-h-0 h-full overflow-hidden">
              {layout6Media}
            </div>
            <div className="flex flex-col min-h-0 h-full">
              <div
                className={`flex-1 min-h-0 flex flex-col justify-center px-6 ${isEditor ? "pt-10 pb-6" : "py-6"}`}
                style={{ backgroundColor: portfolioBg }}
              >
                {layout6HeaderBorderWrap(isEditor ? layout6HeaderEditor : layout6HeaderLive)}
              </div>
              <div
                className="flex-1 min-h-0 flex flex-col justify-center px-6 py-6"
                style={{ backgroundColor: accentHex, color: accentTextColor }}
              >
                {layout6AccentPanelTabletDesktop}
              </div>
            </div>
          </div>
          {/* Desktop: 40% media | 60% split text panels */}
          <div className="hidden lg:grid lg:grid-cols-[4fr_6fr] lg:gap-0 lg:h-full lg:min-h-0 w-full relative z-10">
            <div className="relative min-h-0 h-full overflow-hidden">
              {layout6Media}
            </div>
            <div className="flex flex-col min-h-0 h-full pointer-events-auto">
              <div
                className={`flex-1 min-h-0 flex flex-col justify-center px-8 xl:px-12 ${isEditor ? "pt-14 pb-8" : "py-8"}`}
                style={{ backgroundColor: portfolioBg }}
              >
                {layout6HeaderBorderWrap(isEditor ? layout6HeaderEditor : layout6HeaderLive)}
              </div>
              <div
                className="flex-1 min-h-0 flex flex-col justify-center px-8 xl:px-12 py-8"
                style={{ backgroundColor: accentHex, color: accentTextColor }}
              >
                {layout6AccentPanelTabletDesktop}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-8: Text only – centered 33% accent block, title + line + description, four corner markers
  if (layoutType === "layout-8") {
    const accentHex = customColors?.accent || "#c96a4a";
    const accentTextColor = getTextColorForBackground(accentHex);
    const markerColor = "#ffffff";

    const layout8Content = (
      <div
        className="relative flex items-center justify-center h-full min-h-full overflow-y-auto pointer-events-auto"
        style={{ backgroundColor: accentHex, color: accentTextColor }}
      >
        {/* Four corner markers */}
        <div className="absolute top-4 left-4 w-3 h-3 pointer-events-none" style={{ backgroundColor: markerColor }} aria-hidden />
        <div className="absolute top-4 right-4 w-3 h-3 pointer-events-none" style={{ backgroundColor: markerColor }} aria-hidden />
        <div className="absolute bottom-4 left-4 w-3 h-3 pointer-events-none" style={{ backgroundColor: markerColor }} aria-hidden />
        <div className="absolute bottom-4 right-4 w-3 h-3 pointer-events-none" style={{ backgroundColor: markerColor }} aria-hidden />
        <div className={`flex flex-col items-center justify-center ${LAYOUT_8_TEXT_CENTER_CLASS} px-8 w-full`}>
          <textarea
            className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} ${LAYOUT_8_TEXT_CENTER_CLASS} ${LAYOUT_8_TITLE_FIELD_CLASS} portfolio-header-massive font-bold uppercase`}
            style={{ color: accentTextColor, fontFamily: "inherit" }}
            value={title}
            maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
            onChange={(e) =>
              onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
            }
            onKeyDown={confirmTitleTextOnEnter}
            placeholder="Page title"
          />
          <div className={`${LAYOUT_8_ACCENT_BAR_CLASS} h-[5px] my-4 bg-white/90`} aria-hidden />
          <textarea
            className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} ${LAYOUT_8_TEXT_CENTER_CLASS}`}
            style={{ color: accentTextColor, fontFamily: "inherit" }}
            value={description}
            maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
            onChange={(e) =>
              onChangeDescription?.(
                safeIndex,
                e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
              )
            }
            onKeyDown={confirmTitleTextOnEnter}
            placeholder="Description"
          />
        </div>
      </div>
    );

    return (
      <div className="w-full h-full flex items-center justify-center" data-layout="layout-8">
        {/* Phone: stacked fallback */}
        <div className="flex md:hidden flex-col w-full min-h-[50vh] px-4 py-8">
          <div className="w-full flex-1 min-h-0 overflow-hidden">
            {layout8Content}
          </div>
        </div>
        {/* Tablet: wide accent block, thin side gutters */}
        <div className="hidden md:flex md:items-stretch md:justify-center lg:hidden w-screen relative left-1/2 -translate-x-1/2 md:h-full md:min-h-0 px-3">
          <div className="w-full min-w-0 h-full overflow-hidden shrink-0">
            {layout8Content}
          </div>
        </div>
        {/* Laptop: centered accent block (66% width, full height) */}
        <div className="hidden lg:flex lg:items-stretch lg:justify-center lg:w-full lg:h-full lg:min-h-0">
          <div className="w-[66%] min-w-[280px] max-w-[900px] h-full overflow-hidden shrink-0">
            {layout8Content}
          </div>
        </div>
      </div>
    );
  }

  // layout-9: Full-bleed 60/40 split – left transparent + orange band (title, description), right media
  if (layoutType === "layout-9") {
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text || "#11100e";
    const portfolioTextColor = getTextColorForBackground(portfolioBg);
    const accentTextColor = getTextColorForBackground(accentHex);
    // Layout menu previews render this component with `isEditor={false}` inside a scaled stage.
    // A tiny negative X shift makes the text feel more "centered" visually in that stage.
    const previewTextNudge = isEditor ? "" : "-translate-x-2";

    const layout9TitleTextareaClass = PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS;
    const layout9DescriptionTextareaClass = PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS;

    const layout9Media = (
      <div
        onClick={handleMediaClick}
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
      >
        {mediaSrc ? (
          <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full min-h-[200px] items-center justify-center text-sm border-2 border-dashed border-neutral-500/50 rounded-md"
            style={{ color: "#faf7f2", opacity: 0.9 }}
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
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-9">
          {/* Accent band (z-0): laptop only – transparent top, solid accent bottom */}
          <div
            className="absolute inset-0 z-0 pointer-events-none hidden lg:block"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, transparent 50%, ${accentHex} 50%, ${accentHex} 100%)`,
            }}
          />
          {/* Phone: stacked fallback */}
          <div className="relative z-10 flex md:hidden flex-col w-full min-h-[70vh] px-[2vw]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0">
              {layout9Media}
            </div>
            <div
              className="flex flex-col items-start justify-center px-8 py-14 flex-1 pointer-events-auto min-w-0"
              style={{ backgroundColor: accentHex, color: accentTextColor }}
            >
              <textarea
                className={layout9TitleTextareaClass}
                style={{ color: accentTextColor, fontFamily: "inherit" }}
                value={title}
                readOnly={!isEditor}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Page title"
              />
              <textarea
                className={`${layout9DescriptionTextareaClass} mt-2`}
                style={{ color: accentTextColor, fontFamily: "inherit" }}
                value={description}
                readOnly={!isEditor}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                onChange={(e) =>
                  onChangeDescription?.(
                    safeIndex,
                    e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
                  )
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Sub header"
              />
            </div>
          </div>
          {/* Tablet: smaller image + accent panel to page bottom */}
          <div className="relative z-10 hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 pt-24">
            <div className="w-[88%] mx-auto aspect-video max-h-[38vh] overflow-hidden relative shrink-0">
              {layout9Media}
            </div>
            <div
              className="flex flex-1 flex-col items-center justify-center px-8 py-8 min-h-0 min-w-0 pointer-events-auto"
              style={{ backgroundColor: accentHex, color: accentTextColor }}
            >
              <textarea
                className={`${layout9TitleTextareaClass} text-center`}
                style={{ color: accentTextColor, fontFamily: "inherit" }}
                value={title}
                readOnly={!isEditor}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Page title"
              />
              <textarea
                className={`${layout9DescriptionTextareaClass} mt-2 text-center`}
                style={{ color: accentTextColor, fontFamily: "inherit" }}
                value={description}
                readOnly={!isEditor}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                onChange={(e) =>
                  onChangeDescription?.(
                    safeIndex,
                    e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
                  )
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Sub header"
              />
            </div>
          </div>
          {/* Laptop: 60% left (transparent + text over band), 40% right (media) */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-0 lg:h-full lg:min-h-0 w-full px-[8vw] relative z-10">
            <div className="flex flex-col min-h-0 h-full min-w-0">
              <div className={`flex-1 flex items-center px-8 pointer-events-auto min-h-0 min-w-0 overflow-visible ${previewTextNudge}`}>
                <textarea
                  className={layout9TitleTextareaClass}
                  style={{ color: portfolioTextColor, fontFamily: "inherit" }}
                  value={title}
                  readOnly={!isEditor}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Page title"
                />
              </div>
              <div className={`flex-1 flex items-center px-8 pointer-events-auto min-h-0 min-w-0 overflow-visible ${previewTextNudge}`}>
                <textarea
                  className={layout9DescriptionTextareaClass}
                  style={{ color: accentTextColor, fontFamily: "inherit" }}
                  value={description}
                  readOnly={!isEditor}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                  onChange={(e) =>
                    onChangeDescription?.(
                      safeIndex,
                      e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
                    )
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Sub header"
                />
              </div>
            </div>
            <div className="relative min-h-0 min-w-0 overflow-hidden">
              {layout9Media}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-11: Full-bleed 67/33 split – left media, right 33% orange band (gradient) with title + description; text z-index above image
  if (layoutType === "layout-11") {
    const accentHex = customColors?.accent || "#c96a4a";
    const accentTextColor = getTextColorForBackground(accentHex);
    const gradientBg = `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}dd 50%, ${accentHex}ee 100%)`;

    const layout11Media = (
      <div
        onClick={handleMediaClick}
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
      >
        {mediaSrc ? (
          <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full min-h-[200px] items-center justify-center text-sm border-2 border-dashed border-neutral-500/50 rounded-md"
            style={{ color: "#faf7f2", opacity: 0.9 }}
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

    const layout11TextBlock = (
      <div
        className="flex flex-col justify-center px-8 py-12 h-full min-h-0 overflow-y-auto pointer-events-auto"
        style={{
          background: gradientBg,
          color: accentTextColor,
        }}
      >
        <textarea
          className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-big font-bold outline-none focus:ring-2 focus:ring-white/50`}
          style={{ color: accentTextColor, fontFamily: "inherit" }}
          value={title}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
          onChange={(e) =>
            onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
          }
          onKeyDown={confirmTitleTextOnEnter}
          placeholder="Page title"
          />
        <textarea
          className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-1 bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50`}
          style={{ color: accentTextColor, opacity: 0.95, fontFamily: "inherit" }}
          value={description}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
          onChange={(e) =>
            onChangeDescription?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description))
          }
          onKeyDown={confirmTitleTextOnEnter}
          placeholder="Sub header"
          />
        <textarea
          className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} mt-4`}
          style={{ color: accentTextColor, opacity: 0.9 }}
          value={details}
          maxLength={UNIVERSAL_LAYOUT_LIMITS.details}
          onChange={(e) =>
            onChangeDetails?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.details),
            )
          }
          placeholder="Details"
        />
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-11">
          {/* Phone: stacked fallback */}
          <div className="flex md:hidden flex-col w-full min-h-[70vh]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0 z-0">
              {layout11Media}
            </div>
            <div className="flex-1 relative z-10" style={{
              background: gradientBg,
              color: accentTextColor,
            }}>
              <div className="flex flex-col justify-center px-8 py-12 pointer-events-auto">
                <textarea
                  className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-big font-bold outline-none focus:ring-2 focus:ring-white/50`}
                  style={{ color: accentTextColor, fontFamily: "inherit" }}
                  value={title}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Page title"
                  />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-1 bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50`}
                  style={{ color: accentTextColor, opacity: 0.95, fontFamily: "inherit" }}
                  value={description}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                  onChange={(e) =>
                    onChangeDescription?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Sub header"
                  />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} mt-4`}
                  style={{ color: accentTextColor, opacity: 0.9 }}
                  value={details}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.details}
                  onChange={(e) =>
                    onChangeDetails?.(
                      safeIndex,
                      e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.details),
                    )
                  }
                  placeholder="Details"
                />
              </div>
            </div>
          </div>
          {/* Tablet: full-width image + accent, vertically centered */}
          <div className="hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 justify-center">
            <div className="w-full aspect-video max-h-[45vh] overflow-hidden relative shrink-0 z-0">
              {layout11Media}
            </div>
            <div
              className="w-full shrink-0 relative z-10 flex min-h-[32vh] flex-col items-center justify-center px-8 py-14 text-center pointer-events-auto"
              style={{
                background: gradientBg,
                color: accentTextColor,
              }}
            >
              <textarea
                className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-big font-bold text-center outline-none focus:ring-2 focus:ring-white/50`}
                style={{ color: accentTextColor, fontFamily: "inherit" }}
                value={title}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Page title"
              />
              <textarea
                className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-1 text-center bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50`}
                style={{ color: accentTextColor, opacity: 0.95, fontFamily: "inherit" }}
                value={description}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                onChange={(e) =>
                  onChangeDescription?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Sub header"
              />
              <textarea
                className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} mt-4 text-center`}
                style={{ color: accentTextColor, opacity: 0.9, fontFamily: "inherit" }}
                value={details}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.details}
                onChange={(e) =>
                  onChangeDetails?.(
                    safeIndex,
                    e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.details),
                  )
                }
                placeholder="Details"
              />
            </div>
          </div>
          <div className="hidden lg:grid lg:grid-cols-[2fr_1fr] lg:gap-0 lg:h-full lg:min-h-0 w-full">
            <div className="relative min-h-0 overflow-hidden z-0">
              {layout11Media}
            </div>
            <div className="relative z-10 min-h-0 overflow-hidden">
              {layout11TextBlock}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-13: Row 1 = MASSIVE HEADER (title) full width + 15px orange left accent; Row 2 = 60% image | 40% BIG HEADER + details + 15px orange right accent
  if (layoutType === "layout-13") {
    const accentHex13 = customColors?.accent || "#c96a4a";
    const portfolioBg13 = customColors?.text || "#11100e";
    const textColor13 = getTextColorForBackground(portfolioBg13);

    const layout13Media = (
      <div
        onClick={handleMediaClick}
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
      >
        {mediaSrc ? (
          <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full min-h-[200px] items-center justify-center text-sm border-2 border-dashed border-neutral-500/50 rounded-md"
            style={{ color: "#faf7f2", opacity: 0.9 }}
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
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full flex flex-col" data-layout="layout-13">
          {/* Phone: stacked fallback */}
          <div className="flex md:hidden flex-col w-full flex-1 min-h-[70vh]">
            <div className="h-[4px] w-full shrink-0" style={{ backgroundColor: accentHex13 }} />
            <div className="flex flex-col items-center text-center py-6 px-8 pointer-events-auto">
              <textarea
                className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-massive font-bold text-center outline-none focus:ring-2 focus:ring-white/50`}
                style={{ color: textColor13, fontFamily: "inherit" }}
                value={title}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Page title"
              />
              <textarea
                className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} bg-transparent rounded-md py-2 mt-2 text-center outline-none focus:ring-2 focus:ring-white/50`}
                style={{ color: textColor13, fontFamily: "inherit" }}
                value={description}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                onChange={(e) =>
                  onChangeDescription?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Sub header"
              />
            </div>
            <div className="w-full aspect-video overflow-hidden relative shrink-0">
              {layout13Media}
            </div>
            <textarea
              className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} mt-6 px-8`}
              style={{ color: textColor13, opacity: 0.9, fontFamily: "inherit" }}
              value={details}
              maxLength={UNIVERSAL_LAYOUT_LIMITS.details}
              onChange={(e) =>
                onChangeDetails?.(
                  safeIndex,
                  e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.details),
                )
              }
              placeholder="Details"
            />
            <div className="h-[4px] w-full shrink-0 mt-6" style={{ backgroundColor: accentHex13 }} />
          </div>
          {/* Tablet: bordered content block, vertically centered */}
          <div className="hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 justify-center">
            <div className="w-full shrink-0 flex flex-col">
              <div className="h-[12px] w-full shrink-0" style={{ backgroundColor: accentHex13 }} />
              <div className="flex flex-col items-center text-center py-6 px-8 pointer-events-auto">
                <textarea
                  className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-massive font-bold text-center outline-none focus:ring-2 focus:ring-white/50`}
                  style={{ color: textColor13, fontFamily: "inherit" }}
                  value={title}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Page title"
                />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} bg-transparent rounded-md py-2 mt-2 text-center outline-none focus:ring-2 focus:ring-white/50`}
                  style={{ color: textColor13, fontFamily: "inherit" }}
                  value={description}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                  onChange={(e) =>
                    onChangeDescription?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Sub header"
                />
              </div>
              <div className="w-full aspect-video max-h-[45vh] overflow-hidden relative shrink-0">
                {layout13Media}
              </div>
              <textarea
                className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} py-6 px-8 text-center`}
                style={{ color: textColor13, opacity: 0.9, fontFamily: "inherit" }}
                value={details}
                maxLength={UNIVERSAL_LAYOUT_LIMITS.details}
                onChange={(e) =>
                  onChangeDetails?.(
                    safeIndex,
                    e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.details),
                  )
                }
                placeholder="Details"
              />
              <div className="h-[8px] w-full shrink-0" style={{ backgroundColor: accentHex13 }} />
            </div>
          </div>
          {/* Laptop: Row 1 = title + left accent; Row 2 = 60% image | 40% text + right accent (full bleed) */}
          <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
            <div className={`shrink-0 pl-12 ${isEditor ? "pt-14 pb-6" : "py-6"}`}>
              <div className={`shrink-0 pl-8 border-l-[15px] pointer-events-auto ${LAYOUT_13_HEADER_ACCENT_CLASS}`} style={{ borderLeftColor: accentHex13, color: textColor13 }}>
                <textarea
                  className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} ${LAYOUT_13_HEADER_FIELD_CLASS} portfolio-header-massive font-bold outline-none focus:ring-2 focus:ring-white/50`}
                  style={{ color: textColor13, fontFamily: "inherit" }}
                  value={title}
                  maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Page title"
                  />
              </div>
            </div>
            <div className="grid grid-cols-[3fr_2fr] gap-0 flex-1 min-h-0">
              <div className="relative min-h-0 overflow-hidden">
                {layout13Media}
              </div>
              <div className="flex flex-col justify-center py-8 pr-12 pl-2 overflow-y-auto text-right pointer-events-auto">
                <div className="shrink-0 pr-8 border-r-[15px]" style={{ borderRightColor: accentHex13, color: textColor13 }}>
                  <textarea
                    className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50 text-right`}
                    style={{ color: textColor13, fontFamily: "inherit" }}
                    value={description}
                    maxLength={UNIVERSAL_LAYOUT_LIMITS.description}
                    onChange={(e) =>
                      onChangeDescription?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description))
                    }
                    onKeyDown={confirmTitleTextOnEnter}
                    placeholder="Sub header"
                    />
                  <textarea
                    className={`${PORTFOLIO_EDITOR_DETAILS_TEXTAREA_CLASS} mt-4 text-right`}
                    style={{ color: textColor13, opacity: 0.9 }}
                    value={details}
                    maxLength={UNIVERSAL_LAYOUT_LIMITS.details}
                    onChange={(e) =>
            onChangeDetails?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.details),
            )
          }
                    placeholder="Details"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-14: Three equal columns – block 1 & 3 thin orange border, block 2 solid accent background; full bleed
  if (layoutType === "layout-14") {
    const accentHex14 = customColors?.accent || "#c96a4a";
    const portfolioBg14 = customColors?.text || "#11100e";
    const textColor14 = getTextColorForBackground(portfolioBg14);
    const accentTextColor14 = getTextColorForBackground(accentHex14);
    const title2 = page.title2 ?? "";
    const description2 = page.description2 ?? "";
    const title3 = page.title3 ?? "";
    const description3 = page.description3 ?? "";
    const layout14TitleTextareaClass = `w-full min-w-0 ${LAYOUT_14_TEXT_CENTER_CLASS} ${LAYOUT_14_TITLE_FIELD_CLASS} portfolio-header-big font-bold bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50 resize-none overflow-hidden break-words`;
    const layout14DescriptionTextareaClass = `${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} ${LAYOUT_14_TEXT_CENTER_CLASS}`;

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full flex flex-col" data-layout="layout-14">
          {/* Below lg: stacked vertically; tablet centers content */}
          <div className="flex flex-col lg:hidden w-full gap-6 py-8 px-6 min-h-[70vh] md:h-full md:min-h-0 md:justify-center">
            <div className={`p-6 border-2 rounded-xs pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ borderColor: accentHex14, color: textColor14 }}>
              <textarea
                className={layout14TitleTextareaClass}
                style={{ color: textColor14, fontFamily: "inherit" }}
                value={title}
                maxLength={LAYOUT_14_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle?.(safeIndex, e.target.value.slice(0, LAYOUT_14_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Block 1 title"
                />
              <textarea
                className={`${layout14DescriptionTextareaClass} mt-2`}
                style={{ color: textColor14, opacity: 0.9 }}
                value={description}
                onChange={(e) =>
            onChangeDescription?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
                placeholder="Block 1 description"
              />
            </div>
            <div className={`p-6 rounded-xs pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ backgroundColor: accentHex14, color: accentTextColor14 }}>
              <textarea
                className={layout14TitleTextareaClass}
                style={{ color: accentTextColor14, fontFamily: "inherit" }}
                value={title2}
                maxLength={LAYOUT_14_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle2?.(safeIndex, e.target.value.slice(0, LAYOUT_14_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Block 2 title"
                />
              <textarea
                className={`${layout14DescriptionTextareaClass} mt-2`}
                style={{ color: accentTextColor14, opacity: 0.95 }}
                value={description2}
                onChange={(e) =>
            onChangeDescription2?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
                placeholder="Block 2 description"
              />
            </div>
            <div className={`p-6 border-2 rounded-xs pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ borderColor: accentHex14, color: textColor14 }}>
              <textarea
                className={layout14TitleTextareaClass}
                style={{ color: textColor14, fontFamily: "inherit" }}
                value={title3}
                maxLength={LAYOUT_14_LIMITS.title}
                onChange={(e) =>
                  onChangeTitle3?.(safeIndex, e.target.value.slice(0, LAYOUT_14_LIMITS.title))
                }
                onKeyDown={confirmTitleTextOnEnter}
                placeholder="Block 3 title"
                />
              <textarea
                className={`${layout14DescriptionTextareaClass} mt-2`}
                style={{ color: textColor14, opacity: 0.9 }}
                value={description3}
                onChange={(e) =>
            onChangeDescription3?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
                placeholder="Block 3 description"
              />
            </div>
          </div>
          {/* Laptop: three equal columns, full bleed; boxes max 50% height, centered in layout frame (mirrors public PageRenderer) */}
          <div className="hidden lg:flex lg:flex-1 lg:min-h-0 lg:items-start lg:justify-center">
            <div className="grid grid-cols-3 gap-0 max-h-[50%] w-full mt-[5%]">
              <div className={`flex flex-col justify-center p-3 xl:p-8 overflow-y-auto pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ color: textColor14 }}>
                <textarea
                  className={layout14TitleTextareaClass}
                  style={{ color: textColor14, fontFamily: "inherit" }}
                  value={title}
                  maxLength={LAYOUT_14_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, LAYOUT_14_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 1 title"
                  />
                <div
                  className={`flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`}
                  style={{ borderColor: accentHex14, color: textColor14 }}
                >
                  <textarea
                    className={layout14DescriptionTextareaClass}
                    style={{ color: textColor14, opacity: 0.9 }}
                    value={description}
                    onChange={(e) =>
            onChangeDescription?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
                    placeholder="Block 1 description"
                  />
                </div>
              </div>
              <div className={`flex flex-col justify-center p-3 xl:p-8 overflow-y-auto pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ color: textColor14 }}>
                <textarea
                  className={layout14TitleTextareaClass}
                  style={{ color: textColor14, fontFamily: "inherit" }}
                  value={title2}
                  maxLength={LAYOUT_14_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle2?.(safeIndex, e.target.value.slice(0, LAYOUT_14_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 2 title"
                  />
                <div
                  className={`flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`}
                  style={{ backgroundColor: accentHex14, color: accentTextColor14, borderColor: accentHex14 }}
                >
                  <textarea
                    className={layout14DescriptionTextareaClass}
                    style={{ color: accentTextColor14, opacity: 0.95 }}
                    value={description2}
                    onChange={(e) =>
            onChangeDescription2?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
                    placeholder="Block 2 description"
                  />
                </div>
              </div>
              <div className={`flex flex-col justify-center p-3 xl:p-8 overflow-y-auto pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ color: textColor14 }}>
                <textarea
                  className={layout14TitleTextareaClass}
                  style={{ color: textColor14, fontFamily: "inherit" }}
                  value={title3}
                  maxLength={LAYOUT_14_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle3?.(safeIndex, e.target.value.slice(0, LAYOUT_14_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 3 title"
                  />
                <div
                  className={`flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs pointer-events-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`}
                  style={{ borderColor: accentHex14, color: textColor14 }}
                >
                  <textarea
                    className={layout14DescriptionTextareaClass}
                    style={{ color: textColor14, opacity: 0.9 }}
                    value={description3}
                    onChange={(e) =>
            onChangeDescription3?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
                    placeholder="Block 3 description"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-15: Two equal columns, both accent background; below lg: single full-width block with two sections + divider
  if (layoutType === "layout-15") {
    const accentHex15 = customColors?.accent || "#c96a4a";
    const portfolioBg15 = customColors?.text ?? "#faf7f2";
    const accentTextColor15 = getTextColorForBackground(accentHex15);
    const title2 = page.title2 ?? "";
    const description2 = page.description2 ?? "";
    const layout15TitleTextareaClass = `w-full min-w-0 ${LAYOUT_15_TITLE_FIELD_CLASS} portfolio-header-big font-bold bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50 resize-none overflow-hidden break-words`;

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full flex flex-col" data-layout="layout-15">
          {/* Phone: inset block */}
          <div className="flex md:hidden flex-col w-full flex-1 min-h-[70vh] py-8 px-6">
            <div className="w-full flex flex-col rounded-xs pointer-events-auto" style={{ backgroundColor: accentHex15, color: accentTextColor15 }}>
              <div className="p-8">
                <textarea
                  className={layout15TitleTextareaClass}
                  style={{ color: accentTextColor15, fontFamily: "inherit" }}
                  value={title}
                  maxLength={LAYOUT_15_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, LAYOUT_15_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 1 title"
                />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-2`}
                  style={{ color: accentTextColor15, opacity: 0.9, fontFamily: "inherit" }}
                  value={description}
                  maxLength={LAYOUT_15_LIMITS.description}
                  onChange={(e) =>
                    onChangeDescription?.(
                      safeIndex,
                      e.target.value.slice(0, LAYOUT_15_LIMITS.description),
                    )
                  }
                  placeholder="Block 1 description"
                />
              </div>
              <div className="border-t" style={{ borderColor: accentTextColor15 }} />
              <div className="p-8">
                <textarea
                  className={layout15TitleTextareaClass}
                  style={{ color: accentTextColor15, fontFamily: "inherit" }}
                  value={title2}
                  maxLength={LAYOUT_15_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle2?.(safeIndex, e.target.value.slice(0, LAYOUT_15_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 2 title"
                />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-2`}
                  style={{ color: accentTextColor15, opacity: 0.95, fontFamily: "inherit" }}
                  value={description2}
                  maxLength={LAYOUT_15_LIMITS.description}
                  onChange={(e) =>
                    onChangeDescription2?.(
                      safeIndex,
                      e.target.value.slice(0, LAYOUT_15_LIMITS.description),
                    )
                  }
                  placeholder="Block 2 description"
                />
              </div>
            </div>
          </div>
          {/* Tablet: full-width accent block, vertically centered */}
          <div className="hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 justify-center">
            <div className="w-full shrink-0 flex flex-col pointer-events-auto" style={{ backgroundColor: accentHex15, color: accentTextColor15 }}>
              <div className="flex flex-col items-center text-center p-8">
                <textarea
                  className={`${layout15TitleTextareaClass} text-center`}
                  style={{ color: accentTextColor15, fontFamily: "inherit" }}
                  value={title}
                  maxLength={LAYOUT_15_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, LAYOUT_15_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 1 title"
                />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-2 text-center`}
                  style={{ color: accentTextColor15, opacity: 0.9, fontFamily: "inherit" }}
                  value={description}
                  maxLength={LAYOUT_15_LIMITS.description}
                  onChange={(e) =>
                    onChangeDescription?.(
                      safeIndex,
                      e.target.value.slice(0, LAYOUT_15_LIMITS.description),
                    )
                  }
                  placeholder="Block 1 description"
                />
              </div>
              <div className="h-[8px] w-full shrink-0" style={{ backgroundColor: portfolioBg15 }} />
              <div className="flex flex-col items-center text-center p-8">
                <textarea
                  className={`${layout15TitleTextareaClass} text-center`}
                  style={{ color: accentTextColor15, fontFamily: "inherit" }}
                  value={title2}
                  maxLength={LAYOUT_15_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle2?.(safeIndex, e.target.value.slice(0, LAYOUT_15_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 2 title"
                />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-2 text-center`}
                  style={{ color: accentTextColor15, opacity: 0.95, fontFamily: "inherit" }}
                  value={description2}
                  maxLength={LAYOUT_15_LIMITS.description}
                  onChange={(e) =>
                    onChangeDescription2?.(
                      safeIndex,
                      e.target.value.slice(0, LAYOUT_15_LIMITS.description),
                    )
                  }
                  placeholder="Block 2 description"
                />
              </div>
            </div>
          </div>
          {/* Laptop: two equal columns, both accent background (mirrors public structure with gap) */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:flex-1 lg:min-h-0 lg:gap-0">
            <div className="flex flex-col justify-center p-3 xl:p-8 overflow-y-auto">
              <div
                className="flex flex-col justify-center p-8 overflow-y-auto rounded-xs pointer-events-auto"
                style={{ backgroundColor: accentHex15, color: accentTextColor15 }}
              >
                <textarea
                  className={layout15TitleTextareaClass}
                  style={{ color: accentTextColor15, fontFamily: "inherit" }}
                  value={title}
                  maxLength={LAYOUT_15_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle?.(safeIndex, e.target.value.slice(0, LAYOUT_15_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 1 title"
                  />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-2`}
                  style={{ color: accentTextColor15, opacity: 0.9 }}
                  value={description}
                  maxLength={LAYOUT_15_LIMITS.description}
                  onChange={(e) =>
            onChangeDescription?.(
              safeIndex,
              e.target.value.slice(0, LAYOUT_15_LIMITS.description),
            )
          }
                  placeholder="Block 1 description"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center p-3 xl:p-8 overflow-y-auto">
              <div
                className="flex flex-col justify-center p-8 overflow-y-auto rounded-xs pointer-events-auto"
                style={{ backgroundColor: accentHex15, color: accentTextColor15 }}
              >
                <textarea
                  className={layout15TitleTextareaClass}
                  style={{ color: accentTextColor15, fontFamily: "inherit" }}
                  value={title2}
                  maxLength={LAYOUT_15_LIMITS.title}
                  onChange={(e) =>
                    onChangeTitle2?.(safeIndex, e.target.value.slice(0, LAYOUT_15_LIMITS.title))
                  }
                  onKeyDown={confirmTitleTextOnEnter}
                  placeholder="Block 2 title"
                  />
                <textarea
                  className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} mt-2`}
                  style={{ color: accentTextColor15, opacity: 0.95 }}
                  value={description2}
                  maxLength={LAYOUT_15_LIMITS.description}
                  onChange={(e) =>
            onChangeDescription2?.(
              safeIndex,
              e.target.value.slice(0, LAYOUT_15_LIMITS.description),
            )
          }
                  placeholder="Block 2 description"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-12: Title above; one orange band (taller); image bottom-aligned left overlapping band; description below band (60% width, right-aligned, transparent, border-r)
  if (layoutType === "layout-12") {
    const accentHex12 = customColors?.accent || "#c96a4a";
    const portfolioBg12 = customColors?.text || "#11100e";
    const textColor12 = getTextColorForBackground(portfolioBg12);

    const layout12Media = (
      <div
        onClick={handleMediaClick}
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
      >
        {mediaSrc ? (
          <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover object-bottom" />
        ) : (
          <div
            className="flex h-full w-full min-h-[200px] items-center justify-center text-sm border-2 border-dashed border-neutral-500/50 rounded-md"
            style={{ color: "#faf7f2", opacity: 0.9 }}
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
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden flex flex-col" data-layout="layout-12">
          {/* Below lg: simple stacked */}
          <div className="flex flex-col lg:hidden w-full flex-1 min-h-[70vh] relative z-10">
            <textarea
              className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-big font-bold outline-none focus:ring-2 focus:ring-white/50 shrink-0 pt-4`}
              style={{ color: textColor12, fontFamily: "inherit" }}
              value={title}
              maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
              onChange={(e) =>
                onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
              }
              onKeyDown={confirmTitleTextOnEnter}
              placeholder="Page title"
              />
            <div className="w-full aspect-video overflow-hidden relative shrink-0 mt-4">
              {layout12Media}
            </div>
            <div
              className="flex-1 py-8 border-r-8 mt-4 pointer-events-auto"
              style={{ borderRightColor: accentHex12, color: textColor12 }}
            >
              <textarea
                className={PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS}
                style={{ color: textColor12, opacity: 0.9 }}
                value={description}
                onChange={(e) =>
            onChangeDescription?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
                placeholder="Description"
              />
            </div>
          </div>
          {/* Laptop: title; band + image; gap; description (60% width, right-aligned) */}
          <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0 lg:relative">
            <textarea
              className={`${PORTFOLIO_EDITOR_TITLE_TEXTAREA_CLASS} portfolio-header-big font-bold outline-none focus:ring-2 focus:ring-white/50 shrink-0 mt-10 pt-6 pb-4 w-[75%] mx-auto`}
              style={{ color: textColor12, fontFamily: "inherit" }}
              value={title}
              maxLength={UNIVERSAL_LAYOUT_LIMITS.title}
              onChange={(e) =>
                onChangeTitle?.(safeIndex, e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.title))
              }
              onKeyDown={confirmTitleTextOnEnter}
              placeholder="Page title"
              />
            <div className="relative flex-1 min-h-0">
              {/* Orange band – taller */}
              <div className="absolute top-[25%] left-0 right-0 h-[33%] z-0 pointer-events-none" style={{ backgroundColor: accentHex12 }} />
              {/* Image: left 25%, bottom-aligned with band, overlaps band */}
              <div className="absolute left-0 bottom-0 w-[25%] h-[55%] z-10 overflow-hidden">
                {layout12Media}
              </div>
            </div>
            {/* Vertical gap between band and description */}
            <div className="h-6 shrink-0" />
            {/* Description: 60% width, right-aligned, transparent, thick orange right border */}
            <div
              className="w-[60%] ml-auto shrink-0 py-4 overflow-y-auto border-r-[16px] bg-transparent text-right pointer-events-auto"
              style={{ borderRightColor: accentHex12, color: textColor12 }}
            >
              <textarea
                className={`${PORTFOLIO_EDITOR_DESCRIPTION_TEXTAREA_CLASS} text-right`}
                style={{ color: textColor12, opacity: 0.9 }}
                value={description}
                onChange={(e) =>
            onChangeDescription?.(
              safeIndex,
              e.target.value.slice(0, UNIVERSAL_LAYOUT_LIMITS.description),
            )
          }
                placeholder="Description"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full layout-1-magazine" data-layout="layout-1">
      {/* Mobile: vertical stack – image → header → accent block */}
      <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
        <div className="w-full md:max-w-[50%] md:mx-auto aspect-[9/16] max-h-[50vh] overflow-hidden shrink-0">
          {mediaContent}
        </div>
        <div className="px-4 pt-6 pb-0 text-center">
          {headerEl}
        </div>
        <div className="mx-4 mt-4 mb-6 rounded-xs overflow-hidden shrink-0 md:text-center" style={{ backgroundColor: accentHex }}>
          {bodyContent}
        </div>
      </div>

      {/* Laptop: fixed frame – two equal panels, text left, image right (full height) */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-0 lg:h-full lg:min-h-0 w-full">
        <div className="flex flex-col justify-center items-center px-8 lg:px-12 xl:px-16 overflow-hidden min-h-0">
          {headerEl}
          <div
            className="w-full mt-10 rounded-xs overflow-hidden shrink-0"
            style={{ backgroundColor: accentHex }}
          >
            {bodyContent}
          </div>
        </div>
        <div className="relative min-h-0 overflow-hidden">
          <div className="absolute inset-0">
            {mediaContent}
          </div>
        </div>
      </div>
    </div>
  );
}
