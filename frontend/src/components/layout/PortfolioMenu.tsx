"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Edit2, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

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
};

export default function PortfolioMenu({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

   // Extract artist slug from pathname (e.g., "/mrelirooney" -> "mrelirooney")
   const artistSlug = pathname?.split("/")[1] || "";

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
        },
        body: JSON.stringify({
          title: "Untitled Portfolio",
          privacy: "link_only",
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

  // Build avatar URL
  const rawAvatar = artistData?.profile?.avatar_url;
  let avatarUrl = "/default-avatar.png";
  if (rawAvatar) {
    if (rawAvatar.startsWith("http://") || rawAvatar.startsWith("https://")) {
      avatarUrl = rawAvatar;
    } else {
      const normalizedBase = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
      avatarUrl = normalizedBase + (rawAvatar.startsWith("/") ? rawAvatar : `/${rawAvatar}`);
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in menu */}
      <div
        ref={menuRef}
        className={`fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-60 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {/* Profile section */}
        
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-300 bg-gray-100">
              <img
                src={avatarUrl}
                alt={artistData?.profile?.display_name || "Profile"}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {artistData?.profile?.display_name || "Loading..."}
              </div>
              <div className="text-sm text-gray-500">
                {artistData?.portfolios?.length || 0} portfolio
                {artistData?.portfolios?.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        

        {/* Portfolios list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : artistData?.portfolios && artistData.portfolios.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {artistData.portfolios.map((portfolio) => (
                <li
                  key={portfolio.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        // Dispatch custom event to select portfolio
                        const event = new CustomEvent("portfolio-select", {
                          detail: portfolio.slug,
                        });
                        window.dispatchEvent(event);
                        onClose();
                      }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {portfolio.title || "Untitled Portfolio"}
                      </div>
                      {portfolio.privacy_status && (
                        <div className="text-xs text-gray-500 mt-1">
                          {portfolio.privacy_status}
                        </div>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => handleEdit(portfolio.slug)}
                            className="p-2 rounded-md hover:bg-gray-200 transition"
                            aria-label={`Edit ${portfolio.title}`}
                            title="Edit"
                          >
                            <Edit2 size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(portfolio.id, portfolio.slug)}
                            className="p-2 rounded-md hover:bg-red-50 transition"
                            aria-label={`Delete ${portfolio.title}`}
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No portfolios yet
            </div>
          )}
        </div>

        {/* Add Portfolio button */}
        <div className="p-4">
            {isOwner && (
            <div >
                <button
                onClick={handleAddPortfolio}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition font-medium"
                >
                <Plus size={18} />
                Add Portfolio
                </button>
            </div>
            )}
        </div>
      </div>
    </>
  );
}

