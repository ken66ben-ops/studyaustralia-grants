import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost } from "@/lib/posts";
import { formatDate } from "@/lib/scholarships";
import PostBody from "../../PostBody";
import { SiteNav, SiteFooter } from "../../SiteChrome";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post
    ? { title: `${post.title} – StudyAustralia Grants`, description: post.summary ?? undefined, openGraph: post.image_url ? { images: [post.image_url] } : undefined }
    : { title: "Not found – StudyAustralia Grants" };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <>
    <section className="page-band"><div className="wrap"><SiteNav dark />
      <p className="pill">{post.kind === "blog" ? "📝 Guide" : "📣 Update"} · {formatDate(post.created_at)}</p>
      <h1>{post.title}</h1>
      {post.summary && <p>{post.summary}</p>}
    </div></section>
    <main className="wrap section">
      <article className="post">
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="post-image" />
        )}
        <PostBody text={post.body} />
      </article>
        <p className="back"><Link href="/updates">← All updates</Link> · <Link href="/#subscribe">Get scholarship alerts</Link></p>
    </main>
    <SiteFooter />
    </>
  );
}
