"use client";
import { ReactNode } from "react";

export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">{title}</h1>
      {children}
    </div>
  );
}
