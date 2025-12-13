import { 
  FaInstagram, 
  FaYoutube, 
  FaTwitter, 
  FaLinkedin, 
  FaTwitch,
  FaBehance,
  FaDribbble,
  FaTiktok,
  FaGlobe,
  FaGithub
} from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

export type PlatformType = 
  | 'instagram'
  | 'youtube'
  | 'twitter'
  | 'linkedin'
  | 'twitch'
  | 'behance'
  | 'dribbble'
  | 'tiktok'
  | 'github'
  | 'email'
  | 'website';

export interface ContactItem {
  platform: PlatformType;
  url: string;
  icon: React.ReactNode;
}

export function detectPlatform(url: string): PlatformType | null {
  if (!url) return null;
  
  const lower = url.toLowerCase();
  
  // Check for email first (no http/https prefix)
  if (!lower.startsWith("http") && !lower.startsWith("www") && lower.includes("@")) return "email";
  if (lower.includes("mailto:")) return "email";
  
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("twitch.tv")) return "twitch";
  if (lower.includes("behance.net")) return "behance";
  if (lower.includes("dribbble.com")) return "dribbble";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("github.com")) return "github";
  if (url.startsWith("http") || url.startsWith("www")) return "website";
  
  return null;
}

export function getPlatformIcon(platform: PlatformType, size: number = 20): React.ReactNode {
  const iconProps = { size, className: "text-neutral-700" };
  
  switch (platform) {
    case 'instagram':
      return <FaInstagram {...iconProps} />;
    case 'youtube':
      return <FaYoutube {...iconProps} />;
    case 'twitter':
      return <FaTwitter {...iconProps} />;
    case 'linkedin':
      return <FaLinkedin {...iconProps} />;
    case 'twitch':
      return <FaTwitch {...iconProps} />;
    case 'behance':
      return <FaBehance {...iconProps} />;
    case 'dribbble':
      return <FaDribbble {...iconProps} />;
    case 'tiktok':
      return <FaTiktok {...iconProps} />;
    case 'github':
      return <FaGithub {...iconProps} />;
    case 'email':
      return <MdEmail {...iconProps} />;
    case 'website':
      return <FaGlobe {...iconProps} />;
    default:
      return <FaGlobe {...iconProps} />;
  }
}

export function parseContacts(profile: any): ContactItem[] {
  const contacts: ContactItem[] = [];
  
  // Use contact_order if available to preserve user's drag-and-drop order
  const contactOrder = profile.contact_order && profile.contact_order.length > 0
    ? profile.contact_order
    : [
        "website_url",
        "instagram_url",
        "youtube_url",
        "twitter_url",
        "linkedin_url",
        "twitch_url",
        "behance_url",
        "dribbble_url",
        "tiktok_url",
        "email_contact",
      ];
  
  // Read fields in the saved order to preserve drag-and-drop sequence
  contactOrder.forEach((fieldName: string) => {
    const url = profile[fieldName];
    if (url && url.trim()) {
      const platform = detectPlatform(url);
      if (platform) {
        contacts.push({
          platform,
          url,
          icon: getPlatformIcon(platform),
        });
      }
    }
  });
  
  // Return max 5 contacts
  return contacts.slice(0, 5);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

