// src/components/artist/ArtistHeader.tsx
"use client";

import type { ArtistLanding } from "@/lib/types";
import { parseContacts, copyToClipboard } from "@/lib/contactUtils";
import { useState } from "react";

type Props = { profile?: ArtistLanding["profile"] };

export default function ArtistHeader({ profile }: Props) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  if (!profile)
    return (
      <div className="text-center text-neutral-500 py-8">
        Loading artist info...
      </div>
    );

  const origin =
    (process.env.NEXT_PUBLIC_API_BASE ?? "")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "") || "http://backend:8000";

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
          <div className="h-25 w-25 md:h-56 md:w-56 rounded-full overflow-hidden border-3 border-[var(--background)] shadow-sm bg-white">
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
            {profile?.display_name ?? "Unknown Artist"}
          </h1>
          <p className="mt-1 text-sm sm:text-md md:text-lg text-[var(--foreground)]">{profile?.title ?? ""}</p>

        <p className="mt-1 text-xs sm:text-sm md:text-base text-[var(--foreground)]">
          {profile?.location ?? ""}
        </p>
        
        {/* Contact buttons */}
        {contacts.length > 0 && (
          <div className="mt-3 mb-2 md:mt-2 flex md:justify-start gap-3 relative">
            {contacts.map((contact, i) => (
              <button
                key={i}
                onClick={() => handleContactClick(contact)}
                className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 flex items-center justify-center transition-colors"
                title={contact.platform}
                aria-label={`Contact via ${contact.platform}`}
              >
                {contact.icon}
              </button>
            ))}
            {copiedEmail && (
              <div className="absolute -bottom-8 left-0 text-[var(--foreground)] text-white text-xs px-3 py-1 rounded shadow-lg">
                Email copied!
              </div>
            )}
          </div>
        )}

        
      </div>

        {/* Row 2: Bio */}
        <div className="md:col-span-2">
          <p className="mt-1 max-w-3xl text-sm sm:text-md md:text-lg text-[var(--foreground)] leading-relaxed">
            {profile.bio || "This artist hasn't added a bio yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
