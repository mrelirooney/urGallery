"use client";

import { forwardRef } from "react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  size?: number;           // px
  className?: string;
  onClick?: () => void;
};

const AvatarButton = forwardRef<HTMLButtonElement, Props>(
  ({ size = 28, className = "", onClick }, ref) => {
    const { user } = useAuth();

    const initial =
      (user?.display_name ||
        user?.email ||
        "?")
        .trim()
        .charAt(0)
        .toUpperCase();

    return (
      <button
        ref={ref}
        onClick={onClick}
        aria-label="Open user menu"
        className={[
          "flex items-center justify-center overflow-hidden",
          "rounded-full border border-neutral-300 bg-neutral-200 hover:bg-neutral-300/80",
          "transition-colors outline-none focus:ring-2 focus:ring-neutral-400/50",
          className,
        ].join(" ")}
        style={{ width: size, height: size }}
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name || user.email || "User avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs font-semibold text-neutral-700">
            {initial}
          </span>
        )}
      </button>
    );
  }
);

AvatarButton.displayName = "AvatarButton";
export default AvatarButton;
