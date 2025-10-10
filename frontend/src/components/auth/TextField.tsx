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
          <span className="mb-1 block text-sm font-medium text-neutral-800">
            {label}
          </span>
        )}
        <input
          ref={ref}
          className={[
            "w-full rounded-lg border px-3 py-2 text-sm",
            "border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400/40",
            error ? "border-red-400" : "",
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
