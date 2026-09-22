import { FALLBACK_DISASTERS, FALLBACK_QUAKES, FALLBACK_SPACE } from "./fallback";
import type { DisasterEvent, FeedEnvelope, QuakeEvent, SpaceWeather } from "./types";

const UA = { "User-Agent": "pulsegrid/1.0 (+https://github.com/aniruddhaadak80/pulsegrid)" };

async function fetchJson(url: string, timeoutMs = 9000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: UA, signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(t);
  }
}

interface UsgsFeature { id: string; properties: { mag: number | null; place: string | null; time: number; url: string | null; tsunami: number }; geometry: { coordinates: [number, number, number] } }
interface UsgsFeed { features: UsgsFeature[] }

export async function getQuakes(): Promise<FeedEnvelope<QuakeEvent[]>> {
  const source = "USGS Earthquake Hazards Program (all_day.geojson)";
  try {
    const raw = (await fetchJson("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")) as UsgsFeed;
    const data: QuakeEvent[] = (raw.features ?? [])
      .filter((f) => typeof f.properties?.mag === "number")
      .map((f) => ({
        id: f.id,
        mag: f.properties.mag ?? 0,
        place: f.properties.place ?? "Unknown location",
        time: f.properties.time,
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        depth: f.geometry.coordinates[2] ?? 0,
        url: f.properties.url ?? "https://earthquake.usgs.gov/",
        tsunami: f.properties.tsunami === 1,
      }))
      .sort((a, b) => b.mag - a.mag)
      .slice(0, 80);
    if (data.length === 0) throw new Error("empty feed");
    return { data, fallback: false, fetchedAt: new Date().toISOString(), source };
  } catch {
    return { data: FALLBACK_QUAKES, fallback: true, fetchedAt: new Date().toISOString(), source: `${source} [offline fallback]` };
  }
}

interface KpRow { kp_index?: number; kp?: number; time_tag?: string; observed_time_tag?: string }
function stormLevel(kp: number): string {
  if (kp >= 8) return "G4/G5 — Extreme";
  if (kp >= 7) return "G3 — Strong";
  if (kp >= 6) return "G2 — Moderate";
  if (kp >= 5) return "G1 — Minor";
  if (kp >= 4) return "G0 — Active";
  return "Quiet";
}

export async function getSpace(): Promise<FeedEnvelope<SpaceWeather>> {
  const source = "NOAA SWPC (planetary K-index + solar wind)";
  try {
    const kpRaw = (await fetchJson("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json")) as (KpRow[] | { kp_index: KpRow[] });
    const kpArr: KpRow[] = Array.isArray(kpRaw) ? kpRaw : kpRaw.kp_index ?? [];
    const last = kpArr[kpArr.length - 1] ?? {};
    const kp = Number(last.kp_index ?? last.kp ?? FALLBACK_SPACE.kp);
    const kpTime = String(last.time_tag ?? last.observed_time_tag ?? new Date().toISOString());

    let windSpeed: number | null = null;
    let bz: number | null = null;
    let density: number | null = null;
    try {
      const plasma = (await fetchJson("https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json")) as string[][];
      const prow = plasma[plasma.length - 1];
      if (prow && prow.length >= 4) {
        density = Number(prow[1]); windSpeed = Number(prow[2]);
        if (!Number.isFinite(windSpeed)) windSpeed = null;
        if (!Number.isFinite(density)) density = null;
      }
      const mag = (await fetchJson("https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json")) as string[][];
      const mrow = mag[mag.length - 1];
      if (mrow && mrow.length >= 4) {
        bz = Number(mrow[3]);
        if (!Number.isFinite(bz)) bz = null;
      }
    } catch { /* keep nulls */ }

    const data: SpaceWeather = { kp: Number.isFinite(kp) ? kp : FALLBACK_SPACE.kp, kpTime, windSpeed, bz, density, stormLevel: stormLevel(Number.isFinite(kp) ? kp : 0), source: "live" };
    return { data, fallback: false, fetchedAt: new Date().toISOString(), source };
  } catch {
    return { data: FALLBACK_SPACE, fallback: true, fetchedAt: new Date().toISOString(), source: `${source} [offline fallback]` };
  }
}

interface EonetGeom { coordinates: number[] }
interface EonetEvent { id: string; title: string; categories: { title: string }[]; status: string; geometry: { date: string; coordinates?: number[] }[]; sources: { url: string }[] }
interface EonetFeed { events: EonetEvent[] }

export async function getDisasters(): Promise<FeedEnvelope<DisasterEvent[]>> {
  const source = "NASA EONET v3 (open events)";
  try {
    const raw = (await fetchJson("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=40&days=60")) as EonetFeed;
    const data: DisasterEvent[] = (raw.events ?? []).slice(0, 40).map((e) => {
      const g = e.geometry?.[e.geometry.length - 1];
      const coords: number[] | undefined = g?.coordinates as EonetGeom["coordinates"] | undefined;
      return {
        id: e.id, title: e.title, category: e.categories?.[0]?.title ?? "Unknown",
        status: e.status, date: g?.date ?? new Date().toISOString(),
        lon: coords && coords.length >= 2 ? coords[0] : null,
        lat: coords && coords.length >= 2 ? (coords.length > 2 ? coords[1] : null) : null,
      };
    });
    if (data.length === 0) throw new Error("empty feed");
    return { data, fallback: false, fetchedAt: new Date().toISOString(), source };
  } catch {
    return { data: FALLBACK_DISASTERS, fallback: true, fetchedAt: new Date().toISOString(), source: `${source} [offline fallback]` };
  }
}
