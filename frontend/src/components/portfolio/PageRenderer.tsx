// frontend/src/components/portfolio/PageRenderer.tsx
import React from "react";
import { getTextColorForBackground } from "@/lib/colorUtils";
import {
  LAYOUT_1_TITLE_FIELD_CLASS,
  LAYOUT_6_ACCENT_TEXT_GROUP_CLASS,
  LAYOUT_6_HEADER_BORDER_CLASS,
  LAYOUT_6_TEXT_RIGHT_CLASS,
  LAYOUT_8_ACCENT_BAR_CLASS,
  LAYOUT_8_TEXT_CENTER_CLASS,
  LAYOUT_14_TEXT_CENTER_CLASS,
  LAYOUT_14_TITLE_FIELD_CLASS,
  LAYOUT_15_TITLE_FIELD_CLASS,
  LAYOUT_3_TEXT_COLUMN_CLASS,
  LAYOUT_3_TEXT_OVERLAY_CLASS,
  PORTFOLIO_PAGE_DESCRIPTION_CLASS,
  PORTFOLIO_PAGE_DETAILS_CLASS,
} from "@/lib/portfolio/typography";
import PhonePageLayout from "./PhonePageLayout";

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
  details?: string;
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

  function renderTabletAndDesktop() {
  const { title, description, details = "", mediaSrc, layoutType } = page;

  // layout-2: Image full height between accent bands, text overlay on image (tablet/laptop)
  if (layoutType === "layout-2") {
    const accentHex = customColors?.accent || "#c96a4a";
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
        {/* Tablet: horizontal accent bars, image between, text overlay stacked bottom-left */}
        <div className="hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 py-6">
          <div className="flex flex-col flex-1 min-h-0 w-screen max-w-none relative left-1/2 -translate-x-1/2">
            <div className="w-full h-8 shrink-0" style={accentStyle} aria-hidden />
            <div className="relative flex-1 min-h-0 w-full overflow-hidden">
              {imageEl2}
              <div className="absolute inset-0 z-10 flex flex-col justify-end items-start px-6 md:px-10 pb-6 pointer-events-none max-w-full">
                <h2
                  className="portfolio-header-massive font-bold portfolio-page-title max-w-[85%]"
                  style={overlayTextStyle}
                >
                  {title}
                </h2>
                {description.trim() && (
                  <p
                    className="whitespace-pre-line portfolio-description portfolio-page-description mt-2 max-w-[85%]"
                    style={{ ...overlayTextStyle, opacity: 0.95 }}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full h-6 shrink-0" style={accentStyle} aria-hidden />
          </div>
        </div>
        {/* Laptop: fixed frame – image full height, touches accent bars, text overlay */}
        <div className="hidden lg:flex lg:h-full lg:min-h-0 w-full">
          <div className="w-12 shrink-0" style={accentStyle} />
          <div className="flex-1 relative min-w-0 min-h-0 overflow-hidden">
            {imageEl2}
            <div className="absolute inset-0 z-10 flex items-end justify-between px-6 lg:px-8 xl:px-10 pb-6 lg:pb-8 pointer-events-none">
              <h2 className="portfolio-header-massive font-bold portfolio-page-title max-w-[45%]" style={overlayTextStyle}>
                {title}
              </h2>
              <p className="whitespace-pre-line portfolio-description portfolio-page-description max-w-[45%] text-right" style={{ ...overlayTextStyle, opacity: 0.95 }}>
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
        <div className={`absolute inset-0 z-10 pointer-events-none ${LAYOUT_3_TEXT_OVERLAY_CLASS}`}>
          <div className={`${LAYOUT_3_TEXT_COLUMN_CLASS} text-center`}>
            <h2 className="portfolio-header-massive font-bold portfolio-page-title w-full text-center" style={overlayTextStyle}>
              {title}
            </h2>
            {description.trim() && (
              <div
                className="px-6 py-2 rounded-xs w-full"
                style={{ backgroundColor: accentColor, color: accentTextColor }}
              >
                <p className="whitespace-pre-line portfolio-description portfolio-page-description text-center">
                  {description}
                </p>
              </div>
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
        <h2 className="portfolio-header-big font-bold portfolio-page-title break-words">{title}</h2>
        <p className="whitespace-pre-line portfolio-page-description opacity-90 mt-4">{description || "\u00A0"}</p>
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-4">
          {/* Tablet: layout-6 pattern – full-bleed bg layer + image top / text in accent bottom */}
          <div
            className="absolute inset-0 z-0 pointer-events-none hidden md:block lg:hidden"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, transparent 60%, ${accentHex} 60%, ${accentHex} 100%)`,
            }}
          />
          <div className="relative z-10 hidden md:grid lg:hidden grid-rows-[3fr_2fr] h-full w-full min-h-[70vh]">
            <div className="relative min-h-0 overflow-hidden">
              {mediaEl}
            </div>
            <div
              className="flex min-h-0 flex-col items-start justify-center px-8 lg:px-12 py-8 text-left"
              style={{ color: textColor }}
            >
              <h2 className="portfolio-header-big font-bold portfolio-page-title break-words">{title}</h2>
              <p className="whitespace-pre-line portfolio-page-description opacity-90 mt-4">{description || "\u00A0"}</p>
            </div>
          </div>
          {/* Laptop: two columns side by side */}
          <div className="hidden lg:grid lg:grid-cols-[2fr_3fr] lg:h-full lg:min-h-0 w-full relative z-10">
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
        <h2 className="portfolio-header-big font-bold portfolio-page-title" style={{ color: textColor }}>{title}</h2>
        <p className="whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-90" style={{ color: textColor }}>{description || "\u00A0"}</p>
      </div>
    );

    const textBlockU = (
      <div className="flex flex-col px-6 py-4" style={uBorderStyle}>
        <h2 className="portfolio-header-big font-bold portfolio-page-title" style={{ color: textColor }}>{title}</h2>
        <p className="whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-90" style={{ color: textColor }}>{description || "\u00A0"}</p>
      </div>
    );

    return (
      <div className="w-full h-full" data-layout="layout-5">
        {/* Tablet: full-bleed image on top, text below with U-frame */}
        <div className="hidden md:flex md:flex-col lg:hidden w-screen relative left-1/2 -translate-x-1/2 min-h-[70vh]">
          <div className="w-full aspect-video overflow-hidden relative shrink-0">
            {mediaEl}
          </div>
          <div className="flex-1 px-4 py-6">{textBlockU}</div>
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

  // layout-6: 40/60 split – left full-height media, right 50/50 panels (header top, description + details bottom)
  if (layoutType === "layout-6") {
    const accentHex = customColors?.accent || "#c96a4a";
    const portfolioBg = customColors?.text ?? "#faf7f2";
    const headerTextColor = getTextColorForBackground(portfolioBg);
    const accentTextColor = getTextColorForBackground(accentHex);
    const layout6HeaderStyle = { color: headerTextColor };
    const layout6HeaderBorderStyle = {
      borderBottom: `12px solid ${accentHex}`,
      paddingBottom: "0.5rem",
    };

    const mediaEl6 = mediaSrc ? (
      <img src={mediaSrc} alt="Portfolio media" className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" />
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
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-6">
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${portfolioBg} 0%, ${portfolioBg} 50%, ${accentHex} 50%, ${accentHex} 100%)`,
            }}
          />
          {/* Tablet: 40% media (flush left) | 60% split text panels */}
          <div className="hidden md:grid md:grid-cols-2 lg:hidden md:h-full md:min-h-[70vh] w-full relative z-10">
            <div className="relative min-h-0 h-full overflow-hidden">
              {mediaEl6}
            </div>
            <div className="flex flex-col min-h-0 h-full">
              <div
                className="flex-1 min-h-0 flex flex-col justify-center px-6 py-6"
                style={{ backgroundColor: portfolioBg }}
              >
                <div className="w-full flex justify-end">
                  <div className={LAYOUT_6_HEADER_BORDER_CLASS} style={layout6HeaderBorderStyle}>
                    <h2 className={`${LAYOUT_6_TEXT_RIGHT_CLASS} portfolio-header-big font-bold portfolio-page-title`} style={layout6HeaderStyle}>
                      {title || "\u00A0"}
                    </h2>
                  </div>
                </div>
              </div>
              <div
                className="flex-1 min-h-0 flex flex-col justify-center px-6 py-6"
                style={{ backgroundColor: accentHex, color: accentTextColor }}
              >
                <div className={LAYOUT_6_ACCENT_TEXT_GROUP_CLASS}>
                  <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DESCRIPTION_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS}`}>
                    {description || "\u00A0"}
                  </p>
                  <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DETAILS_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS} opacity-90`}>
                    {details || "\u00A0"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Desktop: 40% media | 60% split text panels */}
          <div className="hidden lg:grid lg:grid-cols-[4fr_6fr] lg:gap-0 lg:h-full lg:min-h-0 w-full relative z-10">
            <div className="relative min-h-0 h-full overflow-hidden">
              {mediaEl6}
            </div>
            <div className="flex flex-col min-h-0 h-full">
              <div
                className="flex-1 min-h-0 flex flex-col justify-center px-8 xl:px-12 py-8"
                style={{ backgroundColor: portfolioBg }}
              >
                <div className="w-full flex justify-end">
                  <div className={LAYOUT_6_HEADER_BORDER_CLASS} style={layout6HeaderBorderStyle}>
                    <h2 className={`${LAYOUT_6_TEXT_RIGHT_CLASS} portfolio-header-big font-bold portfolio-page-title`} style={layout6HeaderStyle}>
                      {title || "\u00A0"}
                    </h2>
                  </div>
                </div>
              </div>
              <div
                className="flex-1 min-h-0 flex flex-col justify-center px-8 xl:px-12 py-8"
                style={{ backgroundColor: accentHex, color: accentTextColor }}
              >
                <div className={LAYOUT_6_ACCENT_TEXT_GROUP_CLASS}>
                  <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DESCRIPTION_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS}`}>
                    {description || "\u00A0"}
                  </p>
                  <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DETAILS_CLASS} ${LAYOUT_6_TEXT_RIGHT_CLASS} opacity-90`}>
                    {details || "\u00A0"}
                  </p>
                </div>
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
        <div className={`flex flex-col items-center justify-center ${LAYOUT_8_TEXT_CENTER_CLASS} px-8 w-full`}>
          <h2 className={`${LAYOUT_8_TEXT_CENTER_CLASS} portfolio-header-massive font-bold portfolio-page-title uppercase`}>{title || "\u00A0"}</h2>
          <div className={`${LAYOUT_8_ACCENT_BAR_CLASS} h-[5px] my-4`} style={{ backgroundColor: markerColor }} aria-hidden />
          <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DESCRIPTION_CLASS} ${LAYOUT_8_TEXT_CENTER_CLASS}`}>{description || "\u00A0"}</p>
        </div>
      </div>
    );

    return (
      <div className="w-full h-full flex items-center justify-center" data-layout="layout-8">
        {/* Tablet: wide accent block, thin side gutters */}
        <div className="hidden md:flex md:items-stretch md:justify-center lg:hidden w-screen relative left-1/2 -translate-x-1/2 md:h-full md:min-h-0 px-3">
          <div className="w-full min-w-0 h-full overflow-hidden shrink-0">
            {contentBlock}
          </div>
        </div>
        {/* Laptop: centered accent block (66% width, full height) */}
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
    const portfolioBg = customColors?.text || "#11100e";
    const portfolioTextColor = getTextColorForBackground(portfolioBg);
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
          {/* Accent band (z-0): laptop only – transparent top, solid accent bottom */}
          <div
            className="absolute inset-0 z-0 pointer-events-none hidden lg:block"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, transparent 50%, ${accentHex} 50%, ${accentHex} 100%)`,
            }}
          />
          {/* Tablet: smaller image + accent panel to page bottom */}
          <div className="relative z-10 hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 pt-24">
            <div className="w-[88%] mx-auto aspect-video max-h-[38vh] overflow-hidden relative shrink-0">
              {mediaEl9}
            </div>
            <div
              className="flex flex-1 flex-col items-center justify-center px-8 py-8 min-h-0 min-w-0"
              style={{ backgroundColor: accentHex, color: accentTextColor }}
            >
              <h2
                className="layout-9-text-block portfolio-page-title text-center break-words whitespace-pre-wrap"
                style={{ color: accentTextColor }}
              >
                {title || "\u00A0"}
              </h2>
              <p
                className="layout-9-text-block portfolio-description portfolio-page-description mt-2 text-center break-words whitespace-pre-wrap"
                style={{ color: accentTextColor }}
              >
                {description || "\u00A0"}
              </p>
            </div>
          </div>
          {/* Laptop: 60% left (transparent + text over band), 40% right (media) */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-0 lg:h-full lg:min-h-0 w-full px-[8vw] relative z-10">
            <div className="flex flex-col min-h-0 h-full min-w-0">
              <div className="flex-1 flex items-center px-8 min-h-0 min-w-0 overflow-visible">
                <h2
                  className="layout-9-text-block portfolio-page-title text-left break-words whitespace-pre-wrap"
                  style={{ color: portfolioTextColor }}
                >
                  {title || "\u00A0"}
                </h2>
              </div>
              <div className="flex-1 flex items-center px-8 min-h-0 min-w-0 overflow-visible">
                <p
                  className="layout-9-text-block portfolio-description portfolio-page-description text-left break-words whitespace-pre-wrap"
                  style={{ color: accentTextColor }}
                >
                  {description || "\u00A0"}
                </p>
              </div>
            </div>
            <div className="relative min-h-0 min-w-0 overflow-hidden">
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
        <h2 className="portfolio-header-big font-bold portfolio-page-title">{title || "\u00A0"}</h2>
        <p className="portfolio-description portfolio-page-description mt-1 opacity-95">{description || "\u00A0"}</p>
        <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DETAILS_CLASS} opacity-90 mt-4`}>{details || "\u00A0"}</p>
      </div>
    );

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full relative overflow-hidden" data-layout="layout-11">
          {/* Tablet: full-width image + accent, vertically centered */}
          <div className="hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 justify-center">
            <div className="w-full aspect-video max-h-[45vh] overflow-hidden relative shrink-0 z-0">
              {mediaEl11}
            </div>
            <div
              className="w-full shrink-0 relative z-10 flex min-h-[32vh] flex-col items-center justify-center px-8 py-14 text-center"
              style={{
                background: gradientBg,
                color: accentTextColor,
              }}
            >
              <h2 className="portfolio-header-big font-bold portfolio-page-title text-center w-full">{title || "\u00A0"}</h2>
              <p className="portfolio-description portfolio-page-description mt-1 opacity-95 text-center w-full">{description || "\u00A0"}</p>
              <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DETAILS_CLASS} opacity-90 mt-4 text-center w-full`}>{details || "\u00A0"}</p>
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

  // layout-13: Row 1 = MASSIVE HEADER (title) full width + 15px orange left accent; Row 2 = 60% image | 40% BIG HEADER + details + 15px orange right accent
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
          {/* Tablet: bordered content block, vertically centered */}
          <div className="hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 justify-center">
            <div className="w-full shrink-0 flex flex-col">
              <div className="h-[12px] w-full shrink-0" style={{ backgroundColor: accentHex }} />
              <div className="flex flex-col items-center text-center py-6 px-8">
                <h2 className="portfolio-header-massive font-bold portfolio-page-title" style={{ color: textColor }}>{title || "\u00A0"}</h2>
                <p className="portfolio-description portfolio-page-description mt-2" style={{ color: textColor }}>{description || "\u00A0"}</p>
              </div>
              <div className="w-full aspect-video max-h-[45vh] overflow-hidden relative shrink-0">
                {mediaEl13}
              </div>
              <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DETAILS_CLASS} py-6 px-8 text-center opacity-90`} style={{ color: textColor }}>{details || "\u00A0"}</p>
              <div className="h-[8px] w-full shrink-0" style={{ backgroundColor: accentHex }} />
            </div>
          </div>
          {/* Laptop: Row 1 = title + left accent; Row 2 = 60% image | 40% text + right accent (full bleed) */}
          <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
            <div className="shrink-0 py-6 pl-12">
              <div className="shrink-0 pl-8 border-l-[15px] " style={{ borderLeftColor: accentHex, color: textColor }}>
                <h2 className="portfolio-header-massive font-bold portfolio-page-title" >{title || "\u00A0"}</h2>
              </div>
            </div>
            <div className="grid grid-cols-[3fr_2fr] gap-0 flex-1 min-h-0">
              <div className="relative min-h-0 overflow-hidden">
                {mediaEl13}
              </div>
              <div
                className="flex flex-col justify-center py-8 pr-12 pl-2 overflow-y-auto text-right">
                <div className="shrink-0 pr-8 border-r-[15px] " style={{ borderRightColor: accentHex, color: textColor }}>
                  <p className="portfolio-description portfolio-page-description">{description || "\u00A0"}</p>
                  <p className={`whitespace-pre-line ${PORTFOLIO_PAGE_DETAILS_CLASS} mt-4 opacity-90`}>{details || "\u00A0"}</p>
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
          <div className="hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 justify-center gap-6 py-8 px-6">
            <div className={`p-6 border-2 rounded-xs ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ borderColor: accentHex, color: textColor }}>
              <h3 className={`portfolio-header-big font-bold portfolio-page-title ${LAYOUT_14_TEXT_CENTER_CLASS} ${LAYOUT_14_TITLE_FIELD_CLASS}`}>{title || "\u00A0"}</h3>
              <p className={`whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-90 ${LAYOUT_14_TEXT_CENTER_CLASS}`}>{description || "\u00A0"}</p>
            </div>
            <div className={`p-6 rounded-xs ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ backgroundColor: accentHex, color: accentTextColor }}>
              <h3 className={`portfolio-header-big font-bold portfolio-page-title ${LAYOUT_14_TEXT_CENTER_CLASS} ${LAYOUT_14_TITLE_FIELD_CLASS}`}>{title2 || "\u00A0"}</h3>
              <p className={`whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-95 ${LAYOUT_14_TEXT_CENTER_CLASS}`}>{description2 || "\u00A0"}</p>
            </div>
            <div className={`p-6 border-2 rounded-xs ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ borderColor: accentHex, color: textColor }}>
              <h3 className={`portfolio-header-big font-bold portfolio-page-title ${LAYOUT_14_TEXT_CENTER_CLASS} ${LAYOUT_14_TITLE_FIELD_CLASS}`}>{title3 || "\u00A0"}</h3>
              <p className={`whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-90 ${LAYOUT_14_TEXT_CENTER_CLASS}`}>{description3 || "\u00A0"}</p>
            </div>
          </div>
          {/* Laptop: three equal columns, full bleed; boxes max 50% height, centered in layout frame */}
          {/* textColor = off-white on dark portfolio; accentTextColor = off-black on light accent, off-white on dark accent */}
          <div className="hidden lg:flex lg:flex-1 lg:min-h-0 lg:items-start lg:justify-center">
            <div className="grid grid-cols-3 gap-0 max-h-[50%] w-full mt-[5%]">
              <div className={`flex flex-col justify-center p-3 xl:p-8 overflow-y-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ color: textColor }}>
                <h3 className={`portfolio-header-big font-bold portfolio-page-title ${LAYOUT_14_TEXT_CENTER_CLASS} ${LAYOUT_14_TITLE_FIELD_CLASS}`}>{title || "\u00A0"}</h3>
                <div
                  className={`flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs ${LAYOUT_14_TEXT_CENTER_CLASS}`}
                  style={{ borderColor: accentHex, color: textColor }}
                >
                  <p className={`whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-90 ${LAYOUT_14_TEXT_CENTER_CLASS}`}>{description || "\u00A0"}</p>
                </div>
              </div>
            <div className={`flex flex-col justify-center p-3 xl:p-8 overflow-y-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ color: textColor }}>
              <h3 className={`portfolio-header-big font-bold portfolio-page-title ${LAYOUT_14_TEXT_CENTER_CLASS} ${LAYOUT_14_TITLE_FIELD_CLASS}`}>{title2 || "\u00A0"}</h3>
              <div
                className={`flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs ${LAYOUT_14_TEXT_CENTER_CLASS}`}
                style={{ backgroundColor: accentHex, color: accentTextColor, borderColor: accentHex, }}
              >
                <p className={`whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-95 ${LAYOUT_14_TEXT_CENTER_CLASS}`}>{description2 || "\u00A0"}</p>
              </div>
            </div>
              <div className={`flex flex-col justify-center p-3 xl:p-8 overflow-y-auto ${LAYOUT_14_TEXT_CENTER_CLASS}`} style={{ color: textColor }}>
              <h3 className={`portfolio-header-big font-bold portfolio-page-title ${LAYOUT_14_TEXT_CENTER_CLASS} ${LAYOUT_14_TITLE_FIELD_CLASS}`}>{title3 || "\u00A0"}</h3>
                <div
                  className={`flex flex-col justify-center p-8 overflow-y-auto border-2 rounded-xs ${LAYOUT_14_TEXT_CENTER_CLASS}`}
                  style={{ borderColor: accentHex, color: textColor }}
                >
                  <p className={`whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-90 ${LAYOUT_14_TEXT_CENTER_CLASS}`}>{description3 || "\u00A0"}</p>
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
    const portfolioBg = customColors?.text ?? "#faf7f2";
    const accentTextColor = getTextColorForBackground(accentHex);
    const title2 = page.title2 ?? "";
    const description2 = page.description2 ?? "";

    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-full min-h-0">
        <div className="w-full h-full flex flex-col" data-layout="layout-15">
          {/* Tablet: full-width accent block, vertically centered */}
          <div className="hidden md:flex md:flex-col lg:hidden w-full h-full min-h-0 justify-center">
            <div className="w-full shrink-0 flex flex-col" style={{ backgroundColor: accentHex, color: accentTextColor }}>
              <div className="flex flex-col items-center text-center p-8">
                <h3 className={`portfolio-header-big font-bold portfolio-page-title text-center w-full ${LAYOUT_15_TITLE_FIELD_CLASS}`}>{title || "\u00A0"}</h3>
                <p className="whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-90 text-center w-full">{description || "\u00A0"}</p>
              </div>
              <div className="h-[8px] w-full shrink-0" style={{ backgroundColor: portfolioBg }} />
              <div className="flex flex-col items-center text-center p-8">
                <h3 className={`portfolio-header-big font-bold portfolio-page-title text-center w-full ${LAYOUT_15_TITLE_FIELD_CLASS}`}>{title2 || "\u00A0"}</h3>
                <p className="whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-95 text-center w-full">{description2 || "\u00A0"}</p>
              </div>
            </div>
          </div>
          {/* Laptop: two equal columns, both accent background */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:flex-1 lg:min-h-0 lg:gap-0">
            <div className="flex flex-col justify-center p-3 xl:p-8 overflow-y-auto">
              <div
                className="flex flex-col justify-center p-8 overflow-y-auto rounded-xs"
                style={{ backgroundColor: accentHex, color: accentTextColor }}
              >
                <h3 className={`portfolio-header-big font-bold portfolio-page-title ${LAYOUT_15_TITLE_FIELD_CLASS}`}>{title || "\u00A0"}</h3>
                <p className="whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-90">{description || "\u00A0"}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center p-3 xl:p-8 overflow-y-auto">
              <div className="flex flex-col justify-center p-8 overflow-y-auto rounded-xs" style={{ backgroundColor: accentHex, color: accentTextColor }}
              >
                <h3 className={`portfolio-header-big font-bold portfolio-page-title ${LAYOUT_15_TITLE_FIELD_CLASS}`}>{title2 || "\u00A0"}</h3>
                <p className="whitespace-pre-line portfolio-description portfolio-page-description mt-2 opacity-95">{description2 || "\u00A0"}</p>
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
          <div className="hidden md:flex md:flex-col lg:hidden w-full flex-1 min-h-[70vh] relative z-10">
            <h2 className="portfolio-header-big font-bold portfolio-page-title shrink-0 pt-4" style={{ color: textColor }}>{title || "\u00A0"}</h2>
            <div className="w-full aspect-video overflow-hidden relative shrink-0 mt-4">
              {mediaEl12}
            </div>
            <div
              className="flex-1 py-8 border-r-8 mt-4"
              style={{ borderRightColor: accentHex, color: textColor }}
            >
              <p className="whitespace-pre-line portfolio-description portfolio-page-description opacity-90">{description || "\u00A0"}</p>
            </div>
          </div>
          {/* Laptop: title; band + image; gap; description (60% width, right-aligned) */}
          <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0 lg:relative">
            <h2 className="portfolio-header-big font-bold portfolio-page-title shrink-0 mt-10 pt-6 pb-4 w-[75%] mx-auto" style={{ color: textColor }}>{title || "\u00A0"}</h2>
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
              <p className="whitespace-pre-line portfolio-description portfolio-page-description opacity-90">{description || "\u00A0"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // layout-1: Fixed frame – two equal panels, text left, image right (laptop)
  const portfolioBg = customColors?.text || "#11100e";
  const textColor = getTextColorForBackground(portfolioBg);
  const accentHex = customColors?.accent || "#c96a4a";
  const headerStyle = {
    color: textColor,
    borderTop: `6px solid ${accentHex}`,
    borderBottom: `6px solid ${accentHex}`,
    borderRadius: 0,
  };

  const headerEl = isEditor ? (
    <input
      className={`w-full portfolio-header-massive portfolio-page-title bg-transparent px-4 outline-none focus:border-neutral-200 ${LAYOUT_1_TITLE_FIELD_CLASS} rounded-none`}
      style={headerStyle}
      value={title}
      onChange={(e) => onChangeTitle?.(currentPageIndex, e.target.value)}
    />
  ) : (
    <h2 className={`portfolio-header-massive portfolio-page-title ${LAYOUT_1_TITLE_FIELD_CLASS}`} style={headerStyle}>
      {title}
    </h2>
  );

  const accentTextColor = getTextColorForBackground(accentHex);
  const bodyContent = isEditor ? (
    <textarea
      className="w-full portfolio-description portfolio-page-description whitespace-pre-line bg-transparent border border-neutral-500/60 rounded-md px-4 py-2 outline-none focus:border-neutral-200 min-h-[80px]"
      style={{ color: accentTextColor }}
      value={description}
      onChange={(e) => onChangeDescription?.(currentPageIndex, e.target.value)}
    />
  ) : (
    <p className="w-full whitespace-pre-line portfolio-description portfolio-page-description px-4 py-3" style={{ color: accentTextColor }}>
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
      <div className="hidden md:flex md:flex-col md:justify-center lg:hidden w-full h-full min-h-[70vh]">
        <div className="w-full md:max-w-[50%] md:mx-auto aspect-[9/16] max-h-[50vh] overflow-hidden shrink-0">
          {imageEl}
        </div>
        <div className="px-4 pt-6 pb-0 text-center">
          {headerEl}
        </div>
        <div
          className="mx-4 mt-4 mb-6 rounded-xs overflow-hidden shrink-0 text-center"
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

  return (
    <>
      <div className="md:hidden w-full min-h-0" data-layout={page.layoutType} data-viewport="phone">
        <PhonePageLayout page={page} customColors={customColors} />
      </div>
      <div className="hidden md:contents">{renderTabletAndDesktop()}</div>
    </>
  );
}
