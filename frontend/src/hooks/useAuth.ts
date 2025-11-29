"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthAPI } from "@/lib/auth/client";

export type User = {
  id: string | number;
  email: string;
  first_name?: string;
  last_name?: string;

  // NEW fields coming from /api/auth/me/
  slug?: string;          // e.g. "mrelirooney"
  display_name?: string;  // e.g. "Mr.EliRooney"
  title?: string;
  location?: string;
  bio?: string;
  avatar_url?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const me = await AuthAPI.me(); // calls /api/auth/me
      if (!me) {
        setUser(null);
      } else {
        setUser(me as User);
      }
    } catch (_err: any) {
      // Don't spam console / error overlay – just assume logged out
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);


  const refreshUser = useCallback(async () => {
    setLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await AuthAPI.logout();
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  // Initial load once on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Re-check auth whenever pathname changes (but not on login/signup)
  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") return;
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return {
    user,
    loading,
    refresh: refreshUser,
    logout,
    setUser,
    refreshUser,
  };
}
