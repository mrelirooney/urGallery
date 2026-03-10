"use client";

import { useState } from "react";
import type { ArtistLanding } from "@/lib/types";
import { parseContacts, copyToClipboard } from "@/lib/contactUtils";

type Props = {
  profile: ArtistLanding["profile"];
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
    profileText?: string;
    accentText?: string;
  };
  textColor?: string;
};

export default function CompactContactButtons({ profile, customColors, textColor }: Props) {
  const [copiedEmail, setCopiedEmail] = useState(false);
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
      window.open(contact.url.startsWith('http') ? contact.url : `https://${contact.url}`, '_blank');
    }
  };

  const accent = customColors?.accent || '#c96a4a';
  const accentText = customColors?.accentText ?? customColors?.profileText ?? '#faf7f2';
  const iconColor = textColor ?? customColors?.profileText ?? accentText;

  return (
    <div className="flex items-center gap-2 relative">
      {contacts.length > 0 && contacts.map((contact, i) => (
        <button
          key={i}
          onClick={() => handleContactClick(contact)}
          className="h-8 w-8 rounded-xs flex items-center justify-center transition-colors duration-200"
          style={{
            backgroundColor: 'transparent',
            color: iconColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = accent;
            e.currentTarget.style.color = accentText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = iconColor;
          }}
          title={contact.platform}
          aria-label={`Contact via ${contact.platform}`}
        >
          {contact.icon}
        </button>
      ))}
      {copiedEmail && (
        <div className="absolute -bottom-8 right-0 bg-neutral-900 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
          Email copied!
        </div>
      )}
    </div>
  );
}









