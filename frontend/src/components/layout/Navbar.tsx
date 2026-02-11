"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import AvatarButton from "../menus/AvatarButton";
import SearchInput from "@/components/search/SearchInput";
import PortfolioMenu from "@/components/layout/PortfolioMenu";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ArrowLeft } from "lucide-react";

export default function Navbar() {
  const [customColors, setCustomColors] = useState<{
    background: string;
    foreground: string;
    text: string;
    accent: string;
  } | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const checkColors = () => {
      const htmlElement = document.documentElement;
      const bgColor = htmlElement.style.getPropertyValue('--artist-background');
      const fgColor = htmlElement.style.getPropertyValue('--artist-foreground');
      const textColor = htmlElement.style.getPropertyValue('--artist-text');
      const accentColor = htmlElement.style.getPropertyValue('--artist-accent');

      if (bgColor && fgColor && textColor && accentColor) {
        setCustomColors({
          background: bgColor.trim(),
          foreground: fgColor.trim(),
          text: textColor.trim(),
          accent: accentColor.trim(),
        });
      } else {
        setCustomColors(null);
      }
    };

    checkColors(); // Initial check

    // Watch for style changes on html element (when ColorThemeSetter applies vars)
    const observer = new MutationObserver(checkColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, [pathname]);

  // --- 1. State & refs ---
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  
  // Check if we're on any artist page (profile, portfolio, or portfolio/edit)
  const isArtistPage = pathname && 
  pathname !== '/' &&
  !pathname.startsWith('/login') &&
  !pathname.startsWith('/signup') &&
  !pathname.startsWith('/settings') &&
  !pathname.startsWith('/sandbox') &&
  /^\/[^\/]+(\/[^\/]+)*$/.test(pathname);
  const hideNavbar =
  pathname?.startsWith("/portfolio-test") ||      // dev editor route
  pathname?.includes("/editor");                  // future real editor routes

  if (hideNavbar) {
    return null;
  }
  
  // Where "View Profile" should go
  const profileHref = user?.slug ? `/${user.slug}` : "/login";
  const [open, setOpen] = useState(false);

  // --- 2. Effects ---
  // outside click + Esc
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Don't close when clicking inside the menu (links, buttons) - let navigation happen first
      if (target.closest('[role="menu"]')) return;
      if (!menuRef.current) return;
      if (!menuRef.current.contains(target)) setMenuOpen(false);
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
  }, [pathname]);

  // close on scroll if open
  useEffect(() => {
    function handleScroll() {
      if (menuOpen) setMenuOpen(false);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // Listen for portfolio menu toggle from compact navbar / portfolio title click
  useEffect(() => {
    function handlePortfolioMenuToggle() {
      if (isArtistPage) {
        setOpen(true);
      }
    }
    
    window.addEventListener("portfolio-menu-toggle", handlePortfolioMenuToggle);
    
    return () => {
      window.removeEventListener("portfolio-menu-toggle", handlePortfolioMenuToggle);
    };
  }, [isArtistPage]);

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
      {isArtistPage && (
        <PortfolioMenu isOpen={open} onClose={() => setOpen(false)} customColors={customColors ?? undefined} />
      )}

      <header 
        id="site-navbar" 
        className="sticky top-0 z-50"
        style={{ backgroundColor: customColors?.background || 'var(--background)' }}
      >
        <div className="mx-auto max-w-6xl px-4 md:px-0 lg:px-0 h-14 flex items-center justify-between">
        {/* Left: Back arrow (mobile/tablet only) OR Logo + Hamburger (desktop) */}
        <div className="flex items-center">
          {/* Mobile/Tablet: Back arrow (only on artist pages) */}
          {isArtistPage && (
            <button
              onClick={() => router.push("/")}
              className="lg:hidden rounded-md transition mr-3"
              style={{ color: customColors?.accent || '#c96a4a' }}
              aria-label="Back to home"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          
          {/* Desktop: Hamburger (only on artist pages) */}
          {isArtistPage && (
            <button
              onClick={() => setOpen(!open)}
              className="hidden lg:block rounded-md transition"
              style={{ color: customColors?.text || '#c96a4a' }}
              aria-label="Portfolio menu"
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}

          {/* Logo - hidden on mobile/tablet for artist profile pages, shown on desktop */}
          <Link 
            href="/" 
            aria-label="Home" 
            className={`${isArtistPage ? "lg:ml-3" : ""} ${isArtistPage ? "hidden lg:block" : ""}`}
          >
            <Logo className="h-5 w-auto" />
          </Link>
        </div>
        
        {/* Right side */}
        {loading ? (
          // While auth state is loading, show a tiny skeleton to avoid flicker
          <div className="w-24 h-8 rounded bg-gray-100 animate-pulse" />
        ) : user ? (
          // --- Signed-in view ---
          <div className="flex items-center gap-3">
            {/* Mobile/Tablet: Hamburger on right (only on artist pages) */}
            {isArtistPage && (
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden rounded-md text-[var(--light-brown)] transition"
                aria-label="Portfolio menu"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            
            {/* Desktop: Search + Avatar */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="pl-4">
                <SearchInput
                  variant="nav"
                  placeholder="Search…"
                  accentColor={isArtistPage ? customColors?.text : undefined}
                />
              </div>
              <div className="relative " ref={menuRef}>
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
            
            {/* Mobile/Tablet: Avatar only (when not on artist profile page) */}
            {!isArtistPage && (
              <div className="lg:hidden relative" ref={menuRef}>
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
            )}
          </div>
        ) : (
          // --- Logged-out view ---
          <nav className="flex items-center gap-4 text-sm">
            {/* Mobile/Tablet: Hamburger on right (only on artist profile pages) */}
            {isArtistPage && (
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden rounded-md text-[var(--light-brown)] transition"
                aria-label="Portfolio menu"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            
            {/* Login/SignUp buttons - hidden on mobile/tablet for artist pages */}
            <div className={isArtistPage ? "hidden lg:flex items-center gap-4" : "flex items-center gap-4"}>
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
            </div>
          </nav>
        )}
      </div>
    </header>
    </>
  );
}