"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArchMark from "./ArchMark";
import Photo from "./Photo";
import BeforeAfter from "./BeforeAfter";
import { SIGNS, ORDER, SAMPLE, PRODUCTS, PRODUCT_PHOTO } from "@/lib/data";
import { band, compose, toScores, simulationPlan } from "@/lib/ritual";
import { simulateLive, fmtDate } from "@/lib/client";
import { getReading, latestReading, getReadings, saveReading, setActive, getPhoto, addToBag, updateReading } from "@/lib/store";

const SIM_LABEL = { texture: "texture", pore: "pores", redness: "redness", acne: "blemishes", radiance: "radiance", oiliness: "shine", moisture: "radiance" };
export const priceOf = (k) => Number(PRODUCTS[k].price.replace(/[^0-9.]/g, ""));
const sampleReading = () => ({ id: "sample-portrait", sample: true, at: new Date().toISOString(), ...SAMPLE, taskId: null, thumb: null });

export default function PortraitView() {
  const router = useRouter();
  const [reading, setReading] = useState(undefined); // undefined = loading, null = none
  const [photo, setPhotoUrl] = useState(null);
  const [maskOn, setMaskOn] = useState(null);
  const [barsIn, setBarsIn] = useState(false);
  const [clinical, setClinical] = useState(false);
  const [inBag, setInBag] = useState(false);
  const [sim, setSim] = useState({ state: "idle", url: null, err: "" });
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    let r = null;
    if (q.get("sample")) r = sampleReading();
    else if (q.get("id")) r = getReading(q.get("id"));
    else r = latestReading();
    setReading(r || null);
    if (r) {
      setPhotoUrl(getPhoto(r.id));
      const list = getReadings();
      const older = list.filter((x) => x.at < r.at && x.id !== r.id);
      setPrev(older[0] || null);
      if (r.simUrl) setSim({ state: "done", url: r.simUrl, err: "" });
    }
    const t = setTimeout(() => setBarsIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (reading === undefined) return <section className="app-page" />;

  if (!reading) {
    return (
      <section className="app-page empty-page">
        <div className="wrap narrow">
          <ArchMark size={56} />
          <span className="mono">Portrait</span>
          <h1 className="app-title">No portrait <em>yet.</em></h1>
          <p className="intro">Sit for a consultation and your skin portrait, ritual and 28-day preview will live here.</p>
          <div className="actions">
            <a className="btn" href="/consult">Begin your consultation</a>
            <a className="btn light" href="/portrait?sample=1">See a sample portrait</a>
          </div>
        </div>
      </section>
    );
  }

  const sc = toScores(reading);
  const vals = Object.values(sc);
  const overall = reading.overall != null ? Math.round(reading.overall) : Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const plan = compose(sc);
  const ritualKeys = [...new Set([...plan.morning, ...plan.evening].map(([k]) => k))];
  const total = ritualKeys.reduce((s, k) => s + priceOf(k), 0);
  const raws = {};
  (reading.concerns || []).forEach((c) => { if (SIGNS[c.type] && c.raw != null) raws[c.type] = Math.round(c.raw); });
  const hasRaw = Object.keys(raws).length > 1;
  const shown = (k) => (clinical && raws[k] != null ? raws[k] : sc[k]);
  const masks = {};
  (reading.concerns || []).forEach((c) => { if (c.mask) masks[c.type] = c.mask; });
  const prevSc = prev ? toScores(prev) : null;
  const simPlan = simulationPlan(sc);
  const canSimulate = !reading.sample && !!photo;

  const runSim = async () => {
    setSim({ state: "running", url: null, err: "" });
    try {
      const url = await simulateLive(photo, simPlan.intensities);
      // Keep "Composing your day 28…" until the image has actually downloaded, so the slider never shows a blank side.
      await new Promise((res) => { const im = new Image(); im.onload = im.onerror = res; im.src = url; setTimeout(res, 20000); });
      setSim({ state: "done", url, err: "" });
      updateReading(reading.id, { simUrl: url });
    } catch (e) { setSim({ state: "error", url: null, err: e.message }); }
  };

  const startRitual = () => {
    if (reading.sample && !getReading(reading.id)) saveReading(reading);
    setActive(reading.id);
    router.push("/ritual");
  };

  return (
    <section className="app-page portrait-page" aria-labelledby="portraitTitle">
      <div className="wrap consult-grid">
        <div className="frame-col sticky-col">
          <div className="pframe">
            {photo ? <img className="photo" src={photo} alt="Your selfie" />
              : reading.thumb ? <img className="photo" src={reading.thumb} alt="Your selfie" />
              : <Photo name="closeup" alt="Sample portrait" sizes="(max-width: 900px) 100vw, 45vw" />}
            {maskOn && masks[maskOn] && <img className="mask on" src={masks[maskOn]} alt="" />}
          </div>
          <p className="frame-note caption">{maskOn && masks[maskOn] ? `${SIGNS[maskOn].label} map` : reading.sample ? "Sample portrait" : fmtDate(reading.at)}</p>
        </div>

        <div className="tool">
          {reading.sample && <span className="flag">Sample results</span>}
          <span className="mono">{reading.sample ? "Reference reading" : `Read ${fmtDate(reading.at)}`}</span>
          <h1 className="app-title" id="portraitTitle">Your skin <em>portrait</em></h1>
          <div className="summary">
            <div><b>{overall}</b><span>Skin score{prev?.overall != null && <Delta d={overall - Math.round(prev.overall)} />}</span></div>
            <div><b>{reading.skinAge != null ? Math.round(reading.skinAge) : "–"}</b><span>Skin age</span></div>
            <div><b className="type">{plan.type}</b><span>Skin type</span></div>
          </div>

          <div>
            <ul className="concerns">
              {ORDER.filter((k) => sc[k] != null).map((k) => {
                const b = band(shown(k));
                return (
                  <li key={k}>
                    <button type="button" className="concern" aria-pressed={maskOn === k} onClick={() => setMaskOn(maskOn === k ? null : k)}>
                      <span className="n">{SIGNS[k].label}<small>{SIGNS[k].sub}</small></span>
                      <span className="s">{shown(k)}{prevSc?.[k] != null && !clinical && <Delta d={sc[k] - prevSc[k]} />}<em className={`tone-${b.tone}`}>{b.label}</em></span>
                      <span className="bar"><i style={{ width: barsIn ? `${shown(k)}%` : 0 }} /></span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="score-meta">
              <p className="caption">
                {clinical ? "Clinical view: YouCam's unadjusted raw scores." : Object.keys(masks).length ? "Higher is healthier. Tap a sign to see where the reader found it." : prev ? "Higher is healthier. Changes compare with your previous reading." : "Higher is healthier. Scores run from 1 to 100."}
              </p>
              {hasRaw && (
                <button type="button" className="toggle" role="switch" aria-checked={clinical} onClick={() => setClinical(!clinical)}>
                  <span className="track"><span className="knob" /></span>Clinical view
                </button>
              )}
            </div>
            {reading.taskId && <p className="caption provenance">Read by YouCam Skin AI · task {String(reading.taskId).slice(0, 10)}…</p>}
          </div>

          <div className="sim">
            <div className="sim-head">
              <span className="caption">The 28-day preview</span>
              <h3>Your skin, <em>after the ritual.</em></h3>
              <p>YouCam AI Skin Simulation applies a natural improvement to your {simPlan.targets.map((t) => SIM_LABEL[t] || SIGNS[t].label.toLowerCase()).join(" and ")}, the two signs your ritual targets.</p>
            </div>
            {sim.state === "done" && sim.url && photo ? (
              <>
                <BeforeAfter before={photo} after={sim.url} />
                <p className="caption">Simulation, not a promise. Drag to compare.</p>
              </>
            ) : canSimulate ? (
              <>
                <button className="btn" type="button" onClick={runSim} disabled={sim.state === "running"}>
                  {sim.state === "running" ? "Composing your day 28…" : "Preview my skin at day 28"}
                </button>
                {sim.state === "error" && <div className="err" role="alert">{sim.err}</div>}
              </>
            ) : (
              <p className="caption">{reading.sample ? "Take a live reading with your own selfie to unlock the 28-day preview." : "Your photo stays on this device only for the session it was taken in. Take a new reading to make a preview."}</p>
            )}
          </div>

          <div className="ritual">
            {[["Morning", plan.morning], ["Evening", plan.evening]].map(([title, items]) => (
              <div key={title}>
                <h3>{title}</h3>
                <ol>
                  {items.map(([k, why]) => (
                    <li key={title + k}>
                      <div className="thumb" style={{ background: PRODUCTS[k].tint }}>
                        <Photo name={PRODUCT_PHOTO[k]} alt="" label="" sizes="72px" widths={[160, 240]} />
                      </div>
                      <div>
                        <span className="step">{PRODUCTS[k].step} · {PRODUCTS[k].size} · {PRODUCTS[k].price}</span>
                        <b>{PRODUCTS[k].name}</b>
                        <span className="why">{why}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div className="bag">
            <div>
              <span className="caption">Your ritual · {ritualKeys.length} products</span>
              <b>${total}</b>
            </div>
            {inBag ? <a className="btn" href="/bag">View bag</a> : (
              <button className="btn" type="button" onClick={() => { addToBag(ritualKeys); setInBag(true); }}>Add my ritual to bag</button>
            )}
          </div>
          <div className="actions">
            <button className="btn light" type="button" onClick={startRitual}>Start this ritual</button>
            <a className="btn light" href="/consult">Read another portrait</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Delta({ d }) {
  if (!d) return <span className="delta">±0</span>;
  return <span className={`delta ${d > 0 ? "up" : "down"}`}>{d > 0 ? `+${d}` : `−${Math.abs(d)}`}</span>;
}
