// lib/useSessionExpiry.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getTokenExpiry } from "./jwt";

interface SessionState {
  expiresAt: number | null;
  msRemaining: number;
  showWarning: boolean;
}

const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // show warning 2 minutes before expiry

/**
 * Pages that are safe to view without authentication.
 * The hook NEVER redirects to /login while the user is on one of these.
 * Add new public routes here (e.g. "/about", "/contact", "/faq").
 */
const PUBLIC_PAGES = [
  "/",
  "/login",
  "/register",
  "/marketplace",
  "/salons",
  "/forgot-password",
];

function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return true; // during SSR/first render, don't redirect
  return PUBLIC_PAGES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function useSessionExpiry() {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<SessionState>({
    expiresAt: null,
    msRemaining: 0,
    showWarning: false,
  });

  const refresh = useCallback(() => {
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("adminToken");
    if (!token) return;

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const msRemaining = expiry - Date.now();
    setState({
      expiresAt: expiry,
      msRemaining,
      showWarning: msRemaining <= WARNING_THRESHOLD_MS && msRemaining > 0,
    });
  }, []);

  // Initial read
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("adminToken");
      const publicNow = isPublicPath(pathname);

      if (!token) {
        // No token at all → kick them out ONLY on protected pages
        if (!publicNow) {
          router.push("/login");
        }
        return;
      }

      const expiry = getTokenExpiry(token);
      if (!expiry) {
        if (!publicNow) router.push("/login");
        return;
      }

      const msRemaining = expiry - Date.now();

      if (msRemaining <= 0) {
        // Hard expired → always clear the token, but only redirect
        // when the current page actually requires auth
        localStorage.removeItem("authToken");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        if (!publicNow) {
          router.push("/login?reason=expired");
        }
        return;
      }

      setState({
        expiresAt: expiry,
        msRemaining,
        showWarning: msRemaining <= WARNING_THRESHOLD_MS,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router, pathname]);

  return { ...state, refresh };
}