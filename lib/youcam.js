// Shared helpers for the YouCam Skin AI (V2) API.
// Docs: https://docs.perfectcorp.com/api_references/skin_analysis

export const BASE = process.env.YOUCAM_API_BASE || "https://yce-api-01.makeupar.com";

// Seven SD concerns (all SD, never mixed with HD). Higher score = healthier.
export const ACTIONS = ["moisture", "oiliness", "radiance", "texture", "pore", "redness", "acne"];

export function apiKey() {
  return process.env.YOUCAM_API_KEY || "";
}

export function authHeaders(key) {
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function readJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// Turns a YouCam error body into a stable code the page can explain.
export function errorCode(body, fallback = "upstream_error") {
  const d = body?.data || {};
  return d.error || body?.error_code || body?.error || fallback;
}

// Normalises a successful format=json task result into
// { overall, skinAge, concerns: [{ type, ui, raw, mask }] }.
export function normalise(results) {
  const out = { overall: null, skinAge: null, concerns: [] };
  if (!results || typeof results !== "object") return out;

  const take = (type, v) => {
    if (v == null) return;
    if (type === "all") {
      out.overall = num(v.score ?? v.ui_score ?? v.raw_score ?? v);
      return;
    }
    if (type === "skin_age") {
      out.skinAge = num(v.score ?? v.value ?? v.skin_age ?? v);
      return;
    }
    // Some concerns nest a "whole" region (HD style); prefer it.
    const node = v.whole && typeof v.whole === "object" ? v.whole : v;
    const ui = num(node.ui_score);
    if (ui == null) return;
    out.concerns.push({
      type,
      ui,
      raw: num(node.raw_score),
      mask: Array.isArray(node.mask_urls) ? node.mask_urls[0] || null : node.mask_url || null,
    });
  };

  if (Array.isArray(results.output)) {
    for (const o of results.output) take(o.type, o);
  }
  // Fallback: score_info-style object keyed by concern.
  for (const [k, v] of Object.entries(results)) {
    if (k === "output") continue;
    if (k === "all" || k === "skin_age" || ACTIONS.includes(k)) {
      if (k !== "all" && k !== "skin_age" && out.concerns.some((c) => c.type === k)) continue;
      take(k, v);
    }
  }
  return out;
}

// Ask YouCam for an upload slot for a feature, then PUT the bytes there. Returns file_id.
// Falls back to the generic /file endpoint if the feature-specific one is missing.
export async function uploadImage(key, feature, buf, contentType) {
  const body = JSON.stringify({ files: [{ content_type: contentType, file_name: `selfie.${contentType === "image/png" ? "png" : "jpg"}`, file_size: buf.length }] });
  let res = await fetch(`${BASE}/s2s/v2.0/file/${feature}`, { method: "POST", headers: authHeaders(key), body });
  if (res.status === 404) res = await fetch(`${BASE}/s2s/v2.0/file`, { method: "POST", headers: authHeaders(key), body });
  const json = await readJson(res);
  const file = json?.data?.files?.[0];
  const slot = file?.requests?.[0];
  if (!res.ok || !file?.file_id || !slot?.url) {
    const e = new Error("Could not prepare the upload."); e.code = errorCode(json); e.detail = json; throw e;
  }
  const headers = {};
  for (const [h, v] of Object.entries(slot.headers || {})) if (h.toLowerCase() !== "content-length") headers[h] = String(v);
  const put = await fetch(slot.url, { method: slot.method || "PUT", headers, body: buf });
  if (!put.ok) { const e = new Error("Could not upload the photo."); e.code = "error_upload"; throw e; }
  return file.file_id;
}

// Decodes a "data:image/...;base64," string into { buf, contentType } or null.
export function decodeImage(image) {
  const m = typeof image === "string" && image.match(/^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/);
  if (!m) return null;
  return { contentType: m[1] === "image/jpg" ? "image/jpeg" : m[1], buf: Buffer.from(m[2], "base64") };
}

// Finds the result image URL in a skin-simulation success payload (the spec is inconsistent about where it lives).
export function findResultUrl(data) {
  if (!data || typeof data !== "object") return null;
  const cand = [data.url, data.results?.url, data.result?.url, Array.isArray(data.results) ? data.results[0]?.url : null, typeof data.results === "string" ? data.results : null];
  for (const c of cand) if (typeof c === "string" && /^https?:\/\//.test(c)) return c;
  const out = data.results?.output || data.output;
  if (Array.isArray(out)) for (const o of out) { const u = o?.url || (Array.isArray(o?.urls) ? o.urls[0] : null); if (u) return u; }
  return null;
}

// Simulation concern names (differ from the analysis names).
export const SIM_KEYS = ["wrinkle", "radiance", "oiliness", "acne", "eye_bags", "dark_circle", "spots", "pores", "texture", "redness"];

function num(v) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}
