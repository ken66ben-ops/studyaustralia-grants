/**
 * Site name and regions in one place.
 * To rename the site, set NEXT_PUBLIC_SITE_NAME in Vercel (e.g. "Global Scholarship Hub") and redeploy.
 * The logo splits the name at the last space: "Global Scholarship" + bold "Hub".
 */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Global Scholarship Hub";

export function siteNameParts(): [string, string] {
  const i = SITE_NAME.lastIndexOf(" ");
  return i > 0 ? [SITE_NAME.slice(0, i), SITE_NAME.slice(i + 1)] : [SITE_NAME, ""];
}

export type Region = "oceania" | "europe" | "usa" | "canada";

export const REGIONS: { id: Region; label: string; short: string; emoji: string }[] = [
  { id: "oceania", label: "Australia & New Zealand", short: "Oceania", emoji: "🦘" },
  { id: "europe", label: "Europe & UK", short: "Europe & UK", emoji: "🇪🇺" },
  { id: "usa", label: "United States", short: "USA", emoji: "🇺🇸" },
  { id: "canada", label: "Canada", short: "Canada", emoji: "🇨🇦" },
];

export const REGION_IDS = REGIONS.map((r) => r.id) as Region[];

const FLAGS: Record<string, string> = {
  "Australia": "🇦🇺", "New Zealand": "🇳🇿", "United Kingdom": "🇬🇧", "Ireland": "🇮🇪", "Netherlands": "🇳🇱",
  "Germany": "🇩🇪", "France": "🇫🇷", "Sweden": "🇸🇪", "Switzerland": "🇨🇭", "Denmark": "🇩🇰", "Norway": "🇳🇴",
  "Finland": "🇫🇮", "Belgium": "🇧🇪", "Italy": "🇮🇹", "Spain": "🇪🇸", "Austria": "🇦🇹", "United States": "🇺🇸", "Canada": "🇨🇦",
};

export function flagFor(country: string | null | undefined): string {
  return (country && FLAGS[country]) || "🌍";
}

/** Countries offered in the admin form. */
export const COUNTRIES: { name: string; region: Region }[] = [
  { name: "Australia", region: "oceania" }, { name: "New Zealand", region: "oceania" },
  { name: "United Kingdom", region: "europe" }, { name: "Ireland", region: "europe" }, { name: "Netherlands", region: "europe" },
  { name: "Germany", region: "europe" }, { name: "France", region: "europe" }, { name: "Sweden", region: "europe" },
  { name: "Switzerland", region: "europe" }, { name: "Denmark", region: "europe" }, { name: "Norway", region: "europe" },
  { name: "Finland", region: "europe" }, { name: "Belgium", region: "europe" }, { name: "Italy", region: "europe" },
  { name: "Spain", region: "europe" }, { name: "Austria", region: "europe" }, { name: "Multiple (Europe)", region: "europe" },
  { name: "United States", region: "usa" }, { name: "Canada", region: "canada" },
];
