"use client";

import { GripVertical, X } from "lucide-react";

type SettingsSection = 
  | "profile" 
  | "customization" 
  | "contact" 
  | "about" 
  | "terms" 
  | "privacy" 
  | "help";

type Props = {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
};

const menuItems: { id: SettingsSection; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "customization", label: "Customization" },
  { id: "contact", label: "Contact" },
  { id: "about", label: "About" },
  { id: "terms", label: "Terms" },
  { id: "privacy", label: "Privacy" },
  { id: "help", label: "Help" },
];

export default function SettingsNav({ activeSection, onSectionChange }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <nav className="lg:w-[20%] xl:w-[5%] border-r border-neutral-200 dark:border-neutral-800 bg-[var(--background)] flex-1 overflow-y-auto">
        <ul className="py-4">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full text-left pl-0 pr-12 py-3 ${
                  activeSection === item.id
                    ? "font-semibold text-[var(--light-brown)]"
                    : "text-[var(--foreground)] opacity-70"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}













