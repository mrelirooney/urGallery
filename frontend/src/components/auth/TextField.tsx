"use client";
import { forwardRef, InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const TextField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = "", ...rest }, ref) => {
    return (
      <label className="block">
        {label && (
          <span className="mb-1 block text-body font-medium text-[var(--foreground)]/70 md:text-[var(--background)]">
            {label}
          </span>
        )}
        <input
          ref={ref}
          className={[
            "w-full rounded-xs ring-2 px-3 py-2 text-body bg-transparent",
            "ring-[var(--foreground)]/10 md:ring-[var(--background)]/10 text-[var(--foreground)] placeholder:text-neutral-400",
            "focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70",
            error ? "ring-red-400/70" : "",
            className,
          ].join(" ")}
          {...rest}
        />
        {error && (
          <span className="mt-1 block text-xs text-red-600">{error}</span>
        )}
      </label>
    );
  }
);

TextField.displayName = "TextField";
export default TextField;
