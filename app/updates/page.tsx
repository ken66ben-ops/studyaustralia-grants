import Link from "next/link";
import { SiteNav, SiteFooter } from "../SiteChrome";
import type { Metadata } from "next";
import { listPosts } from "@/lib/posts";
import { formatDate } from "@/lib/scholarships";

export const revalidate = 300;
export const metadata: Metadata = { title: "Updates – StudyAustralia Grants" };

export default async function UpdatesPage() {
  const posts = await listPosts();
  return (
    <>
    <section className="page-band"><div className="wrap"><SiteNav dark /><h1>Updates &amp; guides</h1><p>News, tips and deadline reminders for students heading to Australia.</p></div></section>
    <main className="wrap section">
      {posts.length === 0 ? (
        <p className="lede">No updates yet. Check back soon.</p>
      ) : (
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
      )}
    </main>
    <SiteFooter />
    </>
  );
}
