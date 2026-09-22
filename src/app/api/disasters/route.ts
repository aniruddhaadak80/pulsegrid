import { NextResponse } from "next/server";
import { getDisasters } from "@/lib/feeds";

export const revalidate = 300;

export async function GET() {
  const env = await getDisasters();
  return NextResponse.json({ count: env.data.length, ...env });
}
