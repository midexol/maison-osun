"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ArchMark from "./ArchMark";
import { SIGNS, ORDER } from "@/lib/data";
import { prepare, analyzeLive, checkLive, makeThumb, newId, sleep } from "@/lib/client";
import { saveReading, setPhoto } from "@/lib/store";

const KIT_SRC = "https://plugins-media.makeupar.com/v2.2-camera-kit/sdk.js";

// Loads YouCam's JS Camera Kit once. Resolves with the global YMK object.
function loadCameraKit() {
  return new Promise((resolve, reject) => {
    if (window.YMK && window.__ymkReady) return resolve(window.YMK);
    const t = setTimeout(() => reject(new Error("Camera Kit did not load.")), 15000);
    window.ymkAsyncInit = () => { window.__ymkReady = true; clearTimeout(t); resolve(window.YMK); };
    if (!document.querySelector(`script[src="${KIT_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = KIT_SRC; s.async = true;
      s.onerror = () => { clearTimeout(t); reject(new Error("Camera Kit did not load.")); };
      document.body.appendChild(s);
    }
  });
}

export default function ConsultFlow() {
  const router = useRouter();
  const [live, setLive] = useState(null);
  const [mode, setMode] = useState("intake"); // intake | camera | scanning
  const [photo, setPhotoUrl] = useState(null);
  const [err, setErr] = useState("");
  const [quality, setQuality] = useState(null);
  const [scanIdx, setScanIdx] = useState(0);
  const listeners = useRef([]);

  useEffect(() => { checkLive().then(setLive); }, []);

  useEffect(() => {
    if (mode !== "scanning") return;
    setScanIdx(0);
    const t = setInterval(() => setScanIdx((i) => Math.min(i + 1, ORDER.length - 1)), 1400);
    return () => clearInterval(t);
  }, [mode]);

  const closeKit = () => {
    try { listeners.current.forEach((id) => window.YMK?.removeEventListener(id)); window.YMK?.close(); } catch {}
    listeners.current = [];
  };
  useEffect(() => closeKit, []);

  const run = async (dataUrl) => {
    setErr(""); setPhotoUrl(dataUrl); setMode("scanning");
    try {
      if (!live) { await sleep(3200); router.push("/portrait?sample=1"); return; }
      const res = await analyzeLive(dataUrl);
      const id = newId();
      const thumb = await makeThumb(dataUrl).catch(() => null);
      saveReading({ id, at: new Date().toISOString(), sample: false, overall: res.overall, skinAge: res.skinAge, concerns: res.concerns, taskId: res.taskId, thumb });
      setPhoto(id, dataUrl);
      router.push(`/portrait?id=${id}`);
    } catch (e) {
      setMode("intake"); setPhotoUrl(null); setErr(e.message);
    }
  };

  const onFile = async (file) => {
    setErr("");
    try { run(await prepare(file)); } catch (e) { setErr(e.message); }
  };

  const openKit = async () => {
    setErr(""); setQuality(null); setMode("camera");
    try {
      const YMK = await loadCameraKit();
      const w = Math.min(480, window.innerWidth - 32);
      YMK.init({ faceDetectionMode: "skincare", imageFormat: "base64", language: "enu", width: w, height: Math.round(w * 1.33) });
      listeners.current.push(
        YMK.addEventListener("faceQualityChanged", (q) => setQuality(q)),
        YMK.addEventListener("cameraFailed", () => { closeKit(); setMode("intake"); setErr("We couldn't open the camera. Allow camera access, or use Take a selfie below."); }),
        YMK.addEventListener("faceDetectionCaptured", async (result) => {
          const img = result?.images?.[0]?.image;
          closeKit();
          if (!img) { setMode("intake"); setErr("The capture came back empty. Please try again."); return; }
          const dataUrl = typeof img === "string" ? (img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`) : await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(img); });
          try { run(await prepare(dataUrl)); } catch (e) { setMode("intake"); setErr(e.message); }
        }),
      );
      YMK.openCameraKit();
    } catch {
      setMode("intake");
      setErr("The guided camera couldn't load on this device. Use Take a selfie instead; it works just as well.");
    }
  };

  const qLine = quality
    ? !quality.hasFace ? "Find your face in the frame"
      : quality.position && quality.position !== "good" ? (quality.position === "toosmall" ? "Come a little closer" : "Centre your face")
      : quality.frontal && quality.frontal !== "good" ? "Look straight at the camera"
      : quality.lighting === "notgood" ? "Find softer, brighter light"
      : "Hold still…"
    : "Starting the camera…";

  return (
    <section className="app-page consult-page" aria-labelledby="consultTitle">
      <div className="wrap consult-grid">
        <div className="frame-col">
          {mode === "camera" ? (
            <div className="kit-wrap">
              <div id="YMK-module" />
              <p className="frame-note caption">{qLine}</p>
              <button className="btn light" type="button" onClick={() => { closeKit(); setMode("intake"); }}>Cancel</button>
            </div>
          ) : (
            <>
              <div className={`pframe ${mode === "scanning" ? "scanning" : ""}`}>
                {photo ? <img className="photo" src={photo} alt="Your selfie" /> : (
                  <div className="empty"><div><ArchMark size={64} /><p className="caption">Your photo appears here</p></div></div>
                )}
                <span className="scanline" />
              </div>
              <p className="frame-note caption">{mode === "scanning" ? `Checking ${SIGNS[ORDER[scanIdx]].label.toLowerCase()}…` : ""}</p>
            </>
          )}
        </div>

        <div className="tool">
          <div className="steps" aria-hidden="true">
            <span className={mode !== "scanning" ? "on" : ""}>Photo</span>
            <span className={mode === "scanning" ? "on" : ""}>Analysis</span>
            <span>Results</span>
          </div>

          {mode === "scanning" ? (
            <>
              <h1 className="app-title">Analysing your <em>skin</em></h1>
              <p className="intro">This usually takes 10 to 30 seconds. Keep this page open.</p>
              <ul className="scanlist" style={{ maxWidth: 460 }}>
                {ORDER.map((k, i) => {
                  const s = i < scanIdx ? "done" : i === scanIdx ? "now" : "";
                  return (
                    <li key={k} className={s}>
                      <span className="chk">{s === "done" ? "✓" : ""}</span>
                      <span>{SIGNS[k].label}</span>
                      <span className="ms">{s === "done" ? "done" : s === "now" ? "checking" : ""}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <>
              <span className="mono">Skin analysis</span>
              <h1 className="app-title" id="consultTitle">Take your <em>photo.</em></h1>
              <p className="intro">Use soft daylight and no makeup if you can. The analysis checks hydration, oil balance, radiance, texture, pores, redness and blemishes.</p>
              <ul className="guides">
                <li><b>I</b><span>Face straight to the camera, eyes open, mouth closed.</span></li>
                <li><b>II</b><span>Come close: your face should fill most of the frame.</span></li>
                <li><b>III</b><span>Soft, even daylight. No coloured lights or filters.</span></li>
                <li><b>IV</b><span>Glasses off, hair away from your forehead.</span></li>
              </ul>
              <div className="actions">
                <button className="btn" type="button" onClick={openKit} disabled={mode === "camera"}>Guided camera</button>
                <label className="btn light" htmlFor="camInput">Take a selfie</label>
                <label className="btn light" htmlFor="fileInput">Upload a photo</label>
              </div>
              <p className="caption">Guided camera uses YouCam Camera Kit. It checks your light, distance and angle, then takes the photo automatically.</p>
              <input className="sr" type="file" id="camInput" accept="image/*" capture="user" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
              <input className="sr" type="file" id="fileInput" accept="image/jpeg,image/png" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
              {err && <div className="err" role="alert">{err}</div>}
              <div className="consult-foot">
                <span className={`mode ${live ? "live" : ""}`}>
                  {live === null ? "Checking connection…" : live ? "Connected to YouCam Skin AI" : "Not connected: you will see sample scores"}
                </span>
                <a className="text-link" href="/portrait?sample=1">See a sample result</a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
