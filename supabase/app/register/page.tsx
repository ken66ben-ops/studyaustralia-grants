import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SubscribeForm from "../SubscribeForm";
import { SiteNav, SiteFooter } from "../SiteChrome";
import { allScholarships, formatDate } from "@/lib/scholarships";
import { getMember, safeNext } from "@/lib/member";
import { SITE_NAME, flagFor } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `Register free – ${SITE_NAME}` };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next) ?? undefined;

  // Already registered? Go straight on.
  if (next && (await getMember())) redirect(next);

  const id = next ? decodeURIComponent(next.slice(4)) : null;
  const target = id ? (await allScholarships()).find((s) => s.id === id) : undefined;

  return (
    <>
      <section className="page-band">
        <div className="wrap">
          <SiteNav dark />
          <p className="pill">✍️ Free · takes 20 seconds · once only</p>
          <h1>{target ? "Register to apply" : "Register free"}</h1>
          <p>
            Registration is free and unlocks every scholarship&apos;s official application link. You&apos;ll also get new
            scholarships, deadline reminders, updates and guides by email.
          </p>
        </div>
      </section>
      <main className="wrap section register-grid">
        <div>
          {target && (
            <div className="target-card">
              <p className="target-label">You&apos;re about to open:</p>
              <p className="target-uni">{flagFor(target.country)} {target.university}</p>
              <h2>{target.name}</h2>
              <p className="amount">💰 {target.amount}</p>
              <p className="target-date">📅 Closes {formatDate(target.closes)}</p>
            </div>
          )}
          <ul className="perks">
            <li>🔓 Open every scholarship&apos;s official page</li>
            <li>⏰ Reminders before deadlines close</li>
            <li>🌍 New scholarships for the regions you pick</li>
            <li>📝 Updates and application guides</li>
          </ul>
        </div>
        <SubscribeForm next={next} bare />
      </main>
      <p className="wrap back"><Link href="/#scholarships">← Back to scholarships</Link></p>
      <SiteFooter />
    </>
  );
}
