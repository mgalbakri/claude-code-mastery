import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "next-themes";
import { parseCurriculum } from "@/lib/parse-curriculum";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButton } from "@/components/auth-button";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { ReferralCapture } from "@/components/referral-capture";
import { AuthProvider } from "@/lib/auth-context";
import { ProgressProvider } from "@/lib/progress-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://agentcodeacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Agent Code Academy — 12-Week AI Coding Course",
    template: "%s — Agent Code Academy",
  },
  description:
    "Go from zero coding knowledge to AI coding expert in 12 weeks. Learn to build real applications with Claude Code. Start free — upgrade to Pro for the full course.",
  keywords: [
    "Claude Code",
    "AI coding course",
    "learn to code with AI",
    "prompt engineering",
    "Claude Code tutorial",
    "AI programming",
    "MCP servers",
    "vibe coding",
    "AI agent development",
  ],
  authors: [{ name: "Agent Code Academy" }],
  creator: "Agent Code Academy",
  openGraph: {
    title: "Agent Code Academy — 12-Week AI Coding Course",
    description:
      "Go from zero coding knowledge to AI coding expert in 12 weeks. Learn to build real applications with Claude Code. Start free — upgrade to Pro for the full course.",
    url: BASE_URL,
    siteName: "Agent Code Academy",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og?title=12-Week%20AI%20Coding%20Course",
        width: 1200,
        height: 630,
        alt: "Agent Code Academy — 12-Week AI Coding Course",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Code Academy — 12-Week AI Coding Course",
    description:
      "Go from zero coding knowledge to AI coding expert in 12 weeks. Start free, go Pro when ready. Self-paced, always up-to-date.",
    images: ["/og?title=12-Week%20AI%20Coding%20Course"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const curriculum = parseCurriculum();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: "Agent Code Academy — AI Coding Course",
              description:
                "Go from zero coding knowledge to AI coding expert in 12 weeks. Learn to build real applications with Claude Code.",
              provider: {
                "@type": "Organization",
                name: "Agent Code Academy",
                url: BASE_URL,
              },
              url: BASE_URL,
              isAccessibleForFree: true,
              hasCourseInstance: [
                {
                  "@type": "CourseInstance",
                  name: "Free Tier (Weeks 1–4)",
                  courseMode: "online",
                  courseWorkload: "PT56H",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                },
                {
                  "@type": "CourseInstance",
                  name: "Pro Tier (Weeks 1–12)",
                  courseMode: "online",
                  courseWorkload: "PT168H",
                  offers: {
                    "@type": "Offer",
                    price: "49",
                    priceCurrency: "USD",
                  },
                },
              ],
              numberOfCredits: 12,
              educationalLevel: "Beginner",
              inLanguage: "en",
              teaches: [
                "AI-assisted coding",
                "Claude Code",
                "Terminal and command line",
                "Git and version control",
                "React and Next.js",
                "Databases and APIs",
                "MCP servers",
                "AI agent development",
              ],
            }),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ProgressProvider>
              <div className="flex min-h-screen overflow-x-hidden">
                <Sidebar
                  phases={curriculum.phases}
                  appendices={curriculum.appendices}
                />
                <div className="flex-1 min-w-0">
                  {/* Mobile header */}
                  <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
                    <MobileNav
                      phases={curriculum.phases}
                      appendices={curriculum.appendices}
                    />
                    <span className="text-sm font-semibold">
                      Agent Code Academy
                    </span>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <AuthButton />
                    </div>
                  </header>
                  {/* Desktop header */}
                  <div className="hidden lg:flex justify-end items-center gap-2 p-3">
                    <ThemeToggle />
                    <AuthButton />
                  </div>
                  <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    {children}
                  </main>
                </div>
              </div>
              <ExitIntentPopup />
              <ReferralCapture />
            </ProgressProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://app.lemonsqueezy.com/js/lemon.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
