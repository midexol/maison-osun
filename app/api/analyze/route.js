// POST { image: "data:image/jpeg;base64,..." } -> { taskId }
// 1) upload slot + PUT the photo, 2) start a skin-analysis task.
import { BASE, ACTIONS, apiKey, authHeaders, readJson, errorCode, uploadImage, decodeImage } from "../../../lib/youcam.js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 9.5 * 1024 * 1024; // YouCam limit is < 10 MB
const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req) {
  const key = apiKey();
  if (!key) return json({ error: "YOUCAM_API_KEY is not set.", code: "missing_key" }, 500);

  let image;
  try { ({ image } = await req.json()); } catch { return json({ error: "Send a JPG or PNG photo.", code: "bad_image" }, 400); }
  const img = decodeImage(image);
  if (!img) return json({ error: "Send a JPG or PNG photo.", code: "bad_image" }, 400);
  if (img.buf.length > MAX_BYTES) return json({ error: "Photo is too large.", code: "exceed_max_filesize" }, 413);

  try {
    const fileId = await uploadImage(key, "skin-analysis", img.buf, img.contentType);
    const taskRes = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify({ src_file_id: fileId, dst_actions: ACTIONS, format: "json" }),
    });
    const taskBody = await readJson(taskRes);
    const taskId = taskBody?.data?.task_id;
    if (!taskRes.ok || !taskId) {
      console.error("task api", taskRes.status, taskBody);
      return json({ error: taskBody?.error || "Could not start the analysis.", code: errorCode(taskBody) }, taskRes.status === 429 ? 429 : 502);
    }
    return json({ taskId });
  } catch (err) {
    console.error(err, err.detail);
    return json({ error: err.message || "The reader is unreachable right now.", code: err.code || "network" }, 502);
  }
}
