"use client";
import { useActionState } from "react";
import { subscribe, type SubscribeState } from "./actions";

const INTERESTS: [string, string][] = [
  ["undergraduate", "🎒 Undergraduate"],
  ["masters", "📘 Master's"],
  ["phd", "🔬 PhD / research"],
  ["international", "🌏 International awards"],
];

export default function SubscribeForm() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);

  return (
    <section className="subscribe-band" id="subscribe">
      <div className="subscribe-copy">
        <p className="pill pill-light">🔔 Free email alerts</p>
        <h2>Never miss a deadline again.</h2>
        <p>Get new scholarships and &quot;closing this week&quot; reminders straight to your inbox. No spam, unsubscribe any time.</p>
      </div>

      {state?.ok ? (
        <div className="subscribe-card done" role="status">
          <p className="big">🎉</p>
          <p><b>{state.message}</b></p>
        </div>
      ) : (
        <form action={action} className="subscribe-card">
          <div className="row">
            <input name="name" type="text" placeholder="First name" autoComplete="given-name" aria-label="First name" />
            <input name="email" type="email" placeholder="you@email.com" required autoComplete="email" aria-label="Email address" />
          </div>
          <fieldset>
            <legend>I&apos;m looking for</legend>
            <div className="chips">
              {INTERESTS.map(([value, label]) => (
                <label key={value} className="chip chip-check">
                  <input type="checkbox" name="interests" value={value} /> <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
          <label className="consent">
            <input type="checkbox" name="consent" required /> I agree to receive emails from StudyAustralia Grants.
          </label>
          <button type="submit" className="btn btn-sun btn-block" disabled={pending}>{pending ? "Subscribing…" : "Send me alerts →"}</button>
          {state && !state.ok && <p className="error" role="alert">{state.message}</p>}
        </form>
      )}
    </section>
  );
}
