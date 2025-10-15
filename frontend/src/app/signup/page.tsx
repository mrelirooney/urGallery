"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/auth/client";

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
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      {err && <p className="mb-3 text-red-600">{err}</p>}
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded px-3 py-2" placeholder="Email"
               value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" type="password" placeholder="Password"
               value={password} onChange={e => setPassword(e.target.value)} />
        <button className="px-3 py-2 bg-black text-white rounded disabled:opacity-60">
          Sign Up
        </button>
      </form>
    </main>
  );
}
