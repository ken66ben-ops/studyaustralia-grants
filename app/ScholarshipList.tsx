"use client";
import { useState } from "react";
import type { Scholarship } from "@/lib/scholarships";

type Row = Scholarship & { closed: boolean; closesLabel: string };

export default function ScholarshipList({ rows }: { rows: Row[] }) {
  const [intlOnly, setIntlOnly] = useState(false);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const shown = rows.filter((s) =>
    (!intlOnly || s.international) &&
    (!query || `${s.university} ${s.name} ${s.level} ${s.field}`.toLowerCase().includes(query))
  );

  return (
    <>
      <div className="filters">
        <input type="search" placeholder="Search university, level or field" value={q}
          onChange={(e) => setQ(e.target.value)} aria-label="Search scholarships" />
        <label className="check">
          <input type="checkbox" checked={intlOnly} onChange={(e) => setIntlOnly(e.target.checked)} />
          Open to international students
        </label>
      </div>
      <p className="count">{shown.length} scholarship{shown.length === 1 ? "" : "s"}</p>
      <ul className="list">
        {shown.map((s) => (
          <li key={s.id} className={`card${s.closed ? " closed" : ""}`}>
            <div className="top">
              <span className="uni">{s.university}</span>
              <span className={`badge ${s.closed ? "badge-closed" : "badge-open"}`}>
                {s.closed ? "Closed" : `Closes ${s.closesLabel}`}
              </span>
            </div>
            <h2>{s.name}</h2>
            <dl>
              <dt>Amount</dt><dd>{s.amount}</dd>
              <dt>Level</dt><dd>{s.level}</dd>
              <dt>Field</dt><dd>{s.field}</dd>
              <dt>Who can apply</dt><dd>{s.eligibility}</dd>
            </dl>
            {s.notes && <p className="notes">{s.notes}</p>}
            <a className="apply" href={s.url} target="_blank" rel="noopener noreferrer">
              Official page →
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
