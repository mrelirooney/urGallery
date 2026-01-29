"use client";

import { useEffect, useState } from "react";
import PortfolioTitle from "@/components/portfolio/primitives/PortfolioTitle";

type Props = {
  initialTitle?: string;
};

export default function CompactNavPortfolioTitle({ initialTitle = "" }: Props) {
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

  if (!portfolioTitle) return null;

  return (
    <PortfolioTitle
      text={portfolioTitle}
      align="left"
      size="xs"
      color="text-[var(--light-brown)]"
    />
  );
}
