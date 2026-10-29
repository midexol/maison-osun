// End-to-end check of the Next.js route handlers against a local mock of the YouCam V2 API.
import http from "node:http";
import assert from "node:assert/strict";

let putBytes = 0, taskBody = null;
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
const { normalise } = await import("../lib/youcam.js");

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
mock.close();
console.log("route handlers: all checks passed");
