"use client";
import { useMemo, useState } from "react";
import type { Scholarship } from "@/lib/scholarships";

export type Row = Scholarship & { closed: boolean; closesLabel: string; daysLeft: number };

type Filter = "all" | "soon" | "intl" | "ug" | "masters" | "phd";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "soon", label: "⏰ Closing soon" },
  { id: "intl", label: "🌏 International" },
  { id: "ug", label: "Undergraduate" },
  { id: "masters", label: "Master's" },
  { id: "phd", label: "PhD & research" },
];

const AVATAR_COLORS = ["#ff7a59", "#2bb3a3", "#7c5cff", "#ffb020", "#ef4f8b", "#2f80ed", "#16a34a"];

function initials(name: string): string {
  const skip = new Set(["the", "of", "university", "and"]);
  const words = name.split(/\s+/).filter((w) => !skip.has(w.toLowerCase()));
  return (words.slice(0, 2).map((w) => w[0]).join("") || name.slice(0, 2)).toUpperCase();
}

function colorFor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function matches(r: Row, f: Filter): boolean {
  const level = r.level.toLowerCase();
  switch (f) {
    case "soon": return !r.closed && r.daysLeft <= 30;
    case "intl": return r.international;
    case "ug": return level.includes("undergrad");
    case "masters": return level.includes("master");
    case "phd": return /phd|research|mphil|doctor/.test(level);
    default: return true;
  }
}

function countdown(r: Row): { text: string; tone: "urgent" | "soon" | "later" | "closed" } {
  if (r.closed) return { text: "Closed", tone: "closed" };
  if (r.daysLeft === 0) return { text: "Closes today!", tone: "urgent" };
  if (r.daysLeft === 1) return { text: "1 day left", tone: "urgent" };
  if (r.daysLeft <= 7) return { text: `${r.daysLeft} days left`, tone: "urgent" };
  if (r.daysLeft <= 30) return { text: `${r.daysLeft} days left`, tone: "soon" };
  const [y, m, d] = r.closes.split("-").map(Number);
  const short = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
  return { text: `Open · till ${short}`, tone: "later" };
}

export default function ScholarshipList({ rows }: { rows: Row[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const shown = useMemo(() => rows.filter((s) =>
    matches(s, filter) &&
    (!query || `${s.university} ${s.name} ${s.level} ${s.field} ${s.eligibility}`.toLowerCase().includes(query))
  ), [rows, filter, query]);

  return (
    <>
      <div className="finder">
        <div className="search-box">
          <span aria-hidden="true">🔎</span>
          <input type="search" placeholder="Search a university, course or level…" value={q}
            onChange={(e) => setQ(e.target.value)} aria-label="Search scholarships" />
        </div>
        <div className="chips" role="group" aria-label="Filter scholarships">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={`chip${filter === f.id ? " active" : ""}`}
              aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <p className="count">Showing <b>{shown.length}</b> scholarship{shown.length === 1 ? "" : "s"}</p>

      {shown.length === 0 ? (
        <div className="empty">😕 Nothing matches that yet. Try another filter, or <a href="#subscribe">get alerts</a> when new ones arrive.</div>
      ) : (
        <ul className="grid">
          {shown.map((s) => {
            const cd = countdown(s);
            return (
              <li key={`${s.source}-${s.id}`} className={`s-card tone-${cd.tone}`}>
                <div className="s-top">
                  <span className="avatar" style={{ background: colorFor(s.university) }} aria-hidden="true">{initials(s.university)}</span>
                  <span className="s-uni">{s.university}</span>
                  <span className={`countdown ${cd.tone}`}>{cd.text}</span>
                </div>
                <h3>{s.name}</h3>
                <p className="amount">💰 {s.amount}</p>
                <div className="tags">
                  <span className="tag">🎓 {s.level}</span>
                  {s.field && s.field !== "All fields" && <span className="tag">📚 {s.field}</span>}
                  {s.international && <span className="tag tag-intl">🌏 International OK</span>}
                </div>
                <p className="elig"><b>Who can apply:</b> {s.eligibility}</p>
                {s.notes && <p className="note">ℹ️ {s.notes}</p>}
                <div className="s-foot">
                  <span className="date">📅 {s.closesLabel}</span>
                  <a className="btn btn-apply" href={s.url} target="_blank" rel="noopener noreferrer">Official page ↗</a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
