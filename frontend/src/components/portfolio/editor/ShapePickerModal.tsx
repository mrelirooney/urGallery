"use client";

import React from "react";
import { MediaShapeType } from "./PageRenderer";

interface ShapePickerModalProps {
  isOpen: boolean;
  currentShape: MediaShapeType;
  onClose: () => void;
  onSelectShape: (shape: MediaShapeType) => void;
}

const SHAPE_OPTIONS: { value: MediaShapeType; label: string; aspect: string }[] = [
  { value: "1:1", label: "Square", aspect: "1:1" },
  { value: "16:9", label: "Wide", aspect: "16:9" },
  { value: "21:9", label: "Cinematic", aspect: "21:9" },
  { value: "9:16", label: "Vertical", aspect: "9:16" },
  { value: "4:5", label: "Portrait", aspect: "4:5" },
  { value: "5:4", label: "Landscape", aspect: "5:4" },
];

export default function ShapePickerModal({
  isOpen,
  currentShape,
  onClose,
  onSelectShape,
}: ShapePickerModalProps) {
  if (!isOpen) return null;

  const handleSelect = (shape: MediaShapeType) => {
    onSelectShape(shape);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Select Media Shape</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SHAPE_OPTIONS.map((option) => {
            const isSelected = currentShape === option.value;
            if (!isOpen) return null;
            return (
              <button
                key={option.value ?? "no-media"}
                onClick={() => handleSelect(option.value)}
                className={`
                  p-6 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? "border-white bg-neutral-800"
                      : "border-neutral-700 hover:border-neutral-500 bg-neutral-800/50"
                  }
                `}
              >
                <div className="flex items-center justify-center mb-3">
                  {option.value ? (
                    <div
                      className="border-2 border-neutral-400 bg-neutral-700"
                      style={{
                        width: option.value === "1:1" ? "60px" : option.value === "16:9" ? "80px" : option.value === "9:16" ? "40px" : option.value === "4:5" ? "50px" : option.value === "21:9" ? "80px" :  "70px",
                        height: option.value === "1:1" ? "60px" : option.value === "16:9" ? "45px" : option.value === "9:16" ? "70px" : option.value === "4:5" ? "62px" : option.value === "21:9" ? "35px" : "56px",
                      }}
                    />
                  ) : (
                    <div className="text-5xl text-neutral-500">—</div>
                  )}
                </div>
                <div className="text-sm text-neutral-200 font-medium mb-1">
                  {option.label}
                </div>
                <div className="text-xs text-neutral-500">{option.aspect}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}