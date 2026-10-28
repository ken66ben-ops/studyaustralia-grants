import { requireAdmin } from "@/lib/auth";
import { db, dbConfigured } from "@/lib/supabase";
import { formatDate } from "@/lib/scholarships";
import { removeSubscriber } from "../actions";
import { DbMissing } from "../Notice";

type Sub = { id: string; email: string; name: string | null; interests: string[]; unsubscribed_at: string | null; created_at: string };

export default async function SubscribersAdmin() {
  await requireAdmin();
  const client = db();
  const { data } = client
    ? await client.from("subscribers").select("id, email, name, interests, unsubscribed_at, created_at").order("created_at", { ascending: false })
    : { data: [] as Sub[] };
  const subs = (data ?? []) as Sub[];
  const active = subs.filter((s) => !s.unsubscribed_at).length;

  return (
    <>
      {!dbConfigured() && <DbMissing />}
      <h1>Subscribers</h1>
      <p>{active} active · {subs.length - active} unsubscribed · <a href="/admin/subscribers/export">Download as spreadsheet (CSV)</a></p>
      <table className="table">
        <thead><tr><th>Email</th><th>Name</th><th>Interests</th><th>Joined</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id}>
              <td>{s.email}</td>
              <td>{s.name ?? ""}</td>
              <td>{s.interests.join(", ")}</td>
              <td>{formatDate(s.created_at)}</td>
              <td>{s.unsubscribed_at ? "Unsubscribed" : "Active"}</td>
              <td>
                <form action={removeSubscriber}>
                  <input type="hidden" name="id" value={s.id} />
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
