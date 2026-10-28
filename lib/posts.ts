import { db } from "@/lib/supabase";

export type Post = {
  id: string;
  slug: string;
  kind: "blog" | "update";
  title: string;
  summary: string | null;
  body: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
};

const COLUMNS = "id, slug, kind, title, summary, body, image_url, published, created_at";

export async function listPosts(opts: { includeDrafts?: boolean; limit?: number } = {}): Promise<Post[]> {
  const client = db();
  if (!client) return [];
  let q = client.from("posts").select(COLUMNS).order("created_at", { ascending: false });
  if (!opts.includeDrafts) q = q.eq("published", true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  return error || !data ? [] : (data as Post[]);
}

export async function getPost(slug: string): Promise<Post | null> {
  const client = db();
  if (!client) return null;
  const { data } = await client.from("posts").select(COLUMNS).eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Post) ?? null;
}

export function slugify(title: string): string {
  const base = title.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 70);
  return `${base || "post"}-${Date.now().toString(36)}`;
}
