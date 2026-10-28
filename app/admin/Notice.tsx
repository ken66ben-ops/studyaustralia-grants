export default function Notice({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="notice" role="status">{msg}</p>;
}

export function DbMissing() {
  return (
    <p className="notice warn">
      The database isn't connected yet, so nothing can be saved. Add <code>SUPABASE_URL</code> and{" "}
      <code>SUPABASE_SERVICE_ROLE_KEY</code> in Vercel, then redeploy.
    </p>
  );
}
