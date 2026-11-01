import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { dbConfigured } from "@/lib/supabase";
import { listPosts } from "@/lib/posts";
import { formatDate } from "@/lib/scholarships";
import { createPost, deletePost, togglePost } from "../actions";
import Notice, { DbMissing } from "../Notice";

type Props = { searchParams: Promise<{ msg?: string }> };

export default async function PostsAdmin({ searchParams }: Props) {
  await requireAdmin();
  const { msg } = await searchParams;
  const posts = await listPosts({ includeDrafts: true });

  return (
    <>
      <Notice msg={msg} />
      {!dbConfigured() && <DbMissing />}
      <form action={createPost} className="panel">
        <h1>New post</h1>
        <label>Type
          <select name="kind" defaultValue="update">
            <option value="update">Short update</option>
            <option value="blog">Blog article</option>
          </select>
        </label>
        <label>Title *<input name="title" required maxLength={200} /></label>
        <label>Short summary (shown in lists)<input name="summary" maxLength={300} /></label>
        <label>Text *<textarea name="body" required rows={10} placeholder={"Leave an empty line between paragraphs.\nWeb links become clickable automatically."} /></label>
        <label>Picture (optional, under 4 MB)<input type="file" name="image" accept="image/*" /></label>
        <label className="check"><input type="checkbox" name="published" defaultChecked /> Show on the website now</label>
        <button type="submit">Save post</button>
      </form>

      <h2>All posts ({posts.length})</h2>
      <table className="table">
        <thead><tr><th>Title</th><th>Type</th><th>Date</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td>{p.published ? <Link href={`/updates/${p.slug}`} target="_blank">{p.title}</Link> : p.title}</td>
              <td>{p.kind === "blog" ? "Blog" : "Update"}</td>
              <td>{formatDate(p.created_at)}</td>
              <td>
                <form action={togglePost}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="published" value={String(!p.published)} />
                  <button className="link-btn">{p.published ? "Live · hide" : "Hidden · show"}</button>
                </form>
              </td>
              <td>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="link-btn danger">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
