import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { getNav } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Raleigh Hills Business Association",
    template: "%s | RHBA",
  },
  description:
    "Raleigh Hills Business Association — community, directory, events, and local business resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nav = getNav();

  return (
    <html
      lang="en"
      data-theme="business"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans antialiased">
        <AppShell nav={nav}>{children}</AppShell>
      </body>
    </html>
  );
}
