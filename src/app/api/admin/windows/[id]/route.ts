import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function isAuthed(req: Request) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { error } = await supabaseAdmin.from("season_overrides").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
