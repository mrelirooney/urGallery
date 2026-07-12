"use client";

import { usePathname } from "next/navigation";

export default function MainWithPadding({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar =
    pathname?.includes("/edit") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/svg-layout-test");
  const hideFooter =
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/svg-layout-test");
  const isArtistPage =
    pathname &&
    pathname !== "/" &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/signup") &&
    !pathname.startsWith("/settings") &&
    !pathname.startsWith("/sandbox") &&
    !pathname.startsWith("/saves") &&
    /^\/[^/]+(\/[^/]+)*$/.test(pathname);

  const pt = hideNavbar ? "" : "pt-12 sm:pt-14";
  const pb = hideFooter
    ? ""
    : isArtistPage
      ? "pb-0 md:pb-14"
      : "pb-14";

  return (
    <main
      className={`flex-1 flex flex-col min-h-0 min-w-0 ${pt} ${pb}`.trim()}
    >
      {children}
    </main>
  );
}
