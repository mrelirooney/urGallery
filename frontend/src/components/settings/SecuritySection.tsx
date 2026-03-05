"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthAPI } from "@/lib/auth/client";

interface SecuritySectionProps {
  onSaveRef?: (saveFn: () => Promise<void>) => void;
  onResetRef?: (resetFn: () => void) => void;
}

export default function SecuritySection({ onSaveRef, onResetRef }: SecuritySectionProps) {
  const { user, refresh: refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Change email
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");

  const currentPasswordRef = useRef(currentPassword);
  const newPasswordRef = useRef(newPassword);
  const confirmPasswordRef = useRef(confirmPassword);
  const newEmailRef = useRef(newEmail);
  const emailCurrentPasswordRef = useRef(emailCurrentPassword);
  currentPasswordRef.current = currentPassword;
  newPasswordRef.current = newPassword;
  confirmPasswordRef.current = confirmPassword;
  newEmailRef.current = newEmail;
  emailCurrentPasswordRef.current = emailCurrentPassword;

  const resetForm = useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setNewEmail("");
    setEmailCurrentPassword("");
    setSaveError(null);
    setSaveSuccess(null);
  }, []);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    const cp = currentPasswordRef.current;
    const np = newPasswordRef.current;
    const cf = confirmPasswordRef.current;
    const ne = newEmailRef.current.trim().toLowerCase();
    const ecp = emailCurrentPasswordRef.current;

    const hasPasswordChange = cp || np || cf;
    const hasEmailChange = ne && ecp;

    if (!hasPasswordChange && !hasEmailChange) {
      return;
    }

    setSaving(true);
    try {
      if (hasPasswordChange) {
        if (!cp || !np || !cf) {
          setSaveError("Fill in all password fields to change password.");
          setSaving(false);
          return;
        }
        if (np.length < 8) {
          setSaveError("New password must be at least 8 characters.");
          setSaving(false);
          return;
        }
        if (np !== cf) {
          setSaveError("New password and confirm password do not match.");
          setSaving(false);
          return;
        }
        await AuthAPI.changePassword({ current_password: cp, new_password: np });
      }

      if (hasEmailChange) {
        if (!ne || !ecp) {
          setSaveError("Enter new email and current password to change email.");
          setSaving(false);
          return;
        }
        await AuthAPI.changeEmail({ new_email: ne, current_password: ecp });
      }

      await refreshUser();
      resetForm();
      setSaveSuccess(
        hasPasswordChange && hasEmailChange
          ? "Password and email updated successfully."
          : hasPasswordChange
            ? "Password updated successfully."
            : "Email updated successfully."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (onSaveRef) {
      onSaveRef(handleSave);
    }
  }, [onSaveRef]);

  useEffect(() => {
    if (onResetRef) {
      onResetRef(resetForm);
    }
  }, [onResetRef]);

  return (
    <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12">
      <div className="flex flex-col gap-10 max-w-xl">
        {/* Change Password */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Change password</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Current password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                New password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Confirm new password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        {/* Change Email */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Change email</h2>
          <p className="text-sm text-[var(--foreground)] opacity-80 mb-4">
            Current email: <span className="font-medium">{user?.email ?? "—"}</span>
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                New email
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="emailCurrentPassword" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Current password
              </label>
              <input
                type="password"
                id="emailCurrentPassword"
                value={emailCurrentPassword}
                onChange={(e) => setEmailCurrentPassword(e.target.value)}
                placeholder="Enter current password to confirm"
                className="w-full px-4 py-2 text-[var(--foreground)] bg-[var(--background)] rounded-xs ring-2 ring-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--light-brown)]/70 placeholder:opacity-60"
                autoComplete="current-password"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        {saveError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-400">
            {saveSuccess}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="hidden"
          id="security-save-btn"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
