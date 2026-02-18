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

  return (
    <footer style={{ backgroundColor: footerBg, position: 'relative', zIndex: 50 }}>
      <Container className="h-auto md:h-14 flex flex-col md:flex-row items-center justify-space-between md:justify-between text-xs max-w-6xl px-16 py-3 md:py-0 gap-1 md:gap-0 opacity-70">
        {/* Mobile: Links first, Desktop: Links on right */}
        <nav className="flex items-center gap-12 order-1 md:order-2">
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
        <div className="whitespace-nowrap order-2 md:order-1" style={{ color: footerText }}>
          <span>&copy; urGallery {year} </span>
          <span 
            className="rounded-sm px-2 py-0.5 text-[10px] leading-none"
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