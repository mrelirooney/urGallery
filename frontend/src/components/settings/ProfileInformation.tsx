"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Camera } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function ProfileInformation() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    displayName: user?.display_name || "",
    title: user?.title || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(
    user?.avatar_url || null
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  // Build avatar URL
  const avatarUrl = profileImage
    ? profileImage.startsWith("http") || profileImage.startsWith("data:")
      ? profileImage
      : `${API_BASE}${profileImage.startsWith("/") ? "" : "/"}${profileImage}`
    : "/default-avatar.png";

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">
        Profile Information
      </h2>

      <div className="flex gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Profile Picture */}
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-neutral-300 bg-neutral-100">
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  onClick={handleImageClick}
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-lg"
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
              <p className="text-sm text-neutral-500 text-center max-w-[120px]">
                Lorem ipsum dolor sit amet consectetur adipiscing
              </p>
            </div>
          </div>

          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>

          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Enter display name"
            />
          </div>

          {/* Title/Role */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Title/Role
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Enter title or role"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-6">
          {/* Last Name */}
          <div className="mt-[120px]">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Enter last name"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Enter location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


