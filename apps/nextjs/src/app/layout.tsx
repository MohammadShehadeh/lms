import "./globals.css";

import { ThemeProvider } from "@nucleus/ui/components/theme";
import { Toaster } from "@nucleus/ui/components/toast";
import { cn } from "@nucleus/ui/lib/utils";
import { NuqsAdapter } from "@nucleus/ui/providers/nuqs";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "@/env";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production" ? env.NEXT_PUBLIC_BASE_URL : "http://localhost:3000"
  ),
  title: "Nucleus",
  description: "A Real-World Full-Stack Reference Architecture",
  openGraph: {
    title: "Nucleus",
    description: "A platform for creating and managing learning content.",
    url: env.NEXT_PUBLIC_BASE_URL,
    siteName: "Nucleus",
  },
  twitter: {
    card: "summary_large_image",
    site: "@_mshehadeh",
    creator: "@_mshehadeh",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NuqsAdapter>
            <TRPCReactProvider>
              <HydrateClient>
                <div className="flex min-h-screen flex-col">{props.children}</div>
              </HydrateClient>
            </TRPCReactProvider>
          </NuqsAdapter>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
