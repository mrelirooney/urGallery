"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Container from "./Container";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/help", label: "Help" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const [customColors, setCustomColors] = useState<{
    background: string;
    foreground: string;
    text: string;
    accent: string;
  } | null>(null);

  useEffect(() => {
    const checkColors = () => {
      const htmlElement = document.documentElement;
      const bgColor = htmlElement.style.getPropertyValue('--artist-background');
      const fgColor = htmlElement.style.getPropertyValue('--artist-foreground');
      const textColor = htmlElement.style.getPropertyValue('--artist-text');
      const accentColor = htmlElement.style.getPropertyValue('--artist-accent');

      if (bgColor && fgColor && textColor && accentColor) {
        setCustomColors({
          background: bgColor.trim(),
          foreground: fgColor.trim(),
          text: textColor.trim(),
          accent: accentColor.trim(),
        });
      } else {
        setCustomColors(null);
      }
    };

    checkColors(); // Initial check

    // Watch for style changes on html element (when ColorThemeSetter applies vars)
    const observer = new MutationObserver(checkColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, [pathname]);

  const footerBg = customColors?.background || 'var(--background)';
  const footerText = customColors?.text || '#6b7280';
  const footerAccent = customColors?.accent || '#c96a4a';

  const isArtistPage = pathname &&
    pathname !== '/' &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup') &&
    !pathname.startsWith('/settings') &&
    !pathname.startsWith('/sandbox') &&
    /^\/[^/]+(\/[^/]+)*$/.test(pathname);

  const containerClass = isArtistPage
    ? "h-auto md:h-14 flex flex-col md:flex-row items-center justify-space-between md:justify-between text-caption max-w-6xl xl:max-w-7xl 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 py-3 md:py-0 gap-3 sm:gap-4 md:gap-0 opacity-70"
    : "h-auto md:h-14 flex flex-col md:flex-row items-center justify-space-between md:justify-between text-caption max-w-full px-0 py-3 md:py-0 gap-3 sm:gap-4 md:gap-0 opacity-70";

  return (
    <footer style={{ backgroundColor: footerBg, position: 'relative', zIndex: 50 }}>
      <Container className={containerClass}>
        {/* Mobile: Links first, Desktop: Links on right */}
        <nav className="flex flex-wrap items-center justify-center sm:justify-center md:justify-end gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 order-1 md:order-2">
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors"
              style={{
                color: footerText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = footerAccent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = footerText;
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: Copyright below, Desktop: Copyright on left */}
        <div className="whitespace-nowrap order-2 md:order-1 text-center md:text-left" style={{ color: footerText }}>
          <span>&copy; urGallery {year} </span>
          <span 
            className="rounded-sm px-2 py-0.5 text-caption leading-none inline-block"
            style={{
              backgroundColor: customColors?.text || '#5a3e36',
              color: footerBg,
              opacity: 0.7,
            }}
          >
            v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}
          </span>
        </div>
      </Container>
    </footer>
  );
}