"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MoreVertical, Share2, Bookmark, MessageCircle, Lock, LockOpen } from "lucide-react";
import { hexToRgba, getTextColorForBackground } from "@/lib/colorUtils";
import { getPortfolioOverlayOpacity, useIsPhoneViewport } from "@/lib/artistScrollOverlay";
import { useArtistScroll } from "@/components/artist/ArtistScrollContext";
import PortfolioTitle from "./primitives/PortfolioTitle";
import Pagination from "./primitives/Pagination";
import EditPortfolioButton from "./EditPortfolioButton";

type PortfolioControlsProps = {
  portfolioTitle: string;
  slug: string;
  artistSlug: string;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
    portfolioText?: string;
  };
  privacy?: "public" | "private";
  isOwner: boolean;
  controlsVisible: boolean;
  isPrivateBlurred: boolean;
  onTogglePrivacy: () => void;
  onOpenPrivacyModal: () => void;
  privacyLoading: boolean;
  shareCopied: boolean;
  onShareCopiedChange: (v: boolean) => void;
  saved: boolean;
  onToggleSave: () => void;
  saveLoading: boolean;
  totalPages: number;
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  commentsOpen: boolean;
  onToggleComments: () => void;
  onPaginationActiveChange?: (active: boolean) => void;
};

const PAGINATION_IDLE_MS = 1000;

