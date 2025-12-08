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
  { id: "profile", label: "Profile Information" },
  { id: "customization", label: "Customization" },
  { id: "contact", label: "Contact Information" },
  { id: "about", label: "About" },
  { id: "terms", label: "Terms" },
  { id: "privacy", label: "Privacy" },
  { id: "help", label: "Help" },
];

export default function SettingsNav({ activeSection, onSectionChange }: Props) {
  return (
    <nav className="w-64 border-r border-neutral-800 bg-neutral-900">
      <ul className="py-4">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSectionChange(item.id)}
              className={`w-full text-left px-6 py-3 transition-colors ${
                activeSection === item.id
                  ? "bg-neutral-800 text-white font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}


