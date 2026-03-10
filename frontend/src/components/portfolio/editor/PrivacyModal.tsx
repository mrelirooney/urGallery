"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getTextColorForBackground } from "@/lib/colorUtils";

export type PrivacyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPrivacy: "public" | "private";
  onUpdatePrivacy: (nextPrivacy: "public" | "private", password?: string) => void | Promise<void>;
  portfolioUrl: string;
  /** When true, modal was opened from Publish click (private without password) */
  publishContext?: boolean;
  /** Called when user clicks Publish in publishContext mode */
  onPublish?: () => Promise<void>;
  /** Saved password from draft (plaintext) for owner to see/edit */
  initialPassword?: string;
  /** Custom colors from artist profile (for editor page) */
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
};

export default function PrivacyModal({
  isOpen,
  onClose,
  currentPrivacy,
  onUpdatePrivacy,
  portfolioUrl,
  publishContext = false,
  onPublish,
  initialPassword = "",
  customColors,
}: PrivacyModalProps) {
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // Sync saved password when modal opens so owner sees it
  useEffect(() => {
    if (isOpen) {
      setPassword(initialPassword);
    }
  }, [isOpen, initialPassword]);

  if (!isOpen) return null;

  const canPublish = currentPrivacy === "public" || (currentPrivacy === "private" && password.trim().length > 0);

  const handleCopy = async () => {
    if (!portfolioUrl) return;
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
    }
  };

  const bg = customColors?.background ?? "#faf7f2";
  const textColor = getTextColorForBackground(bg);
  const textBg = customColors?.text ?? "#11100e";
  const accentBg = customColors?.accent ?? "#c96a4a";
  const inputBg = customColors ? "rgba(255,255,255,0.15)" : undefined;
  const inputBorder = customColors ? "rgba(255,255,255,0.3)" : undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* MODAL */}
      <div
        className="w-full max-w-md mx-4 rounded-xs p-6 shadow-xl"
        style={{
          backgroundColor: bg,
          color: textColor,
          border: "1px solid rgba(255, 253, 250, 0.3)",
        }}
      >
        {/* HEADER */}
        <h2 className="mb-2 text-center text-lg font-semibold" style={{ color: textColor }}>
          Privacy
        </h2>
        {publishContext && currentPrivacy === "private" && !password.trim() ? (
          <p className="mb-4 text-center text-sm font-medium opacity-90" style={{ color: textColor }}>
            This portfolio is set to private. You need to set a password for this private portfolio in order to publish it.
          </p>
        ) : (
          <p className="mb-4 text-center text-sm opacity-80" style={{ color: textColor }}>
            Set who can see this portfolio
          </p>
        )}

        {/* PRIVACY BUTTONS */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            type="button"
            className="px-4 py-2 rounded-xs font-medium transition-colors"
            style={
              currentPrivacy === "public"
                ? {
                    backgroundColor: textBg,
                    color: getTextColorForBackground(textBg),
                  }
                : customColors
                  ? {
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: textColor,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }
                  : {
                      backgroundColor: "rgb(229 229 229)",
                      color: "rgb(64 64 64)",
                      border: "1px solid rgb(212 212 212)",
                    }
            }
            onClick={() => {
              setPasswordError(null);
              onUpdatePrivacy("public");
            }}
          >
            Public
          </button>

          <button
            type="button"
            className="px-4 py-2 rounded-xs font-medium transition-colors"
            style={
              currentPrivacy === "private"
                ? {
                    backgroundColor: textBg,
                    color: getTextColorForBackground(textBg),
                  }
                : customColors
                  ? {
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: textColor,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }
                  : {
                      backgroundColor: "rgb(229 229 229)",
                      color: "rgb(64 64 64)",
                      border: "1px solid rgb(212 212 212)",
                    }
            }
            onClick={() => {
              setPasswordError(null);
              onUpdatePrivacy("private", password || undefined);
            }}
          >
            Private
          </button>
        </div>

        {/* PASSWORD (when private) */}
        {currentPrivacy === "private" && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 opacity-90" style={{ color: textColor }}>
              Password (required to view)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="Enter a password for visitors"
                className="w-full rounded-xs px-3 py-2 pr-10 text-sm"
                style={{
                  backgroundColor: inputBg ?? "rgb(245 245 244)",
                  border: `1px solid ${inputBorder ?? "rgb(228 228 226)"}`,
                  color: textColor,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-70 hover:opacity-100"
                style={{ color: textColor }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-xs opacity-90" style={{ color: accentBg }}>{passwordError}</p>
            )}
          </div>
        )}

        {/* SHARE LINK */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium mb-1 opacity-90" style={{ color: textColor }}>
            Shareable Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={portfolioUrl}
              className="w-full rounded-xs px-3 py-2 text-sm"
              style={{
                backgroundColor: inputBg ?? "rgb(245 245 244)",
                border: `1px solid ${inputBorder ?? "rgb(228 228 226)"}`,
                color: textColor,
              }}
            />
            <button
              type="button"
              className="rounded-xs px-4 py-2 text-sm font-medium shrink-0 transition-colors hover:opacity-90"
              style={{
                backgroundColor: textBg,
                color: getTextColorForBackground(textBg),
              }}
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          {copied && (
            <p className="absolute -bottom-5 left-0 text-xs font-medium" style={{ color: accentBg }}>
              Link copied to clipboard
            </p>
          )}
        </div>

        {/* CLOSE / SAVE / PUBLISH */}
        <div className="flex justify-end gap-3 flex-wrap">
          {publishContext && onPublish && (
            <button
              type="button"
              onClick={async () => {
                if (!canPublish) return;
                setPublishLoading(true);
                try {
                  if (currentPrivacy === "private" && password.trim()) {
                    await onUpdatePrivacy("private", password);
                  }
                  await onPublish?.();
                  onClose();
                } catch (e) {
                  console.error(e);
                } finally {
                  setPublishLoading(false);
                }
              }}
              disabled={!canPublish || publishLoading}
              className="rounded-xs px-4 py-2 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                canPublish
                  ? {
                      backgroundColor: accentBg,
                      color: getTextColorForBackground(accentBg),
                    }
                  : {
                      backgroundColor: customColors ? "rgba(255,255,255,0.2)" : "rgb(229 229 229)",
                      color: customColors ? textColor : "rgb(115 115 115)",
                    }
              }
            >
              {publishLoading ? "Publishing…" : "Publish"}
            </button>
          )}
          {currentPrivacy === "private" && !publishContext && (
            <button
              type="button"
              onClick={() => {
                if (!password.trim()) {
                  setPasswordError("Please enter a password for private portfolios.");
                  return;
                }
                setPasswordError(null);
                onUpdatePrivacy("private", password);
                onClose();
              }}
              className="rounded-xs px-4 py-2 font-medium text-sm transition-colors"
              style={{
                backgroundColor: accentBg,
                color: getTextColorForBackground(accentBg),
              }}
            >
              Save password
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xs px-4 py-2 font-medium text-sm transition-colors"
            style={{
              backgroundColor: textBg,
              color: getTextColorForBackground(textBg),
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
