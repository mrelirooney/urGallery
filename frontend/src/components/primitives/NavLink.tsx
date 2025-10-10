"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function NavLink({ href, children, className = "" }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "text-sm transition-colors",
        isActive ? "text-neutral-900 font-medium" : "text-neutral-600 hover:text-neutral-900",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
