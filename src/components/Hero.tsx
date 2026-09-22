"use client";

import { motion } from "framer-motion";
import { Atom, Radio, Satellite, Waves } from "lucide-react";

export default function Hero({ score, level }: { score: number; level: string }) {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-6xl px-6 pt-16 text-center md:pt-24"
      >
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium tracking-widest text-cyan-200 uppercase">
          <Satellite size={14} /> Live planetary intelligence · no API key
        </div>
        <h1 className="bg-gradient-to-b from-white via-cyan-100 to-violet-300 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-7xl">
          PULSEGRID
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
          Space weather × earthquakes × wildfires fused into one deterministic{" "}
          <span className="text-cyan-300">Planetary Instability Index</span> — sealed, verifiable, and usable by AI agents.
        </p>
        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-4">
          <div className="glass flex-1 rounded-2xl p-5">
            <div className="text-xs tracking-widest text-slate-400 uppercase">Instability index</div>
            <motion.div
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-1 text-5xl font-black text-white"
            >
              {score}
              <span className="text-lg text-slate-400">/100</span>
            </motion.div>
            <div className="mt-1 text-sm font-bold text-violet-300">{level.toUpperCase()}</div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-slate-400">
          <span className="flex items-center gap-2 text-sm"><Waves size={15} className="text-cyan-300" /> USGS live quakes</span>
          <span className="flex items-center gap-2 text-sm"><Atom size={15} className="text-violet-300" /> NOAA solar wind</span>
          <span className="flex items-center gap-2 text-sm"><Radio size={15} className="text-emerald-300" /> NASA disasters</span>
        </div>
      </motion.div>
    </div>
  );
}
