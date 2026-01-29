"use client";

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

  return (
    <footer className="bg-[var(--background)]">
      <Container className="h-auto md:h-14 flex flex-col md:flex-row items-center justify-space-between md:justify-between text-xs text-neutral-600 max-w-6xl py-3 md:py-0 gap-1 md:gap-0">
        {/* Mobile: Links first, Desktop: Links on right */}
        <nav className="flex items-center gap-12 order-1 md:order-2">
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-[var(--light-brown)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: Copyright below, Desktop: Copyright on left */}
        <div className="whitespace-nowrap order-2 md:order-1">
          <span>&copy; urGallery {year} </span>
          <span className="rounded-sm bg-neutral-800 px-2 py-0.5 text-[10px] leading-none text-neutral-600">
            v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}
          </span>
        </div>
      </Container>
    </footer>
  );
}