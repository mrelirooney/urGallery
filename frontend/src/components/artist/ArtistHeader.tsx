// src/components/artist/ArtistHeader.tsx
"use client";

import type { ArtistLanding } from "@/lib/types";
import { parseContacts, copyToClipboard } from "@/lib/contactUtils";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";
import SaveProfileButton from "@/components/saves/SaveProfileButton";

type Props = { 
  profile?: ArtistLanding["profile"];
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
    profileText?: string;
    accentText?: string;
  };
};

export default function ArtistHeader({ profile, customColors }: Props) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const { user } = useAuth();

  // Lock page scroll when resume modal is open (position: fixed freezes everything)
  useEffect(() => {
    if (resumeModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [resumeModalOpen]);
  const isOwner = Boolean(user?.slug && profile?.slug && user.slug === profile.slug);
  const initial =
    (profile?.display_name || profile?.slug || "?")
      .trim()
      .charAt(0)
      .toUpperCase();

  if (!profile)
    return (
      <div className="text-center text-neutral-500 py-8">
        Loading artist info...
      </div>
    );

  const hasAvatar = Boolean(profile?.avatar_url && profile.avatar_url.length > 0);
  const bannerSrc = profile?.banner_image_url || null;

  // Convert localhost URLs to relative so iframe loads from same origin (Next.js /media/* proxy)
  const resumeSrc =
    profile?.resume_url?.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, "") ||
    profile?.resume_url ||
    "";
  
  // Parse contacts from profile
  const contacts = parseContacts(profile);
  
  const handleContactClick = async (contact: any) => {
    if (contact.platform === 'email') {
      const emailMatch = contact.url.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
      const email = emailMatch ? emailMatch[0] : contact.url;
      
      const success = await copyToClipboard(email);
      if (success) {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    } else {
      // Open URL in new tab

      window.open(contact.url.startsWith('http') ? contact.url : `https://${contact.url}`, '_blank');
    }
  };
  
  return (
    <div id="artist-profile" data-probe="ArtistHeader-V3" className="relative pt-8 md:pt-24">
      {/* Content Container */}
      <div className="relative">
        {/* Top: Avatar - left aligned on mobile */}
        <div className="flex justify-start">
          <div className="h-25 w-25 md:h-56 md:w-56 rounded-full overflow-hidden border-3"
            style={{ borderColor: customColors?.background || '#faf7f2' }}
          >
            {hasAvatar ? (
              <img
                src={profile!.avatar_url!}
                alt={`${profile?.display_name ?? "Artist"} avatar`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: 'rgb(130, 130, 130)',
                }}
              />
            )}
          </div>
        </div>
        <br></br>
        {/* Bottom: Name / Title / Contacts / Location */}
        <div className="flex flex-col md:justify-center md:text-left -mt-2">
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide"
          style={{ color: customColors?.profileText ?? customColors?.text ?? 'var(--foreground)' }}
        >
            {profile?.display_name ?? "Unknown Artist"}
          </h1>
          <p 
            className="mt-1 text-sm sm:text-md md:text-lg"
            style={{ color: customColors?.profileText ?? customColors?.text ?? 'var(--foreground)' }}
          >{profile?.title ?? ""}</p>

        <p 
          className="mt-1 text-xs sm:text-sm md:text-base"
          style={{ color: customColors?.profileText ?? customColors?.text ?? 'var(--foreground)' }}
        >
          {profile?.location ?? ""}
        </p>
        
        {/* Save + Contact buttons */}
        <div className="mt-3 mb-2 md:mt-2 flex md:justify-start gap-3 relative items-center">
            {profile?.slug && (
              <SaveProfileButton
                artistSlug={profile.slug}
                customColors={customColors}
              />
            )}
            {contacts.length > 0 && contacts.map((contact, i) => (
              <button
                key={i}
                onClick={() => handleContactClick(contact)}
                className="h-8 w-8 md:h-10 md:w-10 rounded-xs flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: customColors?.profileText ?? customColors?.text ?? '#faf7f2',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = customColors?.accent || '#c96a4a';
                  e.currentTarget.style.color = customColors?.accentText ?? customColors?.profileText ?? '#faf7f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = customColors?.profileText ?? customColors?.text ?? '#faf7f2';
                }}
                title={contact.platform}
                aria-label={`Contact via ${contact.platform}`}
              >
                {contact.icon}
              </button>
            ))}
          {contacts.length > 0 && copiedEmail && (
            <div 
              className="absolute -bottom-8 left-0 text-xs px-3 py-1 rounded shadow-lg"
              style={{
                backgroundColor: customColors?.profileText ?? customColors?.foreground ?? '#11100e',
                color: customColors?.background || '#faf7f2',
              }}
            >
              Email copied!
            </div>
          )}
        </div>

        {/* Resume button - only when profile has resume */}
        {profile?.resume_url && (
          <div className="mt-3 mb-2 md:mt-2 flex md:justify-start">
            <button
              onClick={() => setResumeModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xs text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: customColors?.profileText ?? customColors?.text ?? '#faf7f2',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: customColors?.profileText ?? customColors?.text ?? '#faf7f2',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = customColors?.accent || '#c96a4a';
                e.currentTarget.style.color = customColors?.accentText ?? customColors?.profileText ?? '#faf7f2';
                e.currentTarget.style.borderColor = customColors?.accent || '#c96a4a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = customColors?.profileText ?? customColors?.text ?? '#faf7f2';
                e.currentTarget.style.borderColor = customColors?.profileText ?? customColors?.text ?? '#faf7f2';
              }}
            >
              <FileText size={18} />
              Resume
            </button>
          </div>
        )}

        {/* Resume modal - rendered via portal so it appears above navbar */}
        {resumeModalOpen &&
          resumeSrc &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
              onClick={() => setResumeModalOpen(false)}
            >
              <div
                className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-neutral-900 rounded-xs overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="font-medium text-[var(--foreground)]">Resume</span>
                  <button
                    onClick={() => setResumeModalOpen(false)}
                    className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                <iframe
                  src={resumeSrc}
                  title="Resume"
                  className="flex-1 w-full min-h-0"
                />
              </div>
            </div>,
            document.body
          )}
        
      </div>

        {/* Row 2: Bio */}
        <div className="md:col-span-2">
          <p 
            className="mt-1 text-sm sm:text-md md:text-lg leading-relaxed"
            style={{ color: customColors?.profileText ?? customColors?.text ?? 'var(--foreground)' }}
          >
            {profile.bio ||
              (isOwner
                ? `IT IS TIME TO GET CREATIVE! You can add a bio, profile picture, and banner picture by clicking the '${initial}' in the top right corner then clicking Settings. You can also customize your profile in Settings.`
                : "This artist hasn't added a bio yet.")}
              
          </p>
        </div>
      </div>
    </div>
  );
}
