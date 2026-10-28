import { requireAdmin } from "@/lib/auth";
import { db, dbConfigured } from "@/lib/supabase";
import { emailConfigured } from "@/lib/email";
import { formatDate } from "@/lib/scholarships";
import { sendAlertAction } from "../actions";
import Notice, { DbMissing } from "../Notice";

type Props = { searchParams: Promise<{ msg?: string }> };
type Alert = { id: string; subject: string; sent_count: number; created_at: string };

export default async function AlertsAdmin({ searchParams }: Props) {
  await requireAdmin();
  const { msg } = await searchParams;
  const client = db();
  const { data } = client
    ? await client.from("alerts").select("id, subject, sent_count, created_at").order("created_at", { ascending: false }).limit(20)
    : { data: [] as Alert[] };
  const history = (data ?? []) as Alert[];
  const ready = emailConfigured() && dbConfigured();

  return (
    <>
      <Notice msg={msg} />
      {!dbConfigured() && <DbMissing />}
      {!emailConfigured() && (
        <p className="notice warn">
          Email sending is off. To switch it on, add <code>RESEND_API_KEY</code> and <code>ALERT_FROM_EMAIL</code> in Vercel.
          Until then you can download your subscriber list from the Subscribers page.
        </p>
      )}
      <form action={sendAlertAction} className="panel">
        <h1>Send an email alert</h1>
        <label>Send to
          <select name="audience" defaultValue="all">
            <option value="all">All subscribers</option>
            <option value="undergraduate">Interested in undergraduate</option>
            <option value="masters">Interested in Master's</option>
            <option value="phd">Interested in PhD / research</option>
            <option value="international">Interested in international awards</option>
          </select>
        </label>
        <label>Subject *<input name="subject" required maxLength={200} placeholder="e.g. 3 scholarships closing this week" /></label>
        <label>Message *<textarea name="body" required rows={12} placeholder={"Paste a caption or write your message.\nEach email gets a 'Hi <name>' greeting, the no-fees warning and an unsubscribe link automatically."} /></label>
        <label className="check"><input type="checkbox" name="confirm" /> I've checked this message. Send it now.</label>
        <button type="submit" disabled={!ready}>Send alert</button>
      </form>

      <h2>Sent alerts</h2>
      <table className="table">
        <thead><tr><th>Date</th><th>Subject</th><th>Sent to</th></tr></thead>
        <tbody>
          {history.map((a) => (
            <tr key={a.id}><td>{formatDate(a.created_at)}</td><td>{a.subject}</td><td>{a.sent_count}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
