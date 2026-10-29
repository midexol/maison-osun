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

function num(v) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}
