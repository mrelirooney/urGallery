"use client";

import React from "react";
import { LayoutType } from "./PageRenderer";

interface LayoutPickerModalProps {
  isOpen: boolean;
  currentLayout: LayoutType;
  onClose: () => void;
  onSelectLayout: (layout: LayoutType) => void;
}

const LAYOUT_OPTIONS: { value: LayoutType; label: string }[] = [
  { value: "layout-1", label: "layout-1" },
];

export default function LayoutPickerModal({
  isOpen,
  currentLayout,
  onClose,
  onSelectLayout,
}: LayoutPickerModalProps) {
  const handleSelect = (layout: LayoutType) => {
    onSelectLayout(layout);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Select Page Layout</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {LAYOUT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                px-4 py-3 rounded-lg border-2 transition-all text-left
                ${
                  currentLayout === option.value
                    ? "border-white bg-neutral-800"
                    : "border-neutral-700 hover:border-neutral-500 bg-neutral-800/50"
                }
              `}
            >
              <span className="text-neutral-200 font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
