import raw from "@/data/scholarships.json";
import { db } from "@/lib/supabase";

export type Scholarship = {
  id: string;
  university: string;
  name: string;
  amount: string;
  level: string;
  field: string;
  eligibility: string;
  international: boolean;
  opens: string | null;
  closes: string;
  url: string;
  notes: string | null;
  /** "weekly" = from data/scholarships.json, "admin" = added in /admin */
  source?: "weekly" | "admin";
};

type Data = { verified: string; scholarships: Scholarship[] };
const data = raw as Data;

export const verified = data.verified;

/** Today's date in Australia (Perth), as YYYY-MM-DD. */
export function todayAU(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Perth" }).format(new Date());
}

export function isClosed(s: Scholarship, today = todayAU()): boolean {
  return s.closes < today;
}

/** Scholarships added by hand in /admin (empty if no database). */
export async function adminScholarships(): Promise<Scholarship[]> {
  const client = db();
  if (!client) return [];
  const { data: rows, error } = await client
    .from("scholarships")
    .select("id, university, name, amount, level, field, eligibility, international, opens, closes, url, notes")
    .order("closes", { ascending: true });
  if (error || !rows) return [];
  return rows.map((r) => ({ ...r, source: "admin" as const })) as Scholarship[];
}

/** Weekly list + admin-added list. Open ones first (closing soonest), then recently closed. */
export async function allScholarships(): Promise<Scholarship[]> {
  const today = todayAU();
  const weekly = data.scholarships.map((s) => ({ ...s, source: "weekly" as const }));
  const extra = await adminScholarships();
  return [...weekly, ...extra].sort((a, b) => {
    const ca = isClosed(a, today), cb = isClosed(b, today);
    if (ca !== cb) return ca ? 1 : -1;
    return a.closes.localeCompare(b.closes);
  });
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}
