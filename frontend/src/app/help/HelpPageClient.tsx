"use client";

import HelpSection from "@/components/settings/HelpSection";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function HelpPageClient() {
  const { user, loading } = useAuth();

  return (
    <>
      {!loading && !user && (
        <p className="text-sm opacity-80 mb-6 text-[var(--foreground)]">
          Please{" "}
          <Link href="/login" className="underline text-[var(--light-brown)] hover:opacity-90">
            log in
          </Link>{" "}
          to send us a message.
        </p>
      )}
      <HelpSection />
    </>
  );
}
