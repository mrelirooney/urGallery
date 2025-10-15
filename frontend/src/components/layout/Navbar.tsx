"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "./Container";
import Logo from "@/components/layout/Logo";
import NavLink from "../primitives/NavLink";
import AvatarButton from "../menus/AvatarButton";
import SearchInput from "@/components/search/SearchInput";
import { useAuth } from "@/hooks/useAuth";


export default function Navbar() {
// --- 1. State & refs ---
    const { user, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false); 
    const menuRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    

// --- 2. Effects ---
    // outside click + Esc
    useEffect(() => {
        function onDocMouseDown(e: MouseEvent) {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setMenuOpen(false);
        }
        document.addEventListener("mousedown", onDocMouseDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocMouseDown);
            document.removeEventListener("keydown", onKey);
        };
    }, []);
        // focus first element when opened
    useEffect(() => {
            if (!menuOpen || !menuRef.current) return;
            // Focus first focusable in the menu
            const first = menuRef.current.querySelector<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            first?.focus();
    }, [menuOpen]);

    useEffect(() => {
        // Any route or querystring change should close the menu
        setMenuOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams?.toString()]);

    useEffect(() => {
        function handleScroll() {
            // close only if menu is open
            if (menuOpen) setMenuOpen(false);
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [menuOpen]);

// --- 3. Return JSX ---
return (
  <header className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
    <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
      <Logo className="h-5 w-auto" />

      {/* Right side */}
      {!loading && (
        user ? (
          // --- signed-in view ---
          <div className="flex items-center gap-3">
            <SearchInput
              variant="nav"
              placeholder="Search…"
              onSelect={(r) => console.log("go to", r)}
            />

            <div className="relative" ref={menuRef}>
              <AvatarButton
                size={36}
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              />

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg"
                  onKeyDown={(e) => {
                    if (e.key !== "Tab") return;
                    const container = menuRef.current;
                    if (!container) return;
                    const focusables = container.querySelectorAll<HTMLElement>(
                      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    );
                    if (focusables.length === 0) return;
                    const first = focusables[0];
                    const last = focusables[focusables.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                      e.preventDefault(); last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                      e.preventDefault(); first.focus();
                    }
                  }}
                >
                  <ul className="py-1 text-sm text-gray-700">
                    <li>
                      <a
                        href="/profile"
                        className="block px-3 py-2 hover:bg-gray-50"
                        role="menuitem"
                      >
                        View Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="/settings"
                        className="block px-3 py-2 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Settings
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          window.location.href = "/login"; // TODO: replace with real logout
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          // --- logged-out view ---
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-60"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-60"
            >
              Sign Up
            </a>
          </nav>
        )
      )}
    </div>
  </header>
)};
