"use client";

import React from "react";
import { LayoutType } from "./PageRenderer";
import {
  HeroLayoutSquare01Template,
  HeroLayoutVertical01Template,
  HeroLayoutHorizontal01Template,
  TextOnlyTemplate,
  MediaOnlyTemplate,
} from "../templates";

interface LayoutPickerModalProps {
  isOpen: boolean;
  currentLayout: LayoutType;
  onClose: () => void;
  onSelectLayout: (layout: LayoutType) => void;
}

const LAYOUT_OPTIONS: {
  value: LayoutType;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "HeroLayoutSquare01", label: "Title Page 2 – Image Right", Icon: HeroLayoutSquare01Template },
  { value: "HeroLayoutVertical01", label: "Title Page – Vertical Image", Icon: HeroLayoutVertical01Template },
  { value: "HeroLayoutHorizontal01", label: "Title Page – Horizontal Image", Icon: HeroLayoutHorizontal01Template },
  { value: "TextOnly", label: "Text Only", Icon: TextOnlyTemplate },
  { value: "TextOnlyCenter", label: "Text Only – Centered", Icon: TextOnlyTemplate },
  { value: "MediaOnly", label: "Media Only", Icon: MediaOnlyTemplate },
  { value: "MediaOnlyVertical", label: "Media Only – Vertical", Icon: MediaOnlyTemplate },
  { value: "MediaOnlyHorizontal", label: "Media Only – Horizontal (16:9)", Icon: MediaOnlyTemplate },
  { value: "MediaOnlyWide", label: "Media Only – Wide (16:9)", Icon: MediaOnlyTemplate },
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="w-full h-24 mb-3 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-[120px] [&_svg]:max-h-[80px]">
                <option.Icon className="text-neutral-100" />
              </div>
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