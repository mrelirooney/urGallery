"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackArrowButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="rounded-md text-[var(--artist-text,var(--light-brown))] hover:opacity-80 transition-colors"
      aria-label="Back to home"
    >
      <ArrowLeft size={24} />
    </button>
  );
}