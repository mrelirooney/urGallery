"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/auth/client";
import AuthCard from "@/components/auth/AuthCard";

export default function SignupPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    try {
      await AuthAPI.signup({ email, password });
      await AuthAPI.login({ email, password });  // optional auto-login
      r.push("/");
    } catch (e: any) {
      setErr(e?.message ?? "Sign up failed");
    }
  }

  return (
    
    <main className="mx-auto max-w-md py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-[var(--foreground)] p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text text-[var(--light-brown)]">Create Account</h1>
        {err && <p className="mb-3 text-red-600">{err}</p>}
        <form onSubmit={onSubmit} className="grid gap-3">
          <input className="bg-gray-100 border border-neutral-300 rounded-sm px-3 py-2 text-neutral-800" placeholder="Email"
                value={email} onChange={e => setEmail(e.target.value)} />
          <input className="bg-gray-100 border border-neutral-300 rounded-sm px-3 py-2 text-neutral-800" type="password" placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)} />
          <button className="px-3 py-2 bg-[var(--light-brown)] text-white rounded disabled:opacity-60">
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}
