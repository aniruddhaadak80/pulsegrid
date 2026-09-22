"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import type { DisasterEvent, QuakeEvent } from "@/lib/types";

interface Props {
  quakes: QuakeEvent[];
  disasters: DisasterEvent[];
  kp: number;
}

const DISASTER_COLORS: Record<string, string> = {
  Wildfires: "#fb923c",
  "Severe Storms": "#22d3ee",
  Volcanoes: "#fb7185",
};

export default function GlobeView({ quakes, disasters, kp }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(true);
  const [width, setWidth] = useState(800);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-globe.gl exposes controls via ref without types
  const globeRef = useRef<any>(null);

  const points = useMemo(
    () =>
      quakes.slice(0, 60).map((q) => ({
        lat: q.lat,
        lng: q.lon,
        size: Math.max(0.15, (q.mag - 3) * 0.28),
        color: q.mag >= 6 ? "#fb7185" : q.mag >= 5 ? "#fbbf24" : "#22d3ee",
        label: `M${q.mag.toFixed(1)} ${q.place}`,
      })),
    [quakes],
  );

  const rings = useMemo(
    () =>
      quakes.slice(0, 12).map((q) => ({
        lat: q.lat,
        lng: q.lon,
        maxR: 3 + q.mag,
        propagationSpeed: 1.6,
        repeatPeriod: 2200,
        color: q.mag >= 6 ? "#fb7185" : "#fbbf24",
      })),
    [quakes],
  );

  const disasterPoints = useMemo(
    () =>
      disasters
        .filter((d) => d.lat !== null && d.lon !== null)
        .slice(0, 30)
        .map((d) => ({
          lat: d.lat as number,
          lng: d.lon as number,
          size: 0.32,
          color: DISASTER_COLORS[d.category] ?? "#a78bfa",
          label: d.title,
        })),
    [disasters],
  );

  const arcs = useMemo(() => {
    const intensity = Math.min(1, kp / 9);
    return quakes.slice(0, 8).map((q, i) => ({
      startLat: 62 + (i % 3) * 4,
      startLng: -95 + i * 22,
      endLat: q.lat,
      endLng: q.lon,
      color: [`rgba(167,139,250,${0.25 + intensity * 0.6})`, `rgba(34,211,238,${0.25 + intensity * 0.6})`],
    }));
  }, [quakes, kp]);

  useEffect(() => {
    const g = globeRef.current;
    if (g?.controls) {
      g.controls().autoRotate = spinning;
      g.controls().autoRotateSpeed = 0.7;
    }
  }, [spinning]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => queueMicrotask(() => setWidth(el.clientWidth || 800));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const pause = () => {
      setSpinning(false);
      if (t) clearTimeout(t);
      // Queue resume off the event path so pointer handlers stay cheap.
      t = setTimeout(() => queueMicrotask(() => setSpinning(true)), 6000);
    };
    el.addEventListener("pointerdown", pause);
    el.addEventListener("wheel", pause);
    return () => {
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("wheel", pause);
      if (t) clearTimeout(t);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[420px] w-full overflow-hidden rounded-2xl md:h-[520px]">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
        pointsData={[...points, ...disasterPoints]}
        pointLat="lat"
        pointLng="lng"
        pointRadius="size"
        pointColor="color"
        pointLabel="label"
        ringsData={rings}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor="color"
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={3200}
        atmosphereColor="#22d3ee"
        atmosphereAltitude={0.18}
        width={width}
        height={520}
      />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-cyan-200">
        {spinning ? "auto-rotate on · drag to pause" : "paused · resuming…"}
      </div>
    </div>
  );
}
