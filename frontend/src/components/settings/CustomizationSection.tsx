"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import ThemePatternLayer from "../artist/ThemePatternLayer";
import GoogleFontsLoader from "../artist/GoogleFontsLoader";
import GoogleFontsAllLoader from "../artist/GoogleFontsAllLoader";
import { GOOGLE_FONTS, DEFAULT_FONT_FAMILY, THEME_PATTERN_OPACITY } from "@/lib/constants";
import { getTextColorForBackground } from "@/lib/colorUtils";
import { getThemePatternColorOverrides } from "@/lib/systemSurfaceTheme";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const getCsrfToken = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

interface CustomizationSectionProps {
  onSaveRef?: (saveFn: () => Promise<void>) => void;
}

// Default colors
const DEFAULT_COLORS = {
  background: "#faf7f2",
  foreground: "#11100e",
  text: "#11100e",
  accent: "#c96a4a",
};

type ThemeOption = {
  id: number | null;
  key: string;
  name: string;
  previewUrl: string | null;
  svgUrl: string | null;
};

export default function CustomizationSection({ onSaveRef }: CustomizationSectionProps) {
  const { user, refresh: refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [colors, setColors] = useState({
    background: DEFAULT_COLORS.background,
    foreground: DEFAULT_COLORS.foreground,
    text: DEFAULT_COLORS.text,
    accent: DEFAULT_COLORS.accent,
  });

  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [themeOptions, setThemeOptions] = useState<ThemeOption[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>(DEFAULT_FONT_FAMILY);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // Refs to ensure save always uses latest values (avoids stale closure when Done is clicked)
  const colorsRef = useRef(colors);
  const selectedThemeIdRef = useRef(selectedThemeId);
  const selectedFontRef = useRef(selectedFont);
  colorsRef.current = colors;
  selectedThemeIdRef.current = selectedThemeId;
  selectedFontRef.current = selectedFont;

  // Clear hover preview when dropdown closes
  useEffect(() => {
    if (!fontDropdownOpen) {
      setHoveredFont(null);
    }
  }, [fontDropdownOpen]);

  // Close font dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setFontDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch profile + themes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, themesRes] = await Promise.all([
          fetch(`${API_BASE}/api/my/profile/`, {
            credentials: "include",
            headers: {
              "X-CSRFToken": getCsrfToken(),
              "ngrok-skip-browser-warning": "true",
            },
          }),
          fetch(`${API_BASE}/api/themes/`, {
            credentials: "include",
            headers: { "ngrok-skip-browser-warning": "true" },
          }),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setColors({
            background: data.background_color || DEFAULT_COLORS.background,
            foreground: data.foreground_color || DEFAULT_COLORS.foreground,
            text: data.text_color || DEFAULT_COLORS.text,
            accent: data.accent_color || DEFAULT_COLORS.accent,
          });
          const rawTheme = data.theme ?? null;
          const themeId =
            rawTheme != null
              ? typeof rawTheme === "object"
                ? (rawTheme as { id?: number })?.id ?? null
                : Number(rawTheme)
              : null;
          setSelectedThemeId(themeId != null ? themeId : null);
          setSelectedFont(data.font_family?.trim() || DEFAULT_FONT_FAMILY);
        }

        if (themesRes.ok) {
          const themes: { id: number; key: string; name: string; preview_url: string | null; svg_url: string | null }[] = await themesRes.json();
          const blank: ThemeOption = { id: null, key: "blank", name: "Blank", previewUrl: null, svgUrl: null };
          const rest: ThemeOption[] = themes.map((t) => ({
            id: t.id,
            key: t.key,
            name: t.name,
            previewUrl: t.preview_url ?? null,
            svgUrl: t.svg_url ?? null,
          }));
          setThemeOptions([blank, ...rest]);
        }
      } catch (err) {
        console.error("Error fetching profile/themes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleColorChange = (colorType: keyof typeof colors, value: string) => {
    setColors((prev) => ({ ...prev, [colorType]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      const c = colorsRef.current;
      const font = selectedFontRef.current;
      const themeId = selectedThemeIdRef.current;
      const payload: Record<string, string | number | null> = {
        background_color: c.background,
        foreground_color: c.foreground,
        text_color: c.text,
        accent_color: c.accent,
        font_family: font === DEFAULT_FONT_FAMILY ? null : font,
        theme: themeId,
      };

      const res = await fetch(`${API_BASE}/api/my/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCsrfToken(),
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await refreshUser();
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = (errData as { detail?: string })?.detail ?? (errData as { error?: string })?.error ?? "Failed to save. Please try again.";
        setSaveError(msg);
        console.error("Failed to save:", errData);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save. Please try again.";
      setSaveError(msg);
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  // Expose save function to parent
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef(handleSave);
    }
  }, [onSaveRef]);

  const selectedThemeSvgUrl =
    selectedThemeId != null
      ? themeOptions.find((t) => t.id === selectedThemeId)?.svgUrl ?? null
      : null;

  // Ensure absolute URL for fetch (backend may return relative)
  const absoluteSvgUrl = selectedThemeSvgUrl
    ? selectedThemeSvgUrl.startsWith("http")
      ? selectedThemeSvgUrl
      : `${API_BASE.replace(/\/+$/, "").replace(/\/api$/, "")}${selectedThemeSvgUrl.startsWith("/") ? "" : "/"}${selectedThemeSvgUrl}`
    : null;

  if (loading) {
    return (
      <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12">
        <p className="text-[var(--foreground)]">Loading...</p>
      </div>
    );
  }

  const profileText = getTextColorForBackground(colors.background);
  const portfolioText = getTextColorForBackground(colors.text);
  const accentText = getTextColorForBackground(colors.accent);
  const PLACEHOLDER_GREY = "rgb(130, 130, 130)";
  const previewCardClass =
    "relative overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-xs w-full h-[200px]";
  const previewPortfolioCardClass =
    "relative overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-xs w-full h-[160px]";

  const profileThemeOverrides = getThemePatternColorOverrides(colors.background);
  const portfolioThemeOverrides = getThemePatternColorOverrides(colors.text);

  // Use hovered font for preview when hovering, otherwise selected font
  const previewFont = hoveredFont ?? selectedFont;
  const previewFontFamily = `"${previewFont}", sans-serif`;

  return (
    <div className="flex h-full">
      <GoogleFontsAllLoader />
      <GoogleFontsLoader fontFamily={previewFont} />
      {/* Left side - Colors, Font, Themes */}
      <div className="flex-1 px-0 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12 overflow-y-auto">
        <div className="w-full lg:max-w-none">
        {saveError && (
            <p className="mb-4 text-sm text-[var(--accent)]" role="alert">
              {saveError}
            </p>
          )}
        <h3 className="block text-lg font-semibold text-[var(--foreground)] mb-2">
            Colors
          </h3>
          {/* Profile background (Color #1) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Profile background
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.background}
                onChange={(e) => handleColorChange("background", e.target.value)}
                className="h-12 w-20 rounded-xs border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.background}
                onChange={(e) => handleColorChange("background", e.target.value)}
                placeholder="#faf7f2"
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xs text-[var(--foreground)] bg-[var(--background)]"
              />
            </div>
          </div>

          {/* Foreground/Primary Color
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.foreground}
                onChange={(e) => handleColorChange("foreground", e.target.value)}
                className="h-12 w-20 rounded-xs border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={colors.foreground}
                onChange={(e) => handleColorChange("foreground", e.target.value)}
                placeholder="#11100e"
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xs text-[var(--foreground)] bg-[var(--background)]"
              />
            </div>
          </div> */}

          {/* Portfolio background (Color #2) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Portfolio background
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.text}
                onChange={(e) => handleColorChange("text", e.target.value)}
                className="h-12 w-20 rounded-xs border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.text}
                onChange={(e) => handleColorChange("text", e.target.value)}
                placeholder="#11100e"
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xs text-[var(--foreground)] bg-[var(--background)]"
              />
            </div>
          </div>

          {/* Accent color (Color #3) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Accent color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                className="h-12 w-20 rounded-xs border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                placeholder="#c96a4a"
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xs text-[var(--foreground)] bg-[var(--background)]"
              />
            </div>
          </div>

          {/* Font */}
          <div className="mb-6 relative" ref={fontDropdownRef}>
            <h3 className="block text-lg font-semibold text-[var(--foreground)] mb-2">
              Font
            </h3>
            <button
              type="button"
              onClick={() => setFontDropdownOpen((o) => !o)}
              className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-xs text-[var(--foreground)] bg-[var(--background)] text-left flex items-center justify-between hover:border-neutral-400 transition-colors"
            >
              <span style={{ fontFamily: `"${selectedFont}", sans-serif` }}>
                {selectedFont}
              </span>
              <svg
                className={`w-4 h-4 text-neutral-500 transition-transform ${fontDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {fontDropdownOpen && (
              <div
                className="text-[var(--foreground)] absolute z-50 mt-1 left-0 right-0 max-h-[200px] overflow-y-auto border border-neutral-200 dark:border-neutral-600 rounded-xs bg-[var(--background)] shadow-lg"
                onMouseLeave={() => setHoveredFont(null)}
              >
                {GOOGLE_FONTS.map((f) => {
                  const isSelected = selectedFont === f.family;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onMouseEnter={() => setHoveredFont(f.family)}
                      onClick={() => {
                        setSelectedFont(f.family);
                        setFontDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-[var(--light-brown)]/50 transition-colors first:rounded-xs-t-md last:rounded-xs-b-md ${
                        isSelected ? "bg-[var(--light-brown)] font-medium" : ""
                      }`}
                      style={{ fontFamily: `"${f.family}", sans-serif` }}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Theme */}
          <div className="w-full mt-8 pt-0">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Theme</h3>
            <p className="text-sm text-[var(--foreground)] opacity-80 mb-4">
              Choose a background pattern for your profile and portfolio pages.
            </p>
            <div className="grid grid-cols-3 md:grid-cols-8 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-1">
              {themeOptions.map((opt) => {
                const isSelected = selectedThemeId === opt.id;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedThemeId(opt.id)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-xs border-0 transition-colors w-full min-w-0 ${
                      isSelected
                        ? "bg-[var(--light-brown)]"
                        : "hover:bg-[var(--light-brown)/50]"
                    }`}
                  >
                    <div
                      className={`w-full aspect-square min-w-0 rounded-xs overflow-hidden flex items-center justify-center shrink-0 ${
                        opt.previewUrl ? "bg-neutral-200" : "bg-[var(--foreground)]"
                      }`}
                    >
                      {opt.previewUrl ? (
                        <img
                          src={opt.previewUrl}
                          alt={opt.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[var(--background)] text-sm font-medium">
                          {opt.name}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Preview (hidden on mobile per wireframe) */}
      <div className="hidden lg:block w-[400px] pt-8 pr-0 pl-12 overflow-y-auto bg-[var(--background)]">
        <div className="sticky top-0">
          {/* Profile preview card */}
          <div className={previewCardClass} style={{ backgroundColor: colors.background }}>
            {absoluteSvgUrl && (
              <ThemePatternLayer
                svgUrl={absoluteSvgUrl}
                colorOverrides={profileThemeOverrides}
                opacity={THEME_PATTERN_OPACITY}
              />
            )}
            <div
              className="relative z-10 h-full p-4 flex flex-col justify-start"
              style={{ fontFamily: previewFontFamily }}
            >
              <div
                className="w-20 h-20 aspect-square rounded-full mb-2.5 shrink-0 transition-colors duration-150"
                style={{ backgroundColor: PLACEHOLDER_GREY }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = PLACEHOLDER_GREY;
                }}
              />
              <h1 className="text-[20px] font-bold mb-1 shrink-0" style={{ color: profileText }}>
                Your Name
              </h1>
              <p className="text-sm mb-1 shrink-0" style={{ color: profileText }}>
                Title • Location •{" "}
                <span
                  className="rounded-xs px-1 py-0.5 transition-colors duration-150"
                  style={{ color: profileText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent;
                    e.currentTarget.style.color = accentText;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = profileText;
                  }}
                >
                  Contact
                </span>
              </p>
              <p className="text-sm leading-snug line-clamp-2" style={{ color: profileText }}>
                Your bio goes here
              </p>
            </div>
          </div>

          {/* Portfolio preview card — layout-2 miniature */}
          <div
            className={`${previewPortfolioCardClass} mt-4`}
            style={{ backgroundColor: colors.text }}
          >
            {absoluteSvgUrl && (
              <ThemePatternLayer
                svgUrl={absoluteSvgUrl}
                colorOverrides={portfolioThemeOverrides}
                opacity={THEME_PATTERN_OPACITY}
              />
            )}
            <div
              className="relative z-10 flex h-full min-h-0 pl-4 items-center gap-2"
              style={{ fontFamily: previewFontFamily }}
            >
              <div
                className="w-20 h-28 shrink-0 rounded-xs transition-colors duration-150"
                style={{ backgroundColor: PLACEHOLDER_GREY }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = PLACEHOLDER_GREY;
                }}
              />
              <div className="flex-1 min-w-0 h-28 flex flex-col justify-between py-0.5 pr-2">
                <div className="min-w-0">
                  <h1 className="text-[20px] font-bold leading-tight mb-2" style={{ color: portfolioText }}>
                    Your Portfolio
                  </h1>
                  <p
                    className="text-sm leading-tight line-clamp-2 border-y-4 py-2"
                    style={{ color: portfolioText, borderColor: colors.accent }}
                  >
                    This is how your portfolio will look with these colors.
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-px shrink-0">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((page) => (
                    <span
                      key={page}
                      className="inline-flex items-center justify-center min-w-[1rem] rounded-xs px-0.5 text-[11px] leading-none transition-colors duration-150"
                      style={{ color: portfolioText }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.accent;
                        e.currentTarget.style.color = accentText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = portfolioText;
                      }}
                    >
                      {page}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--foreground)] opacity-70 mt-4">
            Changes will be visible on your public profile and portfolio pages after saving.
          </p>
        </div>
      </div>
    </div>
  );
}
