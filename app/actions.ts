"use server";
import { db } from "@/lib/supabase";

export type SubscribeState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERESTS = ["undergraduate", "masters", "phd", "international"];

export async function subscribe(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  // Hidden "website" field: real people leave it empty, spam bots fill it in.
  if (String(form.get("website") ?? "").trim()) return { ok: true, message: "Thanks! You're subscribed." };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim().slice(0, 80) || null;
  const interests = form.getAll("interests").map(String).filter((i) => INTERESTS.includes(i));
  const consent = form.get("consent") === "on";

  if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false, message: "Please enter a valid email address." };
  if (!consent) return { ok: false, message: "Please tick the box to agree to receive alerts." };

  const client = db();
  if (!client) return { ok: false, message: "Sign-ups aren't open yet. Please check back soon." };

  const { error } = await client
    .from("subscribers")
    .upsert({ email, name, interests, unsubscribed_at: null }, { onConflict: "email" });
  if (error) return { ok: false, message: "Something went wrong. Please try again later." };
  return { ok: true, message: "Thanks! You'll get alerts about new scholarships and deadlines." };
}

export async function unsubscribe(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const client = db();
  if (!client || !/^[0-9a-f-]{36}$/i.test(token)) return;
  await client.from("subscribers").update({ unsubscribed_at: new Date().toISOString() }).eq("unsubscribe_token", token);
}
