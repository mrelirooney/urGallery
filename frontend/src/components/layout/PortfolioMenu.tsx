"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, Edit2, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

interface Portfolio {
  id: number;
  slug: string;
  title: string;
  privacy_status?: string;
}

interface ArtistData {
  profile: {
    slug: string;
    display_name: string;
    avatar_url: string | null;
  };
  portfolios: Portfolio[];
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
};

const DEFAULT_BG = "#faf7f2";
const DEFAULT_TEXT = "#11100e";

export default function PortfolioMenu({ isOpen, onClose, customColors }: Props) {
  const bg = customColors?.background || DEFAULT_BG;
  const text = customColors?.text || DEFAULT_TEXT;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

   // Extract artist slug from pathname (e.g., "/mrelirooney" -> "mrelirooney")
   const artistSlug = pathname?.split("/")[1] || "";
   const currentPortfolioSlug = searchParams?.get("portfolio") ?? artistData?.portfolios?.[0]?.slug ?? "";

   // Check if current user is the owner of this profile
   const isOwner = user?.slug === artistSlug;

  // Fetch artist data when menu opens
  useEffect(() => {
    if (!isOpen || !artistSlug) return;

    async function fetchArtistData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/artists/${artistSlug}/`, {
          credentials: "include",
          cache: "no-store",
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data: ArtistData = await res.json();
        setArtistData(data);
      } catch (err) {
        console.error("Error fetching artist data:", err);
        setError(err instanceof Error ? err.message : "Failed to load portfolios");
      } finally {
        setLoading(false);
      }
    }

    fetchArtistData();
  }, [isOpen, artistSlug]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleEdit = (portfolioSlug: string) => {
    router.push(`/${artistSlug}/${portfolioSlug}/edit`);
    onClose();
  };

  // Helper to get CSRF token from cookies
  const getCsrfToken = (): string => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  };

  const handleDelete = async (portfolioId: number, portfolioSlug: string) => {
    if (!confirm(`Are you sure you want to delete "${portfolioSlug}"?`)) {
      return;
    }

    try {
      const csrfToken = getCsrfToken();
      const res = await fetch(`${API_BASE}/api/my/portfolios/${portfolioSlug}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete: ${res.status}`);
      }

      // Refresh the portfolio list
      if (isOpen) {
        const refreshRes = await fetch(`${API_BASE}/api/artists/${artistSlug}/`, {
          credentials: "include",
          cache: "no-store",
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (refreshRes.ok) {
          const data: ArtistData = await refreshRes.json();
          setArtistData(data);
        }
      }
    } catch (err) {
      console.error("Error deleting portfolio:", err);
      alert(err instanceof Error ? err.message : "Failed to delete portfolio");
    }
  };

  const handleAddPortfolio = async () => {
    try {
      const csrfToken = getCsrfToken();
      const res = await fetch(`${API_BASE}/api/my/portfolios/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          title: "Untitled Portfolio",
          privacy: "private",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create: ${res.status}`);
      }

      const data = await res.json();
      
      // Redirect to editor
      router.push(`/${artistSlug}/${data.slug}/edit`);
      onClose();
    } catch (err) {
      console.error("Error creating portfolio:", err);
      alert(err instanceof Error ? err.message : "Failed to create portfolio");
    }
  };

  // Build avatar URL - only use when user has set a custom picture
  const rawAvatar = artistData?.profile?.avatar_url;
  const hasAvatar = Boolean(rawAvatar && rawAvatar.trim().length > 0);
  let avatarUrl = "";
  if (hasAvatar) {
    if (rawAvatar!.startsWith("http://") || rawAvatar!.startsWith("https://")) {
      avatarUrl = rawAvatar!;
    } else {
      const normalizedBase = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
      avatarUrl = normalizedBase + (rawAvatar!.startsWith("/") ? rawAvatar! : `/${rawAvatar}`);
    }
  }
  const displayName = artistData?.profile?.display_name || "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-60 transition-opacity"
          style={{ backgroundColor: bg, opacity: 0.85 }}
          onClick={onClose}
        />
      )}

      {/* Slide-in menu: mobile = full width from top (full height), desktop = sidebar from left */}
      <div
        ref={menuRef}
        className={`fixed left-0 right-0 top-0 bottom-0 w-full h-screen overflow-y-auto
          sm:left-0 sm:right-auto sm:bottom-0 sm:top-0 sm:w-80 sm:h-auto sm:max-h-none
          shadow-xl z-60 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-y-0 translate-x-0" : "-translate-y-full sm:translate-y-0 sm:-translate-x-full"}
        `}
        style={{ backgroundColor: text }}
      >
        {/* Header - px-4 on mobile to match navbar width */}
        <div
          className="flex items-center justify-between px-4 py-4 sm:p-page border-b"
          style={{ borderColor: `${bg}20` }}
        >
          {/* Profile section */}
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border shrink-0 flex items-center justify-center ${
                hasAvatar ? "" : "border-neutral-300 bg-neutral-200"
              }`}
              style={hasAvatar ? { borderColor: `${bg}40`, backgroundColor: `${bg}10` } : undefined}
            >
              {hasAvatar ? (
                <img
                  src={avatarUrl}
                  alt={artistData?.profile?.display_name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-body font-semibold text-neutral-700">{initial}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-body sm:text-body-lg" style={{ color: bg }}>
                {artistData?.profile?.display_name || "Loading..."}
              </div>
              <div className="text-body-sm" style={{ color: `${bg}99` }}>
                {artistData?.portfolios?.length || 0} portfolio
                {artistData?.portfolios?.length !== 1 ? "s" : ""}
              </div>
              {isOwner && (
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="mt-2 inline-block text-body-sm font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
                  style={{ color: bg }}
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md transition"
            style={{ color: bg }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${bg}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        

        {/* Portfolios list - px-4 on mobile to match navbar, extra pt for portfolio titles */}
        <div className="flex-1 overflow-y-auto pt-6 sm:pt-0">
          {loading ? (
            <div className="px-4 py-4 sm:p-page text-center text-body-sm" style={{ color: `${bg}99` }}>
              Loading...
            </div>
          ) : error ? (
            <div className="px-4 py-4 sm:p-page text-center text-body-sm" style={{ color: `${bg}99` }}>
              {error}
            </div>
          ) : artistData?.portfolios && artistData.portfolios.length > 0 ? (
            <ul>
              {artistData.portfolios.map((portfolio) => {
                const isActive = portfolio.slug === currentPortfolioSlug;
                return (
                <li
                  key={portfolio.id}
                  className="px-4 py-4 sm:p-page transition-colors border-b last:border-b-0"
                  style={{ borderColor: `${bg}15` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${bg}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        const event = new CustomEvent("portfolio-select", {
                          detail: portfolio.slug,
                        });
                        window.dispatchEvent(event);
                        onClose();
                      }}
                      className="flex-1 min-w-0 text-left"
                      style={{ color: bg }}
                    >
                      <div className={`truncate text-body sm:text-body-lg ${isActive ? "font-semibold opacity-100" : "font-medium opacity-60"}`}>
                        {portfolio.title || "Untitled Portfolio"}
                      </div>
                      {portfolio.privacy_status && (
                        <div className="text-caption mt-1" style={{ color: `${bg}99` }}>
                          {portfolio.privacy_status}
                        </div>
                      )}
                    </button>
                    <div className="hidden lg:flex items-center gap-1">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => handleEdit(portfolio.slug)}
                            className="p-2 rounded-md transition"
                            style={{ color: bg }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${bg}15`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            aria-label={`Edit ${portfolio.title}`}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(portfolio.id, portfolio.slug)}
                            className="p-2 rounded-md transition"
                            style={{ color: bg }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${bg}15`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            aria-label={`Delete ${portfolio.title}`}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
              })}
            </ul>
          ) : (
            <div className="px-4 py-4 sm:p-page text-center text-body-sm" style={{ color: `${bg}99` }}>
              No portfolios yet
            </div>
          )}
        </div>

        {/* Add Portfolio button - hidden on mobile and tablet, laptop only; match portfolio item padding */}
        <div className="hidden lg:block px-4 py-4 sm:p-page sm:pb-8">
          {isOwner && (
            <button
              onClick={handleAddPortfolio}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-md transition font-medium text-body-sm sm:text-body"
              style={{
                backgroundColor: bg,
                color: text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${bg}dd`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = bg;
              }}
            >
              <Plus size={18} />
              Add Portfolio
            </button>
          )}
        </div>
      </div>
    </>
  );
}

