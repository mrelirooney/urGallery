"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Lock, LockOpen, Eye, EyeOff, Copy } from "lucide-react";
import Pagination from "./primitives/Pagination";
import PageRenderer, {
  PortfolioPageData,
  LayoutType,
  MediaShapeType,
} from "./PageRenderer";
import PortfolioControls from "@/components/portfolio/PortfolioControls";
import CommentsSection from "@/components/portfolio/CommentsSection";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "";


type PortfolioWrapperProps = {
  slug: string;        // portfolio slug
  artistSlug: string;  // owner’s profile slug
  artistName?: string;
  artistAvatarUrl?: string | null;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
    portfolioText?: string;
  };
  privacy?: "public" | "private";
  isOwner?: boolean;
};

type ApiPage = {
  id: number;
  title: string;
  description: string;
  order: number;
  layout?: LayoutType | null;
  media_image: string | null;
  media_shape: MediaShapeType | null;
  media_image_2: string | null;
  media_shape_2: MediaShapeType | null;
  title_2: string;
  description_2: string;
};

type ApiPortfolio = {
  id: number;
  title: string;
  slug: string;
  pages: ApiPage[];
};

const IDLE_HIDE_MS = 1000;
const UNLOCK_STORAGE_KEY = (a: string, s: string) => `portfolio-unlock-${a}-${s}`;
const UNLOCK_EXPIRY_DAYS = 7;

