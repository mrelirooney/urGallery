import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import ColorThemeGuard from "@/components/artist/ColorThemeGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "urGallery",
  description: "Made By Creatives, Made For Creatives.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={raleway.variable}>
      <body className="min-h-dvh flex flex-col bg-[var(--artist-background,var(--background))] text-neutral-900">
        <ColorThemeGuard />
        {/* Shared page container: constrained for app routes, full-width for profile/portfolio */}
        <LayoutWrapper>
          <ConditionalNavbar />
          <main className="flex-1 flex flex-col min-h-0 min-w-0">
            {children}
          </main>
          <ConditionalFooter />
        </LayoutWrapper>
      </body>
    </html>
  );
}

