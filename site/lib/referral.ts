/**
 * Referral utilities.
 *
 * - Generates a short, deterministic ref code from an email address.
 * - Reads / stores the referrer code from the URL via localStorage.
 *
 * No database required — ref codes are derived from the subscriber's
 * email hash, and the referring code is attached as Resend contact metadata.
 */

const LS_REF_CODE = "ccm-referrer";

/** Generate a short (8-char) referral code from an email address. */
export function generateRefCode(email: string): string {
  const normalized = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0; // Convert to 32-bit int
  }
  // Convert to unsigned, then to base-36 for a compact alphanumeric code
  return (hash >>> 0).toString(36).padStart(6, "0").slice(0, 8);
}

/** Build a full referral URL for a given email. */
export function getReferralUrl(email: string): string {
  const code = generateRefCode(email);
  return `https://agentcodeacademy.com/?ref=${code}`;
}

/**
 * On page load, read `?ref=` from the URL and persist in localStorage.
 * Call this once from a client-side layout effect.
 */
export function captureReferrer(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref && ref.length >= 4) {
    localStorage.setItem(LS_REF_CODE, ref);
  }
}

/** Return the stored referrer code, if any. */
export function getStoredReferrer(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_REF_CODE);
}
