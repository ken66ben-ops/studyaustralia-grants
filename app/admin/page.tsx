import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, dbConfigured } from "@/lib/supabase";
import { emailConfigured } from "@/lib/email";
import { allScholarships, formatDate, isClosed } from "@/lib/scholarships";
import { listPosts } from "@/lib/posts";
import Notice, { DbMissing } from "./Notice";
import { flagFor } from "@/lib/site";

type Props = { searchParams: Promise<{ q?: string; msg?: string }> };

async function counts() {
  const client = db();
  if (!client) return { subscribers: 0, clicks: 0 };
  const { count } = await client.from("subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null);
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { count: clicks } = await client.from("clicks").select("id", { count: "exact", head: true }).gte("created_at", since);
  return { subscribers: count ?? 0, clicks: clicks ?? 0 };
}

export default async function AdminHome({ searchParams }: Props) {
  await requireAdmin();
  const { q = "", msg } = await searchParams;
  const query = q.trim().toLowerCase();

  const [scholarships, posts, c] = await Promise.all([allScholarships(), listPosts({ includeDrafts: true }), counts()]);
  const open = scholarships.filter((s) => !isClosed(s)).length;

  const sHits = query ? scholarships.filter((s) => `${s.university} ${s.name} ${s.level} ${s.field} ${s.eligibility} ${s.country}`.toLowerCase().includes(query)) : [];
  const pHits = query ? posts.filter((p) => `${p.title} ${p.summary ?? ""} ${p.body}`.toLowerCase().includes(query)) : [];

  return (
    <>
      <Notice msg={msg} />
      {!dbConfigured() && <DbMissing />}
      <div className="stats">
        <div><strong>{open}</strong><span>open scholarships</span></div>
        <div><strong>{posts.length}</strong><span>posts</span></div>
        <div><strong>{c.subscribers}</strong><span>registered members</span></div>
        <div><strong>{c.clicks}</strong><span>applications opened (30 days)</span></div>
        <div><strong>{emailConfigured() ? "On" : "Off"}</strong><span>email alerts</span></div>
      </div>

      <div className="quick">
        <Link className="btn" href="/admin/posts">+ New post or update</Link>
        <Link className="btn" href="/admin/scholarships">+ Add a scholarship</Link>
        <Link className="btn" href="/admin/alerts">✉ Send an alert</Link>
      </div>

      <form className="search" method="get">
        <input type="search" name="q" defaultValue={q} placeholder="Search scholarships and posts…" aria-label="Search" />
        <button type="submit">Search</button>
      </form>

      {query && (
        <>
          <h2>Scholarships ({sHits.length})</h2>
          <table className="table">
            <thead><tr><th>University</th><th>Scholarship</th><th>Closes</th><th>Source</th></tr></thead>
            <tbody>
              {sHits.map((s) => (
                <tr key={`${s.source}-${s.id}`}>
                  <td>{flagFor(s.country)} {s.university}</td>
                  <td><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></td>
                  <td>{formatDate(s.closes)}{isClosed(s) && " (closed)"}</td>
                  <td>{s.source === "admin" ? "Added by you" : "Weekly list"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>Posts ({pHits.length})</h2>
          <ul className="post-list">
            {pHits.map((p) => (
              <li key={p.id}>{p.published ? <Link href={`/updates/${p.slug}`} target="_blank">{p.title}</Link> : <>{p.title} <em>(hidden)</em></>} <span className="meta">· {formatDate(p.created_at)}</span></li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
