"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SavesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings?section=saves");
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[40vh]">
      <p className="text-[var(--foreground)] opacity-60">Redirecting…</p>
    </div>
  );
}
