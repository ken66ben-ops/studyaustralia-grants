# StudyAustralia Grants

An independent website listing **genuine, currently open scholarships** at Australian universities and the Australian Government. Not affiliated with any university.

## How it works

- The whole scholarship list lives in **`data/scholarships.json`**. The site reads it at build time.
- Weekly Facebook captions go in **`captions/YYYY-MM-DD.md`**.
- Pushing to `main` makes Vercel rebuild and publish the site automatically.
- A scholarship whose `closes` date has passed shows a grey **Closed** badge. Remove entries more than 30 days after they close.

## `data/scholarships.json` format

```json
{
  "verified": "YYYY-MM-DD",
  "scholarships": [ { ...one object per scholarship... } ]
}
```

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Unique, lowercase, hyphenated (e.g. `ecu-success-2027`) |
| `university` | string | University or government body |
| `name` | string | Official scholarship name |
| `amount` | string | Value exactly as stated on the official page |
| `level` | string | e.g. Undergraduate, Master by Coursework, PhD |
| `field` | string | Field(s) of study, or "All fields" |
| `eligibility` | string | One short sentence on who can apply |
| `international` | boolean | `true` if international students can apply |
| `opens` | string or null | `YYYY-MM-DD`, or `null` if not stated |
| `closes` | string | `YYYY-MM-DD` closing date (required) |
| `url` | string | Official page (`.edu.au`, `.gov.au` or official program domain) |
| `notes` | string or null | Caveats, extra deadlines, time zone |

## Rules

1. Only list scholarships confirmed on the **official** university or government page.
2. Never invent amounts or dates. If there's no close date, leave the scholarship out.
3. Say "fully funded" only if the page covers tuition **and** a living stipend.

## Run locally

```bash
npm ci
npm run dev     # http://localhost:3000
npx next build  # production build check
```
