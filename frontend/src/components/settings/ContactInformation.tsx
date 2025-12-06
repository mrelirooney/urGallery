"use client";

import { useState } from "react";
import { GripVertical, X } from "lucide-react";

type Contact = {
  id: string;
  url: string;
};

export default function ContactInformation() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", url: "" },
    { id: "2", url: "" },
    { id: "3", url: "" },
    { id: "4", url: "" },
  ]);

  const [tags, setTags] = useState<string[]>([
    "#Lorem",
    "#Lorem",
    "#Lorem",
    "#Lorem",
    "#Lorem",
    "#Lorem",
    "#Lorem",
    "#Lorem",
    "#Lorem",
    "#Lorem",
  ]);

  const [newTag, setNewTag] = useState("");

  const handleContactChange = (id: string, value: string) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, url: value } : contact
      )
    );
  };

  const handleRemoveContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const handleAddContact = () => {
    setContacts((prev) => [
      ...prev,
      { id: Date.now().toString(), url: "" },
    ]);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      setTags((prev) => [...prev, `#${newTag.trim()}`]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">
        Contact Information
      </h2>

      <div className="flex gap-8">
        {/* Left Column - Contacts */}
        <div className="flex-1">
          <p className="text-sm text-neutral-500 mb-4">
            Lorem ipsum dolor sit amet consectetur adipiscing
          </p>

          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="flex items-center gap-2"
              >
                <input
                  type="url"
                  value={contact.url}
                  onChange={(e) =>
                    handleContactChange(contact.id, e.target.value)
                  }
                  placeholder={`Contact #${index + 1}`}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
                <button
                  type="button"
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="Reorder contact"
                  title="Drag to reorder"
                >
                  <GripVertical size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(contact.id)}
                  className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                  aria-label="Remove contact"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddContact}
            className="mt-4 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            + Add Contact
          </button>
        </div>

        {/* Right Column - Tags */}
        <div className="flex-1">
          <p className="text-sm text-neutral-500 mb-2">
            Lorem ipsum dolor sit amet consectetur adipiscing
          </p>

          <form onSubmit={handleAddTag} className="mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </form>

          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 bg-neutral-800 text-white rounded-lg"
              >
                <span className="font-medium">{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="text-white hover:text-red-300 transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

