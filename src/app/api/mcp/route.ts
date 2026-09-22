import { NextResponse } from "next/server";
import { computeRisk } from "@/lib/engine";
import { getDisasters, getQuakes, getSpace } from "@/lib/feeds";
import { GENESIS_SEAL, verifySeal } from "@/lib/seal";

export const revalidate = 0;

const TOOLS = [
  {
    name: "get_live_risks",
    description: "Fetch live earthquakes, space weather, and open disasters with counts and fallback flags.",
    inputSchema: { type: "object", properties: { limit: { type: "number", description: "Max quakes to return (default 10)" } } },
  },
  {
    name: "get_planetary_briefing",
    description: "Compute the deterministic Planetary Instability Index (0-100) with itemized factors and a hash-chained seal.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "verify_seal",
    description: "Verify a briefing seal by replaying SHA-384(prevSeal + canonicalJson).",
    inputSchema: {
      type: "object",
      properties: { briefing: { type: "object" }, prevSeal: { type: "string" }, seal: { type: "string" } },
      required: ["briefing", "prevSeal", "seal"],
    },
  },
];

interface RpcBody { jsonrpc?: string; id?: string | number | null; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } }

function rpcOk(id: string | number | null, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? 0, result });
}
function rpcErr(id: string | number | null, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? 0, error: { code, message } });
}

export async function GET() {
  return NextResponse.json({ protocol: "mcp-jsonrpc", version: "1.0.0", tools: TOOLS.map((t) => t.name), usage: "POST {jsonrpc:'2.0', id, method:'tools/list'|'tools/call'|'initialize', params}" });
}

export async function POST(req: Request) {
  let body: RpcBody;
  try {
    body = (await req.json()) as RpcBody;
  } catch {
    return rpcErr(null, -32700, "parse error");
  }
  const id = body.id ?? 0;
  const method = body.method ?? "";

  if (method === "initialize") {
    return rpcOk(id, { protocolVersion: "2024-11-05", serverInfo: { name: "pulsegrid", version: "1.0.0" }, capabilities: { tools: {} } });
  }
  if (method === "tools/list") {
    return rpcOk(id, { tools: TOOLS });
  }
  if (method === "tools/call") {
    const name = body.params?.name ?? "";
    const args = (body.params?.arguments ?? {}) as Record<string, unknown>;
    try {
      if (name === "get_live_risks") {
        const limit = typeof args.limit === "number" ? Math.min(50, Math.max(1, args.limit)) : 10;
        const [q, s, d] = await Promise.all([getQuakes(), getSpace(), getDisasters()]);
        return rpcOk(id, { content: [{ type: "text", text: JSON.stringify({ quakes: q.data.slice(0, limit), quakeCount: q.data.length, space: s.data, disasters: d.data.slice(0, 10), disasterCount: d.data.length, fallbacks: { q: q.fallback, s: s.fallback, d: d.fallback } }) }] });
      }
      if (name === "get_planetary_briefing") {
        const [q, s, d] = await Promise.all([getQuakes(), getSpace(), getDisasters()]);
        const briefing = computeRisk(q.data, s.data, d.data, GENESIS_SEAL, new Date());
        return rpcOk(id, { content: [{ type: "text", text: JSON.stringify(briefing) }] });
      }
      if (name === "verify_seal") {
        const briefing = args.briefing as Record<string, unknown>;
        const prevSeal = String(args.prevSeal ?? "");
        const seal = String(args.seal ?? "");
        const { seal: _omit, ...record } = briefing as Record<string, unknown> & { seal?: string };
        void _omit;
        const valid = verifySeal(record, prevSeal, seal);
        return rpcOk(id, { content: [{ type: "text", text: JSON.stringify({ valid }) }] });
      }
      return rpcErr(id, -32601, `unknown tool: ${name}`);
    } catch (e) {
      return rpcErr(id, -32603, e instanceof Error ? e.message : "tool failed");
    }
  }
  return rpcErr(id, -32601, `unknown method: ${method}`);
}
