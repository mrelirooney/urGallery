import React from "react";
import { getTextColorForBackground } from "@/lib/colorUtils";
import {
  getMediaAspectClass,
  getPhoneMediaMaxHeightClass,
} from "@/lib/portfolio/mediaShape";
import {
  PORTFOLIO_PAGE_DESCRIPTION_CLASS,
  PORTFOLIO_PAGE_DETAILS_CLASS,
} from "@/lib/portfolio/typography";
import type { LayoutType, PortfolioPageData } from "./PageRenderer";

type PhonePageLayoutProps = {
  page: PortfolioPageData;
  customColors?: {
    text?: string;
    accent?: string;
  };
};

type ContentBlock = {
  title?: string;
  description?: string;
  details?: string;
};

/** Layouts with a page-level details field shown under the first description. */
const LAYOUTS_WITH_DETAILS: LayoutType[] = ["layout-6", "layout-11", "layout-13"];

/** Phone layouts that omit the hero media slot (text-only / multi-column text). */
const PHONE_LAYOUTS_WITHOUT_MEDIA: LayoutType[] = ["layout-8", "layout-14"];

function buildContentBlocks(page: PortfolioPageData): ContentBlock[] {
  if (page.layoutType === "layout-14") {
    return [
      { title: page.title, description: page.description },
      { title: page.title2, description: page.description2 },
      { title: page.title3, description: page.description3 },
    ];
  }

  if (page.layoutType === "layout-15") {
    return [
      { title: page.title, description: page.description },
      { title: page.title2, description: page.description2 },
    ];
  }

  return [
    {
      title: page.title,
      description: page.description,
      details: LAYOUTS_WITH_DETAILS.includes(page.layoutType) ? page.details : undefined,
    },
  ];
}

function ContentBlockSection({
  block,
  textColor,
  isFirst,
}: {
  block: ContentBlock;
  textColor: string;
  isFirst: boolean;
}) {
  const title = block.title?.trim() ? block.title : "\u00A0";
  const description = block.description?.trim() ? block.description : null;
  const details = block.details?.trim() ? block.details : null;

  return (
    <div className={`flex flex-col gap-2 ${isFirst ? "" : "mt-6 pt-6 border-t border-current/10"}`}>
      <h2 className="portfolio-page-title" style={{ color: textColor }}>
        {title}
      </h2>
      {description && (
        <p
          className={`whitespace-pre-line ${PORTFOLIO_PAGE_DESCRIPTION_CLASS}`}
          style={{ color: textColor, opacity: 0.9 }}
        >
          {description}
        </p>
      )}
      {details && (
        <p
          className={`whitespace-pre-line ${PORTFOLIO_PAGE_DETAILS_CLASS}`}
          style={{ color: textColor, opacity: 0.85 }}
        >
          {details}
        </p>
      )}
    </div>
  );
}

export default function PhonePageLayout({ page, customColors }: PhonePageLayoutProps) {
  const portfolioBg = customColors?.text || "#11100e";
  const textColor = getTextColorForBackground(portfolioBg);
  const showMedia = !PHONE_LAYOUTS_WITHOUT_MEDIA.includes(page.layoutType);
  const contentBlocks = buildContentBlocks(page);
  const mediaShape = page.mediaShape ?? "1:1";
  const aspectClass = getMediaAspectClass(mediaShape);
  const maxHeightClass = getPhoneMediaMaxHeightClass(mediaShape);

  return (
    <div className="phone-page-layout flex flex-col w-full min-h-0" data-viewport="phone">
      {showMedia && (
        <div
          className={`phone-page-media relative shrink-0 w-screen max-w-none left-1/2 -translate-x-1/2 -mt-1 overflow-hidden ${aspectClass} ${maxHeightClass}`}
        >
          {page.mediaSrc ? (
            <img
              src={page.mediaSrc}
              alt="Portfolio media"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0 flex min-h-[120px] items-center justify-center text-sm"
              style={{ backgroundColor: "rgb(130, 130, 130)", color: "#faf7f2", opacity: 0.8 }}
            >
              No media selected
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col px-4 pt-6 pb-16">
        {contentBlocks.map((block, index) => (
          <ContentBlockSection
            key={index}
            block={block}
            textColor={textColor}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
