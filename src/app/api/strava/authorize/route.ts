import { NextResponse } from "next/server";
import { getAuthorizeURL } from "@/lib/strava";
import { authorizeEnvProblems, configIsBlocking, trainingErrorPath } from "@/lib/trainingGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const problems = authorizeEnvProblems(process.env);
  if (configIsBlocking(problems)) {
    return NextResponse.redirect(
      new URL(trainingErrorPath("server_misconfigured", problems.missing), req.url)
    );
  }
  const { searchParams } = new URL(req.url);
  const consent_public = searchParams.get("consent_public") === "1";
  const next = searchParams.get("next")?.trim() || undefined;
  const url = getAuthorizeURL({ consent_public, ts: Date.now(), next });
  return NextResponse.redirect(url);
}
