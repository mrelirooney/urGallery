import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import ColorThemeGuard from "@/components/artist/ColorThemeGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "urGallery",
  description: "Made By Creatives, Made For Creatives.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col bg-[var(--background)] text-neutral-900">
        <ColorThemeGuard />
        {/* header is sticky already */}
        <ConditionalNavbar />

        {/* let children fill the width (no centering grid here) */}
        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}

