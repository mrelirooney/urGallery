"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import ThemePatternLayer from "../artist/ThemePatternLayer";
import GoogleFontsLoader from "../artist/GoogleFontsLoader";
import GoogleFontsAllLoader from "../artist/GoogleFontsAllLoader";
import { GOOGLE_FONTS, DEFAULT_FONT_FAMILY } from "@/lib/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

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
            headers: { "X-CSRFToken": getCsrfToken() },
          }),
          fetch(`${API_BASE}/api/themes/`, { credentials: "include" }),
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
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await refreshUser();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to save:", errData);
      }
    } catch (err) {
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
      <div className="p-8">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  // Profile preview: matches live profile section (inverted for contrast on background)
  const profileThemeOverrides = {
    "--artist-background": colors.text,
    "--artist-accent": colors.accent,
    "--artist-text": colors.background,
  };

  // Portfolio preview: matches live portfolio section
  const portfolioThemeOverrides = {
    "--artist-background": colors.background,
    "--artist-accent": colors.accent,
    "--artist-text": colors.text,
  };

  // Use hovered font for preview when hovering, otherwise selected font
  const previewFont = hoveredFont ?? selectedFont;
  const previewFontFamily = `"${previewFont}", sans-serif`;

  return (
    <div className="flex h-full">
      <GoogleFontsAllLoader />
      <GoogleFontsLoader fontFamily={previewFont} />
      {/* Left side - Color controls */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">Customization</h2>

          {/* Background Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Color #1
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.background}
                onChange={(e) => handleColorChange("background", e.target.value)}
                className="h-12 w-20 rounded border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={colors.background}
                onChange={(e) => handleColorChange("background", e.target.value)}
                placeholder="#faf7f2"
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-neutral-900"
              />
            </div>
          </div>

          {/* Foreground/Primary Color
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.foreground}
                onChange={(e) => handleColorChange("foreground", e.target.value)}
                className="h-12 w-20 rounded border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={colors.foreground}
                onChange={(e) => handleColorChange("foreground", e.target.value)}
                placeholder="#11100e"
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-neutral-900"
              />
            </div>
          </div> */}

          {/* Text Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Color #2
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.text}
                onChange={(e) => handleColorChange("text", e.target.value)}
                className="h-12 w-20 rounded border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={colors.text}
                onChange={(e) => handleColorChange("text", e.target.value)}
                placeholder="#11100e"
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-neutral-900"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Color #3
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                className="h-12 w-20 rounded border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                placeholder="#c96a4a"
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-neutral-900"
              />
            </div>
          </div>

          {/* Font */}
          <div className="mb-6 relative" ref={fontDropdownRef}>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Font
            </label>
            <button
              type="button"
              onClick={() => setFontDropdownOpen((o) => !o)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-md text-neutral-900 bg-white text-left flex items-center justify-between hover:border-neutral-400 transition-colors"
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
                className="text-neutral-900 absolute z-50 mt-1 left-0 right-0 max-h-64 overflow-y-auto border border-neutral-200 rounded-md bg-white shadow-lg"
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
                      className={`w-full px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                        isSelected ? "bg-neutral-100 font-medium" : ""
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

          {/* Theme - full row */}
          <div className="mt-8 pt-8 border-t border-neutral-200 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Theme</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Choose a background pattern for your profile and portfolio pages.
            </p>
            <div className="flex flex-wrap gap-4">
              {themeOptions.map((opt) => {
                const isSelected = selectedThemeId === opt.id;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedThemeId(opt.id)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <div className="w-24 h-24 rounded-md overflow-hidden bg-neutral-200 flex items-center justify-center shrink-0">
                      {opt.previewUrl ? (
                        <img
                          src={opt.previewUrl}
                          alt={opt.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-neutral-500 text-sm font-medium">
                          {opt.name}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Preview */}
      <div className="w-[400px] border-l border-neutral-200 p-8 overflow-y-auto bg-neutral-50">
        <div className="sticky top-0">         
          {/* Profile preview card */}
          <div
            className="relative overflow-hidden shadow-lg"
            style={{ backgroundColor: colors.background }}
          >
            {absoluteSvgUrl && (
              <ThemePatternLayer
                svgUrl={absoluteSvgUrl}
                colorOverrides={profileThemeOverrides}
                opacity={0.15}
              />
            )}
            <div className="relative z-10 p-6 pr-5 pl-5" style={{ fontFamily: previewFontFamily }}>
              <div 
                className="w-20 h-20 rounded-full mb-4 flex items-center justify-center"
                style={{ backgroundColor: colors.text }}
              >
              </div>
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: colors.text }}
              >
                Your Name
              </h1>
              <p 
                className="text-sm mb-4"
                style={{ color: colors.text }}
              >
                Title • Location • Contact
              </p>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: colors.text }}
              >
                Customize bold, quirky visuals and text to match your exact vibe. Jump beyond basic design.
              </p>
            </div>
          </div>

          {/* Portfolio preview card */}
          <div
            className="relative overflow-hidden shadow-lg mt-4 z-[5]"
            style={{ backgroundColor: colors.text }}
          >
            {absoluteSvgUrl && (
              <ThemePatternLayer
                svgUrl={absoluteSvgUrl}
                colorOverrides={portfolioThemeOverrides}
                opacity={1}
              />
            )}
            {/* Semi-transparent gradient overlay so pattern shows through */}
            <div
              className="absolute inset-0 z-[5] pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${colors.accent} 17.5%, ${colors.text} 17.5%)`,
                opacity: .92,
              }}
            />
            <div className="relative z-10 p-5 flex flex-col gap-4" style={{ fontFamily: previewFontFamily }}>
              <div className="flex flex-row gap-2">
                <div 
                  className="w-38 h-20 z-10 mb-4 flex items-center justify-center"
                  style={{ 
                    backgroundColor: colors.background,
                    boxShadow: `0 0 0 5px ${colors.accent}`,
                   }}
                >
                </div>
                <div className="pl-2">
                  <h1 
                    className="text-2xl font-bold mb-2"
                    style={{ color: colors.background }}
                  >
                    Your Portfolio
                  </h1>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: colors.background }}
                  >
                    This is how your portfolio will look with these colors. 
                  </p>
                  <p 
                    className="text-sm text-right"
                    style={{ color: colors.background }}
                  >
                    1 2 3 4 5 6 7 8 9 10 
                  </p>          
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-500 mt-4">
            Changes will be visible on your public profile and portfolio pages after saving.
          </p>
        </div>
      </div>
    </div>
  );
}
