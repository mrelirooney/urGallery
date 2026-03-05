import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md rounded-sm border-0 md:border border-neutral-200 bg-transparent md:bg-[var(--foreground)] p-6 shadow-sm" />
      }
    >
      <ForgotPasswordClient />
    </Suspense>
  );
}
