"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function CompactNavHamburger() {
  const [open, setOpen] = useState(false);

  // Trigger PortfolioMenu from Navbar when hamburger is clicked
  useEffect(() => {
    if (open) {
      const event = new CustomEvent("portfolio-menu-toggle");
      window.dispatchEvent(event);
    }
  }, [open]);

  // Listen for menu close events from PortfolioMenu
  useEffect(() => {
    function handleMenuClose() {
      setOpen(false);
    }
    window.addEventListener("portfolio-menu-close", handleMenuClose);
    return () => {
      window.removeEventListener("portfolio-menu-close", handleMenuClose);
    };
  }, []);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="rounded-md text-[var(--artist-profile-text,#11100e)] transition"
      aria-label="Portfolio menu"
    >
      <Menu size={24} />
    </button>
  );
}
