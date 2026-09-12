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
  title: "Authority Layer | Governance for Purple Maiʻa's Sovereign Stack",
  description:
    "An independent governance prototype testing how authority, boundaries, review, withdrawal, repair, and exit could travel through Purple Maiʻa's Sovereign Stack.",
  openGraph: {
    title: "Authority Layer",
    description:
      "An independent governance prototype for Purple Maiʻa's Sovereign Stack.",
    url: "https://sovereign-stack-psi.vercel.app",
    siteName: "Authority Layer",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Authority Layer — carrying authority through the Sovereign Stack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Authority Layer",
    description:
      "An independent governance prototype for Purple Maiʻa's Sovereign Stack.",
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
