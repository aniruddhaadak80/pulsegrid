import { NextResponse } from "next/server";
import { getSpace } from "@/lib/feeds";

export const revalidate = 180;

export async function GET() {
  const env = await getSpace();
  return NextResponse.json(env);
}
