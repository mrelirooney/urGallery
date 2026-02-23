"use client";

import { useState, useRef } from "react";
import SettingsNav from "@/components/settings/SettingsNav";
import ProfileInformation from "@/components/settings/ProfileInformation";
import ContactInformation from "@/components/settings/ContactInformation";
import CustomizationSection from "@/components/settings/CustomizationSection";
import AboutSection from "@/components/settings/AboutSection";
import TermsSection from "@/components/settings/TermsSection";
import PrivacySection from "@/components/settings/PrivacySection";
import HelpSection from "@/components/settings/HelpSection";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";

type SettingsSection = 
  | "profile" 
  | "customization" 
  | "contact" 
  | "about" 
  | "terms" 
  | "privacy" 
  | "help";

const MENU_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "customization", label: "Customization" },
  { id: "contact", label: "Contact" },
  { id: "about", label: "About" },
  { id: "terms", label: "Terms" },
  { id: "privacy", label: "Privacy" },
  { id: "help", label: "Help" },
];

const SECTION_LABELS: Record<SettingsSection, string> = {
  profile: "Profile",
  customization: "Customization",
  contact: "Contact",
  about: "About",
  terms: "Terms",
  privacy: "Privacy",
  help: "Help",
};

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [showMenu, setShowMenu] = useState(true); // mobile/tablet: true = menu, false = panel
  const profileSaveRef = useRef<(() => Promise<void>) | null>(null);
  const contactSaveRef = useRef<(() => Promise<void>) | null>(null);
  const customizationSaveRef = useRef<(() => Promise<void>) | null>(null);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  const handleCancel = () => {
    // On mobile: if we have a profile slug, go to profile and refresh so changes show
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

  const handleBackToMenu = async () => {
    // Phone only: auto-save before returning to menu so changes persist
    const isPhone = typeof window !== "undefined" && window.innerWidth < 768;
    if (isPhone) {
      if (activeSection === "profile" && profileSaveRef.current) {
        await profileSaveRef.current();
      } else if (activeSection === "contact" && contactSaveRef.current) {
        await contactSaveRef.current();
      } else if (activeSection === "customization" && customizationSaveRef.current) {
        await customizationSaveRef.current();
      }
    }
    setShowMenu(true);
  };

  const handleCancelToMenu = () => {
    setShowMenu(true);
  };

  const handleDone = async () => {
    // Call save handler if it exists (for profile section)
    if (activeSection === "profile" && profileSaveRef.current) {
      await profileSaveRef.current();
      
      // Navigate to user's profile page and refresh
      if (user?.slug) {
        router.push(`/${user.slug}`);
        // Refresh the page after navigation completes
        setTimeout(() => {
          router.refresh();
        }, 200);
      } else {
        router.back();
      }
    } else if (activeSection === "contact" && contactSaveRef.current) {
      await contactSaveRef.current();
      if (user?.slug) {
        router.push(`/${user.slug}`);
        setTimeout(() => {
          router.refresh();
        }, 200);
      } else {
        router.back();
      }
    } else if (activeSection === "customization" && customizationSaveRef.current) {
      await customizationSaveRef.current();
      if (user?.slug) {
        router.push(`/${user.slug}`);
        setTimeout(() => {
          router.refresh();
        }, 200);
      } else {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className={`border-b border-neutral-200 dark:border-neutral-800 bg-[var(--background)] lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-10 ${!showMenu ? "fixed top-0 left-0 right-0 z-10" : ""}`}>
        <div className={`mx-auto max-w-7xl py-4 flex items-center justify-between ${!showMenu ? "px-4 sm:px-6 md:px-10 lg:px-16" : "px-0 lg:px-6"}`}>
          {/* Mobile/tablet: Cancel | Settings when in menu; Back | Section | Done when in panel */}
          <div className="flex flex-1 min-w-0 items-center gap-4 lg:hidden">
            {showMenu ? (
              <>
                {/* Mobile (< md): Back left + Settings title right */}
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
                {/* Tablet (md to lg): Back left + Settings centered */}
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
              <>
                {/* Mobile (< md): Back left + title right, auto-save on Back */}
                <div className="flex items-center w-full md:hidden">
                  <button
                    onClick={handleBackToMenu}
                    className="p-2 -ml-2 text-[var(--foreground)] opacity-70 shrink-0"
                    aria-label="Back"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div className="flex-1 min-w-0" />
                  <h1 className="text-2xl font-bold text-[var(--light-brown)] shrink-0">{SECTION_LABELS[activeSection]}</h1>
                </div>
                {/* Tablet+ (md to lg): Cancel + title + Done */}
                <div className="hidden md:flex items-center gap-4 w-full">
                  <button
                    onClick={handleCancelToMenu}
                    className="px-0 py-2] text-[var(--foreground)] opacity-70 rounded-xs"
                  >
                    Cancel
                  </button>
                  <h1 className="flex-1 text-center text-2xl font-bold text-[var(--light-brown)]">{SECTION_LABELS[activeSection]}</h1>
                  <button
                    onClick={handleDone}
                    className="px-4 py-2 bg-[color:var(--light-brown)] text-[var(--background)] rounded-xs font-medium shrink-0"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Desktop: Settings | Cancel + Done */}
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
                className="px-4 py-2 bg-[color:var(--light-brown)] text-[var(--background)] rounded-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - pt offsets for fixed header (panel view on mobile, always on desktop) */}
      <div className={`flex min-h-[calc(100vh-73px)] ${showMenu ? "lg:pt-[73px]" : "pt-[73px]"}`}>
        {/* Mobile/Tablet: Menu or Panel */}
        <div className="lg:hidden flex-1 flex flex-col min-w-0">
          {showMenu ? (
            <div className="flex-1 bg-[var(--background)] overflow-y-auto">
              <ul className="pb-4">
                {MENU_ITEMS.map((item) => (
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
          ) : (
            <div className="flex-1 bg-[var(--background)] overflow-y-auto min-w-0">
              {activeSection === "profile" && (
                <ProfileInformation 
                  onSaveRef={(saveFn) => { profileSaveRef.current = saveFn; }}
                  onSaveComplete={() => {}}
                />
              )}
              {activeSection === "contact" && (
                <ContactInformation onSaveRef={(saveFn) => { contactSaveRef.current = saveFn; }} />
              )}
              {activeSection === "customization" && (
                <CustomizationSection onSaveRef={(saveFn) => { customizationSaveRef.current = saveFn; }} />
              )}
              {activeSection === "about" && <AboutSection />}
              {activeSection === "terms" && <TermsSection />}
              {activeSection === "privacy" && <PrivacySection />}
              {activeSection === "help" && <HelpSection />}
            </div>
          )}
        </div>

        {/* Desktop: Left Navigation + Right Content - full width to align with nav bar and footer */}
        <div className="hidden lg:flex flex-1 min-w-0">
          <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />
          <div className="flex-1 bg-[var(--background)] min-w-0 overflow-y-auto">
            {activeSection === "profile" && (
              <ProfileInformation 
                onSaveRef={(saveFn) => { profileSaveRef.current = saveFn; }}
                onSaveComplete={() => {}}
              />
            )}
            {activeSection === "contact" && (
              <ContactInformation onSaveRef={(saveFn) => { contactSaveRef.current = saveFn; }} />
            )}
            {activeSection === "customization" && (
              <CustomizationSection onSaveRef={(saveFn) => { customizationSaveRef.current = saveFn; }} />
            )}
            {activeSection === "about" && <AboutSection />}
            {activeSection === "terms" && <TermsSection />}
            {activeSection === "privacy" && <PrivacySection />}
            {activeSection === "help" && <HelpSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

