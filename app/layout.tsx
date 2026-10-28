import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyAustralia Grants – real scholarships to study in Australia",
  description: "Free, verified list of open scholarships at Australian universities: undergraduate, Master's and PhD, with official links and real deadlines. Independent; not affiliated with any university.",
  openGraph: {
    title: "StudyAustralia Grants",
    description: "Real scholarships to study in Australia, checked against official university pages.",
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
