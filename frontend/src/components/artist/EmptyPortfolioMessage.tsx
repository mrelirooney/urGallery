"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

type Props = {
  profileSlug: string;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
};

const VISITOR_MESSAGE =
  "This artist only has private portfolios. Ask them for a link to see their portfolio.";

const OWNER_DESKTOP_MESSAGE =
  "DECORATE YOUR BLANK CANVAS NOW! You can add a portfolio by clicking the hamburger icon in the top left corner, then click the add portfolio button.";

const OWNER_MOBILE_MESSAGE =
  "You cannot add a portfolio on mobile devices at this time. You must add and edit portfolios on a laptop or desktop.";

const LAPTOP_BREAKPOINT = 1024;

export default function EmptyPortfolioMessage({ profileSlug, customColors }: Props) {
  const { user } = useAuth();
  const [isLaptopOrBeyond, setIsLaptopOrBeyond] = useState(true);

  useEffect(() => {
    const check = () => setIsLaptopOrBeyond(window.innerWidth >= LAPTOP_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isOwner = Boolean(user?.slug && profileSlug && user.slug === profileSlug);

  const message = isOwner
    ? isLaptopOrBeyond
      ? OWNER_DESKTOP_MESSAGE
      : OWNER_MOBILE_MESSAGE
    : VISITOR_MESSAGE;

  return (
    <div className="py-16 px-4 text-center">
      <p
        className="text-lg"
        style={{ color: customColors?.background || "rgba(255,255,255,0.7)" }}
      >
        {message}
      </p>
    </div>
  );
}
