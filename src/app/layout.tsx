import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://agtnames.com"),
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
    creator: "@agtnames",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
