import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DISCLAIMER_COOKIE_NAME,
  DISCLAIMER_VERSION,
  disclaimerCookieOptions,
  openDisclaimer,
  sealDisclaimer,
} from "@/lib/trainingDisclaimer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const accepted = openDisclaimer(
    cookieStore.get(DISCLAIMER_COOKIE_NAME)?.value,
    process.env.TRAINING_SESSION_SECRET
  );
  return NextResponse.json({
    accepted: accepted != null,
    version: DISCLAIMER_VERSION,
  });
}

export async function POST(req: Request) {
  let body: { disclaimerVersion?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (body.disclaimerVersion !== DISCLAIMER_VERSION) {
    return NextResponse.json({ error: "disclaimer_required" }, { status: 400 });
  }
  let sealed: string;
  try {
    sealed = sealDisclaimer(process.env.TRAINING_SESSION_SECRET);
  } catch {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }
  const cookieStore = await cookies();
  cookieStore.set(DISCLAIMER_COOKIE_NAME, sealed, disclaimerCookieOptions());
  return NextResponse.json({ accepted: true, version: DISCLAIMER_VERSION });
}
