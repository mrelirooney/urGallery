// src/components/artist/ArtistHeader.tsx
"use client";

import type { ArtistLanding } from "@/lib/types";
import { parseContacts, copyToClipboard } from "@/lib/contactUtils";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

type Props = { 
  profile?: ArtistLanding["profile"];
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
};

export default function ArtistHeader({ profile, customColors }: Props) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const { user } = useAuth();
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

  const origin =
    (process.env.NEXT_PUBLIC_API_BASE ?? "")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "") || "http://localhost:8000";

  const src =
  profile?.avatar_url && profile.avatar_url.length > 0
    ? profile.avatar_url            // use it as-is
    : "/avatars/default-avatar.png"; // your existing fallback
  
  const bannerSrc = profile?.banner_image_url || null;
  
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
            style={{ borderColor: customColors?.background || '#11100e' }}
          >
            <img
              src={src}
              alt={`${profile?.display_name ?? "Artist"} avatar`}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <br></br>
        {/* Bottom: Name / Title / Contacts / Location */}
        <div className="flex flex-col md:justify-center md:text-left -mt-2">
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide"
          style={{ color: customColors?.text || 'var(--foreground)' }}
        >
            {profile?.display_name ?? "Unknown Artist"}
          </h1>
          <p 
            className="mt-1 text-sm sm:text-md md:text-lg"
            style={{ color: customColors?.text || 'var(--foreground)' }}
          >{profile?.title ?? ""}</p>

        <p 
          className="mt-1 text-xs sm:text-sm md:text-base"
          style={{ color: customColors?.text || 'var(--foreground)' }}
        >
          {profile?.location ?? ""}
        </p>
        
        {/* Contact buttons */}
        {contacts.length > 0 && (
          <div className="mt-3 mb-2 md:mt-2 flex md:justify-start gap-3 relative">
            {contacts.map((contact, i) => (
              <button
                key={i}
                onClick={() => handleContactClick(contact)}
                className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: customColors?.text || '#11100e',
                  color: customColors?.background || '#faf7f2',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = customColors?.accent || '#c96a4a';
                  e.currentTarget.style.color = customColors?.text || '#11100e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = customColors?.text || '#11100e';
                  e.currentTarget.style.color = customColors?.background || '#faf7f2';
                }}
                title={contact.platform}
                aria-label={`Contact via ${contact.platform}`}
              >
                {contact.icon}
              </button>
            ))}
            {copiedEmail && (
              <div 
                className="absolute -bottom-8 left-0 text-xs px-3 py-1 rounded shadow-lg"
                style={{
                  backgroundColor: customColors?.foreground || '#11100e',
                  color: customColors?.background || '#faf7f2',
                }}
              >
                Email copied!
              </div>
            )}
          </div>
        )}

        
      </div>

        {/* Row 2: Bio */}
        <div className="md:col-span-2">
          <p 
            className="mt-1 text-sm sm:text-md md:text-lg leading-relaxed"
            style={{ color: customColors?.text || 'var(--foreground)' }}
          >
            {profile.bio ||
              (isOwner
                ? `IT IS TIME TO GET CREATIVE! You can add a bio, profile picture, and banner picture by clicking the '${initial}' in the top right corner then clicking Settings. You can also customize your profile in Settings. DECORATE YOUR BLANK CANVAS NOW!`
                : "This artist hasn't added a bio yet.")}
          </p>
        </div>
      </div>
    </div>
  );
}
