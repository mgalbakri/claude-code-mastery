"use client";

import { useEffect } from "react";
import { captureReferrer } from "@/lib/referral";

/**
 * Invisible component that captures `?ref=` from the URL on first load
 * and stores it in localStorage for later attribution during signup.
 */
export function ReferralCapture() {
  useEffect(() => {
    captureReferrer();
  }, []);

  return null;
}
