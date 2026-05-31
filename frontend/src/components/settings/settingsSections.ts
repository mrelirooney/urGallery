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
  | "help";

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
};

export function isSettingsSection(value: string | null): value is SettingsSection {
  return SETTINGS_MENU_ITEMS.some((item) => item.id === value);
}
