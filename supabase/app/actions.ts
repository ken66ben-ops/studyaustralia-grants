"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/supabase";
import { setMember, safeNext } from "@/lib/member";

export type SubscribeState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERESTS = ["undergraduate", "masters", "phd", "international", "oceania", "europe", "usa", "canada"];

/** Register / subscribe. If the form came from a scholarship's "Apply" button, continue to that scholarship. */
export async function subscribe(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  // Hidden "website" field: real people leave it empty, spam bots fill it in.
  if (String(form.get("website") ?? "").trim()) return { ok: true, message: "Thanks! You're registered." };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim().slice(0, 80) || null;
  const interests = form.getAll("interests").map(String).filter((i) => INTERESTS.includes(i));
  const consent = form.get("consent") === "on";
  const next = safeNext(form.get("next"));

  if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false, message: "Please enter a valid email address." };
  if (!consent) return { ok: false, message: "Please tick the box to agree to receive alerts." };

  const client = db();
  if (!client) return { ok: false, message: "Registration isn't open yet. Please check back soon." };

  const { data, error } = await client
    .from("subscribers")
    .upsert({ email, name, interests, unsubscribed_at: null }, { onConflict: "email" })
    .select("id")
    .single();
  if (error || !data) return { ok: false, message: "Something went wrong. Please try again later." };

  await setMember(data.id as string);
  if (next) redirect(next);
  return { ok: true, message: "You're registered! You can now open any scholarship, and we'll email you new ones and deadline reminders." };
}

export async function unsubscribe(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const client = db();
  if (!client || !/^[0-9a-f-]{36}$/i.test(token)) return;
  await client.from("subscribers").update({ unsubscribed_at: new Date().toISOString() }).eq("unsubscribe_token", token);
}
