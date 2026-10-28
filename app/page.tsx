import Link from "next/link";
import ScholarshipList, { type Row } from "./ScholarshipList";
import SubscribeForm from "./SubscribeForm";
import { SiteNav, SiteFooter } from "./SiteChrome";
import { allScholarships, isClosed, formatDate, verified, todayAU } from "@/lib/scholarships";
import { listPosts } from "@/lib/posts";

export const revalidate = 300; // refresh every 5 minutes (admin changes also refresh it instantly)

function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.UTC(+fromIso.slice(0, 4), +fromIso.slice(5, 7) - 1, +fromIso.slice(8, 10));
  const b = Date.UTC(+toIso.slice(0, 4), +toIso.slice(5, 7) - 1, +toIso.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

export default async function Home() {
  const today = todayAU();
  const [scholarships, posts] = await Promise.all([allScholarships(), listPosts({ limit: 3 })]);
  const rows: Row[] = scholarships.map((s) => ({
    ...s, closed: isClosed(s, today), closesLabel: formatDate(s.closes), daysLeft: daysBetween(today, s.closes),
  }));
  const open = rows.filter((r) => !r.closed);
  const thisMonth = open.filter((r) => r.daysLeft <= 30).length;
  const intl = open.filter((r) => r.international).length;
  const unis = new Set(open.map((r) => r.university)).size;

  return (
    <>
      <section className="hero">
        <div className="glow glow-a" aria-hidden="true" />
        <div className="glow glow-b" aria-hidden="true" />
        <div className="wrap">
          <SiteNav dark />
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="pill">✨ Free · Official links only · No agents</p>
              <h1>Your future in Australia <span className="hl">starts with a scholarship.</span></h1>
              <p className="hero-lede">
                Real, open scholarships at Australian universities for undergrad, Master&apos;s and PhD students.
                Every listing is checked against the official university page.
              </p>
              <div className="hero-actions">
                <a href="#scholarships" className="btn btn-sun">Browse scholarships →</a>
                <a href="#subscribe" className="btn btn-ghost">🔔 Get deadline alerts</a>
              </div>
              <p className="hero-meta">Last checked {formatDate(verified)} · Updated every week</p>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="sticker s1"><span>🎓</span><b>{open.length}</b> open now</div>
              <div className="sticker s2"><span>⏰</span><b>{thisMonth}</b> closing in 30 days</div>
              <div className="sticker s3"><span>🌏</span><b>{intl}</b> for international students</div>
              <div className="sticker s4"><span>🏛️</span><b>{unis}</b> universities</div>
              <div className="orbit" />
            </div>
          </div>
        </div>
        <svg className="hero-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      <main className="wrap">
        <section className="steps" aria-label="How it works">
          <div className="step"><span className="step-icon">🔍</span><div><h3>Find</h3><p>Filter by level, field and who can apply.</p></div></div>
          <div className="step"><span className="step-icon">✅</span><div><h3>Check</h3><p>Open the official university page and read the details.</p></div></div>
          <div className="step"><span className="step-icon">🚀</span><div><h3>Apply</h3><p>Apply directly with the university. It&apos;s always free.</p></div></div>
        </section>

        <section id="scholarships" className="section">
          <div className="section-head">
            <h2>Open scholarships</h2>
            <p>Closing soonest first. Tap a card&apos;s button to go to the official page.</p>
          </div>
          <ScholarshipList rows={rows} />
        </section>

        {posts.length > 0 && (
          <section className="section">
            <div className="section-head row-between">
              <h2>Latest updates</h2>
              <Link href="/updates" className="more">See all →</Link>
            </div>
            <div className="post-grid">
              {posts.map((p) => (
                <Link key={p.id} href={`/updates/${p.slug}`} className="post-card">
                  {p.image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.image_url} alt="" />
                    : <div className="post-card-art" aria-hidden="true">{p.kind === "blog" ? "📝" : "📣"}</div>}
                  <div className="post-card-body">
                    <span className="tag">{p.kind === "blog" ? "Guide" : "Update"}</span>
                    <h3>{p.title}</h3>
                    {p.summary && <p>{p.summary}</p>}
                    <span className="post-date">{formatDate(p.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <SubscribeForm />
      </main>
      <SiteFooter />
    </>
  );
}
