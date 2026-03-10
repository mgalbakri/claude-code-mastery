import type { Metadata } from "next";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Your Profile",
  description:
    "Track your progress through the 12-week AI coding course. View completed weeks, earn your certificate of completion, and manage your account.",
  openGraph: {
    title: "Your Profile — Agent Code Academy",
    description:
      "Track your progress through the 12-week AI coding course and earn your certificate.",
    url: "https://agentcodeacademy.com/profile",
    images: [
      {
        url: "/og?title=Your%20Profile",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Profile — Agent Code Academy",
    images: ["/og?title=Your%20Profile"],
  },
  alternates: {
    canonical: "https://agentcodeacademy.com/profile",
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
