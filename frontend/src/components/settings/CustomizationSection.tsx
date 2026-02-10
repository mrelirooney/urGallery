"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://backend:8000";

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

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/my/profile/`, {
          credentials: "include",
          headers: {
            "X-CSRFToken": getCsrfToken(),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setColors({
            background: data.background_color || DEFAULT_COLORS.background,
            foreground: data.foreground_color || DEFAULT_COLORS.foreground,
            text: data.text_color || DEFAULT_COLORS.text,
            accent: data.accent_color || DEFAULT_COLORS.accent,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleColorChange = (colorType: keyof typeof colors, value: string) => {
    setColors((prev) => ({ ...prev, [colorType]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      
      formData.append("background_color", colors.background);
      formData.append("foreground_color", colors.foreground);
      formData.append("text_color", colors.text);
      formData.append("accent_color", colors.accent);

      const res = await fetch(`${API_BASE}/api/my/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCsrfToken(),
        },
        body: formData,
      });

      if (res.ok) {
        await refreshUser();
      } else {
        console.error("Failed to save colors");
      }
    } catch (err) {
      console.error("Error saving colors:", err);
    } finally {
      setSaving(false);
    }
  };

  // Expose save function to parent
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef(handleSave);
    }
  }, [colors, onSaveRef]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left side - Color controls */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">Customization</h2>

          {/* Background Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Background Color
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
              Text Color
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
              Accent Color
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
        </div>
      </div>

      {/* Right side - Preview */}
      <div className="w-[400px] border-l border-neutral-200 p-8 overflow-y-auto bg-neutral-50">
        <div className="sticky top-0">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Preview</h3>
          
          {/* Preview card */}
          <div 
            className="rounded-lg overflow-hidden shadow-lg"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header section */}
            <div className="p-6">
              <div 
                className="w-20 h-20 rounded-full mb-4 flex items-center justify-center"
                style={{ backgroundColor: colors.foreground }}
              >
                <span className="text-2xl" style={{ color: colors.background }}>👤</span>
              </div>
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: colors.text }}
              >
                Your Name
              </h1>
              <p 
                className="text-sm mb-4"
                style={{ color: colors.text, opacity: 0.7 }}
              >
                Artist • Designer • Creator
              </p>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: colors.text, opacity: 0.8 }}
              >
                This is how your profile will look with these colors. You can customize the background, text, and accent colors to match your style.
              </p>
            </div>

            {/* Example button/accent elements */}
            <div className="px-6 pb-6">
              <button
                className="px-6 py-2 rounded-md font-medium text-white"
                style={{ backgroundColor: colors.accent }}
              >
                View Portfolio
              </button>
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
