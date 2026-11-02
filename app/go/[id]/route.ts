import { NextResponse, type NextRequest } from "next/server";
import { allScholarships } from "@/lib/scholarships";
import { db } from "@/lib/supabase";
import { gateEnabled, getMember } from "@/lib/member";

export const dynamic = "force-dynamic";

/**
 * Every "Apply" button points here.
 * Registered visitor → record the click, then send them to the official page.
 * Not registered → send them to /register first.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = (await allScholarships()).find((x) => x.id === id);
  if (!s || !/^https:\/\//.test(s.url)) return NextResponse.redirect(new URL("/#scholarships", req.url));

  // No database yet: don't block anyone.
  if (!gateEnabled()) return NextResponse.redirect(s.url);

  const member = await getMember();
  if (!member) {
    const to = new URL("/register", req.url);
    to.searchParams.set("next", `/go/${encodeURIComponent(id)}`);
    return NextResponse.redirect(to);
  }

  try {
    await db()!.from("clicks").insert({
      subscriber_id: member, scholarship_id: s.id, scholarship_name: s.name, university: s.university, country: s.country, url: s.url,
    });
  } catch { /* never stop someone applying because logging failed */ }

  return NextResponse.redirect(s.url);
}
