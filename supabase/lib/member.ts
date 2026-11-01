import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { dbConfigured } from "@/lib/supabase";

/**
 * Registered visitors get a signed cookie holding their subscriber id,
 * so they register once and can then open any scholarship.
 */
const COOKIE = "gsh_member";
const ONE_YEAR = 60 * 60 * 24 * 365;

function secret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

/** The register-before-apply step only switches on when the database and secret are set. */
export function gateEnabled(): boolean {
  return dbConfigured() && Boolean(secret());
}

function sign(id: string): string {
  return createHmac("sha256", secret()!).update(`member:${id}`).digest("hex");
}

export async function setMember(subscriberId: string): Promise<void> {
  if (!secret()) return;
  (await cookies()).set(COOKIE, `${subscriberId}.${sign(subscriberId)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: ONE_YEAR,
  });
}

/** Returns the registered visitor's subscriber id, or null. */
export async function getMember(): Promise<string | null> {
  if (!secret()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  const expected = Buffer.from(sign(id)), given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given) ? id : null;
}

/** Only allow redirects back into our own /go/ links. */
export function safeNext(next: unknown): string | null {
  const n = String(next ?? "");
  return /^\/go\/[A-Za-z0-9._~%-]{1,200}$/.test(n) ? n : null;
}
