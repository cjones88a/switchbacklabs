import { NextResponse } from "next/server";
import { getAuthorizeURL } from "@/lib/strava";
export const runtime = "nodejs";            // <— add this

export async function GET() {
  if (!process.env.STRAVA_CLIENT_ID) {
    return NextResponse.json({ error: "Missing STRAVA_CLIENT_ID in .env.local" }, { status: 500 });
  }
  return NextResponse.redirect(getAuthorizeURL("state-4soh"));
}
