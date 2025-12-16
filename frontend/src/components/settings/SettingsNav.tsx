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
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-white">
      <nav className="w-64 border-r border-neutral-800 bg-neutral-900 flex-1 overflow-y-auto">
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
    </div>
  );
}






