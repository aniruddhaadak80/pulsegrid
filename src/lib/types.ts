export interface QuakeEvent {
  id: string;
  mag: number;
  place: string;
  time: number;
  lat: number;
  lon: number;
  depth: number;
  url: string;
  tsunami: boolean;
}

export interface SpaceWeather {
  kp: number;
  kpTime: string;
  windSpeed: number | null;
  bz: number | null;
  density: number | null;
  stormLevel: string;
  source: "live" | "fallback";
}

export interface DisasterEvent {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  lat: number | null;
  lon: number | null;
}

export interface RiskFactor {
  name: string;
  points: number;
  detail: string;
}

export type RiskLevel = "Calm" | "Watch" | "Elevated" | "Severe" | "Extreme";

export interface RiskBriefing {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  summary: string;
  counts: { quakes: number; strongQuakes: number; disasters: number; kp: number };
  generatedAt: string;
  prevSeal: string;
  seal: string;
}

export interface FeedEnvelope<T> {
  data: T;
  fallback: boolean;
  fetchedAt: string;
  source: string;
}
