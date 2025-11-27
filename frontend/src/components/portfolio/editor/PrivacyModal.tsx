"use client";

import React from "react";


export type PrivacyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPrivacy: "public" | "private";
  onUpdatePrivacy: (nextPrivacy: "public" | "private") => void;
  portfolioUrl: string;
};

export default function PrivacyModal({
  isOpen,
  onClose,
  currentPrivacy,
  onUpdatePrivacy,
  portfolioUrl,
}: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* MODAL */}
      <div className="w-full max-w-md rounded-lg bg-neutral-100 p-6 shadow-xl">
        {/* HEADER */}
        <h2 className="mb-2 text-center text-lg font-semibold text-neutral-900">
          Privacy
        </h2>
        <p className="mb-4 text-center text-neutral-600 text-sm">
          Set who can see this portfolio
        </p>

        {/* PRIVACY BUTTONS */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            className={`px-4 py-2 rounded-md font-medium border ${
              currentPrivacy === "public"
                ? "bg-neutral-900 text-neutral-100 border-neutral-900"
                : "bg-neutral-200 text-neutral-700 border-neutral-300"
            }`}
            onClick={() => onUpdatePrivacy("public")}
          >
            Public
          </button>

          <button
            className={`px-4 py-2 rounded-md font-medium border ${
              currentPrivacy === "private"
                ? "bg-neutral-900 text-neutral-100 border-neutral-900"
                : "bg-neutral-200 text-neutral-700 border-neutral-300"
            }`}
            onClick={() => onUpdatePrivacy("private")}
          >
            Private
          </button>
        </div>

        {/* SHARE LINK */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Shareable Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={portfolioUrl}
              className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-neutral-800 text-sm"
            />
            <button
              className="rounded-md bg-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-400"
              onClick={() => {
                navigator.clipboard.writeText(portfolioUrl);
              }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-neutral-900 px-4 py-2 text-neutral-100 font-medium hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
