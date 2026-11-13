import { NextResponse } from "next/server";
import { getAuthorizeURL } from "@/lib/strava";
import { configIsBlocking, trainingConfigProblems, trainingErrorPath } from "@/lib/trainingGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const problems = trainingConfigProblems(process.env);
  if (configIsBlocking(problems)) {
    return NextResponse.redirect(
      new URL(trainingErrorPath("server_misconfigured", problems.missing), req.url)
    );
  }
  const { searchParams } = new URL(req.url);
  const next = searchParams.get("next")?.trim() || undefined;
  const url = getAuthorizeURL({ ts: Date.now(), next });
  return NextResponse.redirect(url);
}
