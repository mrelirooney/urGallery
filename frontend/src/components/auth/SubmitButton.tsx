"use client";
import { ButtonHTMLAttributes } from "react";

export default function SubmitButton({
  children,
  loading,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={[
        "w-full rounded-sm bg-[var(--light-brown)] px-4 py-2 text-body text-white transition",
        "hover:opacity-90 disabled:opacity-50",
        className,
      ].join(" ")}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
