"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import TextField from "@/components/auth/TextField";
import SubmitButton from "@/components/auth/SubmitButton";
import FormError from "@/components/auth/FormError";
import { AuthAPI, storeAuth } from "src/lib/auth/client";


export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const res = await AuthAPI.login({ email, password });
      router.push("/"); // success → home (change if you want)
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-14">
      <AuthCard title="Login">
        <form onSubmit={onSubmit} className="space-y-4">
          <FormError message={error} />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <SubmitButton loading={loading}>Login</SubmitButton>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <a className="text-neutral-600 hover:text-neutral-900" href="/signup">
            Create account
          </a>
          <a
            className="text-neutral-600 hover:text-neutral-900"
            href="/forgot-password"
          >
            Forgot password?
          </a>
        </div>
      </AuthCard>
    </div>
  );
}
