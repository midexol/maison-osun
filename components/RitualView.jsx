"use client";
import { useEffect, useState } from "react";
import ArchMark from "./ArchMark";
import Photo from "./Photo";
import { SIGNS, PRODUCTS, PRODUCT_PHOTO } from "@/lib/data";
import { compose, toScores } from "@/lib/ritual";
import { fmtDate } from "@/lib/client";
import { latestReading, getChecks, toggleCheck, dayKey, useStore } from "@/lib/store";

const DAY = 86400000;

function progress(checks, day, plan) {
  const d = checks[day] || { am: [], pm: [] };
  const am = plan.morning.filter(([k]) => d.am?.includes(k)).length;
  const pm = plan.evening.filter(([k]) => d.pm?.includes(k)).length;
  return { done: am + pm, total: plan.morning.length + plan.evening.length, am, pm };
}

export default function RitualView() {
  const [reading, ready] = useStore(latestReading);
  const [checks] = useStore(getChecks);
  const [now, setNow] = useState(null);
  useEffect(() => setNow(new Date()), []);

  if (!ready || !now) return <section className="app-page" />;

  if (!reading) {
    return (
      <section className="app-page empty-page">
        <div className="wrap narrow">
          <ArchMark size={56} />
          <span className="mono">Ritual</span>
          <h1 className="app-title">Your ritual starts with <em>a portrait.</em></h1>
          <p className="intro">Once your skin is read, your morning and evening steps appear here to tick off each day.</p>
          <div className="actions">
            <a className="btn" href="/consult">Begin your consultation</a>
            <a className="btn light" href="/portrait?sample=1">Try the sample ritual</a>
          </div>
        </div>
      </section>
    );
  }

  const plan = compose(toScores(reading));
  const today = dayKey(now);
  const c = checks || {};
  const p = progress(c, today, plan);
  const hour = now.getHours();
  const slotNow = hour < 15 ? "am" : "pm";

  // Streak: consecutive complete days ending today (or yesterday if today is not finished yet).
  let streak = 0;
  for (let i = p.done === p.total ? 0 : 1; i < 365; i++) {
    const q = progress(c, dayKey(new Date(now - i * DAY)), plan);
    if (q.done === q.total) streak++; else break;
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * DAY);
    const q = progress(c, dayKey(d), plan);
    return { d, frac: q.done / q.total, today: i === 6 };
  });
  const since = Math.floor((now - new Date(reading.at)) / DAY);
  const dayN = Math.min(28, since + 1);
  const due = new Date(new Date(reading.at).getTime() + 28 * DAY);
  const left = Math.max(0, 28 - since);

  return (
    <section className="app-page ritual-page" aria-labelledby="ritualTitle">
      <div className="wrap">
        <header className="page-head">
          <div>
            <span className="mono">{reading.sample ? "Sample ritual" : `From your portrait of ${fmtDate(reading.at, { day: "numeric", month: "long" })}`}</span>
            <h1 className="app-title" id="ritualTitle">Day {dayN} <em>of 28.</em></h1>
            <p className="intro">{plan.type} skin. Tick each step as you go; your streak and next portrait are tracked on this device.</p>
          </div>
          <div className="stat-row">
            <div><b>{p.done}<small>/{p.total}</small></b><span>Steps today</span></div>
            <div><b>{streak}</b><span>Day streak</span></div>
            <div><b>{left}</b><span>{left ? "Days to next portrait" : "Portrait due"}</span></div>
          </div>
        </header>

        <div className="week" aria-label="The last seven days">
          {week.map(({ d, frac, today: t }) => (
            <div key={d.toISOString()} className={`wday ${t ? "today" : ""}`}>
              <span className="wbar"><i style={{ height: `${Math.round(frac * 100)}%` }} /></span>
              <span className="caption">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
            </div>
          ))}
        </div>

        <div className="slots">
          {[["am", "Morning", plan.morning], ["pm", "Evening", plan.evening]].map(([slot, title, items]) => {
            const done = slot === "am" ? p.am : p.pm;
            return (
              <div key={slot} className={`slot ${slotNow === slot ? "now" : ""}`}>
                <div className="slot-head">
                  <h2>{title}</h2>
                  <span className="caption">{done === items.length ? "Complete" : `${done} of ${items.length}`}</span>
                </div>
                <ol>
                  {items.map(([k, why], i) => {
                    const on = !!c[today]?.[slot]?.includes(k);
                    return (
                      <li key={slot + k}>
                        <button type="button" className={`check ${on ? "on" : ""}`} aria-pressed={on} onClick={() => toggleCheck(today, slot, k)}>
                          <span className="num">{on ? "✓" : String(i + 1).padStart(2, "0")}</span>
                          <span className="thumb" style={{ background: PRODUCTS[k].tint }}>
                            <Photo name={PRODUCT_PHOTO[k]} alt="" label="" sizes="64px" widths={[160, 240]} />
                          </span>
                          <span className="txt">
                            <span className="step">{PRODUCTS[k].step}</span>
                            <b>{PRODUCTS[k].name}</b>
                            <span className="why">{why}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>

        <div className="next-portrait">
          <div>
            <span className="mono">Next portrait</span>
            <h3>{left ? <>Due {fmtDate(due, { weekday: "long", day: "numeric", month: "long" })}.</> : <>Ready when you are.</>}</h3>
            <p>Skin renews in roughly 28 days. Take your next selfie in the same light, and the journal will show what changed in each of your seven signs.</p>
          </div>
          <div className="actions">
            <a className="btn" href="/consult">{left ? "Read my skin early" : "Read my skin now"}</a>
            <a className="btn light" href="/journal">Open the journal</a>
          </div>
        </div>
      </div>
    </section>
  );
}
