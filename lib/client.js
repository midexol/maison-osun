// Browser-side helpers: photo prep, YouCam calls through our API routes, friendly errors.
export const FRIENDLY = {
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
export const friendly = (code, fb) => FRIENDLY[code] || fb || "Something went wrong while reading your photo. Please try another photo.";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const loadImage = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

// Resize to the API's limits: short side >= 480, long side <= 1600, JPEG.
export async function prepare(fileOrDataUrl) {
  let src = fileOrDataUrl, revoke = null;
  if (typeof fileOrDataUrl !== "string") {
    if (!fileOrDataUrl || !/^image\//i.test(fileOrDataUrl.type || "image/jpeg")) throw new Error("Use a JPG or PNG photo.");
    src = revoke = URL.createObjectURL(fileOrDataUrl);
  }
  let img;
  try { img = await loadImage(src); } catch { throw new Error("That file could not be opened as a photo. Try a JPG or PNG."); }
  finally { if (revoke) URL.revokeObjectURL(revoke); }
  const w = img.naturalWidth, h = img.naturalHeight, short = Math.min(w, h), long = Math.max(w, h);
  if (short < 480) throw new Error(FRIENDLY.error_below_min_image_size);
  let s = Math.min(1, 1600 / long);
  if (short * s < 480) s = 480 / short;
  const c = document.createElement("canvas");
  c.width = Math.round(w * s); c.height = Math.round(h * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.9);
}

// Small square-ish thumbnail for the journal (kept on device).
export async function makeThumb(dataUrl, width = 360) {
  const img = await loadImage(dataUrl);
  const s = width / img.naturalWidth;
  const c = document.createElement("canvas");
  c.width = width; c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.78);
}

async function poll(url, ok) {
  const t0 = Date.now();
  while (Date.now() - t0 < 120000) {
    await sleep(2500);
    const s = await fetch(url, { cache: "no-store" });
    const sj = await s.json().catch(() => ({}));
    if (sj.status === "success" && ok(sj)) return sj;
    if (sj.status === "error" || !s.ok) throw new Error(friendly(sj.code, sj.error));
  }
  throw new Error(FRIENDLY.timeout);
}

export async function analyzeLive(dataUrl) {
  const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.taskId) throw new Error(friendly(j.code, j.error));
  const res = await poll(`/api/status?id=${encodeURIComponent(j.taskId)}`, () => true);
  return { ...res, taskId: j.taskId };
}

export async function simulateLive(dataUrl, intensities) {
  const r = await fetch("/api/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl, intensities }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.taskId) throw new Error(friendly(j.code, j.error || "The 28-day preview could not start. Please try again."));
  const res = await poll(`/api/status?kind=simulation&id=${encodeURIComponent(j.taskId)}`, (x) => !!x.url);
  return res.url;
}

export async function checkLive() {
  try { const r = await fetch("/api/health", { cache: "no-store" }); if (!r.ok) return false; return !!(await r.json()).live; } catch { return false; }
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const fmtDate = (iso, opts = { day: "numeric", month: "short", year: "numeric" }) => {
  try { return new Date(iso).toLocaleDateString(undefined, opts); } catch { return iso; }
};
