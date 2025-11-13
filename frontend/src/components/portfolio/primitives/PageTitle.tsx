import React from 'react'

type PageTitleProps = {
  text: string;                // The actual title text
  align?: "left" | "center" | "right";   // Optional alignment
  size?: "xs" | "sm" | "md" | "lg";   // Optional font size options
  color?: string;              // Optional Tailwind text color (like "text-white" or "text-gray-200")
};

export default function PageTitle({ text, align = "left", size = "lg", color = "text-neutral-200",}: PageTitleProps) {
  const sizeClass =
    size === "xs" ? "text-sm" :
    size === "sm" ? "text-xl" :
    size === "md" ? "text-3xl" :
    size === "lg" ? "text-5xl" :
    "text-7xl";
  const alignClass =
    align === "center" ? "text-center" :
    align === "right" ? "text-right" :
    "text-left";
  return (
    <h1 className={`${sizeClass} ${alignClass} ${color} font-bold`}>
      {text}
    </h1>
  )
}
