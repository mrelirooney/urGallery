import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageShell from "@/components/layout/PageShell";

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
      <body className="min-h-dvh flex flex-col bg-gray-50 text-neutral-900">
        {/* header is sticky already */}
        <Navbar />

        {/* let children fill the width (no centering grid here) */}
        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}

