"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const getCsrfToken = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

interface ProfileInformationProps {
  onSaveRef?: (saveFn: () => Promise<void>) => void;
  onSaveComplete?: () => void;
}

export default function ProfileInformation({ onSaveRef, onSaveComplete }: ProfileInformationProps) {
  const { user, refresh: refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    title: "",
    location: "",
    bio: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/my/profile/`, {
          credentials: "include",
          headers: {
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            displayName: data.display_name || "",
            title: data.title || "",
            location: data.location || "",
            bio: data.bio || "",
          });
          
          if (data.avatar_url) {
            setProfileImage(data.avatar_url);
          } else {
            setProfileImage(null);
          }
          
          if (data.banner_image_url) {
            setBannerImage(data.banner_image_url);
          } else {
            setBannerImage(null);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      
      // Add profile fields
      formDataToSend.append("display_name", formData.displayName);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("first_name", formData.firstName);
      formDataToSend.append("last_name", formData.lastName);
      
      // Add avatar if changed
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }
      
      // Add banner if changed
      if (bannerFile) {
        formDataToSend.append("banner_image", bannerFile);
      }

      const res = await fetch(`${API_BASE}/api/my/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCsrfToken(),
          "ngrok-skip-browser-warning": "true",
        },
        body: formDataToSend,
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state with response
        if (data.avatar_url) {
          setProfileImage(data.avatar_url);
        }
        setAvatarFile(null); // Clear file after successful upload
        
        if (data.banner_image_url) {
          setBannerImage(data.banner_image_url);
        }
        setBannerFile(null); // Clear file after successful upload
        
        // Refresh user data in auth context
        await refreshUser();
        
        // Call completion callback if provided (parent handles navigation)
        if (onSaveComplete) {
          onSaveComplete();
        } else {
          // Fallback: refresh router if no callback
          router.refresh();
        }
      } else {
        const error = await res.json();
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Please try again.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Expose save handler to parent
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef(handleSave);
    }
  }, [formData, avatarFile, bannerFile, onSaveRef]);

  // Build avatar URL - when no image, show grey circle with initial
  const hasAvatar = Boolean(profileImage);
  const avatarUrl = hasAvatar
    ? profileImage!.startsWith("http") || profileImage!.startsWith("data:")
      ? profileImage!
      : `${API_BASE}${profileImage!.startsWith("/") ? "" : "/"}${profileImage}`
    : "";
  const initial = (formData.displayName || user?.display_name || "?").trim().charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="px-0 py-4 md:py-6 lg:p-8 flex items-center justify-center">
        <p className="text-[var(--foreground)]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12 flex flex-col">
      {/* Row 1: Profile pic + Banner - stacked on mobile, side by side on tablet+ */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Profile Selector */}
        <div className="flex md:w-[13vw] md:shrink-0 justify-center md:justify-start">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className={`h-32 w-32 rounded-full overflow-hidden border-2 flex items-center justify-center ${
                  hasAvatar ? "border-[var(--foreground)]/30 bg-neutral-100" : "border-neutral-300 bg-neutral-200"
                }`}
              >
                {hasAvatar ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-neutral-700">{initial}</span>
                )}
              </div>
              <button
                onClick={handleImageClick}
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-2 border-[var(--foreground)]/30 bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-lg"
                aria-label="Change profile picture"
              >
                <Camera size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
        {/* Banner - right of profile pic on tablet+ */}
        <div className="flex-1 w-full min-w-0 md:max-w-[70vw]">
          <label
            htmlFor="bannerImage"
            className="block md:hidden text-sm font-medium text-[var(--foreground)] mb-2"
          >
            Banner Image
          </label>
          <div className="relative w-full h-32 rounded-xs overflow-hidden ring-2 ring-[var(--foreground)]/10 bg-neutral-100 dark:bg-neutral-800">
            {bannerImage ? (
              <img
                src={bannerImage.startsWith("http") || bannerImage.startsWith("data:")
                  ? bannerImage
                  : `${API_BASE}${bannerImage.startsWith("/") ? "" : "/"}${bannerImage}`}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--foreground)] opacity-60">
                No banner image
              </div>
            )}
            <button
              type="button"
              onClick={handleBannerClick}
              className="absolute top-2 right-2 px-3 py-1.5 bg-neutral-900 text-white text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-lg"
            >
              {bannerImage ? "Change" : "Upload"}
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
              id="bannerImage"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Text inputs - full width below images on tablet+ */}
      <div className="flex flex-col gap-6 mt-6 w-full">
          <div className="flex flex-col md:flex-row gap-6">
            {/* First Name */}
            <div className="w-full md:w-[50%]">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                placeholder="Enter first name"
              />
            </div>
            {/* Last Name */}
            <div className="w-full md:w-[50%]">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                placeholder="Enter last name"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Display Name */}
            <div className="w-full md:w-[50%]">
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                placeholder="Enter display name"
              />
            </div>

            {/* Location */}
            <div className="w-full md:w-[50%]">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                placeholder="Enter location"
              />
            </div>
          </div>

          {/* Title/Role - full width for longer titles */}
          <div className="w-full">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[var(--foreground)] mb-2"
            >
              Title/Role
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
              placeholder="Enter title or role"
            />
          </div>
        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-[var(--foreground)] mb-2"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );
}





