"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isEditorPage = pathname?.includes("/edit");
  const isSettingsPage = pathname?.startsWith("/settings");
  
  if (isEditorPage || isSettingsPage) {
    return null;
  }
  
  return <Navbar />;
}