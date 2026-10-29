// GET ?id=<task_id> -> { status: "running" | "success" | "error", overall, skinAge, concerns, code? }
import { BASE, apiKey, authHeaders, readJson, errorCode, normalise } from "../../../lib/youcam.js";

export const dynamic = "force-dynamic";

const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req) {
  const key = apiKey();
  if (!key) return json({ status: "error", code: "missing_key" }, 500);

  const id = new URL(req.url).searchParams.get("id") || "";
  if (!/^[A-Za-z0-9_\-+/=]{8,200}$/.test(id)) return json({ status: "error", code: "bad_task" }, 400);

  try {
    const r = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis/${encodeURIComponent(id)}`, {
      headers: authHeaders(key),
      cache: "no-store",
    });
    const body = await readJson(r);
    const d = body?.data || {};
    if (!r.ok) return json({ status: "error", code: errorCode(body), error: body?.error }, 502);
    if (d.task_status === "success") {
      if (typeof d.results === "string") return json({ status: "error", code: "unexpected_zip" }, 502);
      return json({ status: "success", ...normalise(d.results) });
    }
    if (d.task_status === "error") return json({ status: "error", code: errorCode(body, "error_inference"), error: d.error_message });
    return json({ status: "running" });
  } catch (err) {
    console.error(err);
    return json({ status: "error", code: "network" }, 500);
  }
}
