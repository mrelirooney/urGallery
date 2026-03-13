// frontend/src/components/portfolio/PageRenderer.tsx
import React from "react";
import { getTextColorForBackground } from "@/lib/colorUtils";

/** All supported layouts – must match Django choices exactly */
export type LayoutType = "layout-1" | "layout-2" | "layout-3" | "layout-4" | "layout-5" | "layout-6" | "layout-8" | "layout-9" | "layout-11" | "layout-12" | "layout-13" | "layout-14" | "layout-15";

export type MediaShapeType = "1:1" | "9:16" | "16:9" | "4:5" | "5:4" | "21:9";

/** Normalized shape the frontend uses for a page */
export type PortfolioPageData = {
  id?: number;
  pageNumber: number;
  layoutType: LayoutType;
  title: string;
  description: string;
  descriptionBody?: string;
  mediaSrc?: string | null;
  mediaShape?: MediaShapeType;
  mediaSrc2?: string | null;
  mediaShape2?: MediaShapeType;
  title2?: string;
  description2?: string;
  title3?: string;
  description3?: string;
};

type PageRendererProps = {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  isEditor?: boolean;
  customColors?: {
    text?: string;
    background?: string;
    accent?: string;
  };
  onChangeTitle?: (pageIndex: number, newTitle: string) => void;
  onChangeDescription?: (pageIndex: number, newDesc: string) => void;
};

