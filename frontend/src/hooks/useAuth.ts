"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthAPI, initCsrf } from "@/lib/auth/client";

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
  banner_image_url?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const me = await AuthAPI.me(); // calls /api/auth/me
      if (!me) {
        setUser(null);
        return null;
      }
      const u = me as User;
      setUser(u);
      return u;
    } catch (_err: any) {
      // Don't spam console / error overlay – just assume logged out
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);


  const refreshUser = useCallback(async (): Promise<User | null> => {
    setLoading(true);
    return fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    router.replace("/");
    try {
      await AuthAPI.logout();
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setUser(null);
    }
  }, [router]);

  

  // Initial load once on mount
  useEffect(() => {
    async function init() {
      try {
        await initCsrf();   // <-- from client.ts
      } catch (err) {
        console.error("Failed to init CSRF", err);
      }
      refreshUser();
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check auth whenever pathname changes (but not on login/signup/complete)
  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup" || pathname === "/signup/complete") return;
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
