import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md rounded-sm border-0 md:border border-neutral-200 bg-transparent md:bg-[var(--foreground)] p-6 shadow-sm" />
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
