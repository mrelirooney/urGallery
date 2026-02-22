"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import PageRenderer, { type PortfolioPageData } from "./PageRenderer";

const CAPTURE_WIDTH = 160;
const CAPTURE_HEIGHT = 120;

type PageThumbnailCaptureProps = {
  pages: PortfolioPageData[];
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
  onThumbnailsReady: (thumbnails: (string | null)[]) => void;
};

function sameIdsDifferentOrder(
  prev: PortfolioPageData[],
  next: PortfolioPageData[],
): boolean {
  if (prev.length !== next.length) return false;
  const prevIds = prev.map((p) => String(p.id)).sort().join(",");
  const nextIds = next.map((p) => String(p.id)).sort().join(",");
  if (prevIds !== nextIds) return false;
  const prevOrder = prev.map((p) => String(p.id)).join(",");
  const nextOrder = next.map((p) => String(p.id)).join(",");
  return prevOrder !== nextOrder;
}

/**
 * Renders each page off-screen and captures it as a thumbnail using html2canvas.
 * Runs when pages change; captures one page at a time to avoid blocking the UI.
 * Skips recapture when only the page order changes (reorder).
 */
export default function PageThumbnailCapture({
  pages,
  customColors,
  onThumbnailsReady,
}: PageThumbnailCaptureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [captureIndex, setCaptureIndex] = useState<number | null>(null);
  const thumbnailsByPageIdRef = useRef<Map<string | number, string>>(new Map());
  const prevPagesRef = useRef<PortfolioPageData[] | null>(null);

  const captureCurrent = useCallback(async () => {
    const container = containerRef.current;
    if (!container || captureIndex === null || captureIndex >= pages.length) {
      return;
    }

    const page = pages[captureIndex];
    const pageId = page.id;

    try {
      const canvas = await html2canvas(container, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: customColors?.text ?? "#faf7f2",
      });

      const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
      thumbnailsByPageIdRef.current.set(pageId, dataUrl);

      if (captureIndex < pages.length - 1) {
        setCaptureIndex(captureIndex + 1);
      } else {
        setCaptureIndex(null);
        onThumbnailsReady(
          pages.map((p) => thumbnailsByPageIdRef.current.get(p.id) ?? null),
        );
      }
    } catch (err) {
      console.warn("Page thumbnail capture failed for index", captureIndex, err);
      thumbnailsByPageIdRef.current.delete(pageId);
      if (captureIndex < pages.length - 1) {
        setCaptureIndex(captureIndex + 1);
      } else {
        setCaptureIndex(null);
        onThumbnailsReady(
          pages.map((p) => thumbnailsByPageIdRef.current.get(p.id) ?? null),
        );
      }
    }
  }, [captureIndex, pages, customColors?.text, onThumbnailsReady]);

  // Start capture when pages change (debounced). Skip recapture on pure reorder.
  useEffect(() => {
    if (pages.length === 0) {
      onThumbnailsReady([]);
      prevPagesRef.current = pages;
      return;
    }

    const prevPages = prevPagesRef.current;
    const map = thumbnailsByPageIdRef.current;

    if (
      prevPages &&
      sameIdsDifferentOrder(prevPages, pages) &&
      pages.every((p) => map.has(p.id))
    ) {
      // Pure reorder: reuse existing thumbnails, no recapture
      onThumbnailsReady(pages.map((p) => map.get(p.id) ?? null));
      prevPagesRef.current = pages;
      return;
    }

    prevPagesRef.current = pages;
    const timer = setTimeout(() => {
      setCaptureIndex(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [pages, onThumbnailsReady]);

  // Capture after the DOM has rendered for the current index
  useEffect(() => {
    if (captureIndex === null) return;
    const timer = setTimeout(captureCurrent, 100);
    return () => clearTimeout(timer);
  }, [captureIndex, captureCurrent]);

  if (pages.length === 0) return null;

  const currentIndex = captureIndex ?? 0;
  const isCapturing = captureIndex !== null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed"
      style={{
        left: "-9999px",
        top: 0,
        width: CAPTURE_WIDTH,
        height: CAPTURE_HEIGHT,
        overflow: "hidden",
        backgroundColor: customColors?.text ?? "var(--artist-text, #faf7f2)",
        color: customColors?.background ?? "var(--artist-background, #11100e)",
        visibility: isCapturing ? "visible" : "hidden",
      }}
    >
      <div
        className="origin-top-left"
        style={{
          transform: `scale(${CAPTURE_WIDTH / 896})`,
          width: 896,
          minHeight: CAPTURE_HEIGHT * (896 / CAPTURE_WIDTH),
        }}
      >
        <PageRenderer
          pages={pages}
          currentPageIndex={Math.min(currentIndex, pages.length - 1)}
          isEditor={false}
        />
      </div>
    </div>
  );
}
