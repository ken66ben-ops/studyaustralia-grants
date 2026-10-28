import Link from "next/link";

export function SiteNav({ dark = false }: { dark?: boolean }) {
  return (
    <nav className={`site-nav${dark ? " on-dark" : ""}`}>
      <Link href="/" className="logo">
        <span className="logo-mark" aria-hidden="true">🎓</span>
        <span>StudyAustralia<b>Grants</b></span>
      </Link>
      <div className="nav-links">
        <Link href="/#scholarships">Scholarships</Link>
        <Link href="/updates">Updates</Link>
        <Link href="/#subscribe" className="nav-cta">Get alerts</Link>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-logo">🎓 StudyAustralia<b>Grants</b></p>
          <p>A free, independent guide to real scholarships at Australian universities. Not affiliated with any university or government agency.</p>
        </div>
        <div className="footer-warn">
          <p><strong>⚠️ We never charge fees.</strong></p>
          <p>Apply only on official university websites. If anyone asks you to pay for a scholarship, it&apos;s a scam.</p>
        </div>
        <div className="footer-links">
          <Link href="/#scholarships">All scholarships</Link>
          <Link href="/updates">Updates &amp; guides</Link>
          <Link href="/#subscribe">Email alerts</Link>
        </div>
      </div>
      <p className="wrap footer-small">Always confirm amounts, dates and eligibility on the official page before applying.</p>
    </footer>
  );
}
