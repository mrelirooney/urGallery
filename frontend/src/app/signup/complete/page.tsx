"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthAPI } from "@/lib/auth/client";
import AuthCard from "@/components/auth/AuthCard";
import TextField from "@/components/auth/TextField";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default function SignupCompletePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    title: "",
    location: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("first_name", formData.firstName);
      formDataToSend.append("last_name", formData.lastName);
      formDataToSend.append("display_name", formData.displayName);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("location", formData.location);

      const res = await fetch(`${API_BASE}/api/my/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCsrfToken(),
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.detail || (data as any)?.error || "Failed to save profile");
      }

      const updated = await AuthAPI.me();
      const slug = (updated as { slug?: string })?.slug;
      await refreshUser();
      if (slug) {
        router.push(`/${slug}`);
      } else {
        router.push("/");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <main className="mx-auto max-w-md w-full py-14 flex items-center justify-center">
        <p className="text-[var(--foreground)]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md w-full py-4 xl:py-8 -mt-4 md:mt-0">
      <AuthCard title="Complete your profile">
        <p className="mb-6 text-body-sm text-[var(--foreground)]/80 md:text-[var(--background)] text-center">
          Tell us a bit about yourself. <br className="hidden md:block"/> You can always update this later in <b>Settings</b>.
        </p>
        {err && <p className="mb-3 text-sm text-[var(--accent)]">{err}</p>}
        <form onSubmit={handleSubmit} className="grid gap-4">
          <TextField
            label="First name"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
          />
          <TextField
            label="Last name"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
          />
          <TextField
            label="Display name"
            type="text"
            autoComplete="username"
            placeholder="Optional — uses first + last name if blank"
            value={formData.displayName}
            onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
          />
          <TextField
            label="Title"
            type="text"
            placeholder="e.g. Photographer, Designer"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label="Location"
            type="text"
            placeholder="e.g. New York, NY"
            value={formData.location}
            onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full px-3 py-2 bg-[var(--light-brown)] text-white rounded disabled:opacity-60 font-medium"
          >
            {saving ? "Saving…" : "Done"}
          </button>
        </form>
      </AuthCard>
    </main>
  );
}
