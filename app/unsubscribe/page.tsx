import Link from "next/link";
import { redirect } from "next/navigation";
import { unsubscribe } from "../actions";
import { SiteNav } from "../SiteChrome";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string; done?: string }> };

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token = "", done } = await searchParams;

  async function confirm(form: FormData) {
    "use server";
    await unsubscribe(form);
    redirect("/unsubscribe?done=1");
  }

  return (
    <>
    <section className="page-band"><div className="wrap"><SiteNav dark /></div></section>
    <main className="wrap section narrow-page">
      {done ? (
        <><h1>You're unsubscribed</h1><p className="lede">You won't get any more alert emails. You can sign up again any time on the home page.</p></>
      ) : (
        <form action={confirm} className="subscribe-card">
          <h1>Stop getting alerts?</h1>
          <input type="hidden" name="token" value={token} />
          <button type="submit">Yes, unsubscribe me</button>
        </form>
      )}
      <p className="back"><Link href="/">← Back to scholarships</Link></p>
    </main>
    </>
  );
}
