"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/auth/client";
import TextField from "@/components/auth/TextField";
import FormError from "@/components/auth/FormError";

export default function SignupPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    try {
      await AuthAPI.signup({ email, password });
      await AuthAPI.login({ email, password });
      r.push("/signup/complete");
    } catch (e: any) {
      setErr(e?.message ?? "Sign up failed");
    }
  }

  return (
    
    <main className="mx-auto max-w-md w-full py-14">
      <div className="mx-auto w-full max-w-md rounded-sm border-0 md:border border-neutral-200 bg-transparent md:bg-[var(--foreground)] px-0 py-6 md:p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text text-[var(--light-brown)]">Create Account</h1>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormError message={err} />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button className="px-3 py-2 bg-[var(--light-brown)] text-white rounded disabled:opacity-60">
            Sign Up
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center text-sm text-neutral-600">
          <span>Already have an account? &nbsp; </span>
          <a className="text-[var(--light-brown)] hover:text-[var(--light-brown)]" href="/login">
            Login
          </a>
        </div>
      </div>
    </main>
  );
}
