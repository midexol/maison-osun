import { apiKey } from "../../../lib/youcam.js";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ live: Boolean(apiKey()) }, { headers: { "Cache-Control": "no-store" } });
}
