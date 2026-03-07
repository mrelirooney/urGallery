"use client";

import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import PortfolioTitle from "@/components/portfolio/primitives/PortfolioTitle";

type Props = {
  initialTitle?: string;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
    profileText?: string;
    accentText?: string;
  };
  textColor?: string;
};

export default function CompactNavPortfolioTitle({ initialTitle = "", customColors, textColor }: Props) {
  const [portfolioTitle, setPortfolioTitle] = useState<string>(initialTitle);

  // Listen for portfolio title updates from PortfolioWrapper
  useEffect(() => {
    function handlePortfolioTitleUpdate(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
        setPortfolioTitle(customEvent.detail);
      }
    }

    window.addEventListener("portfolio-title-update", handlePortfolioTitleUpdate);
    
    return () => {
      window.removeEventListener("portfolio-title-update", handlePortfolioTitleUpdate);
    };
  }, []);

  function handleMenuClick() {
    const event = new CustomEvent("portfolio-menu-toggle");
    window.dispatchEvent(event);
  }

  if (!portfolioTitle) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleMenuClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleMenuClick();
        }
      }}
      className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
      aria-label="Open portfolio menu"
    >
      <MoreVertical
        size={20}
        style={customColors || textColor ? { color: textColor ?? customColors?.profileText ?? customColors?.text } : undefined}
        className={`hidden md:block transition-colors duration-200 ${!customColors && !textColor ? "text-[var(--light-brown)]" : ""}`}
      />
      <PortfolioTitle
        text={portfolioTitle}
        align="left"
        size="xs"
        color={textColor ?? customColors?.profileText ?? customColors?.text ?? "text-neutral-200"}
      />
    </div>
  );
}
