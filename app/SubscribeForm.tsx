"use client";
import { useActionState } from "react";
import { subscribe, type SubscribeState } from "./actions";

const REGION_INTERESTS: [string, string][] = [
  ["oceania", "🦘 Australia & NZ"],
  ["europe", "🇪🇺 Europe & UK"],
  ["usa", "🇺🇸 USA"],
  ["canada", "🇨🇦 Canada"],
];

const INTERESTS: [string, string][] = [
  ["undergraduate", "🎒 Undergraduate"],
  ["masters", "📘 Master's"],
  ["phd", "🔬 PhD / research"],
  ["international", "🌏 International awards"],
];

type Props = {
  /** Where to go after registering, e.g. /go/<scholarship-id> */
  next?: string;
  /** Show only the form card (used on the /register page). */
  bare?: boolean;
};

export default function SubscribeForm({ next, bare = false }: Props) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);

  const card = state?.ok ? (
    <div className="subscribe-card done" role="status">
      <p className="big">🎉</p>
      <p><b>{state.message}</b></p>
    </div>
  ) : (
    <form action={action} className="subscribe-card">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="row">
        <input name="name" type="text" placeholder="First name" autoComplete="given-name" aria-label="First name" />
        <input name="email" type="email" placeholder="you@email.com" required autoComplete="email" aria-label="Email address" />
      </div>
      <fieldset>
        <legend>Where do you want to study?</legend>
        <div className="chips">
          {REGION_INTERESTS.map(([value, label]) => (
            <label key={value} className="chip chip-check">
              <input type="checkbox" name="interests" value={value} /> <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
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
        <input type="checkbox" name="consent" required /> I agree to receive scholarship alert emails. We also note which scholarships I open, so alerts match my interests. Unsubscribe any time.
      </label>
      <button type="submit" className="btn btn-sun btn-block" disabled={pending}>
        {pending ? "Registering…" : next ? "Register & continue to the scholarship →" : "Register free →"}
      </button>
      {state && !state.ok && <p className="error" role="alert">{state.message}</p>}
    </form>
  );

  if (bare) return card;

  return (
    <section className="subscribe-band" id="subscribe">
      <div className="subscribe-copy">
        <p className="pill pill-light">🔔 Free registration</p>
        <h2>Register once. Apply anywhere.</h2>
        <p>Free registration unlocks every scholarship link, plus new scholarships, deadline reminders, updates and guides straight to your inbox. No spam, unsubscribe any time.</p>
      </div>
      {card}
    </section>
  );
}
