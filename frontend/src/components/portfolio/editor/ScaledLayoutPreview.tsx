"use client";

import React, { useEffect, useRef, useState } from "react";
import PageRenderer, { LayoutType, PortfolioPageData } from "./PageRenderer";
import { hexToRgba, isLightColor } from "@/lib/colorUtils";

/** Virtual canvas size — layouts render at this resolution, then scale to fit the preview gap. */
const PREVIEW_BASE_WIDTH = 1280;
const PREVIEW_BASE_HEIGHT = 720;
const GLOW_OFF_WHITE = "#faf7f2";
const GLOW_OFF_BLACK = "#11100e";

function getPreviewGlowColor(profileBg: string): string {
  return isLightColor(profileBg) ? GLOW_OFF_BLACK : GLOW_OFF_WHITE;
}

function getPreviewGlow(profileBg: string): string {
  const glow = getPreviewGlowColor(profileBg);
  return [
    `0 0 24px ${hexToRgba(glow, 0.28)}`,
    `0 0 48px ${hexToRgba(glow, 0.16)}`,
    `0 0 80px ${hexToRgba(glow, 0.08)}`,
  ].join(", ");
}

function getPreviewBorder(profileBg: string): string {
  return `1px solid ${hexToRgba(getPreviewGlowColor(profileBg), 0.3)}`;
}

type ScaledLayoutPreviewProps = {
  pages: PortfolioPageData[];
  currentPageIndex: number;
  layout: LayoutType;
  profileBg: string;
  portfolioBg: string;
  accent: string;
};

/**
 * Renders PageRenderer inside a fixed-size stage and CSS-scales it to fit the container.
 * Scoped Tailwind overrides neutralize w-screen breakouts and viewport min-heights
 * that would otherwise crop the preview.
 */
export default function ScaledLayoutPreview({
  pages,
  currentPageIndex,
  layout,
  profileBg,
  portfolioBg,
  accent,
}: ScaledLayoutPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setScale(
        Math.min(width / PREVIEW_BASE_WIDTH, height / PREVIEW_BASE_HEIGHT, 1),
      );
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center pointer-events-none"
    >
      <div
        className="rounded-xs overflow-hidden"
        style={{
          width: PREVIEW_BASE_WIDTH * scale,
          height: PREVIEW_BASE_HEIGHT * scale,
          boxShadow: getPreviewGlow(profileBg),
          border: getPreviewBorder(profileBg),
        }}
      >
        <div
          className="h-full w-full overflow-hidden
            [&_.w-screen]:!w-full [&_.w-screen]:!relative [&_.w-screen]:!left-0 [&_.w-screen]:!translate-x-0
            [&_[data-layout]]:!h-full [&_[data-layout]]:!min-h-0
            [&_[class*='min-h-\\[70vh\\]']]:!min-h-0
            [&_[class*='min-h-\\[50vh\\]']]:!min-h-0"
          style={{
            width: PREVIEW_BASE_WIDTH,
            height: PREVIEW_BASE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            backgroundColor: portfolioBg,
          }}
        >
          <PageRenderer
            pages={pages}
            currentPageIndex={currentPageIndex}
            isEditor={false}
            customColors={{
              background: portfolioBg,
              text: portfolioBg,
              accent,
            }}
            layoutOverride={layout}
          />
        </div>
      </div>
    </div>
  );
}
