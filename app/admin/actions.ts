"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { requireAdmin, passwordMatches, startSession, endSession } from "@/lib/auth";
import { slugify } from "@/lib/posts";
import { sendAlert } from "@/lib/email";

function text(form: FormData, key: string, max = 5000): string {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/updates");
  revalidatePath("/updates/[slug]", "page");
}

/* ---------- Login ---------- */

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  // Small delay makes password guessing slower.
  await new Promise((r) => setTimeout(r, 600));
  if (!passwordMatches(String(form.get("password") ?? ""))) return "Wrong password.";
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

/* ---------- Posts (blog + updates) ---------- */

export async function createPost(form: FormData): Promise<void> {
  await requireAdmin();
  const client = db();
  if (!client) redirect("/admin?msg=" + encodeURIComponent("Database not connected."));

  const title = text(form, "title", 200);
  const body = text(form, "body", 50000);
  if (!title || !body) redirect("/admin/posts?msg=" + encodeURIComponent("Title and text are required."));

  let image_url: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      redirect("/admin/posts?msg=" + encodeURIComponent("Picture must be an image under 4 MB."));
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `posts/${Date.now()}.${ext}`;
    const { error } = await client!.storage.from("media").upload(path, file, { contentType: file.type });
    if (error) redirect("/admin/posts?msg=" + encodeURIComponent("Picture upload failed: " + error.message));
    image_url = client!.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await client!.from("posts").insert({
    slug: slugify(title),
    kind: form.get("kind") === "blog" ? "blog" : "update",
    title,
    summary: text(form, "summary", 300) || null,
    body,
    image_url,
    published: form.get("published") === "on",
  });
  if (error) redirect("/admin/posts?msg=" + encodeURIComponent("Could not save: " + error.message));
  refreshPublicPages();
  redirect("/admin/posts?msg=" + encodeURIComponent("Saved."));
}

export async function togglePost(form: FormData): Promise<void> {
  await requireAdmin();
  const client = db();
  if (!client) return;
  await client.from("posts").update({ published: form.get("published") === "true" }).eq("id", text(form, "id"));
  refreshPublicPages();
  revalidatePath("/admin/posts");
}

export async function deletePost(form: FormData): Promise<void> {
  await requireAdmin();
  const client = db();
  if (!client) return;
  await client.from("posts").delete().eq("id", text(form, "id"));
  refreshPublicPages();
  revalidatePath("/admin/posts");
}

/* ---------- Scholarships added by hand ---------- */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function createScholarship(form: FormData): Promise<void> {
  await requireAdmin();
  const client = db();
  if (!client) redirect("/admin?msg=" + encodeURIComponent("Database not connected."));

  const url = text(form, "url", 500);
  const closes = text(form, "closes", 10);
  const opens = text(form, "opens", 10);
  const back = (m: string) => redirect("/admin/scholarships?msg=" + encodeURIComponent(m));

  let host = "";
  try { host = new URL(url).hostname; } catch { back("The link isn't a valid web address."); }
  if (!/(\.edu\.au|\.gov\.au|\.edu|\.org|\.ac\.[a-z]{2})$/.test(host)) {
    back("Use the official university or government page (usually ending in .edu.au or .gov.au).");
  }
  if (!DATE_RE.test(closes)) back("Closing date is required.");

  const row = {
    university: text(form, "university", 200),
    name: text(form, "name", 300),
    amount: text(form, "amount", 300),
    level: text(form, "level", 200),
    field: text(form, "field", 200) || "All fields",
    eligibility: text(form, "eligibility", 600),
    international: form.get("international") === "on",
    opens: DATE_RE.test(opens) ? opens : null,
    closes,
    url,
    notes: text(form, "notes", 600) || null,
  };
  if (!row.university || !row.name || !row.amount || !row.level || !row.eligibility) back("Please fill in every required box.");

  const { error } = await client!.from("scholarships").insert(row);
  if (error) back("Could not save: " + error.message);
  refreshPublicPages();
  back("Scholarship added. It's now on the website.");
}

export async function deleteScholarship(form: FormData): Promise<void> {
  await requireAdmin();
  const client = db();
  if (!client) return;
  await client.from("scholarships").delete().eq("id", text(form, "id"));
  refreshPublicPages();
  revalidatePath("/admin/scholarships");
}

/* ---------- Subscribers ---------- */

export async function removeSubscriber(form: FormData): Promise<void> {
  await requireAdmin();
  const client = db();
  if (!client) return;
  await client.from("subscribers").delete().eq("id", text(form, "id"));
  revalidatePath("/admin/subscribers");
}

/* ---------- Email alerts ---------- */

export async function sendAlertAction(form: FormData): Promise<void> {
  await requireAdmin();
  const client = db();
  const back = (m: string) => redirect("/admin/alerts?msg=" + encodeURIComponent(m));
  if (!client) back("Database not connected.");

  const subject = text(form, "subject", 200);
  const body = text(form, "body", 20000);
  if (!subject || !body) back("Subject and message are required.");
  if (form.get("confirm") !== "on") back("Tick the box to confirm before sending.");

  const audience = text(form, "audience", 40);
  let q = client!.from("subscribers").select("email, name, unsubscribe_token").is("unsubscribed_at", null);
  if (audience && audience !== "all") q = q.contains("interests", [audience]);
  const { data: recipients, error } = await q;
  if (error) back("Could not load subscribers: " + error.message);
  if (!recipients || recipients.length === 0) back("No subscribers match that group yet.");

  const result = await sendAlert(subject, body, recipients!);
  await client!.from("alerts").insert({ subject, body, sent_count: result.sent });
  revalidatePath("/admin/alerts");
  back(result.error ? `Sent ${result.sent}. Problem: ${result.error}` : `Sent to ${result.sent} subscriber(s).`);
}
