"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

// Get CSRF token from cookies
function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

type Props = {
  onSaveRef?: (saveFn: () => Promise<void>) => void;
};

type ContactItem = {
  id: string;
  value: string;
};


function normalizeHashtagInput(raw: string): string {
  return (raw || "").replace(/[^\w\s]/g, "").trim();
}

function HashtagsSubsection() {
  const [hashtags, setHashtags] = useState<{ id: number; name: string }[]>([]);
  const [inputValue, setInputValue] = useState("#");
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState<string | null>(null);
  const MAX_HASHTAGS = 5;

  const fetchHashtags = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/my/hashtags/`, {
        credentials: "include",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (res.ok) {
        const data = await res.json();
        setHashtags(data);
      }
    } catch (err) {
      console.error("Error fetching hashtags:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHashtags();
  }, [fetchHashtags]);

  const handleSubmit = async () => {
    const raw = inputValue.trim().replace(/^#+/, "");
    const normalized = normalizeHashtagInput(raw);
    if (!normalized) {
      setInputValue("#");
      return;
    }
    if (hashtags.length >= MAX_HASHTAGS) {
      setAddError(`You can add up to ${MAX_HASHTAGS} hashtags.`);
      return;
    }
    const existing = hashtags.some((h) => h.name.toLowerCase() === normalized.toLowerCase());
    if (existing) {
      setAddError("You already have this hashtag.");
      return;
    }
    setAddError(null);
    try {
      const res = await fetch(`${API_BASE}/api/my/hashtags/add/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ name: normalized }),
      });
      const data = await res.json();
      if (res.ok) {
        setHashtags((prev) => [...prev, { id: data.id, name: data.name }]);
        setInputValue("#");
      } else {
        setAddError(data.error || "Failed to add hashtag.");
      }
    } catch (err) {
      setAddError("Failed to add hashtag.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRemove = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/my/hashtags/${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCsrfToken(),
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (res.ok) {
        setHashtags((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error("Error removing hashtag:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (!v.startsWith("#")) v = "#" + v;
    setInputValue(v);
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Hashtags</h3>
        <p className="text-sm text-[var(--foreground)] opacity-60">Loading hashtags...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Hashtags</h3>
      <p className="text-sm text-[var(--foreground)] opacity-80 mb-4">
        The right hashtags help people discover your profile in search. Add up to {MAX_HASHTAGS} hashtags that describe your work.
      </p>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="#"
          className="flex-1 px-4 py-2 text-[var(--foreground)] bg-[var(--background)] border border-neutral-300 dark:border-neutral-600 rounded-xs focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)] focus:border-transparent placeholder:opacity-60"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-[var(--light-brown)] text-[var(--foreground)] rounded-xs font-medium shrink-0 hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </div>
      {addError && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{addError}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {hashtags.map((h) => (
          <div
            key={h.id}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xs bg-[var(--light-brown)] text-[var(--foreground)]"
          >
            <span>#{h.name}</span>
            <button
              type="button"
              onClick={() => handleRemove(h.id)}
              className="p-0.5 rounded hover:bg-black/10 transition-colors text-[var(--foreground)]"
              aria-label="Remove hashtag"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SortableContactItem({ id, value, index, onChange }: { id: string; value: string; index: number; onChange: (value: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-0 text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical size={20} />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Contact #${index + 1}`}
        className="flex-1 px-4 py-2 text-[var(--foreground)] bg-[var(--background)] border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)] focus:border-transparent placeholder:opacity-60"
      />
    </div>
  );
}

export default function ContactInformation({ onSaveRef }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState<ContactItem[]>([
    { id: "contact1", value: "" },
    { id: "contact2", value: "" },
    { id: "contact3", value: "" },
    { id: "contact4", value: "" },
    { id: "contact5", value: "" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch current contact data
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/my/profile/`, {
          credentials: "include",
          headers: {
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Use contact_order if available, otherwise fallback to default order
          const contactOrder = data.contact_order && data.contact_order.length > 0
            ? data.contact_order
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

          // Map backend fields to contact slots in the saved order
          const contactUrls = contactOrder
            .map((fieldName: string) => data[fieldName] || "")
            .filter((url: string) => url); // Remove empty ones

          // Fill contacts array with fetched data in saved order
          const contactIds = ["contact1", "contact2", "contact3", "contact4", "contact5"];
          const newContacts = contactIds.map((id, index) => ({
            id,
            value: contactUrls[index] || "",
          }));

          setContacts(newContacts);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Expose save handler to parent
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef(handleSave);
    }
  }, [contacts, onSaveRef]);

  const handleContactChange = (id: string, value: string) => {
    setContacts((prev) =>
      prev.map((contact) => (contact.id === id ? { ...contact, value } : contact))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setContacts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Detect platform for each contact and map to backend fields
      const contactValues = contacts.map(c => c.value).filter(c => c.trim());
      const payload: Record<string, string | string[]> = {
        website_url: "",
        instagram_url: "",
        youtube_url: "",
        twitter_url: "",
        linkedin_url: "",
        twitch_url: "",
        behance_url: "",
        dribbble_url: "",
        tiktok_url: "",
        email_contact: "",
        contact_order: [], // Will store the order of fields
      };

      // Process contacts in the ORDER the user arranged them (drag-and-drop order)
      // Save each contact to its platform field AND save the order separately
      const contactOrder: string[] = [];
      
      contactValues.forEach((contact) => {
        const platform = detectPlatform(contact);
        if (platform) {
          // Assign contact to its platform field
          payload[platform as string] = contact;
          // Track the order
          contactOrder.push(platform);
        }
      });
      
      // Save the contact order array to preserve drag-and-drop order
      payload.contact_order = contactOrder;

      const response = await fetch(`${API_BASE}/api/my/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
      } else {
        const error = await response.json();
        console.error("Error saving contacts:", error);
        alert("Error saving contacts. Please check your inputs.");
      }
    } catch (error) {
      console.error("Error saving contacts:", error);
      alert("Error saving contacts. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Auto-detect platform from URL
  const detectPlatform = (url: string): string | null => {
    const lower = url.toLowerCase();
    
    // Check for email first (no http/https prefix)
    if (!lower.startsWith("http") && !lower.startsWith("www") && lower.includes("@")) return "email_contact";
    if (lower.includes("mailto:")) return "email_contact";
    
    if (lower.includes("instagram.com")) return "instagram_url";
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube_url";
    if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter_url";
    if (lower.includes("linkedin.com")) return "linkedin_url";
    if (lower.includes("twitch.tv")) return "twitch_url";
    if (lower.includes("behance.net")) return "behance_url";
    if (lower.includes("dribbble.com")) return "dribbble_url";
    if (lower.includes("tiktok.com")) return "tiktok_url";
    if (lower.includes("github.com")) return "website_url"; // GitHub goes to website for now since no backend field
    
    // Default to website
    if (url.startsWith("http") || url.startsWith("www")) return "website_url";
    
    return null;
  };

  if (loading) {
    return (
      <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12 text-[var(--foreground)]">
        Loading contact information...
      </div>
    );
  }

  return (
    <div className="px-0 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12">
      <div className="flex flex-col gap-8 max-w-xl">
        {/* Contact Links subsection */}
        <div className="flex-1 w-full min-w-0">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Contact Links
          </h3>
          <p className="text-sm text-[var(--foreground)] opacity-80 mb-4 ">
            Add up to 5 contact links. Drag the grip icon to reorder. We'll automatically detect the platform (Instagram, YouTube, LinkedIn, Email, etc.)
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={contacts.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <SortableContactItem
                    key={contact.id}
                    id={contact.id}
                    value={contact.value}
                    index={index}
                    onChange={(value) => handleContactChange(contact.id, value)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-6 text-sm text-[var(--foreground)] opacity-80">
            <p className="font-semibold mb-1">Supported platforms:</p>
            <p>Instagram, YouTube, Twitter/X, LinkedIn, Twitch, GitHub, Behance, Dribbble, TikTok, Email, Website</p>
            <p className="mt-2 text-[var(--light-brown)]">Note: Phone numbers are not allowed.</p>
          </div>
        </div>

        {/* Hashtags subsection */}
        <HashtagsSubsection />

        {/* Hidden save button - parent component will call this */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="hidden"
          id="contact-save-btn"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
