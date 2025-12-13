"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import AvatarButton from "../menus/AvatarButton";
import SearchInput from "@/components/search/SearchInput";
import PortfolioMenu from "@/components/layout/PortfolioMenu";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  // --- 1. State & refs ---
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  // Check if we're on an artist profile page
  // Pattern: /slug (no sub-paths like /edit, /login, etc.)
  const isArtistProfilePage = pathname && 
  /^\/[^\/]+$/.test(pathname) && 
  !pathname.startsWith('/login') &&
  !pathname.startsWith('/signup') &&
  !pathname.startsWith('/settings') &&
  !pathname.startsWith('/sandbox') &&
  pathname !== '/';
  const hideNavbar =
  pathname?.startsWith("/portfolio-test") ||      // dev editor route
  pathname?.includes("/editor");                  // future real editor routes

  if (hideNavbar) {
    return null;
  }
  
  // Where "View Profile" should go
  const profileHref = user?.slug ? `/${user.slug}` : "/login";
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
    const first = menuRef.current.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
  }, [menuOpen]);

  // close menu on route / query change
  useEffect(() => {
    setMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  // close on scroll if open
  useEffect(() => {
    function handleScroll() {
      if (menuOpen) setMenuOpen(false);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // --- 3. Handlers ---
  async function handleLogout() {
    try {
      await logout();          // clear cookies/state
      setMenuOpen(false);
      router.push("/login");   // send user to login
      router.refresh();        // ensure navbar re-renders w/ logged-out view
    } catch {
      // no-op; you could toast here if you want
    }
  }

  // --- 4. Return JSX ---
  return (
    <>
      {/* Portfolio Menu */}
      {isArtistProfilePage && (
        <PortfolioMenu isOpen={open} onClose={() => setOpen(false)} />
      )}

      <header id="site-navbar" className="sticky top-0 z-50 bg-[var(--background)]">
        <div className="mx-auto max-w-6xl px-8 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex">
          {/* Only show hamburger on artist profile pages */}
          {isArtistProfilePage && (
            <button
              onClick={() => setOpen(!open)}
              className="rounded-md text-neutral-800 transition"
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}

          <Link href="/" aria-label="Home" className={isArtistProfilePage ? "ml-3" : ""}>
            <Logo className="h-5 w-auto" />
          </Link>
        </div>
        {/* Right side */}
        {loading ? (
          // While auth state is loading, show a tiny skeleton to avoid flicker
          <div className="w-28 h-8 rounded bg-gray-100 animate-pulse" />
        ) : user ? (
          // --- Signed-in view ---
          <div className="flex items-center gap-3">
            <SearchInput
              
              variant="nav"
              placeholder="Search…"
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
                  className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg z-50"
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
                      e.preventDefault();
                      last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                      e.preventDefault();
                      first.focus();
                    }
                  }}
                >
                  <ul className="py-1 text-sm text-gray-700">
                    <li>
                      <Link
                        href={profileHref}
                        className="block px-3 py-2 hover:bg-gray-50"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        View Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="block px-3 py-2 hover:bg-gray-50"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
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
          // --- Logged-out view ---
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="px-3 py-1.5 border border-white/60 rounded-xs bg-(--foreground)/0 text-white/60 hover:bg-(--foreground)/90 hover:text-black transition-opacity"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 border border-white/60 rounded-xs bg-(--foreground)/0 text-white/60 hover:bg-(--foreground)/90 hover:text-black transition-opacity"
            >
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
    </>
  );
}
