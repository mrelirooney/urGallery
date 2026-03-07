// frontend/src/components/portfolio/primitives/MediaSlot.tsx
import React from "react";

type MediaSlotProps = {
  src?: string | null;
  alt?: string;
  shape?: "1:1" | "4:5" | "9:16" | "5:4" | "16:9" | "21:9";
  border?: boolean;
  shadow?: boolean;
  align?: "left" | "center" | "right";
};

/**
 * Big canvas media (left side in your screenshot)
 */
export default function MediaSlotC({
  src,
  alt,
  shape = "1:1",
  border = true,
  shadow = false,
  align = "left",
}: MediaSlotProps) {
  // 1) Shape controls the aspect ratio (height is based on width)
  const shapeClass =
    shape === "1:1"
      ? "aspect-square"
      : shape === "4:5"
      ? "aspect-[4/5]"
      : shape === "9:16"
      ? "aspect-[9/16]"
      : shape === "5:4"
      ? "aspect-[5/4]"
      : shape === "21:9"
      ? "aspect-[21/9]"
      : "aspect-[16/9]";

  // 2) Optional styling flags
  const borderClass = border ? "border border-neutral-700" : "";
  const shadowClass = shadow ? "shadow-lg md:shadow-[0_0_0_15px_var(--artist-accent,#c96a4a)]" : "";

  // 3) Horizontal alignment inside the column
  const alignClass =
    align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "mr-auto";

  return (
    <div className="justify-self-center md:justify-self-start portfolio-media-shadow">
      <div
        className={`
          ${alignClass}
          max-h-[50vh] lg:max-h-[20vw]  /* tablet: portrait; laptop: square slot ~30vw vibe */
          w-full
          max-w-[65vw] lg:max-w-[20vw]  /* laptop 1024px+: matches square aspect */
          ${shapeClass}      /* aspect ratio = shape */
          flex items-center justify-center overflow-hidden
          bg-neutral-200
          ${borderClass}
          ${shadowClass}
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-neutral-500 text-sm">No image</div>
        )}
      </div>
    </div>
  );
}

/**
 * Smaller/right-side media version
 */
export function MediaSlotR({
  src,
  alt,
  shape = "1:1",
  border = true,
  shadow = false,
  align = "left",
}: MediaSlotProps) {
  const shapeClass =
    shape === "1:1"
      ? "aspect-square"
      : shape === "4:5"
      ? "aspect-[4/5]"
      : shape === "9:16"
      ? "aspect-[9/16]"
      : shape === "5:4"
      ? "aspect-[5/4]"
      : shape === "21:9"
      ? "aspect-[21/9]"
      : "aspect-[16/9]";

  const borderClass = border ? "border border-neutral-700" : "";
  const shadowClass = shadow ? "shadow-lg md:shadow-[0_0_0_15px_var(--artist-accent,#c96a4a)]" : "";

  const alignClass =
    align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "mr-auto";

  return (
    <div className="justify-self-center md:justify-self-start portfolio-media-shadow">
      <div
        className={`
          ${alignClass}
          max-h-[44vh] lg:max-h-[30vh]  /* tablet: portrait; laptop: matches 30vw vibe */
          w-full
          max-w-[43vw]          /* smaller cap than the canvas version */
          ${shapeClass}
          flex items-center justify-center overflow-hidden
          bg-neutral-200
          ${borderClass}
          ${shadowClass}
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-neutral-500 text-sm">No image</div>
        )}
      </div>
    </div>
  );
}
