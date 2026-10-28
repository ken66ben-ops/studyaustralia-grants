import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyAustralia Grants",
  description: "Genuine, currently open scholarships at Australian universities, checked against official pages. Independent; not affiliated with any university.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
