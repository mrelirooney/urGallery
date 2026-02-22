"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default function HelpSection() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");
    setErrorDetail("");

    try {
      const res = await fetch(`${API_BASE}/api/help/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          subject: subject.trim() || undefined,
          message: message.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("success");
        setSubject("");
        setMessage("");
        setEmail("");
      } else {
        setStatus("error");
        setErrorDetail(data.detail || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorDetail("Failed to send. Please check your connection and try again.");
    }
  };

  return (
    <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12 text-[var(--foreground)]">
      <p className="text-sm opacity-80 mb-6">
        Have a question or feedback? Send us a message and we&apos;ll get back to you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label htmlFor="help-subject" className="block text-sm font-medium mb-1 opacity-90">
            Subject (optional)
          </label>
          <input
            id="help-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Bug report, feature request"
            maxLength={200}
            className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] border border-neutral-300 dark:border-neutral-600 rounded-xs focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)] focus:border-transparent placeholder:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="help-message" className="block text-sm font-medium mb-1 opacity-90">
            Message <span className="text-[var(--light-brown)]">*</span>
          </label>
          <textarea
            id="help-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your question or feedback..."
            required
            rows={5}
            maxLength={5000}
            className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] border border-neutral-300 dark:border-neutral-600 rounded-xs focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)] focus:border-transparent placeholder:opacity-60 resize-y min-h-[120px]"
          />
          <p className="text-xs opacity-60 mt-1">{message.length} / 5000</p>
        </div>

        <div>
          <label htmlFor="help-email" className="block text-sm font-medium mb-1 opacity-90">
            Reply-to email (optional)
          </label>
          <input
            id="help-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="We'll use your account email if blank"
            className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] border border-neutral-300 dark:border-neutral-600 rounded-xs focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)] focus:border-transparent placeholder:opacity-60"
          />
        </div>

        {status === "success" && (
          <p className="text-sm text-green-600 dark:text-green-400">Message sent. We&apos;ll be in touch soon.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-[var(--light-brown)]">{errorDetail}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === "sending" || !message.trim()}
            className="px-4 py-2 bg-[var(--light-brown)] text-[var(--background)] rounded-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
