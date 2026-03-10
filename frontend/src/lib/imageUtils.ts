export type ResizeImageOptions = {
  /** Max px on longest side. Default 2400 for portfolio/banner. Use 512 for avatars. */
  maxDimension?: number;
  /** JPEG quality 0–1. Default 0.82. */
  quality?: number;
  /** Skip resize if file smaller than this (bytes). Default 2MB. */
  sizeThreshold?: number;
};

const DEFAULTS: Required<ResizeImageOptions> = {
  maxDimension: 2400,
  quality: 0.82,
  sizeThreshold: 2_000_000,
};

/**
 * Resize an image file for web display.
 * Portfolio/banner: 2400px, 82% quality.
 * Avatar: 512px, 85% quality (profile pics displayed small).
 */
export async function resizeImageForUpload(
  file: File,
  options: ResizeImageOptions = {}
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const { maxDimension, quality, sizeThreshold } = { ...DEFAULTS, ...options };
  if (file.size < sizeThreshold) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension) {
        resolve(file);
        return;
      }

      const scale = Math.min(maxDimension / width, maxDimension / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // White background for transparent PNGs (JPEG doesn't support transparency)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const resized = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(resized);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/** Avatar preset: 512px max, 85% quality, resize if over 300KB */
export const AVATAR_RESIZE_OPTIONS: ResizeImageOptions = {
  maxDimension: 512,
  quality: 0.85,
  sizeThreshold: 300_000,
};

/** Banner preset: same as portfolio (2400px, 82%) */
export const BANNER_RESIZE_OPTIONS: ResizeImageOptions = {
  maxDimension: 2400,
  quality: 0.82,
  sizeThreshold: 2_000_000,
};
