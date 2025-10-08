import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { traceHeaders } from "@/lib/trace";

export const runtime = 'nodejs';

// type Row = {
//   rider_id: string;
//   race_year: number;
//   fall_ms: number | null;
//   winter_ms: number | null;
//   spring_ms: number | null;
//   summer_ms: number | null;
// };

export async function GET() {
  const t = traceHeaders("my-times");
  console.time(`[${t.name}] ${t.id}`);
  
  const cookieStore = await cookies();
  const rid = cookieStore.get("rider_id")?.value;
  if (!rid) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("rider_yearly_times")
    .select("*")
    .eq("rider_id", rid)
    .gte("race_year", 2014)       // back to 2014
    .order("race_year", { ascending: false });

  if (error) {
    console.error(`[${t.name}] ${t.id} database error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const res = NextResponse.json({ rows: data ?? [] });
  res.headers.set("x-trace-id", t.id);
  res.headers.set("x-handler", t.name);
  console.timeEnd(`[${t.name}] ${t.id}`);
  return res;
}
