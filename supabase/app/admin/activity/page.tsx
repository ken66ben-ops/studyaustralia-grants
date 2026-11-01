import { requireAdmin } from "@/lib/auth";
import { db, dbConfigured } from "@/lib/supabase";
import { flagFor } from "@/lib/site";
import { DbMissing } from "../Notice";

type Click = {
  id: string; scholarship_id: string; scholarship_name: string; university: string; country: string | null;
  created_at: string; subscribers: { email: string; name: string | null } | null;
};

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Australia/Perth" });
}

export default async function ActivityAdmin() {
  await requireAdmin();
  const client = db();
  let clicks: Click[] = [];
  let missingTable = false;
  if (client) {
    const { data, error } = await client
      .from("clicks")
      .select("id, scholarship_id, scholarship_name, university, country, created_at, subscribers(email, name)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) missingTable = true;
    clicks = (data ?? []) as unknown as Click[];
  }

  // Most-opened scholarships
  const tally = new Map<string, { name: string; university: string; country: string | null; n: number; people: Set<string> }>();
  for (const c of clicks) {
    const t = tally.get(c.scholarship_id) ?? { name: c.scholarship_name, university: c.university, country: c.country, n: 0, people: new Set() };
    t.n++; if (c.subscribers?.email) t.people.add(c.subscribers.email);
    tally.set(c.scholarship_id, t);
  }
  const top = [...tally.values()].sort((a, b) => b.people.size - a.people.size).slice(0, 15);

  return (
    <>
      {!dbConfigured() && <DbMissing />}
      {missingTable && (
        <p className="notice warn">Activity tracking isn&apos;t set up yet. Run <code>supabase/upgrade-members.sql</code> in Supabase → SQL Editor.</p>
      )}
      <h1>Who opened which scholarship</h1>
      <p className="hint">Each row is a registered visitor clicking &quot;Apply on official site&quot;. It shows interest, not a finished application.</p>

      <h2>Most popular (by people)</h2>
      <table className="table">
        <thead><tr><th>Scholarship</th><th>University</th><th>People</th><th>Clicks</th></tr></thead>
        <tbody>
          {top.map((t) => (
            <tr key={t.name + t.university}><td>{t.name}</td><td>{flagFor(t.country)} {t.university}</td><td>{t.people.size}</td><td>{t.n}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Latest clicks</h2>
      <table className="table">
        <thead><tr><th>When</th><th>Person</th><th>Scholarship</th></tr></thead>
        <tbody>
          {clicks.slice(0, 100).map((c) => (
            <tr key={c.id}>
              <td>{when(c.created_at)}</td>
              <td>{c.subscribers ? `${c.subscribers.name ? c.subscribers.name + " · " : ""}${c.subscribers.email}` : "(deleted)"}</td>
              <td>{flagFor(c.country)} {c.scholarship_name} <span className="meta">· {c.university}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
