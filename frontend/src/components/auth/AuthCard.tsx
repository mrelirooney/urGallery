"use client";
import { ReactNode } from "react";

export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-sm bg-transparent md:bg-[var(--foreground)] py-6 px-0 md:px-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text text-[var(--light-brown)]">{title}</h1>
      {children}
    </div>
  );
}
