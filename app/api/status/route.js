// GET ?id=<task_id>[&kind=simulation]
//   analysis   -> { status, overall, skinAge, concerns }
//   simulation -> { status, url }
import { BASE, apiKey, authHeaders, readJson, errorCode, normalise, findResultUrl } from "../../../lib/youcam.js";

export const dynamic = "force-dynamic";

const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req) {
  const key = apiKey();
  if (!key) return json({ status: "error", code: "missing_key" }, 500);

  const params = new URL(req.url).searchParams;
  const id = params.get("id") || "";
  const sim = params.get("kind") === "simulation";
  if (!/^[A-Za-z0-9_\-+/=]{8,200}$/.test(id)) return json({ status: "error", code: "bad_task" }, 400);

  try {
    const path = sim ? "skin-simulation" : "skin-analysis";
    const r = await fetch(`${BASE}/s2s/v2.0/task/${path}/${encodeURIComponent(id)}`, { headers: authHeaders(key), cache: "no-store" });
    const body = await readJson(r);
    const d = body?.data || {};
    if (!r.ok) return json({ status: "error", code: errorCode(body), error: body?.error }, 502);
    if (d.task_status === "success") {
      if (sim) {
        const url = findResultUrl(d);
        if (!url) { console.error("simulation result without url", JSON.stringify(d).slice(0, 800)); return json({ status: "error", code: "no_result_url" }, 502); }
        return json({ status: "success", url });
      }
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
