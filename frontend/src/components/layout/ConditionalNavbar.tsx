"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isEditorPage = pathname?.includes("/edit");
  const isSettingsPage = pathname?.startsWith("/settings");
  const isSvgLayoutTest = pathname?.startsWith("/svg-layout-test");

  if (isEditorPage || isSettingsPage || isSvgLayoutTest) {
    return null;
  }
  
  return <Navbar />;
}