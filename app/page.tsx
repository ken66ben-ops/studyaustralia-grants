import ScholarshipList from "./ScholarshipList";
import { sortedScholarships, isClosed, formatDate, verified, todayAU } from "@/lib/scholarships";

export const revalidate = 3600; // refresh "Closed" badges hourly

export default function Home() {
  const today = todayAU();
  const rows = sortedScholarships().map((s) => ({
    ...s, closed: isClosed(s, today), closesLabel: formatDate(s.closes),
  }));
  return (
    <main>
      <header>
        <h1>StudyAustralia Grants</h1>
        <p className="lede">Genuine, currently open scholarships at Australian universities. Every listing is checked against the official university or government page.</p>
        <p className="meta">Last checked {formatDate(verified)}</p>
      </header>
      <ScholarshipList rows={rows} />
      <footer>
        <p><strong>⚠️ We never charge fees. Apply only on official university websites.</strong></p>
        <p>StudyAustralia Grants is independent and not affiliated with any university or government agency. Always confirm details on the official page before applying.</p>
      </footer>
    </main>
  );
}
