"use client";

import { useState, useRef, useEffect } from "react";
import SettingsNav from "@/components/settings/SettingsNav";
import ProfileInformation from "@/components/settings/ProfileInformation";
import ContactInformation from "@/components/settings/ContactInformation";
import CustomizationSection from "@/components/settings/CustomizationSection";
import AboutSection from "@/components/settings/AboutSection";
import TermsSection from "@/components/settings/TermsSection";
import PrivacySection from "@/components/settings/PrivacySection";
import HelpSection from "@/components/settings/HelpSection";
import SecuritySection from "@/components/settings/SecuritySection";
import ResumeSection from "@/components/settings/ResumeSection";
import SavesSection from "@/components/settings/SavesSection";
import {
  type SettingsSection,
  SETTINGS_MENU_ITEMS,
  SETTINGS_SECTION_LABELS,
  isSettingsSection,
} from "@/components/settings/settingsSections";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [showMenu, setShowMenu] = useState(true);
  const profileSaveRefMobile = useRef<(() => Promise<void>) | null>(null);
  const profileSaveRefDesktop = useRef<(() => Promise<void>) | null>(null);
  const contactSaveRefMobile = useRef<(() => Promise<void>) | null>(null);
  const contactSaveRefDesktop = useRef<(() => Promise<void>) | null>(null);
  const customizationSaveRefMobile = useRef<(() => Promise<void>) | null>(null);
  const customizationSaveRefDesktop = useRef<(() => Promise<void>) | null>(null);
  const securitySaveRefMobile = useRef<(() => Promise<void>) | null>(null);
  const securitySaveRefDesktop = useRef<(() => Promise<void>) | null>(null);
  const securityResetRef = useRef<(() => void) | null>(null);
  const resumeSaveRefMobile = useRef<(() => Promise<void>) | null>(null);
  const resumeSaveRefDesktop = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (isSettingsSection(section)) {
      setActiveSection(section);
      setShowMenu(false);
    }
  }, []);

  const isMobileViewport = () => typeof window !== "undefined" && window.innerWidth < 1024;

  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  const handleCancel = () => {
    if (activeSection === "security" && securityResetRef.current) {
      securityResetRef.current();
    }
    if (typeof window !== "undefined" && window.innerWidth < 768 && user?.slug) {
      router.push(`/${user.slug}`);
      setTimeout(() => router.refresh(), 200);
    } else {
      router.back();
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setTimeout(() => router.refresh(), 200);
      }
    }
  };

  const handleSelectSection = (section: SettingsSection) => {
    setActiveSection(section);
    setShowMenu(false);
  };

  const getSaveRef = () => {
    const mobile = isMobileViewport();
    switch (activeSection) {
      case "profile": return mobile ? profileSaveRefMobile.current : profileSaveRefDesktop.current;
      case "contact": return mobile ? contactSaveRefMobile.current : contactSaveRefDesktop.current;
      case "customization": return mobile ? customizationSaveRefMobile.current : customizationSaveRefDesktop.current;
      case "security": return mobile ? securitySaveRefMobile.current : securitySaveRefDesktop.current;
      case "resume": return mobile ? resumeSaveRefMobile.current : resumeSaveRefDesktop.current;
      default: return null;
    }
  };

  const handleCancelToMenu = () => {
    if (activeSection === "security" && securityResetRef.current) {
      securityResetRef.current();
    }
    setShowMenu(true);
  };

  const handleDone = async () => {
    const saveFn = getSaveRef();
    if (saveFn) {
      await saveFn();
    }
    if (user?.slug) {
      router.push(`/${user.slug}`);
      setTimeout(() => router.refresh(), 200);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className={`border-b border-neutral-200 dark:border-neutral-800 bg-[var(--background)] lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-10 ${!showMenu ? "fixed top-0 left-0 right-0 z-10" : ""}`}>
        <div className={`mx-auto max-w-7xl lg:max-w-6xl py-4 flex items-center justify-between ${!showMenu ? "px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20" : "px-0 lg:px-0"}`}>
          <div className="flex flex-1 min-w-0 items-center gap-4 lg:hidden">
            {showMenu ? (
              <>
                <div className="flex items-center w-full md:hidden">
                  <button
                    onClick={handleCancel}
                    className="p-2 -ml-2 text-[var(--foreground)] opacity-70 shrink-0"
                    aria-label="Back"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div className="flex-1 min-w-0" />
                  <h1 className="text-2xl font-bold text-[var(--light-brown)] shrink-0">Settings</h1>
                </div>
                <div className="hidden md:flex items-center w-full">
                  <button
                    onClick={handleCancel}
                    className="p-2 -ml-2 text-[var(--foreground)] opacity-70 shrink-0"
                    aria-label="Back"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <h1 className="flex-1 text-center text-2xl font-bold text-[var(--light-brown)]">Settings</h1>
                  <div className="w-10 shrink-0" />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 w-full">
                <button
                  onClick={handleCancelToMenu}
                  className="px-2 py-2 text-[var(--foreground)] opacity-70 rounded-xs shrink-0"
                >
                  Cancel
                </button>
                <h1 className="flex-1 text-center text-lg sm:text-xl md:text-2xl font-bold text-[var(--light-brown)] min-w-0 truncate">
                  {SETTINGS_SECTION_LABELS[activeSection]}
                </h1>
                <button
                  onClick={handleDone}
                  className="px-4 py-2 bg-[color:var(--light-brown)] text-[var(--foreground)] rounded-xs font-medium shrink-0"
                >
                  Done
                </button>
              </div>
            )}
          </div>
          <div className="hidden lg:flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold text-[var(--light-brown)]">Settings</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-[var(--foreground)] opacity-70"
              >
                Cancel
              </button>
              <button
                onClick={handleDone}
                className="px-4 py-2 bg-[color:var(--light-brown)] text-[var(--foreground)] rounded-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`flex min-h-[calc(100vh-73px)] ${showMenu ? "lg:pt-[73px]" : "pt-[73px]"}`}>
        <div className="lg:hidden flex-1 flex flex-col min-w-0">
          <div className={`flex-1 bg-[var(--background)] overflow-y-auto ${showMenu ? "" : "hidden"}`}>
            <ul className="pb-4">
              {SETTINGS_MENU_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelectSection(item.id)}
                    className="w-full flex items-center justify-between px-0 py-4 lg:px-6 text-left text-[var(--foreground)] border-b border-neutral-200 dark:border-neutral-800"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={20} className="opacity-50" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className={`flex-1 bg-[var(--background)] overflow-y-auto min-w-0 ${showMenu ? "hidden" : ""}`}>
            <div className={activeSection === "profile" ? "" : "hidden"}>
              <ProfileInformation
                onSaveRef={(saveFn) => { profileSaveRefMobile.current = saveFn; }}
                onSaveComplete={() => {}}
              />
            </div>
            <div className={activeSection === "contact" ? "" : "hidden"}>
              <ContactInformation onSaveRef={(saveFn) => { contactSaveRefMobile.current = saveFn; }} />
            </div>
            <div className={activeSection === "saves" ? "" : "hidden"}>
              <SavesSection />
            </div>
            <div className={activeSection === "security" ? "" : "hidden"}>
              <SecuritySection
                onSaveRef={(saveFn) => { securitySaveRefMobile.current = saveFn; }}
                onResetRef={(resetFn) => { securityResetRef.current = resetFn; }}
              />
            </div>
            <div className={activeSection === "resume" ? "" : "hidden"}>
              <ResumeSection instanceId="mobile" onSaveRef={(saveFn) => { resumeSaveRefMobile.current = saveFn; }} />
            </div>
            <div className={activeSection === "customization" ? "" : "hidden"}>
              <CustomizationSection onSaveRef={(saveFn) => { customizationSaveRefMobile.current = saveFn; }} />
            </div>
            <div className={activeSection === "about" ? "" : "hidden"}>
              <AboutSection />
            </div>
            <div className={activeSection === "terms" ? "" : "hidden"}>
              <TermsSection />
            </div>
            <div className={activeSection === "privacy" ? "" : "hidden"}>
              <PrivacySection />
            </div>
            <div className={activeSection === "help" ? "" : "hidden"}>
              <HelpSection />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 min-w-0">
          <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />
          <div className="flex-1 bg-[var(--background)] min-w-0 overflow-y-auto">
            <div className={activeSection === "profile" ? "" : "hidden"}>
              <ProfileInformation
                onSaveRef={(saveFn) => { profileSaveRefDesktop.current = saveFn; }}
                onSaveComplete={() => {}}
              />
            </div>
            <div className={activeSection === "contact" ? "" : "hidden"}>
              <ContactInformation onSaveRef={(saveFn) => { contactSaveRefDesktop.current = saveFn; }} />
            </div>
            <div className={activeSection === "saves" ? "" : "hidden"}>
              <SavesSection />
            </div>
            <div className={activeSection === "security" ? "" : "hidden"}>
              <SecuritySection
                onSaveRef={(saveFn) => { securitySaveRefDesktop.current = saveFn; }}
                onResetRef={(resetFn) => { securityResetRef.current = resetFn; }}
              />
            </div>
            <div className={activeSection === "resume" ? "" : "hidden"}>
              <ResumeSection instanceId="desktop" onSaveRef={(saveFn) => { resumeSaveRefDesktop.current = saveFn; }} />
            </div>
            <div className={activeSection === "customization" ? "" : "hidden"}>
              <CustomizationSection onSaveRef={(saveFn) => { customizationSaveRefDesktop.current = saveFn; }} />
            </div>
            <div className={activeSection === "about" ? "" : "hidden"}>
              <AboutSection />
            </div>
            <div className={activeSection === "terms" ? "" : "hidden"}>
              <TermsSection />
            </div>
            <div className={activeSection === "privacy" ? "" : "hidden"}>
              <PrivacySection />
            </div>
            <div className={activeSection === "help" ? "" : "hidden"}>
              <HelpSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
