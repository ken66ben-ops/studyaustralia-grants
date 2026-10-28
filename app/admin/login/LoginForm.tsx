"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [error, action, pending] = useActionState<string | null, FormData>(login, null);
  return (
    <form action={action} className="panel narrow">
      <h1>Admin login</h1>
      <label>Password<input type="password" name="password" required autoFocus autoComplete="current-password" /></label>
      <button type="submit" disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
