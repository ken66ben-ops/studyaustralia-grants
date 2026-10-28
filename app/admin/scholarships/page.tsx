import { requireAdmin } from "@/lib/auth";
import { dbConfigured } from "@/lib/supabase";
import { adminScholarships, formatDate, isClosed } from "@/lib/scholarships";
import { createScholarship, deleteScholarship } from "../actions";
import Notice, { DbMissing } from "../Notice";

type Props = { searchParams: Promise<{ msg?: string }> };

export default async function ScholarshipsAdmin({ searchParams }: Props) {
  await requireAdmin();
  const { msg } = await searchParams;
  const mine = await adminScholarships();

  return (
    <>
      <Notice msg={msg} />
      {!dbConfigured() && <DbMissing />}
      <form action={createScholarship} className="panel">
        <h1>Add a scholarship</h1>
        <p className="hint">Copy every detail from the <strong>official</strong> university or government page. Don't guess amounts or dates.</p>
        <label>University *<input name="university" required placeholder="e.g. Edith Cowan University" /></label>
        <label>Scholarship name *<input name="name" required /></label>
        <label>Amount *<input name="amount" required placeholder="e.g. 20% tuition fee reduction" /></label>
        <label>Level *<input name="level" required placeholder="e.g. Undergraduate, Master by Coursework, PhD" /></label>
        <label>Field of study<input name="field" placeholder="All fields" /></label>
        <label>Who can apply *<textarea name="eligibility" required rows={3} /></label>
        <label className="check"><input type="checkbox" name="international" defaultChecked /> Open to international students</label>
        <div className="row">
          <label>Opens<input type="date" name="opens" /></label>
          <label>Closes *<input type="date" name="closes" required /></label>
        </div>
        <label>Official link *<input type="url" name="url" required placeholder="https://www.ecu.edu.au/scholarships/…" /></label>
        <label>Notes<input name="notes" placeholder="e.g. Closes 11:59pm AWST" /></label>
        <button type="submit">Add to website</button>
      </form>

      <h2>Scholarships you added ({mine.length})</h2>
      <p className="hint">The weekly list (from Claude) is managed separately in <code>data/scholarships.json</code>.</p>
      <table className="table">
        <thead><tr><th>University</th><th>Scholarship</th><th>Closes</th><th></th></tr></thead>
        <tbody>
          {mine.map((s) => (
            <tr key={s.id}>
              <td>{s.university}</td>
              <td><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></td>
              <td>{formatDate(s.closes)}{isClosed(s) && " (closed)"}</td>
              <td>
                <form action={deleteScholarship}>
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