export default function PortfolioControls({
  portfolioTitle,
  slug,
  artistSlug,
  customColors,
  privacy = "public",
  isOwner,
  controlsVisible,
  isPrivateBlurred,
  onTogglePrivacy,
  onOpenPrivacyModal,
  privacyLoading,
  shareCopied,
  onShareCopiedChange,
  saved,
  onToggleSave,
  saveLoading,
  totalPages,
  currentPageIndex,
  onPageChange,
  commentsOpen,
  onToggleComments,
  onPaginationActiveChange,
}: PortfolioControlsProps) {
  const shareCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paginationIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOverPagination, setIsOverPagination] = useState(false);
  const [paginationIdle, setPaginationIdle] = useState(false);
  const artistScroll = useArtistScroll();
  const isPhone = useIsPhoneViewport();
  const phoneScrollOpacity = artistScroll
    ? getPortfolioOverlayOpacity(artistScroll.scrollProgress, isPhone)
    : 0;
  const textColor = customColors?.portfolioText ?? "var(--artist-portfolio-text, #faf7f2)";
  const portfolioBg = customColors?.text || "#11100e";
  const accent = customColors?.accent || "var(--artist-accent, #c96a4a)";
  const accentHex = accent.startsWith("var") ? "#c96a4a" : accent;
  const accentText = getTextColorForBackground(accentHex);
  const frostedBgDefault = hexToRgba(portfolioBg, 0.05);
  const frostedBgHover = hexToRgba(accentHex, 0.5);

  const frostedButtonStyle = (isActive?: boolean) => ({
    backgroundColor: isActive ? accent : frostedBgDefault,
    color: isActive ? accentText : textColor,
    border: "1px solid rgba(250, 247, 242, 0.1)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
  });

  const phonePaginationInteractive =
    phoneScrollOpacity >= 0.01 && !isPrivateBlurred;

  const handleShare = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/${artistSlug}?portfolio=${slug}#portfolio-shell`;
    navigator.clipboard?.writeText(url).then(() => {
      if (shareCopiedTimeoutRef.current) clearTimeout(shareCopiedTimeoutRef.current);
      onShareCopiedChange(true);
      shareCopiedTimeoutRef.current = setTimeout(() => {
        onShareCopiedChange(false);
        shareCopiedTimeoutRef.current = null;
      }, 2000);
    });
  };

  const clearPaginationIdleTimer = useCallback(() => {
    if (paginationIdleTimerRef.current) {
      clearTimeout(paginationIdleTimerRef.current);
      paginationIdleTimerRef.current = null;
    }
  }, []);

  const schedulePaginationIdle = useCallback(() => {
    clearPaginationIdleTimer();
    setPaginationIdle(false);
    paginationIdleTimerRef.current = setTimeout(() => {
      setPaginationIdle(true);
    }, PAGINATION_IDLE_MS);
  }, [clearPaginationIdleTimer]);

  const handlePaginationEnter = useCallback(() => {
    setIsOverPagination(true);
    onPaginationActiveChange?.(true);
    schedulePaginationIdle();
  }, [onPaginationActiveChange, schedulePaginationIdle]);

  const handlePaginationLeave = useCallback(() => {
    setIsOverPagination(false);
    setPaginationIdle(false);
    clearPaginationIdleTimer();
    onPaginationActiveChange?.(false);
  }, [clearPaginationIdleTimer, onPaginationActiveChange]);

  const handlePaginationMove = useCallback(() => {
    schedulePaginationIdle();
  }, [schedulePaginationIdle]);

  useEffect(() => {
    return () => clearPaginationIdleTimer();
  }, [clearPaginationIdleTimer]);

  const overlayVisible = controlsVisible || isOverPagination;
  const chromeVisible = controlsVisible && !paginationIdle;
  const controlsPointerEvents =
    overlayVisible && !isPrivateBlurred ? "pointer-events-auto" : "pointer-events-none";
  const containerClass = `fixed left-0 right-0 w-full z-[100] flex flex-col justify-end md:justify-between py-3 transition-opacity duration-300 pointer-events-none ${overlayVisible ? "opacity-100" : "opacity-0"}`;
  const innerClass = "w-full max-w-6xl lg:max-w-7xl xl:max-w-7xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 flex flex-col justify-end md:justify-between flex-1 min-h-0";
  const chromeClass = `hidden md:flex items-center justify-between gap-4 relative z-0 transition-opacity duration-300 ${chromeVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`;

  return (
    <>
      {/* Phone: pagination dots above footer, no background strip */}
      <div
        className="fixed left-0 right-0 z-[100] md:hidden transition-opacity duration-300"
        style={{
          bottom: "calc(var(--artist-footer-height, 3rem) + 1.5rem)",
          color: textColor,
          opacity: phoneScrollOpacity,
          pointerEvents: phonePaginationInteractive ? "auto" : "none",
        }}
      >
        <div
          className={`w-full py-2 transition-opacity duration-300 ${phonePaginationInteractive ? "" : "pointer-events-none"}`}
          style={{
            opacity: paginationIdle ? 0.35 : 1,
          }}
          onMouseEnter={handlePaginationEnter}
          onMouseLeave={handlePaginationLeave}
          onMouseMove={handlePaginationMove}
        >
          <Pagination
            totalPages={totalPages}
            currentPage={currentPageIndex + 1}
            onChangePage={(idx) => onPageChange(idx)}
            customColors={customColors}
          />
        </div>
      </div>

      {/* Tablet/desktop: floating controls overlay */}
      <div
        className={`${containerClass} hidden md:flex`}
        style={{
          top: "4rem",
          height: "calc(100vh - 4rem - 3.5rem)",
          color: textColor,
          backgroundColor: "transparent",
        }}
      >
      <div className={innerClass}>
      {/* Row 1: title + privacy (left) | share, comment, edit, save (right) – hidden on mobile */}
      <div className={chromeClass}>
        <div className="flex items-center gap-2 min-w-0">
          <div
            role="button"
            tabIndex={0}
            onClick={() => window.dispatchEvent(new CustomEvent("portfolio-menu-toggle"))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("portfolio-menu-toggle"));
              }
            }}
            className="flex items-center gap-2 rounded-xs p-2.5 backdrop-blur-md transition-all duration-200 cursor-pointer shrink-0"
            style={frostedButtonStyle()}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = frostedBgHover;
              e.currentTarget.style.color = textColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = frostedBgDefault;
              e.currentTarget.style.color = textColor;
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = frostedBgHover;
              e.currentTarget.style.color = textColor;
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = frostedBgDefault;
              e.currentTarget.style.color = textColor;
            }}
            aria-label="Open portfolio menu"
          >
            <MoreVertical size={20} />
            <PortfolioTitle
              text={portfolioTitle}
              align="left"
              size="xs"
              color="currentColor"
            />
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                privacy === "private" ? onTogglePrivacy() : onOpenPrivacyModal();
              }}
              disabled={privacyLoading}
              className="rounded-xs p-2.5 flex items-center justify-center backdrop-blur-md transition-all duration-200 disabled:opacity-50 shrink-0"
              style={frostedButtonStyle()}
              onMouseEnter={(e) => {
                if (!privacyLoading) {
                  e.currentTarget.style.backgroundColor = frostedBgHover;
                  e.currentTarget.style.color = textColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = frostedBgDefault;
                e.currentTarget.style.color = textColor;
              }}
              onFocus={(e) => {
                if (!privacyLoading) {
                  e.currentTarget.style.backgroundColor = frostedBgHover;
                  e.currentTarget.style.color = textColor;
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = frostedBgDefault;
                e.currentTarget.style.color = textColor;
              }}
              aria-label={privacy === "private" ? "Set portfolio to public" : "Set portfolio to private"}
            >
              {privacy === "private" ? <Lock size={18} /> : <LockOpen size={18} />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="relative">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-xs p-2.5 flex items-center justify-center backdrop-blur-md transition-all duration-200"
            style={frostedButtonStyle()}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = frostedBgHover;
              e.currentTarget.style.color = textColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = frostedBgDefault;
              e.currentTarget.style.color = textColor;
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = frostedBgHover;
              e.currentTarget.style.color = textColor;
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = frostedBgDefault;
              e.currentTarget.style.color = textColor;
            }}
            aria-label="Share portfolio"
          >
            <Share2 size={18} />
          </button>
          {shareCopied && (
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap px-2 py-1 text-xs rounded-xs bg-[var(--artist-accent)] text-[var(--artist-accent-text)]"
              style={{ boxShadow: "var(--artist-accent-shadow-portfolio, 0 10px 15px -3px rgb(0 0 0 / 0.1))" }}
              role="status"
            >
              Portfolio link copied
            </div>
          )}
        </div>
          <button
            type="button"
            onClick={() => onToggleComments()}
            className="rounded-xs p-2.5 flex items-center justify-center backdrop-blur-md transition-all duration-200"
            style={frostedButtonStyle(commentsOpen)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = commentsOpen ? accent : frostedBgHover;
              e.currentTarget.style.color = commentsOpen ? accentText : textColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = commentsOpen ? accent : frostedBgDefault;
              e.currentTarget.style.color = commentsOpen ? accentText : textColor;
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = commentsOpen ? accent : frostedBgHover;
              e.currentTarget.style.color = commentsOpen ? accentText : textColor;
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = commentsOpen ? accent : frostedBgDefault;
              e.currentTarget.style.color = commentsOpen ? accentText : textColor;
            }}
            aria-label="Comments"
            aria-expanded={commentsOpen}
          >
            <MessageCircle size={18} />
          </button>
          <EditPortfolioButton artistSlug={artistSlug} portfolioSlug={slug} customColors={customColors} />
          {!isOwner && (
            <button
              type="button"
              onClick={onToggleSave}
              disabled={saveLoading}
              className="rounded-xs p-2.5 flex items-center justify-center backdrop-blur-md transition-all duration-200 disabled:opacity-50"
              style={frostedButtonStyle(saved)}
              onMouseEnter={(e) => {
                if (!saveLoading) {
                  e.currentTarget.style.backgroundColor = saved ? accent : frostedBgHover;
                  e.currentTarget.style.color = saved ? accentText : textColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = saved ? accent : frostedBgDefault;
                e.currentTarget.style.color = saved ? accentText : textColor;
              }}
              onFocus={(e) => {
                if (!saveLoading) {
                  e.currentTarget.style.backgroundColor = saved ? accent : frostedBgHover;
                  e.currentTarget.style.color = saved ? accentText : textColor;
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = saved ? accent : frostedBgDefault;
                e.currentTarget.style.color = saved ? accentText : textColor;
              }}
              aria-label={saved ? "Remove from saves" : "Save portfolio"}
            >
              <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: pagination – bottom center on mobile/tablet, bottom right on desktop */}
      <div
        className={`flex justify-center lg:justify-end min-w-0 relative z-0 transition-opacity duration-300 ${controlsPointerEvents}`}
        style={{ opacity: paginationIdle ? 0.25 : 1 }}
        onMouseEnter={handlePaginationEnter}
        onMouseLeave={handlePaginationLeave}
        onMouseMove={handlePaginationMove}
      >
        <Pagination
          totalPages={totalPages}
          currentPage={currentPageIndex + 1}
          onChangePage={(idx) => onPageChange(idx)}
          customColors={customColors}
        />
      </div>
      </div>
    </div>
    </>
  );
}
