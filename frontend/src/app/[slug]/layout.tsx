import type { ReactNode } from "react";
import { getArtistLanding } from "@/lib/api/artistLanding";

type LayoutProps = {
  params: Promise<{ slug: string }>;
  children: ReactNode;
};

/**
 * Injects theme CSS variables before first paint to prevent white flash
 * at top/bottom (behind fixed navbar/footer) before ColorThemeSetter runs.
 */
export default async function ArtistLayout({ params, children }: LayoutProps) {
  const { slug } = await params;
  const data = await getArtistLanding(slug);

  if (!data?.profile) {
    return <>{children}</>;
  }

  const profileBg = data.profile.background_color || "#faf7f2";
  const portfolioBg = data.profile.text_color || "#11100e";
  const gradient = `linear-gradient(to bottom, ${profileBg}, ${portfolioBg})`;

  // Inline script runs when parsed, before React hydrates - prevents white flash
  const script = `(function(){var d=document.documentElement;d.style.setProperty('--body-background',${JSON.stringify(gradient)});d.style.setProperty('background',${JSON.stringify(profileBg)});})();`;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: script }}
        suppressHydrationWarning
      />
      {children}
    </>
  );
}
