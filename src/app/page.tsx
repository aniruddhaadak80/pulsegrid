import { Activity, Bot, ShieldCheck, Star, Waves } from "lucide-react";
import Hero from "@/components/Hero";
import GlobeSection from "@/components/GlobeSection";
import McpConsole from "@/components/McpConsole";
import { computeRisk } from "@/lib/engine";
import { getDisasters, getQuakes, getSpace } from "@/lib/feeds";
import { GENESIS_SEAL } from "@/lib/seal";

export const revalidate = 120;

function tickerItems(quakes: { mag: number; place: string }[], kp: number, disasters: { title: string }[]) {
  return [
    `Kp ${kp.toFixed(1)} geomagnetic`,
    ...quakes.slice(0, 6).map((q) => `M${q.mag.toFixed(1)} ${q.place}`),
    ...disasters.slice(0, 4).map((d) => d.title),
  ];
}

export default async function Home() {
  const [q, s, d] = await Promise.all([getQuakes(), getSpace(), getDisasters()]);
  const briefing = computeRisk(q.data, s.data, d.data, GENESIS_SEAL, new Date());
  const items = tickerItems(q.data, s.data.kp, d.data);
  const ticker = [...items, ...items].join("  ✦  ");
  const topQuakes = [...q.data].sort((a, b) => b.mag - a.mag).slice(0, 6);

  return (
    <main className="min-h-screen bg-[#04060c] text-slate-100">
      <div className="grid-bg" />
      <Hero score={briefing.score} level={briefing.level} />

      <div className="ticker mt-10 border-y border-cyan-400/20 bg-cyan-400/5 py-2.5 text-sm text-cyan-200">
        <div className="ticker-track">{ticker}</div>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-6 py-14">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { k: "Quakes / 24h", v: String(q.data.length), sub: q.fallback ? "offline sample" : "USGS live" },
            { k: "Strongest", v: q.data.length ? `M${Math.max(...q.data.map((x) => x.mag)).toFixed(1)}` : "—", sub: "max magnitude" },
            { k: "Kp index", v: s.data.kp.toFixed(1), sub: s.data.stormLevel },
            { k: "Open disasters", v: String(d.data.length), sub: d.fallback ? "offline sample" : "EONET live" },
          ].map((st) => (
            <div key={st.k} className="glass rounded-2xl p-4 text-center">
              <div className="text-[11px] tracking-widest text-slate-400 uppercase">{st.k}</div>
              <div className="mt-1 text-3xl font-black text-white">{st.v}</div>
              <div className="text-xs text-cyan-300">{st.sub}</div>
            </div>
          ))}
        </div>

        <section>
          <div className="section-tag">01 — LIVE</div>
          <h2 className="mb-4 text-2xl font-extrabold">The planet, right now</h2>
          <GlobeSection quakes={q.data} disasters={d.data} kp={s.data.kp} />
          <p className="mt-3 text-xs text-slate-500">
            <Star size={11} className="mr-1 inline" />
            Built on <span className="text-slate-300">react-globe.gl</span> (ThreeJS/WebGL): quake points + rings, disaster markers, solar-storm arcs, atmosphere glow. Auto-rotates, pauses when you grab it.
          </p>
        </section>

        <section>
          <div className="section-tag">02 — ENGINE</div>
          <h2 className="mb-2 text-2xl font-extrabold">Deterministic Instability Index</h2>
          <p className="mb-4 max-w-3xl text-sm text-slate-400">{briefing.summary} Same function powers the UI, <code>/api/risk</code>, and the MCP tool.</p>
          <div className="grid gap-3 md:grid-cols-5">
            {briefing.factors.map((f) => (
              <div key={f.name} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-violet-300"><Activity size={13} /> {f.name}</div>
                <div className="mt-1 text-2xl font-black">+{f.points}</div>
                <div className="mt-1 text-xs leading-relaxed text-slate-400">{f.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="section-tag">03 — QUAKES</div>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-extrabold"><Waves size={20} className="text-cyan-300" /> Strongest right now</h2>
            <div className="space-y-2">
              {topQuakes.map((ev) => (
                <a key={ev.id} href={ev.url} target="_blank" rel="noreferrer" className="glass flex items-center justify-between rounded-xl px-4 py-3 transition hover:border-cyan-400/40">
                  <div>
                    <div className="text-sm font-bold text-white">M{ev.mag.toFixed(1)} — {ev.place}</div>
                    <div className="text-xs text-slate-500">{new Date(ev.time).toUTCString()} · {ev.depth.toFixed(0)} km deep{ev.tsunami ? " · tsunami flag" : ""}</div>
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-xs font-black ${ev.mag >= 6 ? "bg-rose-500/20 text-rose-300" : ev.mag >= 5 ? "bg-amber-400/20 text-amber-300" : "bg-cyan-400/20 text-cyan-300"}`}>M{ev.mag.toFixed(1)}</div>
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="section-tag">04 — AGENTS</div>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-extrabold"><Bot size={20} className="text-emerald-300" /> Use it as a tool</h2>
            <McpConsole />
          </div>
        </section>

        <section>
          <div className="section-tag">05 — SEALED</div>
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-extrabold"><ShieldCheck size={20} className="text-emerald-300" /> Hash-chained briefing</h2>
          <p className="mb-3 max-w-3xl text-sm text-slate-400">
            Every briefing carries <code>SHA-384(prevSeal ‖ canonicalJson)</code>. Replay the chain to verify — try the <code>verify_seal</code> MCP tool.
          </p>
          <div className="glass break-all rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-slate-300">
            <div><span className="text-slate-500">prev </span>{briefing.prevSeal.slice(0, 48)}…</div>
            <div><span className="text-slate-500">seal </span><span className="text-emerald-300">{briefing.seal.slice(0, 64)}…</span></div>
            <div><span className="text-slate-500">at </span>{briefing.generatedAt}</div>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          PulseGrid · USGS + NOAA SWPC + NASA EONET · MIT · feeds cached with revalidate, offline fallbacks sealed in · not an official warning system
        </footer>
      </div>
    </main>
  );
}
