import { NextResponse } from "next/server";
import { getQuakes } from "@/lib/feeds";

export const revalidate = 120;

export async function GET() {
  const env = await getQuakes();
  return NextResponse.json({ count: env.data.length, ...env });
}
