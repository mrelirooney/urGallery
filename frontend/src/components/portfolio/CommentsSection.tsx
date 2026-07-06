"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSystemSurfaceColors } from "@/hooks/useSystemSurfaceColors";
import { getTextColorForBackground, hexToRgba } from "@/lib/colorUtils";
import { Trash2, X, Send } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function buildAvatarUrl(raw: string | null): string {
  if (!raw?.trim()) return "/default-avatar.png";
  if (raw.startsWith("http")) return raw;
  const base = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
  return base + (raw.startsWith("/") ? raw : `/${raw}`);
}

type Comment = {
  id: number;
  body: string;
  author_id: number;
  author_display_name: string;
  author_avatar_url: string | null;
  is_portfolio_author: boolean;
  created_at: string;
};

type CommentsSectionProps = {
  isOpen: boolean;
  onClose: () => void;
  artistSlug: string;
  portfolioSlug: string;
  isOwner?: boolean;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
};

type CommentBubbleProps = {
  comment: Comment;
  isOwn: boolean;
  profileBg: string;
  foreground: string;
  surface: string;
  canDelete: boolean;
  onDelete: (id: number) => void;
};

function CommentBubble({
  comment,
  isOwn,
  profileBg,
  foreground,
  surface,
  canDelete,
  onDelete,
}: CommentBubbleProps) {
  const bubbleBg = isOwn ? profileBg : hexToRgba(foreground, 0.25);
  const bubbleText = isOwn
    ? getTextColorForBackground(profileBg)
    : getTextColorForBackground(foreground);
  const metaColor = bubbleText;
  const avatarSrc = buildAvatarUrl(comment.author_avatar_url);

  const bubbleStyle = {
    backgroundColor: bubbleBg,
    color: bubbleText,
  };

  const metaRow = (
    <p
      className={`text-xs mt-1.5 ${isOwn ? "text-right" : "text-left"}`}
      style={{ color: metaColor }}
    >
      {comment.author_display_name}
      {comment.is_portfolio_author && (
        <>
          {" "}
          - <strong>Author</strong>
        </>
      )}
    </p>
  );

  return (
    <div className={`group flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`relative max-w-[90%] md:max-w-[85%] ${isOwn ? "pl-8" : "pr-8"}`}>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className={`absolute top-0 p-1 rounded-xs opacity-0 group-hover:opacity-70 hover:!opacity-100 transition z-10 ${
              isOwn ? "left-0" : "right-0"
            }`}
            style={{ color: foreground }}
            aria-label="Delete comment"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* Tablet / desktop: avatar beside bubble */}
        <div className={`hidden md:flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <img
            src={avatarSrc}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover border self-start"
            style={{ borderColor: hexToRgba(foreground, 0.25) }}
          />
          <div className={`min-w-0 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
            <div
              className="px-3 py-2 rounded-xs text-sm whitespace-pre-wrap break-words"
              style={bubbleStyle}
            >
              {comment.body}
            </div>
            {metaRow}
          </div>
        </div>

        {/* Phone: avatar overlaps bottom corner of bubble */}
        <div className="md:hidden">
          <div
            className="px-3 py-2 rounded-xs text-sm whitespace-pre-wrap break-words"
            style={bubbleStyle}
          >
            {comment.body}
          </div>
          <div
            className={`flex items-end gap-2 -mt-3 relative z-10 ${
              isOwn ? "flex-row-reverse justify-end" : "flex-row justify-start"
            }`}
          >
            <img
              src={avatarSrc}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover border"
              style={{
                borderColor: hexToRgba(foreground, 0.25),
                backgroundColor: surface,
              }}
            />
            <div className={`pb-0.5 ${isOwn ? "text-right" : "text-left"}`}>{metaRow}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommentsSection({
  isOpen,
  onClose,
  artistSlug,
  portfolioSlug,
  isOwner = false,
  customColors,
}: CommentsSectionProps) {
  const { user, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [body]);

  const { surface, foreground } = useSystemSurfaceColors();

  const profileBg = customColors?.background || "#faf7f2";
  const accent = customColors?.accent || "#c96a4a";

  const fetchComments = useCallback(async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/artists/${artistSlug}/portfolios/${portfolioSlug}/comments/`,
        {
          credentials: "include",
          headers: { "ngrok-skip-browser-warning": "true" },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [artistSlug, portfolioSlug, isOpen]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [loading, comments]);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !body.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/artists/${artistSlug}/portfolios/${portfolioSlug}/comments/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ body: body.trim() }),
        }
      );
      if (res.ok) {
        setBody("");
        await fetchComments();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || data.body?.[0] || "Failed to post comment.");
      }
    } catch {
      setError("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/artists/${artistSlug}/portfolios/${portfolioSlug}/comments/${commentId}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      if (res.ok) {
        await fetchComments();
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const canDelete = (c: Comment) =>
    Boolean(
      user &&
        (String(user.id) === String(c.author_id) || isOwner)
    );

  const displayComments = [...comments].reverse();

  const overlay = (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] transition-opacity"
          style={{ backgroundColor: profileBg, opacity: 0.85 }}
          onClick={onClose}
        />
      )}

      <div
        ref={panelRef}
        className={`fixed right-0 top-0 bottom-0 w-full md:w-[65%] lg:w-[400px] h-screen flex flex-col
          shadow-xl z-[100] transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ backgroundColor: surface }}
      >
        <div
          className="flex items-center justify-between px-4 py-4 border-b shrink-0"
          style={{ borderColor: hexToRgba(foreground, 0.15) }}
        >
          <h3 className="text-lg font-semibold" style={{ color: foreground }}>
            Comments
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xs transition hover:opacity-80"
            style={{ color: foreground }}
            aria-label="Close comments"
          >
            <X size={20} />
          </button>
        </div>

        {authLoading ? (
          <div
            className="flex-1 flex items-center justify-center px-4"
            style={{ color: hexToRgba(foreground, 0.6) }}
          >
            Loading…
          </div>
        ) : !user ? (
          <div
            className="flex-1 flex items-center justify-center px-4 text-center"
            style={{ color: foreground }}
          >
            <p className="text-sm">
              <Link href="/login" className="underline font-medium" style={{ color: accent }}>
                Sign in
              </Link>{" "}
              to comment.
            </p>
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto min-h-0 relative flex flex-col"
            >
              <div
                className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10"
                style={{
                  background: `linear-gradient(to bottom, ${surface} 0%, transparent 100%)`,
                }}
              />
              <div className="mt-auto px-4 py-4 space-y-5">
                {loading ? (
                  <p className="text-sm" style={{ color: hexToRgba(foreground, 0.6) }}>
                    Loading comments…
                  </p>
                ) : displayComments.length === 0 ? (
                  <p className="text-sm" style={{ color: hexToRgba(foreground, 0.6) }}>
                    No comments yet. Be the first!
                  </p>
                ) : (
                  displayComments.map((c) => (
                    <CommentBubble
                      key={c.id}
                      comment={c}
                      isOwn={String(user.id) === String(c.author_id)}
                      profileBg={profileBg}
                      foreground={foreground}
                      surface={surface}
                      canDelete={canDelete(c)}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>

            <div
              className="shrink-0 p-4 border-t"
              style={{ borderColor: hexToRgba(foreground, 0.15) }}
            >
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSubmit();
                    }
                  }}
                  placeholder="Add a comment…"
                  rows={1}
                  className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 rounded-xs resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm"
                  style={{
                    backgroundColor: "transparent",
                    color: foreground,
                    border: `1px solid ${accent}`,
                  }}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className="shrink-0 p-2 rounded-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      sendHovered && !submitting && body.trim() ? accent : "transparent",
                    color:
                      sendHovered && !submitting && body.trim()
                        ? "var(--artist-accent-text, #faf7f2)"
                        : foreground,
                  }}
                  onMouseEnter={() => setSendHovered(true)}
                  onMouseLeave={() => setSendHovered(false)}
                  aria-label="Send comment"
                >
                  <Send size={18} />
                </button>
              </form>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
          </>
        )}
      </div>
    </>
  );

  return mounted && typeof document !== "undefined"
    ? createPortal(overlay, document.body)
    : null;
}
