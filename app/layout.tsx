import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sovereign-stack-psi.vercel.app"),
  alternates: { canonical: "/" },
  title: "The Sovereign Stack | Governance & Learning Layer",
  description:
    "A working concept for carrying community authority through every layer of an AI system—from purpose and data to models, use, review, and refusal.",
  openGraph: {
    title: "The Sovereign Stack",
    description:
      "A working proposal for a Purple Maiʻa-owned governance and learning layer carrying authority through every part of an AI system.",
    url: "https://sovereign-stack-psi.vercel.app",
    siteName: "The Sovereign Stack",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Sovereign Stack — community authority carried through the AI stack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Sovereign Stack",
    description:
      "A working proposal for a Purple Maiʻa-owned governance and learning layer carrying authority through every part of an AI system.",
    images: ["/opengraph-image"],
  },
  authors: [{ name: "Rayven-Nikkita (RN) Collins" }],
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
