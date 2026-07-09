"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { trackEvent } from "@/lib/analytics";

const FLAG = "ao_signup_tracked";

/**
 * Fires `signup_completed` exactly once per device when a freshly created
 * account first loads the app (Clerk has no client-side "just signed up"
 * signal, so we infer it from user.createdAt being minutes old). Renders
 * nothing. Must be mounted inside ClerkProvider.
 */
export default function SignupTracker() {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !user?.createdAt) return;
    try {
      if (localStorage.getItem(FLAG)) return;
      const ageMs = Date.now() - new Date(user.createdAt).getTime();
      // 10-minute window: wide enough to survive OAuth round-trips and the
      // post-signup redirect, narrow enough not to count old accounts that
      // sign in on a new device.
      if (ageMs < 10 * 60_000) trackEvent("signup_completed");
      // Either way, never evaluate again on this device.
      localStorage.setItem(FLAG, "1");
    } catch {
      /* storage unavailable (private mode) — skip silently */
    }
  }, [isLoaded, user]);

  return null;
}
