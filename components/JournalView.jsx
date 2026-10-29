"use client";
import { useState } from "react";
import ArchMark from "./ArchMark";
import { SIGNS, ORDER, sampleHistory } from "@/lib/data";
import { toScores, band } from "@/lib/ritual";
import { fmtDate } from "@/lib/client";
import { getReadings, saveReading, deleteReading, useStore } from "@/lib/store";
import { Delta } from "./PortraitView";

const overallOf = (r) => {
  if (r.overall != null) return Math.round(r.overall);
  const v = Object.values(toScores(r));
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
};

function Trend({ points }) {
  // points: oldest -> newest [{ at, v }]
  const W = 960, H = 280, P = { l: 48, r: 48, t: 30, b: 34 };
  const vs = points.map((p) => p.v);
  const lo = Math.max(0, Math.floor((Math.min(...vs) - 6) / 5) * 5);
  const hi = Math.min(100, Math.ceil((Math.max(...vs) + 6) / 5) * 5);
  const x = (i) => P.l + (points.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (points.length - 1));
  const y = (v) => P.t + ((hi - v) * (H - P.t - P.b)) / (hi - lo || 1);
  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  return (
    <svg className="trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Trend from ${vs[0]} to ${vs[vs.length - 1]}`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="grid" />
          <text x={P.l - 10} y={y(t) + 4} textAnchor="end" className="tick">{t}</text>
        </g>
      ))}
      <path d={d} className="line" />
      {points.map((p, i) => (
        <g key={p.at}>
          <line x1={x(i)} x2={x(i)} y1={y(p.v)} y2={H - P.b} className="stem" />
          <text x={x(i)} y={y(p.v) - 10} textAnchor="middle" className="val">{p.v}</text>
          <text x={x(i)} y={H - 10} textAnchor="middle" className="tick">{fmtDate(p.at, { day: "numeric", month: "short" })}</text>
        </g>
      ))}
    </svg>
  );
}

export default function JournalView() {
  const [list, ready] = useStore(getReadings);
  const [sign, setSign] = useState("overall");
  const [confirm, setConfirm] = useState(null);

  if (!ready) return <section className="app-page" />;
  const readings = list || [];

  const loadSample = () => sampleHistory().slice().reverse().forEach((r) => saveReading(r));
  const clearSample = () => readings.filter((r) => r.sample).forEach((r) => deleteReading(r.id));

  if (!readings.length) {
    return (
      <section className="app-page empty-page">
        <div className="wrap narrow">
          <ArchMark size={56} />
          <span className="mono">Journal</span>
          <h1 className="app-title">Every portrait, <em>kept.</em></h1>
          <p className="intro">Each reading is saved on this device, so you can watch your seven signs change month by month. Nothing is stored on our servers.</p>
          <div className="actions">
            <a className="btn" href="/consult">Take your first reading</a>
            <button className="btn light" type="button" onClick={loadSample}>Load a sample history</button>
          </div>
        </div>
      </section>
    );
  }

  const asc = readings.slice().reverse();
  const valOf = (r) => (sign === "overall" ? overallOf(r) : toScores(r)[sign] ?? null);
  const points = asc.map((r) => ({ at: r.at, v: valOf(r) })).filter((p) => p.v != null);
  const first = asc[0], last = asc[asc.length - 1];
  const change = asc.length > 1 && valOf(first) != null && valOf(last) != null ? valOf(last) - valOf(first) : null;
  const lastSc = toScores(last), firstSc = toScores(first);
  const moved = asc.length > 1 ? ORDER.filter((k) => lastSc[k] != null && firstSc[k] != null).sort((a, b) => (lastSc[b] - firstSc[b]) - (lastSc[a] - firstSc[a])) : [];
  const hasSample = readings.some((r) => r.sample);

  return (
    <section className="app-page journal-page" aria-labelledby="journalTitle">
      <div className="wrap">
        <header className="page-head">
          <div>
            <span className="mono">{readings.length} {readings.length === 1 ? "portrait" : "portraits"} · since {fmtDate(first.at, { month: "long", year: "numeric" })}</span>
            <h1 className="app-title" id="journalTitle">The <em>journal.</em></h1>
            <p className="intro">Every reading, saved on this device. Choose a sign to follow it over time.</p>
          </div>
          {change != null && (
            <div className="stat-row">
              <div><b>{change > 0 ? `+${change}` : change}</b><span>{sign === "overall" ? "Skin score" : SIGNS[sign].label} since first</span></div>
              {moved[0] && <div><b className="word">{SIGNS[moved[0]].label}</b><span>Most improved</span></div>}
            </div>
          )}
        </header>

        {hasSample && (
          <p className="flag-line"><span className="flag">Includes sample readings</span><button className="text-link" type="button" onClick={clearSample}>Remove samples</button></p>
        )}

        <div className="chart-card">
          <div className="sign-tabs" role="tablist" aria-label="Sign">
            {[["overall", "Skin score"], ...ORDER.map((k) => [k, SIGNS[k].label])].map(([k, l]) => (
              <button key={k} role="tab" type="button" aria-selected={sign === k} className={sign === k ? "on" : ""} onClick={() => setSign(k)}>{l}</button>
            ))}
          </div>
          {points.length ? <Trend points={points} /> : <p className="caption">No scores for this sign yet.</p>}
          {points.length === 1 && <p className="caption">Your trend line appears after your second portrait.</p>}
        </div>

        <ol className="entries">
          {readings.map((r, i) => {
            const prev = readings[i + 1];
            const o = overallOf(r), po = prev ? overallOf(prev) : null;
            const sc = toScores(r);
            const weakest = ORDER.filter((k) => sc[k] != null).sort((a, b) => sc[a] - sc[b])[0];
            return (
              <li key={r.id} className="entry">
                <a className="entry-main" href={`/portrait?id=${encodeURIComponent(r.id)}`}>
                  <span className="entry-thumb">{r.thumb ? <img src={r.thumb} alt="" /> : <ArchMark size={26} />}</span>
                  <span className="entry-date">
                    <b>{fmtDate(r.at, { day: "numeric", month: "long", year: "numeric" })}</b>
                    <span className="caption">{r.sample ? "Sample reading" : "YouCam Skin AI"}{weakest ? ` · focus: ${SIGNS[weakest].label.toLowerCase()}` : ""}</span>
                  </span>
                  <span className="entry-score">
                    <b>{o ?? "–"}</b>
                    {po != null && o != null ? <Delta d={o - po} /> : <span className="caption">{o != null ? band(o).label : ""}</span>}
                  </span>
                </a>
                {confirm === r.id ? (
                  <span className="entry-confirm">
                    <button type="button" className="text-link danger" onClick={() => { deleteReading(r.id); setConfirm(null); }}>Delete</button>
                    <button type="button" className="text-link" onClick={() => setConfirm(null)}>Keep</button>
                  </span>
                ) : (
                  <button type="button" className="text-link entry-del" onClick={() => setConfirm(r.id)} aria-label={`Delete reading from ${fmtDate(r.at)}`}>Remove</button>
                )}
              </li>
            );
          })}
        </ol>

        <div className="actions journal-actions">
          <a className="btn" href="/consult">Add a new portrait</a>
          {!hasSample && <button className="btn light" type="button" onClick={loadSample}>Load a sample history</button>}
        </div>
      </div>
    </section>
  );
}
