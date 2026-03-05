"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Trash2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const getCsrfToken = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

const getFileNameFromUrl = (url: string): string => {
  try {
    const pathname = url.split("?")[0];
    const lastSegment = pathname.split("/").filter(Boolean).pop();
    return lastSegment ? decodeURIComponent(lastSegment) : "Resume";
  } catch {
    return "Resume";
  }
};

interface ResumeSectionProps {
  onSaveRef?: (saveFn: () => Promise<void>) => void;
  instanceId?: string;
}

export default function ResumeSection({ onSaveRef, instanceId = "default" }: ResumeSectionProps) {
  const { refresh: refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [removeRequested, setRemoveRequested] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);

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
          setResumeUrl(data.resume_url || null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    const file = fileInputRef.current?.files?.[0] || pendingFileRef.current;
    const hasRemove = removeRequested;
    const hasUpload = file && !removeRequested;

    if (!hasRemove && !hasUpload) {
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (hasRemove) {
        formData.append("remove_resume", "true");
      } else if (hasUpload) {
        if (file.type !== "application/pdf") {
          setSaveError("Only PDF files are allowed. Please upload a PDF resume.");
          setSaving(false);
          return;
        }
        formData.append("resume_file", file);
      }

      const res = await fetch(`${API_BASE}/api/my/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCsrfToken(),
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save resume.");
      }

      const data = await res.json();
      setResumeUrl(data.resume_url || null);
      setRemoveRequested(false);
      setSelectedFileName(null);
      pendingFileRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await refreshUser();
      setSaveSuccess(data.resume_url ? "Resume saved." : "Resume removed.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save resume.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRemoveRequested(false);
      setSelectedFileName(file.name);
      pendingFileRef.current = file;
    }
  };

  const handleRemove = () => {
    setRemoveRequested(true);
    setSelectedFileName(null);
    pendingFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (onSaveRef) {
      onSaveRef(handleSave);
    }
  }, [onSaveRef]);

  if (loading) {
    return (
      <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12">
        <p className="text-[var(--foreground)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12">
      <div className="max-w-xl space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Resume</h2>
        <p className="text-sm text-[var(--foreground)] opacity-80">
          Upload a PDF resume to display on your profile. PDF only — other formats are not supported.
        </p>

        {resumeUrl && !removeRequested && !selectedFileName && (
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-3">
            <FileText size={24} className="text-[var(--light-brown)]" />
            <span className="flex-1 text-sm text-[var(--foreground)]">
              Resume uploaded — <span className="font-medium">{getFileNameFromUrl(resumeUrl)}</span>
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        )}

        {selectedFileName && (
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50">
            <FileText size={24} className="text-[var(--light-brown)]" />
            <span className="flex-1 text-sm text-[var(--foreground)]">
              Selected: <span className="font-medium">{selectedFileName}</span> — click Done to save.
            </span>
          </div>
        )}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id={`resume-upload-${instanceId}`}
          />
          <label
            htmlFor={`resume-upload-${instanceId}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <FileText size={18} />
            {resumeUrl && !removeRequested ? "Replace resume" : "Upload PDF (PDF only)"}
          </label>
        </div>

        {saveError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-400">
            {saveSuccess}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="hidden" id="resume-save-btn">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
