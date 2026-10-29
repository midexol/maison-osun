// POST { image: "data:image/jpeg;base64,..." } -> { taskId }
// 1) ask YouCam for an upload slot, 2) PUT the photo there, 3) start a skin-analysis task.
import { BASE, ACTIONS, apiKey, authHeaders, readJson, errorCode } from "../../../lib/youcam.js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 9.5 * 1024 * 1024; // YouCam limit is < 10 MB
const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req) {
  const key = apiKey();
  if (!key) return json({ error: "YOUCAM_API_KEY is not set.", code: "missing_key" }, 500);

  let image;
  try {
    ({ image } = await req.json());
  } catch {
    return json({ error: "Send a JPG or PNG photo.", code: "bad_image" }, 400);
  }
  const m = typeof image === "string" && image.match(/^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/);
  if (!m) return json({ error: "Send a JPG or PNG photo.", code: "bad_image" }, 400);

  const contentType = m[1] === "image/jpg" ? "image/jpeg" : m[1];
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > MAX_BYTES) return json({ error: "Photo is too large.", code: "exceed_max_filesize" }, 413);

  try {
    const fileRes = await fetch(`${BASE}/s2s/v2.0/file/skin-analysis`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify({
        files: [{ content_type: contentType, file_name: `selfie.${contentType === "image/png" ? "png" : "jpg"}`, file_size: buf.length }],
      }),
    });
    const fileBody = await readJson(fileRes);
    const file = fileBody?.data?.files?.[0];
    const slot = file?.requests?.[0];
    if (!fileRes.ok || !file?.file_id || !slot?.url) {
      console.error("file api", fileRes.status, fileBody);
      return json({ error: "Could not prepare the upload.", code: errorCode(fileBody) }, 502);
    }

    const putHeaders = {};
    for (const [h, v] of Object.entries(slot.headers || {})) {
      if (h.toLowerCase() !== "content-length") putHeaders[h] = String(v);
    }
    const put = await fetch(slot.url, { method: slot.method || "PUT", headers: putHeaders, body: buf });
    if (!put.ok) {
      console.error("upload", put.status, await put.text().catch(() => ""));
      return json({ error: "Could not upload the photo.", code: "error_upload" }, 502);
    }

    const taskRes = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify({ src_file_id: file.file_id, dst_actions: ACTIONS, format: "json" }),
    });
    const taskBody = await readJson(taskRes);
    const taskId = taskBody?.data?.task_id;
    if (!taskRes.ok || !taskId) {
      console.error("task api", taskRes.status, taskBody);
      return json({ error: taskBody?.error || "Could not start the analysis.", code: errorCode(taskBody) }, taskRes.status === 429 ? 429 : 502);
    }
    return json({ taskId });
  } catch (err) {
    console.error(err);
    return json({ error: "The reader is unreachable right now.", code: "network" }, 500);
  }
}
