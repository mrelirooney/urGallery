"use client";

export type SettingsSection =
  | "profile"
  | "customization"
  | "contact"
  | "saves"
  | "security"
  | "resume"
  | "about"
  | "terms"
  | "privacy"
  | "help"
  | "admin";

export const SETTINGS_MENU_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "customization", label: "Customization" },
  { id: "contact", label: "Discoverability" },
  { id: "saves", label: "Saves" },
  { id: "security", label: "Security" },
  { id: "resume", label: "Resume" },
  { id: "about", label: "About" },
  { id: "terms", label: "Terms" },
  { id: "privacy", label: "Privacy" },
  { id: "help", label: "Help" },
];

export function getSettingsMenuItems(isSuperuser?: boolean) {
  if (!isSuperuser) return SETTINGS_MENU_ITEMS;
  return [...SETTINGS_MENU_ITEMS, { id: "admin" as const, label: "Admin" }];
}

export const SETTINGS_SECTION_LABELS: Record<SettingsSection, string> = {
  profile: "Profile",
  customization: "Customization",
  contact: "Discoverability",
  saves: "Portfolio Saves",
  security: "Security",
  resume: "Resume",
  about: "About",
  terms: "Terms",
  privacy: "Privacy",
  help: "Help",
  admin: "Admin",
};

export function isSettingsSection(value: string | null): value is SettingsSection {
  return getSettingsMenuItems(true).some((item) => item.id === value);
}
