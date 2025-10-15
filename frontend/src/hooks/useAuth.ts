"use client";
import { useEffect, useState } from "react";
import { AuthAPI } from "@/lib/auth/client";

export type User = { id: string | number; email: string; first_name?: string; last_name?: string };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const u = await AuthAPI.me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return { user, loading, reload: load };
}
