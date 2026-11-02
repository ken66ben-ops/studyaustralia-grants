import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} – real scholarships to study abroad`,
  description: "Free, verified list of open scholarships in Australia, New Zealand, Europe, the UK, the USA and Canada: undergraduate, Master's and PhD, with official links and real deadlines. Independent; not affiliated with any university.",
  openGraph: {
    title: SITE_NAME,
    description: "Real scholarships to study abroad, checked against official university pages.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0b3d36" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
