"use client";
import { useEffect, useRef, useState } from "react";
import ArchMark from "./ArchMark";
import Photo from "./Photo";
import { SIGNS, ORDER, SAMPLE, PRODUCTS, PRODUCT_PHOTO } from "@/lib/data";
import { band, compose, toScores } from "@/lib/ritual";

const FRIENDLY = {
  error_src_face_too_small: "Your face looks too small in the photo. Come closer so it fills most of the frame, then try again.",
  error_src_face_out_of_bound: "Part of your face is outside the frame. Centre your whole face, forehead to chin, and try again.",
  error_lighting_dark: "The photo is too dark. Face a window or a soft light and try again.",
  error_no_face: "The reader could not find a face. Use a front-facing photo with your full face visible.",
  error_below_min_image_size: "This photo is too small. Use one at least 480 px on its shortest side.",
  error_large_face_angle: "Your head is turned too far. Look straight at the camera and try again.",
  error_multiple_people: "More than one person is in the photo. Use a photo of just you.",
  missing_key: "The reader is not connected yet: the site owner needs to add the YouCam API key.",
  timeout: "The reader took too long. Please try again.",
};
const friendly = (code, fb) => FRIENDLY[code] || fb || "Something went wrong while reading your photo. Please try another photo.";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Resize in the browser to fit the API: short side >= 480, long side <= 1600, JPEG.
function prepare(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//i.test(file.type || "image/jpeg")) return reject(new Error("Use a JPG or PNG photo."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight, short = Math.min(w, h), long = Math.max(w, h);
      URL.revokeObjectURL(url);
      if (short < 480) return reject(new Error(FRIENDLY.error_below_min_image_size));
      let s = Math.min(1, 1600 / long);
      if (short * s < 480) s = 480 / short;
      const c = document.createElement("canvas");
      c.width = Math.round(w * s); c.height = Math.round(h * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file could not be opened as a photo. Try a JPG or PNG.")); };
    img.src = url;
  });
}

async function analyzeLive(dataUrl) {
  const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.taskId) throw new Error(friendly(j.code, j.error));
  const t0 = Date.now();
  while (Date.now() - t0 < 120000) {
    await sleep(2500);
    const s = await fetch(`/api/status?id=${encodeURIComponent(j.taskId)}`, { cache: "no-store" });
    const sj = await s.json().catch(() => ({}));
    if (sj.status === "success") return sj;
    if (sj.status === "error" || !s.ok) throw new Error(friendly(sj.code, sj.error));
  }
  throw new Error(FRIENDLY.timeout);
}

