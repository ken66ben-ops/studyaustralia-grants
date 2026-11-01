import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  if (!adminConfigured()) {
    return (
      <div className="panel">
        <h1>Admin isn't switched on yet</h1>
        <p>Add <code>ADMIN_PASSWORD</code> and <code>SESSION_SECRET</code> (at least 16 characters) in Vercel → Settings → Environment Variables, then redeploy.</p>
      </div>
    );
  }
  return <LoginForm />;
}
