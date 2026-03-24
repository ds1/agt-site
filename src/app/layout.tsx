import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: ".agt — Name your agent",
  description: "The identity layer for AI agents. Claim a name, declare capabilities, get discovered.",
  openGraph: {
    title: ".agt — Name your agent",
    description: "The identity layer for AI agents. Claim a name, declare capabilities, get discovered.",
    siteName: ".agt",
  },
  twitter: {
    card: "summary",
    title: ".agt — Name your agent",
    description: "The identity layer for AI agents.",
    creator: "@agtdomains",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
