import Link from "next/link";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { SITE_NAME } from "@/lib/site";
import { logout } from "./actions";

export const metadata: Metadata = { title: `Admin – ${SITE_NAME}`, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const loggedIn = await isAdmin();
  return (
    <div className="admin">
      <header className="admin-bar">
        <Link href="/admin" className="brand">Admin</Link>
        {loggedIn && (
          <nav>
            <Link href="/admin">Search</Link>
            <Link href="/admin/posts">Posts</Link>
            <Link href="/admin/scholarships">Scholarships</Link>
            <Link href="/admin/subscribers">Members</Link>
            <Link href="/admin/activity">Activity</Link>
            <Link href="/admin/alerts">Email alerts</Link>
            <Link href="/" target="_blank">View site ↗</Link>
            <form action={logout}><button className="link-btn">Log out</button></form>
          </nav>
        )}
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
