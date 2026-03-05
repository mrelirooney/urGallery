"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import TextField from "@/components/auth/TextField";
import SubmitButton from "@/components/auth/SubmitButton";
import FormError from "@/components/auth/FormError";
import { AuthAPI } from "@/lib/auth/client";

export default function ForgotPasswordClient() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      await AuthAPI.forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="py-14">
        <AuthCard title="Check your email">
          <p className="mb-6 text-[var(--foreground)] md:text-[var(--background)]">
            If that email is registered, a reset link has been sent. Check your inbox and follow the link to set a new password.
          </p>
          <a
            href="/login"
            className="block w-full rounded-sm bg-[var(--light-brown)] px-4 py-2 text-center text-body text-white transition hover:opacity-90"
          >
            Back to login
          </a>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="py-14">
      <AuthCard title="Forgot password?">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormError message={error} />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <SubmitButton loading={loading} className="bg-[var(--light-brown)]">
            Send reset link
          </SubmitButton>
        </form>

        <div className="mt-4 text-center text-sm">
          <a className="text-[var(--light-brown)]" href="/login">
            Back to login
          </a>
        </div>
      </AuthCard>
    </div>
  );
}
