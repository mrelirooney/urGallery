import Image, { type ImageProps } from "next/image";
import type { ComponentProps } from "react";

// Let CSS control the display size (h/w classes), while Next uses width/height for aspect ratio.

type Props = Omit<ImageProps, "src" | "alt"> & { className?: string };

export function LogoPrimary({ className = "", ...rest }: Props) {
  return (
    <Image
      src="/Logos/urGalleryLogo-Primary-black.png"
      alt="urGallery"
      // intrinsic pixel size of the asset (any reasonable ratio works)
      width={1200}
      height={320}
      sizes="(max-width: 640px) 256px, (max-width: 1024px) 384px, 512px"
      priority
      className={className}
      {...rest}
    />
  );
}

export default function LogoMark({ className = "", ...rest }: Props) {
  return (
    <Image
      src="/Logos/urGalleryLogo-Secondary-ur-black.png"
      alt="ur"
      width={35}
      height={35}
      sizes="38px"
      priority
      {...rest}
    />
  );
}