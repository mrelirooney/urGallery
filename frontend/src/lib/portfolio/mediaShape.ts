import type { MediaShapeType } from "@/components/portfolio/PageRenderer";

/** Tailwind aspect-ratio class for a portfolio media shape. */
export function getMediaAspectClass(shape: MediaShapeType | undefined): string {
  switch (shape) {
    case "1:1":
      return "aspect-square";
    case "4:5":
      return "aspect-[4/5]";
    case "9:16":
      return "aspect-[9/16]";
    case "5:4":
      return "aspect-[5/4]";
    case "21:9":
      return "aspect-[21/9]";
    case "16:9":
      return "aspect-[16/9]";
    default:
      return "aspect-square";
  }
}

/** Cap tall portrait slots so they do not dominate the phone viewport. */
export function getPhoneMediaMaxHeightClass(shape: MediaShapeType | undefined): string {
  if (shape === "9:16" || shape === "4:5") {
    return "max-h-[65vh]";
  }
  if (shape === "1:1") {
    return "max-h-[75vh]";
  }
  return "";
}
