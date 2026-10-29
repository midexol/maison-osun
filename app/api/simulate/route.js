// POST { image, intensities: { texture: 0.4, pores: 0.3, ... } } -> { taskId }
// Runs YouCam AI Skin Simulation on the same selfie, tuned to the user's weakest signs.
import { BASE, SIM_KEYS, apiKey, authHeaders, readJson, errorCode, uploadImage, decodeImage } from "../../../lib/youcam.js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req) {
  const key = apiKey();
  if (!key) return json({ error: "YOUCAM_API_KEY is not set.", code: "missing_key" }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ code: "bad_request" }, 400); }
  const img = decodeImage(body?.image);
  if (!img) return json({ error: "Send a JPG or PNG photo.", code: "bad_image" }, 400);

  const params = {};
  for (const k of SIM_KEYS) {
    const v = Number(body?.intensities?.[k]);
    if (Number.isFinite(v) && v > 0) params[k] = Math.min(1, Math.max(0, Math.round(v * 100) / 100));
  }
  if (!Object.keys(params).length) return json({ error: "Nothing to simulate.", code: "invalid_parameter" }, 400);

  try {
    const fileId = await uploadImage(key, "skin-simulation", img.buf, img.contentType);
    const res = await fetch(`${BASE}/s2s/v2.0/task/skin-simulation`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify({ src_file_id: fileId, ...params }),
    });
    const j = await readJson(res);
    const taskId = j?.data?.task_id;
    if (!res.ok || !taskId) {
      console.error("simulation task", res.status, j);
      return json({ error: j?.error || "Could not start the preview.", code: errorCode(j) }, res.status === 429 ? 429 : 502);
    }
    return json({ taskId, params });
  } catch (err) {
    console.error(err, err.detail);
    return json({ error: err.message || "The preview is unreachable right now.", code: err.code || "network" }, 502);
  }
}
