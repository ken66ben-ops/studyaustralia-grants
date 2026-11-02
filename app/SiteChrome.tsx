import Link from "next/link";
import { siteNameParts } from "@/lib/site";

export function SiteNav({ dark = false }: { dark?: boolean }) {
  const [a, b] = siteNameParts();
  return (
    <nav className={`site-nav${dark ? " on-dark" : ""}`}>
      <Link href="/" className="logo">
        <span className="logo-mark" aria-hidden="true">🎓</span>
        <span>{a}<b>{b}</b></span>
      </Link>
      <div className="nav-links">
        <Link href="/#scholarships">Scholarships</Link>
        <Link href="/updates">Updates</Link>
        <Link href="/register" className="nav-cta">Register free</Link>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  const [a, b] = siteNameParts();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-logo">🎓 {a}<b>{b}</b></p>
          <p>A free, independent guide to real scholarships in Australia, New Zealand, Europe, the UK, the USA and Canada. Not affiliated with any university or government agency.</p>
        </div>
        <div className="footer-links">
          <Link href="/#scholarships">All scholarships</Link>
          <Link href="/updates">Updates &amp; guides</Link>
          <Link href="/register">Register free</Link>
        </div>
      </div>
      <p className="wrap footer-small">Always confirm amounts, dates and eligibility on the official page before applying.</p>
    </footer>
  );
}
