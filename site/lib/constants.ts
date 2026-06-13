// Subscription API
export const SUBSCRIBE_API = "/api/subscribe";

// localStorage keys
export const LS_EMAIL_SUBSCRIBED = "ccm-email-subscribed";
export const LS_EMAIL_DISMISSED = "ccm-email-banner-dismissed";
export const LS_EMAIL_GATE_SKIPPED = "ccm-email-gate-skipped";
export const LS_EXIT_INTENT_SHOWN = "ccm-exit-intent-shown"; // sessionStorage
export const LS_PREMIUM_TOKEN = "ccm-premium-token";

// Course structure
export const FREE_WEEKS = [1, 2, 3, 4] as const;
export const PREMIUM_WEEKS = [5, 6, 7, 8, 9, 10, 11, 12] as const;
export const TOTAL_WEEKS = 12;
export const COURSE_IS_FREE = false;

// Pricing (dormant while COURSE_IS_FREE)
export const PRICE_AMOUNT = 4900; // cents
export const PRICE_DISPLAY = "$49";
export const ORIGINAL_PRICE_DISPLAY = "$99";
export const LAUNCH_PRICING = true;

// Lead magnet
export const CHEAT_SHEET_PATH = "/ai-coding-cheat-sheet.pdf";
