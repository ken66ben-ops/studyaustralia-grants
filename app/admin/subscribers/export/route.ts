import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  let s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formulas
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Not allowed", { status: 401 });
  const client = db();
  if (!client) return new Response("Database not connected", { status: 503 });
  const { data, error } = await client
    .from("subscribers")
    .select("email, name, interests, created_at, unsubscribed_at")
    .order("created_at", { ascending: true });
  if (error) return new Response("Error loading subscribers", { status: 500 });

  const header = ["email", "name", "interests", "joined", "unsubscribed"];
  const lines = [header.join(","), ...(data ?? []).map((r) => [r.email, r.name, r.interests, r.created_at, r.unsubscribed_at].map(cell).join(","))];
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
