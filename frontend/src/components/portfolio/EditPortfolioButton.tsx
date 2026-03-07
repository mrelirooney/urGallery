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
    <div className="mb-0 flex justify-end hidden lg:flex">
      <Link
        href={`/${artistSlug}/${portfolioSlug}/edit`}
        className="rounded-xs px-4 py-2 text-sm font-medium bg-transparent text-[var(--artist-portfolio-text)] hover:bg-[var(--artist-accent)] hover:text-[var(--artist-accent-text)] opacity-70 hover:opacity-100 transition-opacity"
      >
        Edit
      </Link>
    </div>
  );
}
