import type { Metadata } from "next";
import { PricingClient } from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans",
  description:
    "Start the 12-week AI coding course free. Upgrade to Pro for lifetime access to all weeks, advanced projects, certificate, and priority support.",
  openGraph: {
    title: "Pricing — Agent Code Academy",
    description:
      "Start free with Weeks 1–4. Go Pro for the full 12-week course — one-time payment, lifetime access.",
    url: "https://agentcodeacademy.com/pricing",
    images: [
      {
        url: "/og?title=Pricing%20%E2%80%94%20Free%20%26%20Pro%20Plans",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Agent Code Academy",
    images: ["/og?title=Pricing%20%E2%80%94%20Free%20%26%20Pro%20Plans"],
  },
  alternates: {
    canonical: "https://agentcodeacademy.com/pricing",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
