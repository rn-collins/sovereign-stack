import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL("https://sovereign-stack-psi.vercel.app"),
  alternates: { canonical: "/" },
  title: "Authority Layer | Independent Governance Prototype",
  description:
    "An independent prototype exploring how authority decisions could remain attached to uses across Purple Maiʻa's publicly described Sovereign Stack.",
  openGraph: {
    title: "Authority Layer",
    description:
      "An independent prototype exploring authority alongside Purple Maiʻa's publicly described Sovereign Stack.",
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
      "An independent prototype exploring authority alongside Purple Maiʻa's publicly described Sovereign Stack.",
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
