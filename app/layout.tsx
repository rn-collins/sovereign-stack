import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL("https://sovereign-stack-psi.vercel.app"),
  alternates: { canonical: "/" },
  title: "Authority Layer | Independent Governance Prototype",
  description:
    "A working proposal showing how one specific use could remain bound to its authority decision as technology, people, purpose, and conditions change.",
  openGraph: {
    title: "Authority Layer",
    description:
      "A working proposal for binding one specific use to its authority decision across change, challenge, withdrawal, and exit.",
    url: "https://sovereign-stack-psi.vercel.app",
    siteName: "Authority Layer",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Authority Layer — an independent governance prototype",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Authority Layer",
    description:
      "A working proposal for binding one specific use to its authority decision across change, challenge, withdrawal, and exit.",
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
      <body>{children}</body>
    </html>
  );
}
