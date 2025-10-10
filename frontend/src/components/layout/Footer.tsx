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
    <footer className="border-t border-neutral-200 bg-white">
      <Container className="h-12 flex items-center justify-between text-xs text-neutral-600 max-sm:flex-wrap max-sm:justify-center max-sm:gap-x-4 max-sm:gap-y-1">
        {/* Left: copyright */}
        <div className="whitespace-nowrap">
            <span>&copy; urGallery {year}</span>
            <span className="text-neutral-400">•</span>
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] leading-none text-neutral-600">
            v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}
        </span></div>

        {/* Right: links */}
        <nav className="flex items-center gap-4">
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-neutral-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
