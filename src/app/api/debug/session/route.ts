import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export const runtime = "nodejs";
export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({ rid: cookieStore.get("RID")?.value ?? null });
}
