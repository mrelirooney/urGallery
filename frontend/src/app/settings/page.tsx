"use client";

import { useState, useRef } from "react";
import SettingsNav from "@/components/settings/SettingsNav";
import ProfileInformation from "@/components/settings/ProfileInformation";
import ContactInformation from "@/components/settings/ContactInformation";
import AboutSection from "@/components/settings/AboutSection";
import TermsSection from "@/components/settings/TermsSection";
import PrivacySection from "@/components/settings/PrivacySection";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

type SettingsSection = 
  | "profile" 
  | "customization" 
  | "contact" 
  | "about" 
  | "terms" 
  | "privacy" 
  | "help";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const profileSaveRef = useRef<(() => Promise<void>) | null>(null);
  const contactSaveRef = useRef<(() => Promise<void>) | null>(null);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  const handleCancel = () => {
    router.back();
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
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left Navigation */}
        <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Right Content Area */}
        <div className="flex-1 bg-white">
          {activeSection === "profile" && (
            <ProfileInformation 
              onSaveRef={(saveFn) => {
                profileSaveRef.current = saveFn;
              }}
              onSaveComplete={() => {
                // This will be called after save completes
                // Navigation happens in handleDone
              }}
            />
          )}
          {activeSection === "contact" && (
            <ContactInformation 
              onSaveRef={(saveFn) => {
                contactSaveRef.current = saveFn;
              }}
            />
          )}
          {activeSection === "customization" && (
            <div className="p-8">
              <p className="text-neutral-500">Coming soon lol...</p>
            </div>
          )}
          {activeSection === "about" && <AboutSection />}
          {activeSection === "terms" && <TermsSection />}
          {activeSection === "privacy" && <PrivacySection />}
          {activeSection === "help" && (
            <div className="p-8">
              <p className="text-neutral-500">Coming soon lol...Just send me email with all your questions or critiques for now.</p>
              <p className="text-neutral-500">Email: <a href="mailto:mrelirooney@gmail.com">mrelirooney@gmail.com</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