export default function PageRenderer({
  pages,
  currentPageIndex,
  isEditor,
  customColors,
  onChangeTitle,
  onChangeDescription,
}: PageRendererProps) {
  const page = pages[currentPageIndex];
  if (!page) return null;

  const { title, description, descriptionBody = "", mediaSrc, layoutType } = page;

  // layout-2: Image full height between accent bands, text overlay on image (tablet/laptop)
  if (layoutType === "layout-2") {
    const portfolioBg = customColors?.text || "#11100e";
    const accentHex = customColors?.accent || "#c96a4a";
    const textColor = getTextColorForBackground(portfolioBg);
    const overlayTextStyle = {
      color: "#faf7f2",
      textShadow: "0 1px 3px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
    };
    const imageEl2 = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    ) : (
      <div
        className="absolute inset-0 w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
      </div>
    );
    const accentStyle = { backgroundColor: accentHex };
    const rightBandStyle = { ...accentStyle, borderLeft: "1px solid rgba(255,255,255,0.35)" };

    return (
      <div className="w-full h-full layout-2-horizontal" data-layout="layout-2">
        {/* Mobile: media on top (16:9), text below, accent band right (unchanged) */}
        <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
          <div className="w-full aspect-video overflow-hidden relative">
            {mediaSrc ? (
              <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div
                className="w-full h-full min-h-[120px] flex items-center justify-center text-sm"
                style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
              >
                No media selected
              </div>
            )}
          </div>
          <div className="flex flex-1">
            <div className="flex-1 px-4 py-6">
              <h2 className="portfolio-header-massive font-bold" style={{ color: textColor }}>{title}</h2>
              <p className="whitespace-pre-line portfolio-description" style={{ color: textColor, opacity: 0.85 }}>{description}</p>
            </div>
            <div className="w-8 shrink-0" style={accentStyle} />
          </div>
        </div>
        {/* Tablet/laptop: fixed frame – image full height, touches accent bars, text overlay */}
        <div className="hidden md:flex md:h-full md:min-h-0 w-full">
          <div className="w-12 shrink-0" style={accentStyle} />
          <div className="flex-1 relative min-w-0 min-h-0 overflow-hidden">
            {imageEl2}
            <div className="absolute inset-0 z-10 flex items-end justify-between px-6 lg:px-8 xl:px-10 pb-6 lg:pb-8 pointer-events-none">
              <h2 className="portfolio-header-massive font-bold max-w-[45%]" style={overlayTextStyle}>
                {title}
              </h2>
              <p className="whitespace-pre-line portfolio-description max-w-[45%] text-right" style={{ ...overlayTextStyle, opacity: 0.95 }}>
                {description}
              </p>
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
    const mediaEl = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    ) : (
      <div
        className="absolute inset-0 w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-3">
        {/* Media: fills entire content area, z-0 */}
        <div className="absolute inset-0 z-0">{mediaEl}</div>

        {/* Four orange corner markers, z-10 */}
        <div className="absolute top-4 left-4 w-3 h-3 z-10" style={{ backgroundColor: accentColor }} aria-hidden />
        <div className="absolute top-4 right-4 w-3 h-3 z-10" style={{ backgroundColor: accentColor }} aria-hidden />
        <div className="absolute bottom-4 left-4 w-3 h-3 z-10" style={{ backgroundColor: accentColor }} aria-hidden />
        <div className="absolute bottom-4 right-4 w-3 h-3 z-10" style={{ backgroundColor: accentColor }} aria-hidden />

        {/* Centered text overlay: MASSIVE HEADER + SUB HEADER (orange bar), z-10 */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center gap-4 px-8 text-center">
            <h2 className="portfolio-header-massive font-bold" style={overlayTextStyle}>
              {title}
            </h2>
            <div
              className="px-6 py-2 rounded-xs"
              style={{ backgroundColor: accentColor, color: accentTextColor }}
            >
              <p className="whitespace-pre-line portfolio-description text-sm sm:text-base">
                {description || "\u00A0"}
              </p>
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

    const mediaEl = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    ) : (
      <div
        className="absolute inset-0 w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
      </div>
    );

    const orangePanel = (
      <div
        className="flex flex-col justify-center px-8 lg:px-12 xl:px-16 py-8 overflow-y-auto"
        style={{ backgroundColor: accentColor, color: textColor }}
      >
        <h2 className="portfolio-header-big font-bold">{title}</h2>
        <p className="portfolio-description mt-1 opacity-95">{description}</p>
        <p className="whitespace-pre-line portfolio-description opacity-90 mt-4">{descriptionBody || "\u00A0"}</p>
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full" data-layout="layout-4">
          {/* Mobile/tablet: media on top, then orange section (mirror layout-1) */}
          <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0">
              {mediaEl}
            </div>
            <div className="flex-1 min-h-0">{orangePanel}</div>
          </div>
          {/* Laptop: two columns side by side */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_2fr] lg:h-full lg:min-h-0 w-full">
            {orangePanel}
            <div className="relative min-h-0 overflow-hidden bg-neutral-600">
              {mediaEl}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-5: Constrained frame – left text with L-shaped accent border, right media (no bg)
  if (layoutType === "layout-5") {
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text || "#11100e";
    const textColor = getTextColorForBackground(portfolioBg);
    const lBorderStyle = { borderLeft: `20px solid ${accentHex}`, borderBottom: `20px solid ${accentHex}` };
    const uBorderStyle = {
      borderLeft: `20px solid ${accentHex}`,
      borderRight: `20px solid ${accentHex}`,
      borderBottom: `20px solid ${accentHex}`,
    };

    const mediaEl = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    ) : (
      <div
        className="absolute inset-0 w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
      </div>
    );

    const textBlock = (
      <div className="flex flex-col px-6 py-4" style={lBorderStyle}>
        <h2 className="portfolio-header-big font-bold" style={{ color: textColor }}>{title}</h2>
        <p className="whitespace-pre-line portfolio-description mt-2 opacity-90" style={{ color: textColor }}>{description || "\u00A0"}</p>
      </div>
    );

    const textBlockU = (
      <div className="flex flex-col px-6 py-4" style={uBorderStyle}>
        <h2 className="portfolio-header-big font-bold" style={{ color: textColor }}>{title}</h2>
        <p className="whitespace-pre-line portfolio-description mt-2 opacity-90" style={{ color: textColor }}>{description || "\u00A0"}</p>
      </div>
    );

    return (
      <div className="w-full h-full" data-layout="layout-5">
        {/* Tablet/mobile: image on top, text below with U-frame */}
        <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
          <div className="w-full aspect-video overflow-hidden relative shrink-0">
            {mediaEl}
          </div>
          <div className="flex-1 p-6">{textBlockU}</div>
        </div>
        {/* Laptop: two columns – left text with L-border, right media */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-0 lg:h-full lg:min-h-0 w-full">
          <div className="flex flex-col justify-end pl-0 pr-4 pb-16 overflow-hidden min-h-0">
            {textBlock}
          </div>
          <div className="relative min-h-0 overflow-hidden">
            <div className="absolute inset-0">{mediaEl}</div>
          </div>
        </div>
      </div>
    );
  }

  // layout-6: 25% / 75% split – left text, right vertical media strip; split bg (top transparent, bottom accent)
  if (layoutType === "layout-6") {
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text || "#11100e";
    const textColor = getTextColorForBackground(portfolioBg);
    const descriptionBodyColor = getTextColorForBackground(accentHex);

    const mediaEl6 = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="w-full h-full object-cover object-center" loading="lazy" />
    ) : (
      <div
        className="w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-6">
          {/* Split background: top 50% transparent, bottom 50% accent */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, transparent 50%, ${accentHex} 50%, ${accentHex} 100%)`,
            }}
          />
          {/* Content: full-bleed 25% media left, 75% text right */}
          <div className="relative z-10 flex flex-col lg:hidden w-full min-h-[70vh] px-[2vw]">
          <div className="w-full aspect-[9/16] max-h-[40vh] max-w-[200px] mx-auto overflow-hidden relative shrink-0">
            {mediaEl6}
          </div>
          <div className="flex-1 px-4 py-6 text-right">
            <h2 className="portfolio-header-big font-bold" style={{ color: textColor }}>{title}</h2>
            <p className="whitespace-pre-line portfolio-description mt-1 opacity-95" style={{ color: textColor }}>{description || "\u00A0"}</p>
            <p className="whitespace-pre-line portfolio-description opacity-90 mt-32" style={{ color: descriptionBodyColor }}>{descriptionBody || "\u00A0"}</p>
          </div>
        </div>
        <div className="hidden lg:grid lg:grid-cols-[4fr_6fr] lg:gap-0 lg:h-full lg:min-h-0 w-full px-[8vw]">
          <div className="flex items-center justify-center min-h-0 overflow-hidden pl-4">
            <div className="relative w-full h-full min-h-[300px] overflow-hidden shrink-0">
              {mediaEl6}
            </div>
          </div>
          <div className="flex flex-col justify-center items-end text-right px-6 lg:px-8 overflow-y-auto min-h-0">
            <h2 className="portfolio-header-big font-bold w-full" style={{ color: textColor }}>{title}</h2>
            <p className="whitespace-pre-line portfolio-description mt-1 opacity-95 w-full" style={{ color: textColor }}>{description || "\u00A0"}</p>
            <p className="whitespace-pre-line portfolio-description opacity-90 mt-32 w-full" style={{ color: descriptionBodyColor }}>{descriptionBody || "\u00A0"}</p>
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

    const contentBlock = (
      <div
        className="relative flex items-center justify-center h-full min-h-full overflow-y-auto"
        style={{ backgroundColor: accentHex, color: accentTextColor }}
      >
        {/* Four corner markers */}
        <div className="absolute top-4 left-4 w-3 h-3" style={{ backgroundColor: markerColor }} aria-hidden />
        <div className="absolute top-4 right-4 w-3 h-3" style={{ backgroundColor: markerColor }} aria-hidden />
        <div className="absolute bottom-4 left-4 w-3 h-3" style={{ backgroundColor: markerColor }} aria-hidden />
        <div className="absolute bottom-4 right-4 w-3 h-3" style={{ backgroundColor: markerColor }} aria-hidden />
        <div className="flex flex-col items-center justify-center text-center px-8 w-full">
          <h2 className="portfolio-header-massive font-bold uppercase">{title || "\u00A0"}</h2>
          <div className="w-4/5 h-[5px] my-4" style={{ backgroundColor: markerColor }} aria-hidden />
          <p className="whitespace-pre-line portfolio-description">{description || "\u00A0"}</p>
        </div>
      </div>
    );

    return (
      <div className="w-full h-full flex items-center justify-center" data-layout="layout-8">
        {/* Mobile: stacked, full width with horizontal padding */}
        <div className="flex flex-col lg:hidden w-full min-h-[50vh] px-4 py-8">
          <div className="w-full flex-1 min-h-0 overflow-hidden">
            {contentBlock}
          </div>
        </div>
        {/* Desktop: 50% width, full height, centered */}
        <div className="hidden lg:flex lg:items-stretch lg:justify-center lg:w-full lg:h-full lg:min-h-0">
          <div className="w-[66%] min-w-[280px] max-w-[900px] h-full overflow-hidden shrink-0">
            {contentBlock}
          </div>
        </div>
      </div>
    );
  }

  // layout-9: Full-bleed 60/40 split – left transparent + orange band (title, description), right media
  if (layoutType === "layout-9") {
    const accentHex = customColors?.accent || "#c96a4a";
    const accentTextColor = getTextColorForBackground(accentHex);

    const mediaEl9 = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    ) : (
      <div
        className="absolute inset-0 w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
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
          {/* Tablet: media on top, text below (over orange band) */}
          <div className="relative z-10 flex flex-col lg:hidden w-full min-h-[70vh] px-[2vw]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0">
              {mediaEl9}
            </div>
            <div
              className="flex flex-col items-center justify-center text-center px-8 py-14 flex-1"
              style={{ color: accentTextColor }}
            >
              <h2 className="portfolio-header-massive font-bold uppercase">{title || "\u00A0"}</h2>
              <p className="portfolio-description mt-2 uppercase">{description || "\u00A0"}</p>
            </div>
          </div>
          {/* Laptop: 60% left (transparent + text over band), 40% right (media) */}
          <div className="hidden lg:grid lg:grid-cols-[3fr_2fr] lg:gap-0 lg:h-full lg:min-h-0 w-full px-[8vw] relative z-10">
            <div className="flex flex-col min-h-0">
              <div className="flex-1 min-h-0" />
              <div
                className="flex flex-col justify-end px-8 py-14 shrink-0"
                style={{ color: accentTextColor }}
              >
                <h2 className="portfolio-header-massive font-bold uppercase">{title || "\u00A0"}</h2>
                <p className="portfolio-description mt-2 uppercase">{description || "\u00A0"}</p>
              </div>
            </div>
            <div className="relative min-h-0 overflow-hidden">
              {mediaEl9}
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

    const mediaEl11 = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    ) : (
      <div
        className="absolute inset-0 w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
      </div>
    );

    const textBlock = (
      <div
        className="flex flex-col justify-center px-8 py-12 h-full min-h-0 overflow-y-auto"
        style={{
          background: gradientBg,
          color: accentTextColor,
        }}
      >
        <h2 className="portfolio-header-big font-bold">{title || "\u00A0"}</h2>
        <p className="portfolio-description mt-1 opacity-95">{description || "\u00A0"}</p>
        <p className="whitespace-pre-line portfolio-description opacity-90 mt-4">{descriptionBody || "\u00A0"}</p>
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-11">
          {/* Below lg: simple stacked – media on top, orange band below */}
          <div className="flex flex-col lg:hidden w-full min-h-[70vh]">
            <div className="w-full aspect-video overflow-hidden relative shrink-0 z-0">
              {mediaEl11}
            </div>
            <div className="flex-1 relative z-10" style={{
              background: gradientBg,
              color: accentTextColor,
            }}>
              <div className="flex flex-col justify-center px-8 py-12">
                <h2 className="portfolio-header-big font-bold">{title || "\u00A0"}</h2>
                <p className="portfolio-description mt-1 opacity-95">{description || "\u00A0"}</p>
                <p className="whitespace-pre-line portfolio-description opacity-90 mt-4">{descriptionBody || "\u00A0"}</p>
              </div>
            </div>
          </div>
          {/* Laptop: 67% media (z-0), 33% orange band with gradient (z-10) */}
          <div className="hidden lg:grid lg:grid-cols-[2fr_1fr] lg:gap-0 lg:h-full lg:min-h-0 w-full">
            <div className="relative min-h-0 overflow-hidden z-0">
              {mediaEl11}
            </div>
            <div className="relative z-10 min-h-0 overflow-hidden">
              {textBlock}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-13: Row 1 = MASSIVE HEADER (title) full width + 15px orange left accent; Row 2 = 60% image | 40% BIG HEADER + descriptionBody + 15px orange right accent
  if (layoutType === "layout-13") {
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text || "#11100e";
    const textColor = getTextColorForBackground(portfolioBg);

    const mediaEl13 = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    ) : (
      <div
        className="absolute inset-0 w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full flex flex-col" data-layout="layout-13">
          {/* Below lg: tablet stacked – horizontal lines, centered headers, full-width media, paragraph */}
          <div className="flex flex-col lg:hidden w-full flex-1 min-h-[70vh]">
            <div className="h-[4px] w-full shrink-0" style={{ backgroundColor: accentHex }} />
            <div className="flex flex-col items-center text-center py-6 px-8">
              <h2 className="portfolio-header-massive font-bold" style={{ color: textColor }}>{title || "\u00A0"}</h2>
              <h3 className="portfolio-header-big font-bold mt-2" style={{ color: textColor }}>{description || "\u00A0"}</h3>
            </div>
            <div className="w-full aspect-video overflow-hidden relative shrink-0">
              {mediaEl13}
            </div>
            <p className="whitespace-pre-line portfolio-description py-6 px-8 opacity-90" style={{ color: textColor }}>{descriptionBody || "\u00A0"}</p>
            <div className="h-[4px] w-full shrink-0" style={{ backgroundColor: accentHex }} />
          </div>
          {/* Laptop: Row 1 = title + left accent; Row 2 = 60% image | 40% text + right accent (full bleed) */}
          <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
            <div className="shrink-0 py-6 pl-12">
              <div className="shrink-0 pl-8 border-l-[15px] " style={{ borderLeftColor: accentHex, color: textColor }}>
                <h2 className="portfolio-header-massive font-bold" >{title || "\u00A0"}</h2>
              </div>
            </div>
            <div className="grid grid-cols-[3fr_2fr] gap-0 flex-1 min-h-0">
              <div className="relative min-h-0 overflow-hidden">
                {mediaEl13}
              </div>
              <div
                className="flex flex-col justify-center py-8 pr-12 pl-2 overflow-y-auto text-right">
                <div className="shrink-0 pr-8 border-r-[15px] " style={{ borderRightColor: accentHex, color: textColor }}>
                  <h3 className="portfolio-header-big font-bold">{description || "\u00A0"}</h3>
                  <p className="whitespace-pre-line portfolio-description mt-4 opacity-90">{descriptionBody || "\u00A0"}</p>
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
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text || "#11100e";
    const textColor = getTextColorForBackground(portfolioBg);
    const accentTextColor = getTextColorForBackground(accentHex);
    const title2 = page.title2 ?? "";
    const description2 = page.description2 ?? "";
    const title3 = page.title3 ?? "";
    const description3 = page.description3 ?? "";

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full flex flex-col" data-layout="layout-14">
          {/* Below lg: stacked vertically */}
          <div className="flex flex-col lg:hidden w-full flex-1 min-h-[70vh] gap-6 py-8 px-6">
            <div className="p-6 border-2 rounded-xs" style={{ borderColor: accentHex, color: textColor }}>
              <h3 className="portfolio-header-big font-bold">{title || "\u00A0"}</h3>
              <p className="whitespace-pre-line portfolio-description mt-2 opacity-90">{description || "\u00A0"}</p>
            </div>
            <div className="p-6 rounded-xs" style={{ backgroundColor: accentHex, color: accentTextColor }}>
              <h3 className="portfolio-header-big font-bold">{title2 || "\u00A0"}</h3>
              <p className="whitespace-pre-line portfolio-description mt-2 opacity-95">{description2 || "\u00A0"}</p>
            </div>
            <div className="p-6 border-2 rounded-xs" style={{ borderColor: accentHex, color: textColor }}>
              <h3 className="portfolio-header-big font-bold">{title3 || "\u00A0"}</h3>
              <p className="whitespace-pre-line portfolio-description mt-2 opacity-90">{description3 || "\u00A0"}</p>
            </div>
          </div>
          {/* Laptop: three equal columns, full bleed; boxes max 50% height, centered in layout frame */}
          {/* textColor = off-white on dark portfolio; accentTextColor = off-black on light accent, off-white on dark accent */}
          <div className="hidden lg:flex lg:flex-1 lg:min-h-0 lg:items-start lg:justify-center">
            <div className="grid grid-cols-3 gap-0 max-h-[50%] w-full">
              <div className="flex flex-col justify-center p-3 xl:p-8 overflow-y-auto" style={{ color: textColor }}>
                <h3 className="portfolio-header-big font-bold text-center pb-2">{title || "\u00A0"}</h3>
                <div
                  className="flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs text-center"
                  style={{ borderColor: accentHex, color: textColor }}
                >
                  <p className="whitespace-pre-line portfolio-description mt-2 opacity-90">{description || "\u00A0"}</p>
                </div>
              </div>
            <div className="flex flex-col justify-center px-0 xl:px-0 overflow-y-auto" style={{ color: textColor }}>
              <h3 className="portfolio-header-big font-bold text-center pb-2">{title2 || "\u00A0"}</h3>
              <div
                className="flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs text-center"
                style={{ backgroundColor: accentHex, color: accentTextColor, borderColor: accentHex, }}
              >
                <p className="whitespace-pre-line portfolio-description mt-2 opacity-95">{description2 || "\u00A0"}</p>
              </div>
            </div>
              <div className="flex flex-col justify-center p-3 xl:p-8 overflow-y-auto" style={{ color: textColor }}>
              <h3 className="portfolio-header-big font-bold text-center pb-2">{title3 || "\u00A0"}</h3>
                <div
                  className="flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs text-center"
                  style={{ borderColor: accentHex, color: textColor }}
                >
                  <p className="whitespace-pre-line portfolio-description mt-2 opacity-90">{description3 || "\u00A0"}</p>
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
    const accentHex = customColors?.accent || "#c96a4a";
    const accentTextColor = getTextColorForBackground(accentHex);
    const title2 = page.title2 ?? "";
    const description2 = page.description2 ?? "";

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full flex flex-col" data-layout="layout-15">
          {/* Below lg: single full-width block, two sections, divider */}
          <div className="flex flex-col lg:hidden w-full flex-1 min-h-[70vh] py-8 px-6">
            <div className="w-full flex flex-col rounded-xs" style={{ backgroundColor: accentHex, color: accentTextColor }}>
              <div className="p-8">
                <h3 className="portfolio-header-big font-bold">{title || "\u00A0"}</h3>
                <p className="whitespace-pre-line portfolio-description mt-2 opacity-90">{description || "\u00A0"}</p>
              </div>
              <div className="border-t" style={{ borderColor: accentTextColor }} />
              <div className="p-8">
                <h3 className="portfolio-header-big font-bold">{title2 || "\u00A0"}</h3>
                <p className="whitespace-pre-line portfolio-description mt-2 opacity-95">{description2 || "\u00A0"}</p>
              </div>
            </div>
          </div>
          {/* Laptop: two equal columns, both accent background */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:flex-1 lg:min-h-0 lg:gap-0">
            <div className="flex flex-col justify-center pl-8 pr-4 overflow-y-auto">
              <div
                className="flex flex-col justify-center p-8 overflow-y-auto rounded-xs"
                style={{ backgroundColor: accentHex, color: accentTextColor }}
              >
                <h3 className="portfolio-header-big font-bold">{title || "\u00A0"}</h3>
                <p className="whitespace-pre-line portfolio-description mt-2 opacity-90">{description || "\u00A0"}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center pl-4 pr-8 overflow-y-auto">
              <div className="flex flex-col justify-center p-8 overflow-y-auto rounded-xs" style={{ backgroundColor: accentHex, color: accentTextColor }}
              >
                <h3 className="portfolio-header-big font-bold">{title2 || "\u00A0"}</h3>
                <p className="whitespace-pre-line portfolio-description mt-2 opacity-95">{description2 || "\u00A0"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-12: Title above; one orange band (taller); image bottom-aligned left overlapping band; description below band (60% width, right-aligned, transparent, border-r)
  if (layoutType === "layout-12") {
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text || "#11100e";
    const textColor = getTextColorForBackground(portfolioBg);

    const mediaEl12 = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover object-bottom" loading="lazy" />
    ) : (
      <div
        className="absolute inset-0 w-full h-full min-h-[120px] flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
      >
        No media selected
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden flex flex-col" data-layout="layout-12">
          {/* Below lg: simple stacked */}
          <div className="flex flex-col lg:hidden w-full flex-1 min-h-[70vh] relative z-10">
            <h2 className="portfolio-header-big font-bold shrink-0 pt-4" style={{ color: textColor }}>{title || "\u00A0"}</h2>
            <div className="w-full aspect-video overflow-hidden relative shrink-0 mt-4">
              {mediaEl12}
            </div>
            <div
              className="flex-1 py-8 border-r-8 mt-4"
              style={{ borderRightColor: accentHex, color: textColor }}
            >
              <p className="whitespace-pre-line portfolio-description opacity-90">{description || "\u00A0"}</p>
            </div>
          </div>
          {/* Laptop: title; band + image; gap; description (60% width, right-aligned) */}
          <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0 lg:relative">
            <h2 className="portfolio-header-big font-bold shrink-0 mt-10 pt-6 pb-4 w-[75%] mx-auto" style={{ color: textColor }}>{title || "\u00A0"}</h2>
            <div className="relative flex-1 min-h-0">
              {/* Orange band – taller */}
              <div className="absolute top-[25%] left-0 right-0 h-[33%] z-0" style={{ backgroundColor: accentHex }} />
              {/* Image: left 25%, bottom-aligned with band, overlaps band */}
              <div className="absolute left-[15%] bottom-0 w-[25%]	min-h-[350px] h-[55%] z-10 overflow-hidden">
                {mediaEl12}
              </div>
            </div>
            {/* Vertical gap between band and description */}
            <div className="h-6 shrink-0" />
            {/* Description: 60% width, right-aligned, transparent, thick orange right border */}
            <div
              className="w-[60%] ml-auto shrink-0 py-4 overflow-y-auto border-r-[16px] bg-transparent text-right"
              style={{ borderRightColor: accentHex, color: textColor }}
            >
              <p className="whitespace-pre-line portfolio-description opacity-90">{description || "\u00A0"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-1: Fixed frame – two equal panels, text left, image right (laptop)
  const portfolioBg = customColors?.text || "#11100e";
  const textColor = getTextColorForBackground(portfolioBg);
  const headerStyle = {
    color: textColor,
    borderTop: "2px solid currentColor",
    borderBottom: "2px solid currentColor",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
  };

  const headerEl = isEditor ? (
    <input
      className="w-full portfolio-header-massive bg-transparent rounded-md px-4 py-2 outline-none focus:border-neutral-200"
      style={headerStyle}
      value={title}
      onChange={(e) => onChangeTitle?.(currentPageIndex, e.target.value)}
    />
  ) : (
    <h2 className="portfolio-header-massive" style={headerStyle}>
      {title}
    </h2>
  );

  const accentHex = customColors?.accent || "#c96a4a";
  const accentTextColor = getTextColorForBackground(accentHex);
  const bodyContent = isEditor ? (
    <textarea
      className="w-full portfolio-description whitespace-pre-line bg-transparent border border-neutral-500/60 rounded-md px-4 py-2 outline-none focus:border-neutral-200 min-h-[80px]"
      style={{ color: accentTextColor }}
      value={description}
      onChange={(e) => onChangeDescription?.(currentPageIndex, e.target.value)}
    />
  ) : (
    <p className="w-full whitespace-pre-line portfolio-description px-4 py-3" style={{ color: accentTextColor }}>
      {description}
    </p>
  );

  const imageEl = mediaSrc ? (
    <img
      src={mediaSrc}
      alt="Portfolio media"
      className="w-full h-full object-cover"
      loading="lazy"
    />
  ) : (
    <div
      className="w-full h-full min-h-[120px] flex items-center justify-center text-sm"
      style={{
        backgroundColor: "rgb(130, 130, 130)",
        color: "#faf7f2",
        opacity: 0.8,
      }}
    >
      No media selected
    </div>
  );

  return (
    <div className="w-full h-full layout-1-magazine" data-layout="layout-1">
      {/* Mobile: vertical stack – image → header → accent block */}
      <div className="flex flex-col justify-center lg:hidden w-full h-full min-h-[70vh]">
        <div className="w-full md:max-w-[50%] md:mx-auto aspect-[9/16] max-h-[50vh] overflow-hidden shrink-0">
          {imageEl}
        </div>
        <div className="px-4 py-6 text-center">
          {headerEl}
        </div>
        <div
          className="mx-4 mb-6 rounded-xs overflow-hidden shrink-0"
          style={{ backgroundColor: accentHex }}
        >
          {bodyContent}
        </div>
      </div>

      {/* Laptop: fixed frame – two equal panels, text left, image right (full height) */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-0 lg:h-full lg:min-h-0 w-full">
        <div className="flex flex-col justify-center items-start pl-0 pr-8 lg:pr-12 xl:pr-16 overflow-hidden min-h-0">
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
            {imageEl}
          </div>
        </div>
      </div>
    </div>
  );
}
