import { FALLBACK_DISASTERS, FALLBACK_QUAKES, FALLBACK_SPACE } from "./fallback";
import { GENESIS_SEAL, sealRecord } from "./seal";
import type { DisasterEvent, QuakeEvent, RiskBriefing, RiskFactor, RiskLevel, SpaceWeather } from "./types";

function quakePoints(maxMag: number): { points: number; detail: string } {
  if (maxMag >= 7) return { points: 52, detail: `Largest quake M${maxMag.toFixed(1)} in window — major seismic energy release.` };
  if (maxMag >= 6) return { points: 40, detail: `Largest quake M${maxMag.toFixed(1)} — strong event, aftershock watch.` };
  if (maxMag >= 5) return { points: 28, detail: `Largest quake M${maxMag.toFixed(1)} — moderate, locally felt.` };
  if (maxMag >= 4) return { points: 15, detail: `Largest quake M${maxMag.toFixed(1)} — light background seismicity.` };
  return { points: 5, detail: `Largest quake M${maxMag.toFixed(1)} — quiet crust.` };
}

function kpPoints(kp: number): { points: number; detail: string } {
  if (kp >= 8) return { points: 48, detail: `Kp ${kp.toFixed(1)} — G4/G5 extreme storm, grid + sat risk.` };
  if (kp >= 7) return { points: 38, detail: `Kp ${kp.toFixed(1)} — G3 strong storm, aurora far south.` };
  if (kp >= 6) return { points: 30, detail: `Kp ${kp.toFixed(1)} — G2 moderate storm, transformer heating possible.` };
  if (kp >= 5) return { points: 22, detail: `Kp ${kp.toFixed(1)} — G1 minor storm, satellite drag up.` };
  if (kp >= 4) return { points: 12, detail: `Kp ${kp.toFixed(1)} — active magnetosphere, watch.` };
  return { points: Math.round(kp * 2), detail: `Kp ${kp.toFixed(1)} — quiet solar wind.` };
}

function disasterPoints(disasters: DisasterEvent[]): { points: number; detail: string } {
  const caps: Record<string, number> = { Wildfires: 18, "Severe Storms": 21, Volcanoes: 16 };
  const per: Record<string, number> = { Wildfires: 6, "Severe Storms": 7, Volcanoes: 8 };
  const acc: Record<string, number> = {};
  for (const d of disasters) {
    const p = per[d.category] ?? 3;
    const cap = caps[d.category] ?? 9;
    acc[d.category] = Math.min(cap, (acc[d.category] ?? 0) + p);
  }
  const total = Math.min(30, Object.values(acc).reduce((a, b) => a + b, 0));
  const top = Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => `${k} +${v}`).join(", ");
  return { points: total, detail: disasters.length === 0 ? "No open EONET disasters — clear board." : `${disasters.length} open events (${top || "mixed"}).` };
}

export function levelFor(score: number): RiskLevel {
  if (score >= 80) return "Extreme";
  if (score >= 60) return "Severe";
  if (score >= 40) return "Elevated";
  if (score >= 20) return "Watch";
  return "Calm";
}

/**
 * Deterministic Planetary Instability Index (0–100).
 * SAME function serves the UI, the REST API, and MCP tools.
 */
export function computeRisk(
  quakes: QuakeEvent[],
  space: SpaceWeather,
  disasters: DisasterEvent[],
  prevSeal = GENESIS_SEAL,
  now = new Date(),
): RiskBriefing {
  const factors: RiskFactor[] = [];
  const maxMag = quakes.reduce((m, q) => Math.max(m, q.mag || 0), 0);
  const strong = quakes.filter((q) => q.mag >= 4.5).length;

  const q = quakePoints(maxMag);
  factors.push({ name: "Seismic energy", points: q.points, detail: q.detail });

  const countPts = strong === 0 ? 0 : strong <= 3 ? 5 : strong <= 9 ? 12 : 18;
  factors.push({ name: "Quake swarm", points: countPts, detail: `${strong} quakes ≥ M4.5 in 24h window.` });

  const k = kpPoints(space.kp);
  factors.push({ name: "Geomagnetic storm", points: k.points, detail: k.detail });

  let windPts = 0;
  const windBits: string[] = [];
  if ((space.windSpeed ?? 0) > 600) { windPts += 8; windBits.push(`wind ${(space.windSpeed ?? 0).toFixed(0)} km/s`); }
  if ((space.bz ?? 0) < -10) { windPts += 10; windBits.push(`Bz ${(space.bz ?? 0).toFixed(1)} nT southward`); }
  factors.push({ name: "Solar wind coupling", points: windPts, detail: windBits.length ? `${windBits.join(" + ")} — reconnection likely.` : "Solar wind nominal." });

  const d = disasterPoints(disasters);
  factors.push({ name: "Surface disasters", points: d.points, detail: d.detail });

  const score = Math.min(100, factors.reduce((a, f) => a + f.points, 0));
  const level = levelFor(score);
  const top = [...factors].sort((a, b) => b.points - a.points).slice(0, 2).map((f) => f.name.toLowerCase()).join(" + ");
  const summary = `Planetary Instability Index ${score}/100 (${level}). Driven by ${top}. ${strong} strong quakes, Kp ${space.kp.toFixed(1)}, ${disasters.length} open disasters.`;

  const body = { score, level, factors, summary, counts: { quakes: quakes.length, strongQuakes: strong, disasters: disasters.length, kp: space.kp }, generatedAt: now.toISOString(), prevSeal };
  const seal = sealRecord(body, prevSeal);
  return { ...body, seal };
}

export function sampleInputs() {
  return { quakes: FALLBACK_QUAKES, space: FALLBACK_SPACE, disasters: FALLBACK_DISASTERS };
}
