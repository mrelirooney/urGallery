"use client";

import { usePathname } from "next/navigation";

function isConstrainedRoute(pathname: string | null): boolean {
  if (!pathname) return true; // default to constrained when unknown
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/saves") ||
    pathname.startsWith("/sandbox") ||
    pathname.startsWith("/svg-layout-test") ||
    pathname === "/about" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/help"
  );
}

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullWidth = !isConstrainedRoute(pathname);

  const containerClass = isFullWidth
    ? "flex-1 flex flex-col w-full min-w-0"
    : "flex-1 flex flex-col w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 min-w-0";

  return <div className={containerClass}>{children}</div>;
}
