import { NextResponse } from "next/server";
import { computeRisk } from "@/lib/engine";
import { getDisasters, getQuakes, getSpace } from "@/lib/feeds";
import { GENESIS_SEAL } from "@/lib/seal";

export const revalidate = 120;

export async function GET() {
  const [q, s, d] = await Promise.all([getQuakes(), getSpace(), getDisasters()]);
  const briefing = computeRisk(q.data, s.data, d.data, GENESIS_SEAL, new Date());
  return NextResponse.json({
    briefing,
    inputs: { quakesFallback: q.fallback, spaceFallback: s.fallback, disastersFallback: d.fallback },
    sources: [q.source, s.source, d.source],
  });
}
