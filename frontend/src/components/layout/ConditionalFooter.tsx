"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isSettingsPage = pathname?.startsWith("/settings");
  const isSvgLayoutTest = pathname?.startsWith("/svg-layout-test");

  if (isSettingsPage || isSvgLayoutTest) {
    return null;
  }

  return <Footer />;
}
