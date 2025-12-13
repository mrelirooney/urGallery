import Image, { type ImageProps } from "next/image";
import type { ComponentProps } from "react";

// Let CSS control the display size (h/w classes), while Next uses width/height for aspect ratio.

type Props = Omit<ImageProps, "src" | "alt"> & { className?: string };

export function LogoPrimary({ className = "", ...rest }: Props) {
  return (
    <div>
      {/* Dark logo for light backgrounds - shown by default */}
      <Image
        src="/Logos/urGalleryLogo-Primary-black-01.png"
        alt="urGallery"
        width={450}
        height={120}
        sizes="(max-width: 640px) 256px, (max-width: 1024px) 384px, 512px"
        priority
        className="block dark:hidden"
        {...rest}
      />
      {/* Light logo for dark backgrounds - shown in dark mode */}
      <Image
        src="/Logos/urGalleryLogo-Primary-white-01.png"  // Update this path to your light logo filename
        alt="urGallery"
        width={450}
        height={120}
        sizes="(max-width: 640px) 256px, (max-width: 1024px) 384px, 512px"
        priority
        className="hidden dark:block"
        {...rest}
      />
    </div>
  );
}

export default function LogoMark({ className = "", ...rest }: Props) {
  return (
    <div>
    {/* Dark logo for light backgrounds - shown by default */}
      <Image
      src="/Logos/urGalleryLogo-Secondary-ur-black.png"
      alt="ur"
      width={35}
      height={35}
      sizes="38px"
      priority
      className="block dark:hidden opacity-60 hover:opacity-90 transition-opacity"
      {...rest}
      />
    {/* Light logo for dark backgrounds - shown in dark mode */}
      <Image
      src="/Logos/urGalleryLogo-Secondary-ur-white.png"  // Update this path to your light logo filename
      alt="urGallery"
      width={35}
      height={35}
      sizes="38px"
      priority
      className="hidden dark:block opacity-60 hover:opacity-90 transition-opacity"
      {...rest}
      />
    </div>
  );
}