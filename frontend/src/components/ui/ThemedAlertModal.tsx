"use client";

import React, { useEffect } from "react";
import { useSystemSurfaceColors } from "@/hooks/useSystemSurfaceColors";
import {
  AlertModalCustomColors,
  getAlertModalTheme,
} from "@/lib/alertModalTheme";

export type AlertModalAction = {
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

type ThemedAlertModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  customColors?: AlertModalCustomColors;
  title: string;
  children?: React.ReactNode;
  maxWidthClass?: string;
  primary?: AlertModalAction;
  secondary?: AlertModalAction;
  footer?: React.ReactNode;
};

export default function ThemedAlertModal({
  isOpen,
  onClose,
  customColors,
  title,
  children,
  maxWidthClass = "max-w-sm",
  primary,
  secondary,
  footer,
}: ThemedAlertModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { prefersDark } = useSystemSurfaceColors();

  if (!isOpen) return null;

  const theme = getAlertModalTheme(customColors, prefersDark);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={theme.backdropStyle}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative z-10 w-full ${maxWidthClass} mx-4 rounded-xs p-6`}
        style={theme.panelStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="themed-alert-title"
      >
        <h3
          id="themed-alert-title"
          className="text-lg font-medium mb-2 text-center"
          style={theme.titleStyle}
        >
          {title}
        </h3>

        {children ? (
          <div className="text-sm mb-6 text-center" style={theme.bodyStyle}>
            {children}
          </div>
        ) : (
          <div className="mb-4" aria-hidden />
        )}

        {footer ?? (
          (primary || secondary) && (
            <div className="flex gap-3 justify-center flex-wrap">
              {secondary && (
                <button
                  type="button"
                  onClick={secondary.onClick}
                  disabled={secondary.disabled || secondary.loading}
                  className="px-4 py-2 rounded-xs font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={theme.secondaryButtonStyle}
                >
                  {secondary.loading ? "…" : secondary.label}
                </button>
              )}
              {primary && (
                <button
                  type="button"
                  onClick={primary.onClick}
                  disabled={primary.disabled || primary.loading}
                  className="px-4 py-2 rounded-xs font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={theme.primaryButtonStyle}
                >
                  {primary.loading ? "…" : primary.label}
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function useAlertModalTheme(customColors?: AlertModalCustomColors) {
  const { prefersDark } = useSystemSurfaceColors();
  return getAlertModalTheme(customColors, prefersDark);
}
