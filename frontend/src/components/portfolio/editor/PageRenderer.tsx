"use client";

import React, { useRef } from "react";
import { getTextColorForBackground } from "@/lib/colorUtils";

export type LayoutType = "layout-1" | "layout-2" | "layout-3" | "layout-4" | "layout-5" | "layout-6" | "layout-8" | "layout-9" | "layout-11" | "layout-12";

export type MediaShapeType = "1:1" | "4:5" | "9:16" | "16:9" | "5:4" | "21:9";

export interface PortfolioPageData {
  id: number | string;
  layoutType: LayoutType;
  title: string;
  description: string;
  descriptionBody?: string;
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
    accent?: string;
  };
  layoutOverride?: LayoutType | null;
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
  onChangeDescriptionBody?: (pageIndex: number, newDesc: string) => void;
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
  onChangeDescriptionBody,
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
  const { title, description, descriptionBody = "", mediaSrc } = page;

  const handleMediaClick = () => {
    if (isEditor && onChangeImage) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChangeImage) return;
    onChangeImage(safeIndex, e.target.files?.[0] ?? null);
  };

  // layout-1: Fixed frame – two equal panels, text left, image right (laptop)
  const canvasBg = customColors?.background ?? "#faf7f2";
  const headerStyle = {
    color: getTextColorForBackground(canvasBg),
    borderTop: "2px solid currentColor",
    borderBottom: "2px solid currentColor",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
  };

  const headerEl = (
    <input
      className="w-full portfolio-header-massive bg-transparent rounded-md pl-0 pr-4 py-2 outline-none focus:border-neutral-200"
      style={headerStyle}
      value={title}
      onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
    />
  );

  const accentHex = customColors?.accent || "#c96a4a";
  const accentTextColor = getTextColorForBackground(accentHex);
  const bodyContent = (
    <textarea
      className="w-full portfolio-description whitespace-pre-line bg-transparent border border-neutral-500/60 rounded-md pl-0 pr-4 py-2 outline-none focus:border-neutral-200 min-h-[80px]"
      style={{ color: accentTextColor }}
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

  // layout-2: Image full height between accent bands, text overlay on image (tablet/laptop)
  if (layoutType === "layout-2") {
    const canvasBg = customColors?.background ?? "#faf7f2";
    const textColor = getTextColorForBackground(canvasBg);
    const overlayTextStyle = {
      color: "#faf7f2",
      textShadow: "0 1px 3px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
    };
    const accentStyle = { backgroundColor: "var(--artist-accent, #c96a4a)" };
    const rightBandStyle = { ...accentStyle, borderLeft: "1px solid rgba(255,255,255,0.35)" };

    return (
      <div className="w-full h-full layout-2-horizontal" data-layout="layout-2">
        <div className="flex flex-col md:hidden w-full min-h-[70vh]">
          <div className="w-full aspect-video overflow-hidden">{mediaContent}</div>
          <div className="flex flex-1">
            <div className="flex-1 px-4 py-6">
              <input
                className="w-full portfolio-header-massive font-bold bg-transparent rounded-md pl-0 pr-4 py-2 outline-none focus:border-neutral-200"
                style={{ color: textColor }}
                value={title}
                onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
              />
              <textarea
                className="w-full portfolio-description whitespace-pre-line bg-transparent border border-neutral-500/60 rounded-md pl-0 pr-4 py-2 outline-none focus:border-neutral-200 min-h-[120px]"
                style={{ color: textColor, opacity: 0.9 }}
                value={description}
                onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
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
              <input
                className="portfolio-header-massive font-bold bg-transparent rounded-md pl-0 pr-2 py-1 outline-none focus:border-neutral-200 max-w-[45%] pointer-events-auto"
                style={overlayTextStyle}
                value={title}
                onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
              />
              <textarea
                className="portfolio-description whitespace-pre-line bg-transparent border border-white/30 rounded-md pl-2 pr-2 py-1 outline-none focus:border-white/60 min-h-[80px] max-w-[45%] text-right resize-none pointer-events-auto"
                style={{ ...overlayTextStyle, opacity: 0.95 }}
                value={description}
                onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
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

        {/* Centered text overlay: editable title + description (orange bar), z-10 */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center gap-4 px-8 text-center pointer-events-auto">
            <input
              className="portfolio-header-massive font-bold bg-transparent rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-white/50 text-center w-full max-w-2xl"
              style={overlayTextStyle}
              value={title}
              onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
              placeholder="Page title"
            />
            <div
              className="px-6 py-2 rounded-xs w-full max-w-2xl"
              style={{ backgroundColor: accentColor }}
            >
              <textarea
                className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-white/50 min-h-[80px] resize-none text-center"
                style={{ color: accentTextColor }}
                value={description}
                onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
                placeholder="Description"
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // layout-4: Full-bleed two columns – left 1/3 orange (title, description, body), right 2/3 grey (media)
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
        <input
          className="w-full portfolio-header-big font-bold bg-transparent rounded-md pl-0 pr-4 py-2 outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: textColor }}
          value={title}
          onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
          placeholder="Page title"
        />
        <input
          className="w-full portfolio-description mt-1 bg-transparent rounded-md pl-0 pr-4 py-2 outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: textColor, opacity: 0.95 }}
          value={description}
          onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
          placeholder="Sub header (one liner)"
        />
        <textarea
          className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md pl-0 pr-4 py-2 outline-none focus:ring-2 focus:ring-white/50 min-h-[120px] resize-none mt-4"
          style={{ color: textColor, opacity: 0.9 }}
          value={descriptionBody}
          onChange={(e) => onChangeDescriptionBody?.(safeIndex, e.target.value)}
          placeholder="Body text"
        />
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full" data-layout="layout-4">
          {/* Mobile/tablet: media on top, then orange section */}
          <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0">
              {mediaContent}
            </div>
            <div className="flex-1 min-h-0">{orangePanel}</div>
          </div>
          {/* Laptop: two columns side by side */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_2fr] lg:h-full lg:min-h-0 w-full">
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
        <input
          className="w-full portfolio-header-big font-bold bg-transparent rounded-md pl-0 pr-4 py-2 outline-none focus:ring-2 focus:ring-neutral-400/50"
          style={{ color: textColor }}
          value={title}
          onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
          placeholder="Page title"
        />
        <textarea
          className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md pl-0 pr-4 py-2 mt-2 outline-none focus:ring-2 focus:ring-neutral-400/50 min-h-[80px] resize-none"
          style={{ color: textColor, opacity: 0.9 }}
          value={description}
          onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
          placeholder="Description"
        />
      </div>
    );

    const textBlockU = (
      <div className="flex flex-col px-6 py-4" style={uBorderStyle}>
        <input
          className="w-full portfolio-header-big font-bold bg-transparent rounded-md pl-0 pr-4 py-2 outline-none focus:ring-2 focus:ring-neutral-400/50"
          style={{ color: textColor }}
          value={title}
          onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
          placeholder="Page title"
        />
        <textarea
          className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md pl-0 pr-4 py-2 mt-2 outline-none focus:ring-2 focus:ring-neutral-400/50 min-h-[80px] resize-none"
          style={{ color: textColor, opacity: 0.9 }}
          value={description}
          onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
          placeholder="Description"
        />
      </div>
    );

    return (
      <div className="w-full h-full" data-layout="layout-5">
        {/* Tablet/mobile: image on top, text below with U-frame */}
        <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
          <div className="w-full aspect-video overflow-hidden relative shrink-0">
            {layout5Media}
          </div>
          <div className="flex-1 p-6">{textBlockU}</div>
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

  // layout-6: 25% / 75% split – left text, right vertical media strip; split bg (top transparent, bottom accent)
  if (layoutType === "layout-6") {
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text ?? "#11100e";
    const textColor = getTextColorForBackground(portfolioBg);

    const layout6Media = (
      <div
        onClick={handleMediaClick}
        className={`w-full h-full min-h-[200px] flex items-center justify-center overflow-hidden ${isEditor ? "cursor-pointer" : ""}`}
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

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-6">
          {/* Split background: top 50% transparent, bottom 50% accent */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, transparent 50%, ${accentHex} 50%, ${accentHex} 100%)`,
            }}
          />
          <div className="relative z-10 flex flex-col lg:hidden w-full min-h-[70vh] px-[2vw] pointer-events-auto">
          <div className="w-full aspect-[9/16] max-h-[40vh] max-w-[200px] mx-auto overflow-hidden relative shrink-0">
            {layout6Media}
          </div>
          <div className="flex-1 px-4 py-6 text-right">
            <input
              className="w-full portfolio-header-big font-bold bg-transparent rounded-md pl-4 pr-0 py-2 text-right outline-none focus:ring-2 focus:ring-neutral-400/50"
              style={{ color: textColor }}
              value={title}
              onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
              placeholder="Page title"
            />
            <input
              className="w-full portfolio-description mt-1 bg-transparent rounded-md pl-4 pr-0 py-2 text-right outline-none focus:ring-2 focus:ring-neutral-400/50"
              style={{ color: textColor, opacity: 0.95 }}
              value={description}
              onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
              placeholder="Sub header"
            />
            <textarea
              className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md pl-4 pr-0 py-2 mt-28 text-right outline-none focus:ring-2 focus:ring-neutral-400/50 min-h-[80px] resize-none"
              style={{ color: textColor, opacity: 0.9 }}
              value={descriptionBody}
              onChange={(e) => onChangeDescriptionBody?.(safeIndex, e.target.value)}
              placeholder="Body text"
            />
          </div>
        </div>
        <div className="hidden lg:grid lg:grid-cols-[3fr_7fr] lg:gap-0 lg:h-full lg:min-h-0 w-full px-[8vw] relative z-10">
          <div className="flex items-center justify-center min-h-0 overflow-hidden pl-4">
            <div className="relative w-full h-full min-h-[300px] overflow-hidden shrink-0">
              {layout6Media}
            </div>
          </div>
          <div className="flex flex-col justify-center items-end text-right px-6 lg:px-8 overflow-y-auto min-h-0 pointer-events-auto relative z-10">
            <input
              className="w-full portfolio-header-big font-bold bg-transparent rounded-md pl-4 pr-0 py-2 text-right outline-none focus:ring-2 focus:ring-neutral-400/50"
              style={{ color: textColor }}
              value={title}
              onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
              placeholder="Page title"
            />
            <input
              className="w-full portfolio-description mt-1 bg-transparent rounded-md pl-4 pr-0 py-2 text-right outline-none focus:ring-2 focus:ring-neutral-400/50"
              style={{ color: textColor, opacity: 0.95 }}
              value={description}
              onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
              placeholder="Sub header"
            />
            <textarea
              className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md pl-4 pr-0 py-2 mt-28 text-right outline-none focus:ring-2 focus:ring-neutral-400/50 min-h-[80px] resize-none"
              style={{ color: textColor, opacity: 0.9 }}
              value={descriptionBody}
              onChange={(e) => onChangeDescriptionBody?.(safeIndex, e.target.value)}
              placeholder="Body text"
            />
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
        <div className="flex flex-col items-center justify-center text-center px-8 w-full">
          <input
            className="w-full portfolio-header-massive font-bold uppercase bg-transparent rounded-md py-2 text-center outline-none focus:ring-2 focus:ring-white/50"
            style={{ color: accentTextColor }}
            value={title}
            onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
            placeholder="Page title"
          />
          <div className="w-4/5 h-[5px] my-4 bg-white/90" aria-hidden />
          <textarea
            className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md py-2 text-center outline-none focus:ring-2 focus:ring-white/50 min-h-[80px] resize-none"
            style={{ color: accentTextColor }}
            value={description}
            onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
            placeholder="Description"
          />
        </div>
      </div>
    );

    return (
      <div className="w-full h-full flex items-center justify-center" data-layout="layout-8">
        <div className="flex flex-col lg:hidden w-full min-h-[50vh] px-4 py-8">
          <div className="w-full flex-1 min-h-0 rounded-sm overflow-hidden">
            {layout8Content}
          </div>
        </div>
        <div className="hidden lg:flex lg:items-stretch lg:justify-center lg:w-full lg:h-full lg:min-h-0">
          <div className="w-[66%] min-w-[280px] max-w-[900px] h-full rounded-sm overflow-hidden shrink-0">
            {layout8Content}
          </div>
        </div>
      </div>
    );
  }

  // layout-9: Full-bleed 60/40 split – left transparent + orange band (title, description), right media
  if (layoutType === "layout-9") {
    const accentHex = customColors?.accent || "#c96a4a";
    const accentTextColor = getTextColorForBackground(accentHex);

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
          {/* Full-width orange band (z-0) – like layout-6 */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, transparent 67%, ${accentHex} 67%, ${accentHex} 100%)`,
            }}
          />
          {/* Content: 60/40 split on top (z-10) */}
          <div className="relative z-10 flex flex-col lg:hidden w-full min-h-[70vh] px-[2vw]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0">
              {layout9Media}
            </div>
            <div
              className="flex flex-col items-center justify-center text-center px-8 py-14 flex-1 pointer-events-auto"
              style={{ color: accentTextColor }}
            >
              <input
                className="w-full portfolio-header-massive font-bold uppercase bg-transparent rounded-md py-2 text-center outline-none focus:ring-2 focus:ring-white/50"
                style={{ color: accentTextColor }}
                value={title}
                onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
                placeholder="Page title"
              />
              <input
                className="w-full portfolio-description mt-2 uppercase bg-transparent rounded-md py-2 text-center outline-none focus:ring-2 focus:ring-white/50"
                style={{ color: accentTextColor }}
                value={description}
                onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
                placeholder="Sub header"
              />
            </div>
          </div>
          {/* Laptop: 60% left (transparent + text over band), 40% right (media) */}
          <div className="hidden lg:grid lg:grid-cols-[3fr_2fr] lg:gap-0 lg:h-full lg:min-h-0 w-full px-[8vw] relative z-10">
            <div className="flex flex-col min-h-0">
              <div className="flex-1 min-h-0" />
              <div
                className="flex flex-col justify-end px-8 py-14 shrink-0 pointer-events-auto"
                style={{ color: accentTextColor }}
              >
                <input
                  className="w-full portfolio-header-massive font-bold uppercase bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50"
                  style={{ color: accentTextColor }}
                  value={title}
                  onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
                  placeholder="Page title"
                />
                <input
                  className="w-full portfolio-description mt-2 uppercase bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50"
                  style={{ color: accentTextColor }}
                  value={description}
                  onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
                  placeholder="Sub header"
                />
              </div>
            </div>
            <div className="relative min-h-0 overflow-hidden">
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
        <input
          className="w-full portfolio-header-big font-bold bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: accentTextColor }}
          value={title}
          onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
          placeholder="Page title"
        />
        <input
          className="w-full portfolio-description mt-1 bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: accentTextColor, opacity: 0.95 }}
          value={description}
          onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
          placeholder="Sub header"
        />
        <textarea
          className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md py-2 mt-4 outline-none focus:ring-2 focus:ring-white/50 min-h-[80px] resize-none"
          style={{ color: accentTextColor, opacity: 0.9 }}
          value={descriptionBody}
          onChange={(e) => onChangeDescriptionBody?.(safeIndex, e.target.value)}
          placeholder="Body text"
        />
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-11">
          <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0 z-0">
              {layout11Media}
            </div>
            <div className="flex-1 relative z-10" style={{
              background: gradientBg,
              color: accentTextColor,
            }}>
              <div className="flex flex-col justify-center px-8 py-12 pointer-events-auto">
                <input
                  className="w-full portfolio-header-big font-bold bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50"
                  style={{ color: accentTextColor }}
                  value={title}
                  onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
                  placeholder="Page title"
                />
                <input
                  className="w-full portfolio-description mt-1 bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50"
                  style={{ color: accentTextColor, opacity: 0.95 }}
                  value={description}
                  onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
                  placeholder="Sub header"
                />
                <textarea
                  className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md py-2 mt-4 outline-none focus:ring-2 focus:ring-white/50 min-h-[80px] resize-none"
                  style={{ color: accentTextColor, opacity: 0.9 }}
                  value={descriptionBody}
                  onChange={(e) => onChangeDescriptionBody?.(safeIndex, e.target.value)}
                  placeholder="Body text"
                />
              </div>
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

  // layout-12: Title above; one orange band (upper-mid); image bottom-aligned left; description right with orange border
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
        <div className="w-full h-full relative overflow-hidden flex flex-col px-8" data-layout="layout-12">
          {/* Below lg: simple stacked */}
          <div className="flex flex-col lg:hidden w-full flex-1 min-h-[70vh] relative z-10">
            <input
              className="w-full portfolio-header-big font-bold bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50 shrink-0 pt-4"
              style={{ color: textColor12 }}
              value={title}
              onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
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
                className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50 min-h-[80px] resize-none"
                style={{ color: textColor12, opacity: 0.9 }}
                value={description}
                onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
                placeholder="Description"
              />
            </div>
          </div>
          {/* Laptop: title row; one band; image (bottom) | description (border-right) */}
          <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0 lg:relative">
            <input
              className="w-full portfolio-header-big font-bold bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50 shrink-0 pt-6 pb-4"
              style={{ color: textColor12 }}
              value={title}
              onChange={(e) => onChangeTitle?.(safeIndex, e.target.value)}
              placeholder="Page title"
            />
            <div className="relative flex-1 min-h-0 flex">
              {/* One orange band – a little higher than halfway */}
              <div className="absolute top-[38%] left-0 right-0 h-[14%] z-0 pointer-events-none" style={{ backgroundColor: accentHex12 }} />
              <div className="grid grid-cols-[1fr_3fr] gap-0 flex-1 min-h-0 relative z-10">
                {/* Image: bottom-aligned, ~58% height, overlaps band */}
                <div className="relative flex items-end min-h-0">
                  <div className="absolute bottom-0 left-0 right-0 h-[58%] overflow-hidden">
                    {layout12Media}
                  </div>
                </div>
                {/* Description: thick orange right border only */}
                <div
                  className="flex flex-col justify-center py-6 overflow-y-auto border-r-[16px] pointer-events-auto"
                  style={{ borderRightColor: accentHex12, color: textColor12 }}
                >
                  <textarea
                    className="w-full portfolio-description whitespace-pre-line bg-transparent rounded-md py-2 outline-none focus:ring-2 focus:ring-white/50 min-h-[80px] resize-none"
                    style={{ color: textColor12, opacity: 0.9 }}
                    value={description}
                    onChange={(e) => onChangeDescription?.(safeIndex, e.target.value)}
                    placeholder="Description"
                  />
                </div>
              </div>
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
        <div className="px-4 py-6 text-center">
          {headerEl}
        </div>
        <div className="mx-4 mb-6 rounded-xs overflow-hidden shrink-0" style={{ backgroundColor: accentHex }}>
          {bodyContent}
        </div>
      </div>

      {/* Laptop: fixed frame – two equal panels, text left, image right (full height) */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-0 lg:h-full lg:min-h-0 w-full">
        <div className="flex flex-col justify-center items-center px-8 lg:px-12 xl:px-16 overflow-hidden min-h-0">
          {headerEl}
          <div
            className="w-full mt-4 rounded-xs overflow-hidden shrink-0"
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
