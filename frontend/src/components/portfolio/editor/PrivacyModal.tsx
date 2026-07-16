"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import ThemedAlertModal, { useAlertModalTheme } from "@/components/ui/ThemedAlertModal";

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

  const theme = useAlertModalTheme(customColors);

  useEffect(() => {
    if (isOpen) {
      setPassword(initialPassword);
    }
  }, [isOpen, initialPassword]);

  const canPublish =
    currentPrivacy === "public" ||
    (currentPrivacy === "private" && password.trim().length > 0);

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

  const toggleButtonStyle = (selected: boolean): React.CSSProperties =>
    selected ? theme.primaryButtonStyle : theme.secondaryButtonStyle;

  const description =
    publishContext && currentPrivacy === "private" && !password.trim()
      ? "This portfolio is set to private. You need to set a password for this private portfolio in order to publish it."
      : "Set who can see this portfolio";

  return (
    <ThemedAlertModal
      isOpen={isOpen}
      onClose={onClose}
      customColors={customColors}
      title="Privacy"
      maxWidthClass="max-w-md"
      footer={
        <>
          <div className="mb-6 flex items-center justify-center gap-4">
            <button
              type="button"
              className="px-4 py-2 rounded-xs font-medium text-sm transition-colors"
              style={toggleButtonStyle(currentPrivacy === "public")}
              onClick={() => {
                setPasswordError(null);
                onUpdatePrivacy("public");
              }}
            >
              Public
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xs font-medium text-sm transition-colors"
              style={toggleButtonStyle(currentPrivacy === "private")}
              onClick={() => {
                setPasswordError(null);
                onUpdatePrivacy("private", password || undefined);
              }}
            >
              Private
            </button>
          </div>

          {currentPrivacy === "private" && (
            <div className="mb-6">
              <label
                className="block text-sm font-medium mb-1"
                style={theme.titleStyle}
              >
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
                  style={theme.inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-70 hover:opacity-100"
                  style={{ color: theme.textColor }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <p
                  className="mt-1 text-xs"
                  style={{ color: theme.accent, opacity: 0.9 }}
                >
                  {passwordError}
                </p>
              )}
            </div>
          )}

          <div className="mb-6 relative">
            <label
              className="block text-sm font-medium mb-1"
              style={theme.titleStyle}
            >
              Shareable Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={portfolioUrl}
                className="w-full rounded-xs px-3 py-2 text-sm"
                style={theme.inputStyle}
              />
              <button
                type="button"
                className="rounded-xs px-4 py-2 text-sm font-medium shrink-0 transition-colors hover:opacity-90"
                style={theme.secondaryButtonStyle}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {copied && (
              <p
                className="absolute -bottom-5 left-0 text-xs font-medium"
                style={{ color: theme.accent }}
              >
                Link copied to clipboard
              </p>
            )}
          </div>

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
                    ? theme.primaryButtonStyle
                    : theme.secondaryButtonStyle
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
                    setPasswordError(
                      "Please enter a password for private portfolios.",
                    );
                    return;
                  }
                  setPasswordError(null);
                  onUpdatePrivacy("private", password);
                  onClose();
                }}
                className="rounded-xs px-4 py-2 font-medium text-sm transition-colors"
                style={theme.primaryButtonStyle}
              >
                Save password
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xs px-4 py-2 font-medium text-sm transition-colors"
              style={theme.secondaryButtonStyle}
            >
              Close
            </button>
          </div>
        </>
      }
    >
      {description}
    </ThemedAlertModal>
  );
}
