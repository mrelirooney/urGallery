"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface EditPortfolioButtonProps {
  artistSlug: string;
  portfolioSlug: string;
}

export default function EditPortfolioButton({ artistSlug, portfolioSlug }: EditPortfolioButtonProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || (user as any).slug !== artistSlug) return null;

  return (
    <div className="mb-6 flex justify-end">
      <Link
        href={`/${artistSlug}/${portfolioSlug}/edit`}
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow hover:bg-neutral-100 transition"
      >
        Edit
      </Link>
    </div>
  );
}
