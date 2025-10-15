"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthAPI } from "@/lib/auth/client";

export type User = { id: string | number; email: string; first_name?: string; last_name?: string };

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);
  const router = useRouter(); 
  const pathname = usePathname();
  const fetchUser = useCallback(async () => {
    try {
      const res = await AuthAPI.me();
      setUser(res);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  const refreshUser = async () => {
    try {
      setLoading(true);
      const me = await AuthAPI.me(); // fetch("/api/auth/me", { credentials: "include" })
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      await AuthAPI.logout(); // POST /api/auth/logout/ that clears cookies
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };


  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    AuthAPI.me()
      .then(u => { if (!cancelled) setUser(u); })
      .catch(() => { if (!cancelled) setUser(null); })   // <- treat 401 as logged out
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tick]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    refreshUser(); // run once on mount
  }, []);
  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") return;
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return { user, loading, refresh, logout, setUser, refreshUser, };
}


