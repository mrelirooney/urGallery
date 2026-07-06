"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Container from "@/components/layout/Container";
import AvatarButton from "../menus/AvatarButton";
import SearchInput from "@/components/search/SearchInput";
import MobileSearchOverlay from "@/components/search/MobileSearchOverlay";
import PortfolioMenu from "@/components/layout/PortfolioMenu";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ArrowLeft, Search } from "lucide-react";
import { hexToRgba, isLightColor, getTextColorForBackground } from "@/lib/colorUtils";
import { useFrostedGlassHover } from "@/components/layout/FrostedGlassHoverContext";
import { useArtistScroll } from "@/components/artist/ArtistScrollContext";

export default function Navbar() {
  const [customColors, setCustomColors] = useState<{
    background: string;
    foreground: string;
    text: string;
    accent: string;
    portfolioBg?: string | null;
  } | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const checkColors = () => {
      const htmlElement = document.documentElement;
      const profileBg = htmlElement.style.getPropertyValue('--artist-profile-bg');
      const profileText = htmlElement.style.getPropertyValue('--artist-profile-text');
      const accentColor = htmlElement.style.getPropertyValue('--artist-accent');
      const portfolioBg = htmlElement.style.getPropertyValue('--artist-portfolio-bg');

      if (profileBg && profileText && accentColor) {
        setCustomColors({
          background: profileBg.trim(),
          foreground: profileText.trim(),
          text: profileText.trim(),
          accent: accentColor.trim(),
          portfolioBg: portfolioBg?.trim() || null,
        });
      } else {
        setCustomColors(null);
      }
    };

    checkColors();

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
  
  const isConstrainedLayout =
    pathname === "/" ||
    pathname?.startsWith("/search") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/saves") ||
    pathname?.startsWith("/sandbox") ||
    pathname?.startsWith("/svg-layout-test") ||
    pathname === "/about" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/help";
  // Artist profile, portfolio, or portfolio/edit — not app routes like /search or /about
  const isArtistPage = Boolean(
    pathname &&
      !isConstrainedLayout &&
      /^\/[^/]+(\/[^/]+)*$/.test(pathname),
  );
  const isSavesPage = pathname === "/saves";
  const hideNavbar =
  pathname?.startsWith("/portfolio-test") ||      // dev editor route
  pathname?.includes("/editor");                  // future real editor routes

  if (hideNavbar) {
    return null;
  }
  
  // Where "View Profile" should go
  const profileHref = user?.slug ? `/${user.slug}` : "/login";
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    setMenuOpen(false);
    await logout();
  }

  const frostedCtx = useFrostedGlassHover();
  const isFrostedHovered = frostedCtx?.isHovered ?? false;
  const frostedOpacity = isArtistPage && customColors && frostedCtx ? (isFrostedHovered ? 0.75 : 0.05) : 0.05;
  const bgForBorder = customColors?.portfolioBg ?? customColors?.background ?? "#faf7f2";
  const borderOpacity = isLightColor(bgForBorder) ? 0.3 : 0.1;

  // Scroll-based navbar fade: 0–50% scroll = fade out, 50–100% = hidden
  const artistScroll = useArtistScroll();
  const navOpacity =
    isArtistPage && artistScroll
      ? artistScroll.scrollProgress <= 0.5
        ? 1 - artistScroll.scrollProgress / 0.5
        : 0
      : 1;
  const navPointerEvents = navOpacity < 0.01 ? "none" : "auto";

  // --- 4. Return JSX ---
  return (
    <>
      {/* Portfolio Menu - wrapped in Suspense for useSearchParams (required for 404/prerender) */}
      {isArtistPage && (
        <Suspense fallback={null}>
          <PortfolioMenu isOpen={open} onClose={() => setOpen(false)} customColors={customColors ?? undefined} />
        </Suspense>
      )}

      {/* Mobile only: full-screen search overlay */}
      <MobileSearchOverlay isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />

      <header
        id="site-navbar"
        ref={frostedCtx?.getRefCallback("nav")}
        onMouseEnter={() => frostedCtx?.onMouseEnter("nav")}
        onMouseLeave={(e) => frostedCtx?.onMouseLeave("nav", e.relatedTarget)}
        className={`fixed top-0 left-0 right-0 z-55 transition-all duration-200 ${isArtistPage && customColors ? "border-b backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.15)]" : ""}`}
        style={{
          backgroundColor: isArtistPage && customColors
            ? hexToRgba(customColors.background, frostedOpacity)
            : (customColors?.background || "var(--background)"),
          ...(isArtistPage && customColors && {
            borderBottomWidth: 1,
            borderBottomColor: hexToRgba("#faf7f2", borderOpacity),
            transition: "background-color 0.2s ease, border-color 0.2s ease",
          }),
          ...(isArtistPage && artistScroll && {
            opacity: navOpacity,
            pointerEvents: navPointerEvents,
          }),
        }}
      >
        <Container className={`h-12 sm:h-14 ${isConstrainedLayout ? "max-w-none" : ""} px-0`}>
        <div className={`h-full flex items-center justify-between gap-2 ${isArtistPage ? "max-w-6xl xl:max-w-7xl 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20" : isConstrainedLayout ? "max-w-6xl xl:max-w-7xl 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20" : ""}`}>
        {/* Left: Back arrow (mobile only) OR Hamburger + Logo (tablet/desktop on artist/saves pages) */}
        <div className="flex items-center">
          {/* Mobile only: Back arrow (only on artist pages) */}
          {isArtistPage && !isSavesPage && (
            <button
              onClick={() => router.push("/")}
              className="md:hidden rounded-md transition mr-3"
              style={{ color: 'var(--artist-profile-text, #11100e)' }}
              aria-label="Back to home"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          
          {/* Tablet/Desktop: Hamburger (artist pages = portfolio menu, saves page = saves menu) */}
          {(isArtistPage || isSavesPage) && (
            <button
              onClick={() => {
                if (isSavesPage) {
                  window.dispatchEvent(new CustomEvent("saves-menu-toggle"));
                } else {
                  setOpen(!open);
                }
              }}
              className="hidden md:block rounded-md transition"
              style={{ color: isSavesPage ? 'var(--foreground)' : 'var(--artist-profile-text, #11100e)' }}
              aria-label={isSavesPage ? "Saves menu" : "Portfolio menu"}
            >
              <Menu size={28} />
            </button>
          )}

          {/* Logo - hidden on mobile for artist profile pages, shown on tablet/desktop.
              Color: theme text on profile pages, var(--foreground) on home/saves (light/dark auto) */}
          <Link 
            href="/" 
            aria-label="Home" 
            className={`${(isArtistPage || isSavesPage) ? "md:ml-3" : ""} ${(isArtistPage || isSavesPage) ? "hidden md:block" : ""} ${!(isArtistPage || isSavesPage) ? "text-[var(--foreground)]" : ""}`}
            style={(isArtistPage || isSavesPage) ? { color: isSavesPage ? 'var(--foreground)' : 'var(--artist-profile-text, #11100e)' } : undefined}
          >
            <Logo className="h-10 sm:h-11 lg:h-12 w-auto" />
          </Link>
        </div>
        
        {/* Right side */}
        {loading ? (
          // While auth state is loading, show a tiny skeleton to avoid flicker
          <div className="w-24 h-8 rounded bg-gray-100 animate-pulse" />
        ) : user ? (
          // --- Signed-in view ---
          <div className="flex items-center gap-3">
            {/* Mobile only: Search icon - opens full-screen search overlay */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden rounded-md p-2 transition hover:opacity-80"
              style={{ color: (isArtistPage && !isSavesPage) ? 'var(--artist-profile-text, #11100e)' : 'var(--foreground)' }}
              aria-label="Search"
            >
              <Search size={24} />
            </button>
            {/* Mobile only: Hamburger on right (artist pages = portfolio menu, saves = saves menu) */}
            {(isArtistPage || isSavesPage) && (
              <button
                onClick={() => {
                  if (isSavesPage) {
                    window.dispatchEvent(new CustomEvent("saves-menu-toggle"));
                  } else {
                    setOpen(!open);
                  }
                }}
                className="md:hidden rounded-md transition"
                style={{ color: isSavesPage ? 'var(--foreground)' : 'var(--artist-profile-text, #11100e)' }}
                aria-label={isSavesPage ? "Saves menu" : "Portfolio menu"}
              >
                <Menu size={24} />
              </button>
            )}
            
            {/* Tablet/Desktop: Search + Avatar */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-5">
              <div className="pl-2 lg:pl-4 xl:pl-6">
                <SearchInput
                  variant="nav"
                  placeholder="Search…"
                  textColor={isArtistPage ? customColors?.text : undefined}
                  accentColor={isArtistPage ? customColors?.accent : undefined}
                  backgroundColor={isArtistPage ? customColors?.background : undefined}
                  foregroundColor={isArtistPage ? customColors?.foreground : undefined}
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
                    className="absolute right-0 mt-2 w-44 min-w-[10rem] max-w-[calc(100vw-2rem)] rounded-md border border-neutral-200 bg-white shadow-lg z-55"
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
                    <ul className="py-1 text-body-sm text-gray-700">
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
                          href="/settings?section=saves"
                          className="block px-3 py-2 hover:bg-gray-50"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                        >
                          Saves
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
            
            {/* Mobile only: Avatar (when not on artist profile page; md+ shows Search+Avatar above) */}
            {!isArtistPage && (
              <div className="md:hidden relative" ref={menuRef}>
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
                    className="absolute right-0 mt-2 w-44 min-w-[10rem] max-w-[calc(100vw-2rem)] rounded-md border border-gray-200 bg-white shadow-lg z-50"
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
                    <ul className="py-1 text-body-sm text-gray-700">
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
                          href="/settings?section=saves"
                          className="block px-3 py-2 hover:bg-gray-50"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                        >
                          Saves
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
          <nav className="flex items-center gap-3 sm:gap-4 text-body-sm md:pr-4">
            {/* Mobile only: overlay search — artist pages hide inline SearchInput below md; home etc. use SearchInput’s own icon */}
            {isArtistPage && (
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden rounded-md p-2 transition hover:opacity-80"
                style={{ color: customColors?.text || "#11100e" }}
                aria-label="Search"
              >
                <Search size={24} />
              </button>
            )}
            {/* Mobile only: Hamburger on right (only on artist profile pages) */}
            {isArtistPage && (
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden rounded-md transition"
                style={{ color: customColors?.text || '#11100e' }}
                aria-label="Portfolio menu"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            
            {/* Search + Login/SignUp - hidden on mobile for artist pages, shown on tablet/desktop */}
            <div className={`flex items-center gap-3 sm:gap-4 ${isArtistPage ? "hidden md:flex lg:gap-4 xl:gap-5" : ""}`}>
              <div className={isArtistPage ? "pl-2 lg:pl-4 xl:pl-6 min-w-0 flex-1" : "min-w-0 flex-1 max-w-[180px] sm:max-w-[220px] md:max-w-[260px]"}>
                <SearchInput
                  variant="nav"
                  placeholder="Search…"
                  textColor={isArtistPage ? customColors?.text : undefined}
                  accentColor={isArtistPage ? customColors?.accent : undefined}
                  backgroundColor={isArtistPage ? customColors?.background : undefined}
                  foregroundColor={isArtistPage ? customColors?.foreground : undefined}
                />
              </div>
              <div
                className="flex items-center gap-2 sm:gap-3 shrink-0"
                style={
                  isArtistPage && customColors?.accent
                    ? {
                        "--nav-accent": customColors.accent,
                        "--nav-accent-text": getTextColorForBackground(customColors.accent),
                      } as React.CSSProperties
                    : {
                        "--nav-accent": "var(--light-brown)",
                        "--nav-accent-text": getTextColorForBackground("#c96a4a"),
                      } as React.CSSProperties
                }
              >
              <Link
                href="/login"
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-body rounded-xs bg-transparent transition-opacity hover:opacity-90 ${!isArtistPage ? "text-[var(--foreground)]/90" : ""} sm:hover:bg-[var(--nav-accent)] sm:hover:text-[var(--nav-accent-text)]`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-body rounded-xs bg-transparent transition-opacity hover:opacity-90 ${!isArtistPage ? "text-[var(--foreground)]/90" : ""} sm:hover:bg-[var(--nav-accent)] sm:hover:text-[var(--nav-accent-text)]`}
                style={isArtistPage && customColors?.text ? { color: customColors.text, borderColor: `${customColors.text}66` } : undefined}
              >
                Sign Up
              </Link>
              </div>
            </div>
          </nav>
        )}
        </div>
      </Container>
    </header>
    </>
  );
}