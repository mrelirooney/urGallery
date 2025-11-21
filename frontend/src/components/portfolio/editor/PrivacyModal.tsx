"use client";

import React, { useState, useCallback } from "react";

// Define the privacy states used by the model and API
export type PrivacyState = "DRAFT" | "PUBLIC" | "LINK_ONLY";

interface PrivacyModalProps {
  isOpen: boolean;
  currentPrivacy: PrivacyState;
  portfolioTitle: string;
  portfolioUrl: string; // The URL to be displayed and copied
  onClose: () => void;
  // Function to call when a button is clicked. 
  // We only allow setting to PUBLIC or LINK_ONLY from this modal.
  onUpdatePrivacy: (newPrivacy: "PUBLIC" | "LINK_ONLY") => Promise<void>;
}

export default function PrivacyModal({
  isOpen,
  currentPrivacy,
  portfolioTitle,
  portfolioUrl,
  onClose,
  onUpdatePrivacy,
}: PrivacyModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy");

  if (!isOpen) return null;

  // --- Handlers ---
  
  const handleUpdate = async (newPrivacy: "PUBLIC" | "LINK_ONLY") => {
    // Only update if the selected state is different and it's not currently updating
    if (newPrivacy === currentPrivacy || isUpdating) return;

    setIsUpdating(true);
    try {
      await onUpdatePrivacy(newPrivacy);
    } catch (error) {
      console.error("Failed to update portfolio privacy:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      setCopyStatus("Failed");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    }
  }, [portfolioUrl]);

  // --- UI Logic ---
  const isPublic = currentPrivacy === "PUBLIC";
  const isLinkOnly = currentPrivacy === "LINK_ONLY";
  const isDraft = currentPrivacy === "DRAFT";

  const statusText = isPublic
    ? "Public (Visible to everyone)"
    : isLinkOnly
    ? "Private (Link Only)"
    : "Draft (Not public)";
    
  // --- Component Render ---
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
          <h2 className="text-xl font-semibold text-white">Privacy Settings</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl p-1 leading-none"
          >
            ×
          </button>
        </div>

        {/* Portfolio Title & Status */}
        <p className="text-sm font-medium text-neutral-400">Portfolio</p>
        <h3 className="text-lg font-bold text-white mb-4 truncate">
          {portfolioTitle}
        </h3>
        
        {/* Current Status Badge */}
        <p className={`text-xs font-semibold px-2 py-1 rounded-full w-fit mb-6 ${
            isPublic ? 'bg-green-600 text-white' : 
            isLinkOnly ? 'bg-yellow-600 text-black' : 
            'bg-blue-600 text-white'
        }`}>
            Status: {statusText}
        </p>


        {/* Privacy Toggle Buttons */}
        <div className="flex border border-neutral-700 rounded-lg mb-6">
          {/* Public Button */}
          <button
            onClick={() => handleUpdate("PUBLIC")}
            disabled={isUpdating}
            className={`flex-1 p-3 text-sm font-medium transition-colors rounded-l-lg ${
              isPublic
                ? "bg-white text-black"
                : "text-neutral-300 hover:bg-neutral-800"
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Public
          </button>

          {/* Link Only Button (Private) */}
          <button
            onClick={() => handleUpdate("LINK_ONLY")}
            disabled={isUpdating}
            className={`flex-1 p-3 text-sm font-medium transition-colors border-l border-neutral-700 rounded-r-lg ${
              isLinkOnly
                ? "bg-white text-black"
                : "text-neutral-300 hover:bg-neutral-800"
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Private (Link)
          </button>
        </div>
        
        {/* Portfolio Link Section */}
        <p className="text-sm font-medium text-neutral-400 mb-2">Sharable Link</p>
        <div className="flex items-stretch gap-2">
          {/* URL Display */}
          <div className="flex-1 bg-neutral-800 border border-neutral-700 p-2 rounded-md text-sm text-neutral-300 overflow-hidden whitespace-nowrap">
            {portfolioUrl}
          </div>
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-24 ${
                copyStatus === "Copied!" ? "bg-green-600 text-white" : 
                copyStatus === "Failed" ? "bg-red-600 text-white" :
                "bg-neutral-700 text-white hover:bg-neutral-600"
            }`}
          >
            {copyStatus}
          </button>
        </div>
      </div>
    </div>
  );
}