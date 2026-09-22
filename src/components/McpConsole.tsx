"use client";

import { useState } from "react";
import { Bot, Play } from "lucide-react";

const PRESETS = [
  { label: "tools/list", body: { jsonrpc: "2.0", id: 1, method: "tools/list" } },
  { label: "get_planetary_briefing", body: { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_planetary_briefing", arguments: {} } } },
  { label: "get_live_risks (5)", body: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_live_risks", arguments: { limit: 5 } } } },
];

export default function McpConsole() {
  const [out, setOut] = useState("Click a preset to prove the agent interface works — live, in this page.");
  const [busy, setBusy] = useState(false);

  async function run(body: unknown) {
    setBusy(true);
    try {
      const res = await fetch("/api/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      setOut(JSON.stringify(json, null, 2).slice(0, 4000));
    } catch (e) {
      setOut(`error: ${e instanceof Error ? e.message : "fetch failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-300">
        <Bot size={16} /> MCP agent console — one click proof
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            disabled={busy}
            onClick={() => run(p.body)}
            className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50"
          >
            <Play size={12} /> {p.label}
          </button>
        ))}
      </div>
      <pre className="max-h-72 overflow-auto rounded-xl bg-black/70 p-4 text-[11px] leading-relaxed text-emerald-100">{out}</pre>
    </div>
  );
}