export default function Consultation() {
  const [live, setLive] = useState(null); // null = checking
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [err, setErr] = useState("");
  const [scanIdx, setScanIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [isSample, setIsSample] = useState(false);
  const [maskOn, setMaskOn] = useState(null);
  const [barsIn, setBarsIn] = useState(false);
  const [inBag, setInBag] = useState(false);
  const portraitRef = useRef(null);

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { live: false }))
      .then((j) => setLive(!!j.live))
      .catch(() => setLive(false));
  }, []);

  useEffect(() => {
    if (step !== 2) return;
    setScanIdx(0);
    const t = setInterval(() => setScanIdx((i) => Math.min(i + 1, ORDER.length - 1)), 1400);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (step === 3) {
      setBarsIn(false);
      const t = setTimeout(() => setBarsIn(true), 60);
      if (window.innerWidth < 900) portraitRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return () => clearTimeout(t);
    }
  }, [step, result]);

  const finish = (res, sample) => {
    const sc = toScores(res);
    if (Object.keys(sc).length < 2) {
      setStep(1); setPhoto(null);
      setErr("The reader returned no usable scores for this photo. Please try a clearer, front-facing selfie.");
      return;
    }
    setResult(res); setIsSample(sample); setMaskOn(null); setInBag(false); setStep(3);
  };

  const onFile = async (file) => {
    setErr("");
    let dataUrl;
    try { dataUrl = await prepare(file); } catch (e) { setErr(e.message); return; }
    setPhoto(dataUrl); setStep(2);
    try {
      if (live) finish(await analyzeLive(dataUrl), false);
      else { await sleep(5200); finish(SAMPLE, true); }
    } catch (e) {
      setStep(1); setPhoto(null); setErr(e.message);
    }
  };

  const sample = async () => { setErr(""); setPhoto(null); setStep(2); await sleep(3600); finish(SAMPLE, true); };

  const sc = result ? toScores(result) : {};
  const vals = Object.values(sc);
  const overall = result?.overall != null ? Math.round(result.overall) : vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : "–";
  const plan = result ? compose(sc) : null;
  const ritualKeys = plan ? [...new Set([...plan.morning, ...plan.evening].map(([k]) => k))] : [];
  const total = ritualKeys.reduce((sum, k) => sum + Number(PRODUCTS[k].price.replace(/[^0-9.]/g, "")), 0);
  const masks = {};
  (result?.concerns || []).forEach((c) => { if (c.mask) masks[c.type] = c.mask; });

  return (
    <section className="consult" id="consult" aria-labelledby="consultTitle">
      <div className="wrap consult-grid">
        <div className="frame-col">
          <div className={`pframe ${step === 2 ? "scanning" : ""}`}>
            {photo ? (
              <img className="photo" src={photo} alt="Your selfie" />
            ) : (
              <div className="empty"><div><ArchMark size={64} /><p className="caption">Your portrait appears here</p></div></div>
            )}
            {maskOn && masks[maskOn] && <img className="mask on" src={masks[maskOn]} alt="" />}
            <span className="scanline" />
          </div>
          <p className="frame-note caption">
            {step === 2 ? `Reading ${SIGNS[ORDER[scanIdx]].label.toLowerCase()}…` : maskOn && masks[maskOn] ? `${SIGNS[maskOn].label} map` : ""}
          </p>
        </div>

        <div className="tool" ref={portraitRef}>
          <div className="steps" aria-hidden="true">
            <span className={step === 1 ? "on" : ""}>Sit</span>
            <span className={step === 2 ? "on" : ""}>Read</span>
            <span className={step === 3 ? "on" : ""}>Ritual</span>
          </div>

          {step === 1 && (
            <>
              <h2 id="consultTitle">The <em>consultation</em></h2>
              <p className="intro">Sit facing a window, bare-faced if you can. The reader looks at hydration, oil balance, radiance, texture, pores, redness and blemishes.</p>
              <ul className="guides">
                <li><b>I</b><span>Face straight to the camera, eyes open, mouth closed.</span></li>
                <li><b>II</b><span>Come close: your face should fill most of the frame.</span></li>
                <li><b>III</b><span>Soft, even daylight. No coloured lights or filters.</span></li>
                <li><b>IV</b><span>Glasses off, hair away from your forehead.</span></li>
              </ul>
              <div className="actions">
                <label className="btn" htmlFor="camInput">Take a selfie</label>
                <label className="btn light" htmlFor="fileInput">Upload a photo</label>
                <button className="btn light" type="button" onClick={sample}>See a sample portrait</button>
              </div>
              <input className="sr" type="file" id="camInput" accept="image/*" capture="user" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
              <input className="sr" type="file" id="fileInput" accept="image/jpeg,image/png" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
              {err && <div className="err" role="alert">{err}</div>}
              <span className={`mode ${live ? "live" : ""}`}>
                {live === null ? "Checking the reader…" : live ? "Live reader: YouCam Skin AI" : "Preview mode: your photo gets sample scores"}
              </span>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Reading your <em>skin</em></h2>
              <p className="intro">This usually takes 10 to 30 seconds. Keep this page open.</p>
              <ul className="scanlist" style={{ maxWidth: 460 }}>
                {ORDER.map((k, i) => {
                  const s = i < scanIdx ? "done" : i === scanIdx ? "now" : "";
                  return (
                    <li key={k} className={s}>
                      <span className="chk">{s === "done" ? "✓" : ""}</span>
                      <span>{SIGNS[k].label}</span>
                      <span className="ms">{s === "done" ? "seen" : s === "now" ? "reading" : "·"}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {step === 3 && plan && (
            <>
              {isSample && <span className="flag">{live ? "Sample results" : "Sample results · live reading runs on the deployed site"}</span>}
              <h2 id="consultTitle">Your skin <em>portrait</em></h2>
              <div className="summary">
                <div><b>{overall}</b><span>Skin score</span></div>
                <div><b>{result.skinAge != null ? Math.round(result.skinAge) : "–"}</b><span>Skin age</span></div>
                <div><b className="type">{plan.type}</b><span>Skin type</span></div>
              </div>
              <div>
                <ul className="concerns">
                  {ORDER.filter((k) => sc[k] != null).map((k) => {
                    const b = band(sc[k]);
                    return (
                      <li key={k}>
                        <button type="button" className="concern" aria-pressed={maskOn === k} onClick={() => setMaskOn(maskOn === k ? null : k)}>
                          <span className="n">{SIGNS[k].label}<small>{SIGNS[k].sub}</small></span>
                          <span className="s">{sc[k]}<em className={`tone-${b.tone}`}>{b.label}</em></span>
                          <span className="bar"><i style={{ width: barsIn ? `${sc[k]}%` : 0 }} /></span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="caption" style={{ marginTop: ".8rem" }}>
                  {Object.keys(masks).length ? "Higher is healthier. Tap a sign to see where the reader found it." : "Higher is healthier. Scores run from 1 to 100."}
                </p>
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
                <button className="btn" type="button" onClick={() => setInBag(true)} disabled={inBag}>
                  {inBag ? "Ritual added to your bag" : "Add my ritual to bag"}
                </button>
              </div>
              {inBag && <p className="caption">Concept checkout: no payment is taken in this demo.</p>}
              <div className="actions">
                <button className="btn light" type="button" onClick={() => { setPhoto(null); setResult(null); setStep(1); }}>Read another portrait</button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
