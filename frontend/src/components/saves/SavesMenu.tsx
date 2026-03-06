"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, User, FolderOpen } from "lucide-react";

const DEFAULT_BG = "#faf7f2";
const DEFAULT_TEXT = "#11100e";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentView: "profiles" | "portfolios";
  onSelectView: (view: "profiles" | "portfolios") => void;
};

export default function SavesMenu({ isOpen, onClose, currentView, onSelectView }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const bg = DEFAULT_BG;
  const text = DEFAULT_TEXT;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-60 transition-opacity"
          style={{ backgroundColor: text, opacity: 0.85 }}
          onClick={onClose}
        />
      )}

      <div
        ref={menuRef}
        className={`fixed left-0 right-0 top-0 bottom-0 w-full h-screen overflow-y-auto
          sm:left-0 sm:right-auto sm:bottom-0 sm:top-0 sm:w-80 sm:h-auto sm:max-h-none
          shadow-xl z-60 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-y-0 translate-x-0" : "-translate-y-full sm:translate-y-0 sm:-translate-x-full"}
        `}
        style={{ backgroundColor: text }}
      >
        <div
          className="flex items-center justify-between px-4 py-4 sm:p-page border-b"
          style={{ borderColor: `${bg}20` }}
        >
          <h2 className="font-semibold text-body-lg" style={{ color: bg }}>
            Saves
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition hover:opacity-80"
            style={{ color: bg }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col pt-4">
          <button
            onClick={() => {
              onSelectView("profiles");
              onClose();
            }}
            className={`flex items-center gap-3 px-4 py-3 sm:px-page sm:py-3 text-left transition-colors border-b ${
              currentView === "profiles" ? "opacity-100" : "opacity-80 hover:opacity-100"
            }`}
            style={{
              borderColor: `${bg}15`,
              backgroundColor: currentView === "profiles" ? `${bg}20` : "transparent",
              color: bg,
            }}
          >
            <User size={20} />
            <span className="font-medium">Profiles</span>
          </button>
          <button
            onClick={() => {
              onSelectView("portfolios");
              onClose();
            }}
            className={`flex items-center gap-3 px-4 py-3 sm:px-page sm:py-3 text-left transition-colors ${
              currentView === "portfolios" ? "opacity-100" : "opacity-80 hover:opacity-100"
            }`}
            style={{
              borderColor: `${bg}15`,
              backgroundColor: currentView === "portfolios" ? `${bg}20` : "transparent",
              color: bg,
            }}
          >
            <FolderOpen size={20} />
            <span className="font-medium">Portfolios</span>
          </button>
        </nav>

        <div className="flex-1 p-4 sm:p-page">
          <Link
            href="/"
            onClick={onClose}
            className="text-body-sm underline underline-offset-2 hover:opacity-80"
            style={{ color: `${bg}99` }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
