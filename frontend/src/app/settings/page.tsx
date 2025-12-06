"use client";

import { useState } from "react";
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

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  const handleCancel = () => {
    router.back();
  };

  const handleDone = () => {
    // TODO: Save changes when backend is connected
    router.back();
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
          {activeSection === "profile" && <ProfileInformation />}
          {activeSection === "contact" && <ContactInformation />}
          {activeSection === "customization" && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Customization</h2>
              <p className="text-neutral-500">Coming soon...</p>
            </div>
          )}
          {activeSection === "about" && <AboutSection />}
          {activeSection === "terms" && <TermsSection />}
          {activeSection === "privacy" && <PrivacySection />}
          {activeSection === "help" && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Help</h2>
              <p className="text-neutral-500">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

