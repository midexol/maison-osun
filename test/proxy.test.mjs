// End-to-end check of the Next.js route handlers against a local mock of the YouCam V2 API.
import http from "node:http";
import assert from "node:assert/strict";

let putBytes = 0, taskBody = null, simBody = null;
const mock = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/s2s/v2.0/file/skin-analysis") {
      assert.equal(req.headers.authorization, "Bearer test-key");
      const f = JSON.parse(body).files[0];
      return res.end(JSON.stringify({ status: 200, data: { files: [{ ...f, file_id: "FILE/abc+1", requests: [{ method: "PUT", url: `http://localhost:${port}/upload`, headers: { "Content-Type": f.content_type, "Content-Length": f.file_size } }] }] } }));
    }
    if (req.url === "/s2s/v2.0/file/skin-simulation") {
      const f = JSON.parse(body).files[0];
      return res.end(JSON.stringify({ status: 200, data: { files: [{ ...f, file_id: "SIMFILE1", requests: [{ method: "PUT", url: `http://localhost:${port}/upload`, headers: { "Content-Type": f.content_type } }] }] } }));
    }
    if (req.url === "/s2s/v2.0/task/skin-simulation") { simBody = JSON.parse(body); return res.end(JSON.stringify({ status: 200, data: { task_id: "SIMTASK_123" } })); }
    if (req.url.startsWith("/s2s/v2.0/task/skin-simulation/SIMTASK_123")) {
      return res.end(JSON.stringify({ status: 200, data: { task_status: "success", results: { url: "https://x/sim.jpg" } } }));
    }
    if (req.url === "/upload") { putBytes = body.length; return res.end(""); }
    if (req.url === "/s2s/v2.0/task/skin-analysis") { taskBody = JSON.parse(body); return res.end(JSON.stringify({ status: 200, data: { task_id: "TASK_abc-123" } })); }
    if (req.url.startsWith("/s2s/v2.0/task/skin-analysis/TASK_abc-123")) {
      return res.end(JSON.stringify({ status: 200, data: { task_status: "success", results: { output: [
        { type: "moisture", ui_score: 70, raw_score: 48.7, mask_urls: ["https://x/moisture.png"] },
        { type: "acne", ui_score: 88, raw_score: 92.3, mask_urls: ["https://x/acne.png"] },
        { type: "all", score: 75.75 }, { type: "skin_age", score: 37 } ] } } }));
    }
    res.statusCode = 404; res.end("{}");
  });
});
await new Promise((r) => mock.listen(0, r));
const port = mock.address().port;
process.env.YOUCAM_API_BASE = `http://localhost:${port}`;
process.env.YOUCAM_API_KEY = "test-key";

const { POST: analyze } = await import("../app/api/analyze/route.js");
const { GET: status } = await import("../app/api/status/route.js");
const { GET: health } = await import("../app/api/health/route.js");
const { POST: simulate } = await import("../app/api/simulate/route.js");
const { normalise, findResultUrl } = await import("../lib/youcam.js");
const { simulationPlan } = await import("../lib/ritual.js");

assert.equal((await health().json()).live, true);

const jpeg = "data:image/jpeg;base64," + Buffer.alloc(5000, 7).toString("base64");
const a = await analyze(new Request("http://x/api/analyze", { method: "POST", body: JSON.stringify({ image: jpeg }) }));
assert.equal(a.status, 200);
assert.equal((await a.json()).taskId, "TASK_abc-123");
assert.equal(putBytes, 5000);
assert.deepEqual(taskBody.dst_actions, ["moisture", "oiliness", "radiance", "texture", "pore", "redness", "acne"]);
assert.equal(taskBody.format, "json");

const s = await (await status(new Request("http://x/api/status?id=TASK_abc-123"))).json();
assert.equal(s.status, "success");
assert.equal(s.overall, 75.75); assert.equal(s.skinAge, 37);
assert.equal(s.concerns.length, 2); assert.equal(s.concerns[0].mask, "https://x/moisture.png");

const n = normalise({ moisture: { ui_score: 70, raw_score: 48 }, all: { score: 70 }, skin_age: 30 });
assert.equal(n.concerns[0].ui, 70); assert.equal(n.overall, 70); assert.equal(n.skinAge, 30);

const bad = await analyze(new Request("http://x/api/analyze", { method: "POST", body: JSON.stringify({ image: "nope" }) }));
assert.equal(bad.status, 400);
// Skin Simulation: plan -> route -> poll
const plan = simulationPlan({ moisture: 70, oiliness: 72, radiance: 79, texture: 76, pore: 84, redness: 77, acne: 88 });
assert.deepEqual(plan.targets, ["moisture", "oiliness"]);
assert.ok(plan.intensities.radiance >= 0.2 && plan.intensities.oiliness > 0);
const sm = await simulate(new Request("http://x/api/simulate", { method: "POST", body: JSON.stringify({ image: jpeg, intensities: { ...plan.intensities, bogus: 5 } }) }));
assert.equal(sm.status, 200);
assert.equal((await sm.json()).taskId, "SIMTASK_123");
assert.equal(simBody.src_file_id, "SIMFILE1");
assert.equal(simBody.bogus, undefined);
assert.ok(simBody.radiance > 0 && simBody.radiance <= 1);
const ss = await (await status(new Request("http://x/api/status?kind=simulation&id=SIMTASK_123"))).json();
assert.deepEqual(ss, { status: "success", url: "https://x/sim.jpg" });
assert.equal(findResultUrl({ url: "https://a/1.jpg" }), "https://a/1.jpg");
assert.equal(findResultUrl({ results: [{ url: "https://a/2.jpg" }] }), "https://a/2.jpg");
assert.equal(findResultUrl({ results: "https://a/3.jpg" }), "https://a/3.jpg");
const none = await simulate(new Request("http://x/api/simulate", { method: "POST", body: JSON.stringify({ image: jpeg, intensities: { texture: 0 } }) }));
assert.equal(none.status, 400);

mock.close();
console.log("route handlers (analysis + simulation): all checks passed");
