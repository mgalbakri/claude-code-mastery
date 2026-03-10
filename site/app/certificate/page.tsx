import type { Metadata } from "next";
import { CertificateClient } from "./certificate-client";

export const metadata: Metadata = {
  title: "Certificate of Completion",
  description:
    "Complete all 12 weeks of the AI coding course to earn your Agent Code Academy certificate. Verifiable, printable, and shareable.",
  openGraph: {
    title: "Certificate of Completion — Agent Code Academy",
    description:
      "Earn your certificate by completing the full 12-week AI coding course.",
    url: "https://agentcodeacademy.com/certificate",
    images: [
      {
        url: "/og?title=Certificate%20of%20Completion",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Certificate of Completion — Agent Code Academy",
    images: ["/og?title=Certificate%20of%20Completion"],
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://agentcodeacademy.com/certificate",
  },
};

export default function CertificatePage() {
  return <CertificateClient />;
}
