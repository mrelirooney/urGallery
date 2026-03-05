"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import TextField from "@/components/auth/TextField";
import SubmitButton from "@/components/auth/SubmitButton";
import FormError from "@/components/auth/FormError";
import { AuthAPI } from "@/lib/auth/client";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasValidLink = Boolean(uid && token);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (!hasValidLink) {
      setError("Invalid or missing reset link. Please request a new one.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await AuthAPI.resetPassword({ uid, token, new_password: newPassword });
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
        <AuthCard title="Password changed">
          <p className="mb-6 text-[var(--foreground)] md:text-[var(--background)]">
            Your password has been changed.
          </p>
          <a
            href="/login"
            className="block w-full rounded-sm bg-[var(--light-brown)] px-4 py-2 text-center text-body text-white transition hover:opacity-90"
          >
            Login
          </a>
        </AuthCard>
      </div>
    );
  }

  if (!hasValidLink) {
    return (
      <div className="py-14">
        <AuthCard title="Invalid reset link">
          <FormError message="This reset link is invalid or has expired. Please request a new one." />
          <a
            href="/forgot-password"
            className="mt-4 block w-full rounded-sm bg-[var(--light-brown)] px-4 py-2 text-center text-body text-white transition hover:opacity-90"
          >
            Request new link
          </a>
          <div className="mt-4 text-center text-sm">
            <a className="text-[var(--light-brown)]" href="/login">
              Back to login
            </a>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="py-14">
      <AuthCard title="Set new password">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormError message={error} />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Email (for your records)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <SubmitButton loading={loading} className="bg-[var(--light-brown)]">
            Reset password
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
