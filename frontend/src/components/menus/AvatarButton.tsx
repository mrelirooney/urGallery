"use client";

import { forwardRef } from "react";

type Props = {
  size?: number;           // px
  className?: string;
  onClick?: () => void;
};

const AvatarButton = forwardRef<HTMLButtonElement, Props>(
  ({ size = 28, className = "", onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        aria-label="Open user menu"
        className={[
          "rounded-full border border-neutral-300 bg-neutral-200 hover:bg-neutral-300/80",
          "transition-colors outline-none focus:ring-2 focus:ring-neutral-400/50",
          className,
        ].join(" ")}
        style={{ width: size, height: size }}
      />
    );
  }
);

AvatarButton.displayName = "AvatarButton";
export default AvatarButton;
