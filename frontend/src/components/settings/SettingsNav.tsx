"use client";

import type { SettingsSection } from "./settingsSections";

type MenuItem = { id: SettingsSection; label: string };

type Props = {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  menuItems: MenuItem[];
};

export default function SettingsNav({ activeSection, onSectionChange, menuItems }: Props) {
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
