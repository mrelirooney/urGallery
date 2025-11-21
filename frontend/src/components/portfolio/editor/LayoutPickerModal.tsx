"use client";

import React from "react";
import { LayoutType } from "./PageRenderer";

interface LayoutPickerModalProps {
  isOpen: boolean;
  currentLayout: LayoutType;
  onClose: () => void;
  onSelectLayout: (layout: LayoutType) => void;
}

const LAYOUT_OPTIONS: { value: LayoutType; label: string; icon: string }[] = [
  { value: "MediaLeft_TextRight", label: "Media Left • Text Right", icon: "◧" },
  { value: "MediaRight_TextLeft", label: "Media Right • Text Left", icon: "◨" },
  { value: "MediaTop_TextBottom", label: "Media Top • Text Bottom", icon: "⬒" },
  { value: "MediaBottom_TextTop", label: "Media Bottom • Text Top", icon: "⬓" },
  { value: "TextOnly", label: "Text Only", icon: "≡" },
  { value: "MediaOnly", label: "Media Only", icon: "▭" },
];

export default function LayoutPickerModal({
  isOpen,
  currentLayout,
  onClose,
  onSelectLayout,
}: LayoutPickerModalProps) {
  if (!isOpen) return null;

  const handleSelect = (layout: LayoutType) => {
    onSelectLayout(layout);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 max-w-4xl w-full mx-4"
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {LAYOUT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                p-6 rounded-lg border-2 transition-all
                ${
                  currentLayout === option.value
                    ? "border-white bg-neutral-800"
                    : "border-neutral-700 hover:border-neutral-500 bg-neutral-800/50"
                }
              `}
            >
              <div className="text-5xl mb-3">{option.icon}</div>
              <div className="text-sm text-neutral-200 font-medium">
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}