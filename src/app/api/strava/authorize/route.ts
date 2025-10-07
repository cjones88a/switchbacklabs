import { NextResponse } from "next/server";
import { getAuthorizeURL } from "@/lib/strava";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!process.env.STRAVA_CLIENT_ID) {
    return NextResponse.json({ error: "Missing STRAVA_CLIENT_ID in .env.local" }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const consent_public = searchParams.get("consent_public") === "1";
  const url = getAuthorizeURL({ consent_public, ts: Date.now() });
  return NextResponse.redirect(url);
}
