import raw from "@/data/scholarships.json";

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

/** Open ones first (closing soonest first), then recently closed. */
export function sortedScholarships(): Scholarship[] {
  const today = todayAU();
  return [...data.scholarships].sort((a, b) => {
    const ca = isClosed(a, today), cb = isClosed(b, today);
    if (ca !== cb) return ca ? 1 : -1;
    return a.closes.localeCompare(b.closes);
  });
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}
