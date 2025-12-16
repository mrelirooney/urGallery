"use client";

import { useState } from "react";
import type { ArtistLanding } from "@/lib/types";
import { parseContacts, copyToClipboard } from "@/lib/contactUtils";

type Props = {
  profile: ArtistLanding["profile"];
};

export default function CompactContactButtons({ profile }: Props) {
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

  if (contacts.length === 0) return null;

  return (
    <div className="flex items-center gap-2 relative">
      {contacts.map((contact, i) => (
        <button
          key={i}
          onClick={() => handleContactClick(contact)}
          className="h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 flex items-center justify-center transition-colors"
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


