// frontend/src/components/portfolio/primitives/MediaSlot.tsx
import React from "react";

type MediaSlotProps = {
  src: string;
  alt: string;
  shape?: "1:1" | "4:5" | "9:16" | "5:4" | "16:9";
  border?: boolean;
  shadow?: boolean;
  align?: "left" | "center" | "right";
};

export default function MediaSlotC({src, alt, shape = "1:1", border = true, shadow = true, align = "left"}: MediaSlotProps) {
  const shapeClass =
    shape === "1:1" ? "aspect-square" :
    shape === "4:5" ? "aspect-[4/5]" :
    shape === "9:16" ? "aspect-[9/16]" :
    shape === "5:4" ? "aspect-[5/4]" :
    "aspect-[16/9]";

  const widthClass =
    shape === "1:1"  ? "w-[520px]" :
    shape === "4:5"  ? "w-[380px]" :
    shape === "9:16" ? "w-[340px]" :
    shape === "5:4"  ? "w-[560px]" :
    shape === "16:9" ? "w-[600px]" :
                       "w-[480px]" ;

  const heightClass =
    shape === "1:1"  ? "h-[520px]" :
    shape === "4:5"  ? "h-[520px]" :
    shape === "9:16" ? "h-[520px]" :
    shape === "5:4"  ? "h-[520px]" :
    shape === "16:9" ? "h-[338px]" :
                        "h-[520px]";

  const borderClass = border ? "border border-neutral-700" : "";
  const shadowClass = shadow ? "shadow-lg" : "";

  const alignClass =
    align === "center" ? "mx-auto" :
    align === "right"  ? "ml-auto" : "mr-auto";

  return (
    <div className={`justify-self-center md:justify-self-start overflow-hidden`}>
      <div className={`max-h-[63vh] ${widthClass} ${heightClass} ${alignClass} flex items-center justify-center bg-neutral-200 ${borderClass} ${shadowClass}`}>
        <img src={src} alt={alt} className="h-full w-auto object-contain" />
      </div>
  </div>
  );
}

export function MediaSlotR({src, alt, shape = "1:1", border = true, shadow = true, align = "left"}: MediaSlotProps) {
  const shapeClass =
    shape === "1:1" ? "aspect-square" :
    shape === "4:5" ? "aspect-[4/5]" :
    shape === "9:16" ? "aspect-[9/16]" :
    shape === "5:4" ? "aspect-[5/4]" :
    "aspect-[16/9]";

  const widthClass =
    shape === "1:1"  ? "w-[325px]" :
    shape === "4:5"  ? "w-[260px]" :
    shape === "9:16" ? "w-[182px]" :
    shape === "5:4"  ? "w-[406px]" :
    shape === "16:9" ? "w-[578px]" :
                       "w-[480px]";

  const heightClass =
    shape === "1:1"  ? "h-[325px]" :
    shape === "4:5"  ? "h-[325px]" :
    shape === "9:16" ? "h-[325px]" :
    shape === "5:4"  ? "h-[325px]" :
    shape === "16:9" ? "h-[325px]" :
                       "h-[325px]";

  const borderClass = border ? "border border-neutral-700" : "";
  const shadowClass = shadow ? "shadow-lg" : "";

  const alignClass =
    align === "center" ? "mx-auto" :
    align === "right"  ? "ml-auto" : "mr-auto";

  return (
    <div className={`justify-self-center md:justify-self-start overflow-hidden`}>
      <div className={`max-h-[63vh] ${widthClass} ${heightClass} ${alignClass} flex items-center justify-center bg-neutral-200 ${borderClass} ${shadowClass}`}>
        <img src={src} alt={alt} className="h-full w-auto object-contain" />
      </div>
  </div>
  );
}