function getStoredUnlock(artistSlug: string, slug: string): { token: string; expires_at: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(UNLOCK_STORAGE_KEY(artistSlug, slug));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.token || !data?.expires_at) return null;
    if (Date.now() / 1000 > data.expires_at) {
      localStorage.removeItem(UNLOCK_STORAGE_KEY(artistSlug, slug));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setStoredUnlock(artistSlug: string, slug: string, token: string, expiresAt: number) {
  localStorage.setItem(UNLOCK_STORAGE_KEY(artistSlug, slug), JSON.stringify({ token, expires_at: expiresAt }));
}

const getCsrfToken = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

export default function PortfolioWrapper({ slug, artistSlug, artistName, artistAvatarUrl, customColors, privacy = "public", isOwner = false }: PortfolioWrapperProps) {
  const router = useRouter();
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");
  const [pages, setPages] = useState<PortfolioPageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPortfolioView, setIsPortfolioView] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [blurOpacity, setBlurOpacity] = useState(1);
  const [showModal, setShowModal] = useState(true);
  const [unlockErrorShake, setUnlockErrorShake] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const idleRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live-view privacy toggle (owner only)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [privacyPassword, setPrivacyPassword] = useState("");
  const [privacyPasswordVisible, setPrivacyPasswordVisible] = useState(false);
  const [privacyPasswordCopied, setPrivacyPasswordCopied] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const isPrivateBlurred = privacy === "private" && !isOwner && !unlocked;

  // Check localStorage for valid unlock token on mount (7-day expiry)
  useEffect(() => {
    const stored = getStoredUnlock(artistSlug, slug);
    if (stored) setUnlocked(true);
  }, [artistSlug, slug]);

  // Hide controls after 1s of no mouse/touch movement
  useEffect(() => {
    function scheduleHide() {
      if (idleRef.current) clearTimeout(idleRef.current);
      setControlsVisible(true);
      idleRef.current = setTimeout(() => setControlsVisible(false), IDLE_HIDE_MS);
    }
    window.addEventListener("mousemove", scheduleHide);
    window.addEventListener("touchmove", scheduleHide);
    scheduleHide(); // initial schedule
    return () => {
      window.removeEventListener("mousemove", scheduleHide);
      window.removeEventListener("touchmove", scheduleHide);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, []);

  // Sync visibility to compact profile bar and footer (they listen for this event)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("portfolio-overlay-visibility", { detail: { visible: controlsVisible } }));
  }, [controlsVisible]);

  // Show PortfolioControls only when user has scrolled to portfolio (artist-compact)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkCompact = () => setIsPortfolioView(document.documentElement.classList.contains("artist-compact"));
    checkCompact(); // initial check (e.g. page loaded with #portfolio-shell)
    const observer = new MutationObserver(checkCompact);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("artist-compact-change", checkCompact);
    return () => {
      observer.disconnect();
      window.removeEventListener("artist-compact-change", checkCompact);
    };
  }, []);


  useEffect(() => {
    if (!slug) {
      return;
    }

    async function loadPortfolio() {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE}/api/artists/${artistSlug}/portfolios/${slug}/`;

        const res = await fetch(url, {
          credentials: "include", // Send auth cookies
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch portfolio: ${res.status}`);
        }

        const data: ApiPortfolio = await res.json();
        setPortfolioTitle(data.title ?? "");
        
        // Emit portfolio title update for compact navbar
        const event = new CustomEvent("portfolio-title-update", { 
          detail: data.title ?? "" 
        });
        window.dispatchEvent(event);

        
        // Map backend Page → frontend PageRenderer shape
        const mappedPages: PortfolioPageData[] = data.pages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((page, index) => {
            // Build a *safe* mediaSrc
            let mediaSrc: string | null = null;
            if (page.media_image) {
              // If backend already gave us a full URL, just use it
              if (page.media_image.startsWith("http")) {
                mediaSrc = page.media_image;
              } else {
                // Otherwise, prefix with API_BASE
                mediaSrc = `${API_BASE}${page.media_image}`;
              }
            }

            // Build mediaSrc2 for second column
            let mediaSrc2: string | null = null;
            if (page.media_image_2) {
              if (page.media_image_2.startsWith("http")) {
                mediaSrc2 = page.media_image_2;
              } else {
                mediaSrc2 = `${API_BASE}${page.media_image_2}`;
              }
            }

            return {
              id: page.id,
              title: page.title,
              description: page.description,
              // Fall back to your default layout if null/undefined
              layoutType: (page.layout || "layout-1") as LayoutType,
              mediaSrc,
              // Make live view respect saved media shape
              mediaShape: (page.media_shape || "1:1") as MediaShapeType,
              // Second column fields
              mediaSrc2,
              mediaShape2: (page.media_shape_2 || "1:1") as MediaShapeType,
              title2: page.title_2 || "",
              description2: page.description_2 || "",
              pageNumber: index + 1,
            };
          });

        setPages(mappedPages);
        setCurrentPageIndex(0);
      } catch (err) {
        console.error("❌ Error loading portfolio:", err);
        setError("Could not load portfolio.");
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  },  [slug, artistSlug]);

  const handleUnlock = useCallback(async () => {
    setUnlockError(null);
    setUnlockLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/artists/${artistSlug}/portfolios/${slug}/unlock/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ password: unlockPassword }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUnlockError("Incorrect password. Try again.");
        setUnlockErrorShake(true);
        setTimeout(() => setUnlockErrorShake(false), 500);
        return;
      }
      const token = data.token;
      const expiresAt = data.expires_at;
      if (token) {
        setStoredUnlock(artistSlug, slug, token, expiresAt ?? Math.floor(Date.now() / 1000) + UNLOCK_EXPIRY_DAYS * 24 * 60 * 60);
        setUnlockPassword("");
        setUnlockSuccess(true);
        // Blur fade out over 1.5s
        const start = Date.now();
        const duration = 1500;
        const tick = () => {
          const elapsed = Date.now() - start;
          const p = Math.min(elapsed / duration, 1);
          setBlurOpacity(1 - p);
          if (p < 1) requestAnimationFrame(tick);
          else {
            setUnlocked(true);
            setShowModal(false);
          }
        };
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error("Unlock error:", err);
      setUnlockError("Something went wrong. Please try again.");
    } finally {
      setUnlockLoading(false);
    }
  }, [artistSlug, slug, unlockPassword]);

  // Auto-focus password input when overlay appears
  useEffect(() => {
    if (isPrivateBlurred && showModal && !unlockSuccess) {
      passwordInputRef.current?.focus();
    }
  }, [isPrivateBlurred, showModal, unlockSuccess]);

  // Fetch draft password when privacy modal opens (to pre-fill)
  useEffect(() => {
    if (!privacyModalOpen || !isOwner) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/portfolios/${slug}/editor/`,
          { credentials: "include", headers: { "ngrok-skip-browser-warning": "true" } }
        );
        if (cancelled || !res.ok) return;
        const data = await res.json();
        const pw = data?.password;
        if (typeof pw === "string") setPrivacyPassword(pw);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [privacyModalOpen, isOwner, slug]);

  // Lock page scroll when modals are open (html + body for full coverage)
  useEffect(() => {
    const shouldLock = privacyModalOpen || (isPrivateBlurred && showModal);
    if (shouldLock) {
      const prevHtml = document.documentElement.style.overflow;
      const prevBody = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = prevHtml;
        document.body.style.overflow = prevBody;
      };
    }
  }, [privacyModalOpen, isPrivateBlurred, showModal]);

  const handleToggleSave = useCallback(async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    try {
      if (saved) {
        const res = await fetch(
          `${API_BASE}/api/my/saves/portfolios/${artistSlug}/${slug}/`,
          { method: "DELETE", credentials: "include", headers: { "ngrok-skip-browser-warning": "true" } }
        );
        if (res.ok) setSaved(false);
      } else {
        const res = await fetch(
          `${API_BASE}/api/my/saves/portfolios/${artistSlug}/${slug}/`,
          { method: "POST", credentials: "include", headers: { "ngrok-skip-browser-warning": "true" } }
        );
        if (res.ok) setSaved(true);
      }
    } catch (err) {
      console.error("Error saving portfolio:", err);
    } finally {
      setSaveLoading(false);
    }
  }, [artistSlug, slug, saved, saveLoading]);

  const handleToggleToPublic = useCallback(async () => {
    if (!isOwner) return;
    setPrivacyLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/artists/${artistSlug}/portfolios/${slug}/privacy/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ privacy: "public" }),
        }
      );
      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Privacy toggle error:", err);
    } finally {
      setPrivacyLoading(false);
    }
  }, [artistSlug, slug, isOwner, router]);

  const handlePrivacyModalDone = useCallback(async () => {
    if (!privacyPassword.trim()) return;
    setPrivacyLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/artists/${artistSlug}/portfolios/${slug}/privacy/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ privacy: "private", password: privacyPassword }),
        }
      );
      if (res.ok) {
        setPrivacyModalOpen(false);
        setPrivacyPassword("");
        router.refresh();
      }
    } catch (err) {
      console.error("Privacy update error:", err);
    } finally {
      setPrivacyLoading(false);
    }
  }, [artistSlug, slug, privacyPassword, router]);

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Loading portfolio…
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="p-8 text-center text-red-500">
        {error ?? "This user does not have a portfolio."}
      </div>
    );
  }

  return (
    <section 
      className="w-full flex flex-col justify-between"
      style={{ 
        backgroundColor: customColors?.text || '#11100e',
        color: customColors?.background || '#faf7f2',
       }}
    >
      <PortfolioControls
        portfolioTitle={portfolioTitle}
        slug={slug}
        artistSlug={artistSlug}
        customColors={customColors}
        privacy={privacy}
        isOwner={isOwner ?? false}
        controlsVisible={controlsVisible && isPortfolioView}
        isPrivateBlurred={isPrivateBlurred}
        onTogglePrivacy={handleToggleToPublic}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        privacyLoading={privacyLoading}
        shareCopied={shareCopied}
        onShareCopiedChange={setShareCopied}
        saved={saved}
        onToggleSave={handleToggleSave}
        saveLoading={saveLoading}
        totalPages={pages.length}
        currentPageIndex={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        commentsOpen={commentsOpen}
        onToggleComments={() => setCommentsOpen((v) => !v)}
      />

      <div className={`min-h-[85vh] md:min-h-[85vh] w-full pt-0 pb-4 md:pt-8 md:pb-8 flex flex-col justify-between relative z-10 ${isPrivateBlurred ? "select-none" : ""}`}>
        <div className="flex flex-col justify-start md:justify-center gap-6 relative z-10 min-h-[calc(70vh-1.5rem)] max-h-[calc(100vh-8rem)]">
          {/* Content: blur fades out on success */}
          <div
            className="flex flex-col justify-start md:justify-center gap-6 min-h-0 transition-[filter] duration-[1500ms] ease-out"
            style={{
              filter: isPrivateBlurred ? `blur(${blurOpacity * 24}px)` : "none",
              pointerEvents: isPrivateBlurred ? "none" : "auto",
              userSelect: isPrivateBlurred ? "none" : "auto",
            }}
          >
            <PageRenderer
              pages={pages}
              currentPageIndex={currentPageIndex}
              customColors={customColors}
            />
          </div>
          {/* Overlay: sibling of blurred content so it stays sharp and clickable */}
          {isPrivateBlurred && showModal && (
            <div
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto"
              aria-label="Unlock private portfolio"
            >
              <div
                className="max-w-sm w-full mx-4 p-6 rounded-xs text-center"
                style={{
                  backgroundColor: customColors?.background || "#faf7f2",
                  color: customColors?.text || "#11100e",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className={`mx-auto mb-4 flex justify-center ${unlockErrorShake ? "animate-unlock-shake" : ""} ${unlockSuccess ? "animate-pulse" : ""}`}
                  style={{ color: customColors?.text || "#11100e" }}
                >
                  {unlockSuccess ? (
                    <LockOpen size={32} className="opacity-90" />
                  ) : (
                    <Lock size={32} className="opacity-90" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {unlockSuccess ? "This portfolio is unlocked" : "This portfolio is private"}
                </h3>
                {!unlockSuccess && (
                  <p className="text-sm opacity-80 mb-4">
                    Enter the password to view.
                  </p>
                )}
                {!unlockSuccess && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUnlock();
                    }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? "text" : "password"}
                        value={unlockPassword}
                        onChange={(e) => {
                          setUnlockPassword(e.target.value);
                          setUnlockError(null);
                        }}
                        placeholder="Password"
                        className="w-full rounded-xs ring-2 px-3 py-2.5 pr-10 text-sm focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: customColors?.background || "#faf7f2",
                          color: customColors?.text || "#11100e",
                          boxShadow: `0 0 0 2px ${(customColors?.text || "#11100e")}CC`,
                        }}
                        autoComplete="current-password"
                        disabled={unlockLoading}
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${customColors?.accent || "var(--artist-accent)"}`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${(customColors?.text || "#11100e")}CC`;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-70 hover:opacity-100"
                        style={{ color: customColors?.text || "#11100e" }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {unlockError && (
                      <p className="text-sm text-red-600">{unlockError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={unlockLoading}
                      className="w-full py-2.5 rounded-xs font-medium text-sm transition-all duration-200 disabled:opacity-60 hover:opacity-90"
                      style={{
                        backgroundColor: customColors?.text || "#11100e",
                        color: customColors?.background || "#faf7f2",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = customColors?.accent || "var(--artist-accent)";
                        e.currentTarget.style.color = customColors?.foreground || "var(--artist-accent-text)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = customColors?.text || "#11100e";
                        e.currentTarget.style.color = customColors?.background || "#faf7f2";
                      }}
                    >
                      {unlockLoading ? "Checking…" : "Unlock"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile: comment + pagination (in flow) */}
        <div className={`flex md:hidden items-center justify-between relative z-20 top-5 mb-6 transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"} ${isPrivateBlurred ? "pointer-events-none" : ""}`}>
          <button
            type="button"
            onClick={() => setCommentsOpen((v) => !v)}
            className={`rounded-xs p-2.5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity ${commentsOpen ? "bg-[var(--artist-accent)] text-[var(--artist-accent-text)]" : "bg-transparent text-[var(--artist-portfolio-text)] hover:bg-[var(--artist-accent)] hover:text-[var(--artist-accent-text)]"}`}
            aria-label="Comments"
            aria-expanded={commentsOpen}
          >
            <MessageCircle size={18} />
          </button>
          <div className="flex-1" />
          <Pagination
            totalPages={pages.length}
            currentPage={currentPageIndex + 1}
            onChangePage={(idx) => setCurrentPageIndex(idx)}
            customColors={customColors}
          />
        </div>

        <CommentsSection
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          artistSlug={artistSlug}
          portfolioSlug={slug}
          customColors={customColors}
        />

        {/* Make-private modal (owner only) */}
        {privacyModalOpen && isOwner && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            style={{ touchAction: "none", overscrollBehavior: "none" }}
          >
            <div
              className="max-w-sm w-full mx-4 p-6 rounded-xs"
              style={{
                backgroundColor: customColors?.background || "#faf7f2",
                color: customColors?.text || "#11100e",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
              }}
            >
              <h3 className="text-lg font-medium mb-2 text-center">
                Set portfolio to private
              </h3>
              <p className="text-sm opacity-80 mb-4 text-center">
                You&apos;re about to set this portfolio to private. Private portfolios need a password.
              </p>
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium opacity-90">
                  Password (required to view)
                </label>
                <div className="relative">
                  <input
                    type={privacyPasswordVisible ? "text" : "password"}
                    value={privacyPassword}
                    onChange={(e) => setPrivacyPassword(e.target.value)}
                    placeholder="Enter a password for visitors"
                    className="w-full rounded-xs ring-2 px-3 py-2.5 pr-20 text-sm focus:outline-none transition-all duration-200"
                    style={{
                      backgroundColor: customColors?.background || "#faf7f2",
                      color: customColors?.text || "#11100e",
                      boxShadow: `0 0 0 2px ${(customColors?.text || "#11100e")}CC`,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${customColors?.accent || "var(--artist-accent)"}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${(customColors?.text || "#11100e")}CC`;
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPrivacyPasswordVisible((v) => !v)}
                      className="p-1.5 rounded opacity-70 hover:opacity-100"
                      style={{ color: customColors?.text || "#11100e" }}
                      aria-label={privacyPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {privacyPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (privacyPassword) {
                          navigator.clipboard?.writeText(privacyPassword);
                          setPrivacyPasswordCopied(true);
                          setTimeout(() => setPrivacyPasswordCopied(false), 2000);
                        }
                      }}
                      className="p-1.5 rounded opacity-70 hover:opacity-100"
                      style={{ color: customColors?.text || "#11100e" }}
                      aria-label="Copy password"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                {privacyPasswordCopied && (
                  <p className="text-xs opacity-80">Password copied</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrivacyModalOpen(false);
                    setPrivacyPassword("");
                  }}
                  className="px-4 py-2 rounded-xs font-medium text-sm transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: customColors?.text || "#11100e",
                    color: customColors?.background || "#faf7f2",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = customColors?.accent || "var(--artist-accent)";
                    e.currentTarget.style.color = customColors?.foreground || "var(--artist-accent-text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = customColors?.text || "#11100e";
                    e.currentTarget.style.color = customColors?.background || "#faf7f2";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handlePrivacyModalDone()}
                  disabled={!privacyPassword.trim() || privacyLoading}
                  className="px-4 py-2 rounded-xs font-medium text-sm transition-all duration-200 disabled:opacity-60 hover:opacity-90"
                  style={{
                    backgroundColor: customColors?.text || "#11100e",
                    color: customColors?.background || "#faf7f2",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = customColors?.accent || "var(--artist-accent)";
                      e.currentTarget.style.color = customColors?.foreground || "var(--artist-accent-text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = customColors?.text || "#11100e";
                    e.currentTarget.style.color = customColors?.background || "#faf7f2";
                  }}
                >
                  {privacyLoading ? "Saving…" : "Done"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
