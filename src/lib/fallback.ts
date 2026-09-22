import type { DisasterEvent, QuakeEvent, SpaceWeather } from "./types";

export const FALLBACK_QUAKES: QuakeEvent[] = [
  { id: "fallback-q1", mag: 6.1, place: "South of the Fiji Islands", time: Date.now() - 1000 * 60 * 60 * 5, lat: -24.8, lon: 178.4, depth: 535, url: "https://earthquake.usgs.gov/", tsunami: false },
  { id: "fallback-q2", mag: 5.2, place: "Off the coast of Valparaiso, Chile", time: Date.now() - 1000 * 60 * 60 * 9, lat: -33.2, lon: -72.1, depth: 22, url: "https://earthquake.usgs.gov/", tsunami: false },
  { id: "fallback-q3", mag: 4.8, place: "Hindu Kush region, Afghanistan", time: Date.now() - 1000 * 60 * 60 * 14, lat: 36.5, lon: 70.9, depth: 190, url: "https://earthquake.usgs.gov/", tsunami: false },
  { id: "fallback-q4", mag: 4.6, place: "Izu Islands, Japan region", time: Date.now() - 1000 * 60 * 60 * 20, lat: 34.1, lon: 139.5, depth: 12, url: "https://earthquake.usgs.gov/", tsunami: true },
  { id: "fallback-q5", mag: 4.3, place: "Southern California", time: Date.now() - 1000 * 60 * 60 * 26, lat: 34.0, lon: -117.2, depth: 8, url: "https://earthquake.usgs.gov/", tsunami: false },
];

export const FALLBACK_SPACE: SpaceWeather = {
  kp: 4.33,
  kpTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  windSpeed: 512,
  bz: -6.4,
  density: 8.2,
  stormLevel: "G0 — Active",
  source: "fallback",
};

export const FALLBACK_DISASTERS: DisasterEvent[] = [
  { id: "EONET-fb-w1", title: "Wildfire — Attica, Greece", category: "Wildfires", status: "open", date: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), lat: 38.0, lon: 23.7 },
  { id: "EONET-fb-s1", title: "Severe Storm — Bay of Bengal", category: "Severe Storms", status: "open", date: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), lat: 15.5, lon: 88.0 },
  { id: "EONET-fb-v1", title: "Volcano — Reykjanes, Iceland", category: "Volcanoes", status: "open", date: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(), lat: 63.9, lon: -22.4 },
  { id: "EONET-fb-d1", title: "Drought — Horn of Africa", category: "Drought", status: "open", date: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(), lat: 2.0, lon: 45.0 },
];
