"use client";

import dynamic from "next/dynamic";
import type { DisasterEvent, QuakeEvent } from "@/lib/types";

const GlobeView = dynamic(() => import("@/components/GlobeView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-400 md:h-[520px]">
      loading 3D globe…
    </div>
  ),
});

export default function GlobeSection({ quakes, disasters, kp }: { quakes: QuakeEvent[]; disasters: DisasterEvent[]; kp: number }) {
  return <GlobeView quakes={quakes} disasters={disasters} kp={kp} />;
}
