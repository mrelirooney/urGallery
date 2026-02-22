"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isSettingsPage = pathname?.startsWith("/settings");

  if (isSettingsPage) {
    return null;
  }

  return <Footer />;
}
