import React from 'react'

type PageDesProps = {
  text: string;                // The actual title text
  align?: "left" | "center" | "right";   // Optional alignment
  size?: "sx" | "sm" | "md" | "lg";   // Optional font size options
  color?: string;              // Optional Tailwind text color (like "text-white" or "text-gray-200")
};

export default function PageDescription({ text, align = "left", size = "sm", color = "text-neutral-200",}: PageDesProps) {
  const sizeClass =
    size === "sx" ? "text-sm" :
    size === "sm" ? "text-xl" :
    size === "md" ? "text-3xl" :
    size === "lg" ? "text-5xl" :
    "text-7xl";
  const alignClass =
    align === "center" ? "text-center" :
    align === "right" ? "text-right" :
    "text-left";
  return (
    <div>
        <p className={`${sizeClass} ${alignClass} ${color}`}>
          {text}
        </p>
    </div>
  )
}
