import Image, { type ImageProps } from "next/image";
import type { ComponentProps } from "react";
import UrLogoMarkSvg from "./UrLogoMarkSvg";

// Let CSS control the display size (h/w classes), while Next uses width/height for aspect ratio.

type Props = Omit<ImageProps, "src" | "alt"> & { className?: string };
type LogoMarkProps = { className?: string };

export function LogoPrimary({ className = "", ...rest }: Props) {
  return (
    <div>
      {/* Dark logo for light backgrounds - shown by default */}
      <Image
        src="/Logos/urGalleryLogo-Primary-black-01.png"
        alt="urGallery"
        width={450}
        height={120}
        sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, (max-width: 1024px) 384px, (max-width: 1280px) 512px, (max-width: 1536px) 576px, 640px"
        priority
        className="block dark:hidden object-contain"
        {...rest}
      />
      {/* Light logo for dark backgrounds - shown in dark mode */}
      <Image
        src="/Logos/urGalleryLogo-Primary-white-01.png"
        alt="urGallery"
        width={450}
        height={120}
        sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, (max-width: 1024px) 384px, (max-width: 1280px) 512px, (max-width: 1536px) 576px, 640px"
        priority
        className="hidden dark:block object-contain"
        {...rest}
      />
    </div>
  );
}

/**
 * [ur] logo mark for Navbar. Uses currentColor - parent must set color via
 * style or className (e.g. text-[var(--foreground)] for home, or custom theme color for profile).
 */
export default function LogoMark({ className = "", ...rest }: LogoMarkProps) {
  return (
    <UrLogoMarkSvg
      className={`opacity-60 hover:opacity-90 transition-opacity ${className}`}
      {...rest}
    />
  );
}