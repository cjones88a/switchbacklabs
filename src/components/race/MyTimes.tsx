"use client";
import * as React from "react";

type YearRow = {
  race_year: number;
  fall_ms: number | null;
  winter_ms: number | null;
  spring_ms: number | null;
  summer_ms: number | null;
};

const fmt = (ms: number | null | undefined) => {
  if (ms == null) return "—";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (h ? `${h}:` : "") + `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

export default function MyTimes() {
  const [rows, setRows] = React.useState<YearRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/my-times", { cache: "no-store" });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          setErr(j?.error || r.statusText);
          setLoading(false);
          return;
        }
        const j = await r.json();
        setRows(j.rows || []);
      } catch (e: any) {
        setErr("network_error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-muted">Loading…</div>;
  if (err === "not_authenticated") {
    return <div className="text-sm">Connect with Strava to view your historical times.</div>;
  }
  if (err) {
    return <div className="text-sm text-red-600">Error: {err}</div>;
  }
  if (!rows.length) {
    return <div className="text-sm text-muted">No historical times found yet.</div>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block card-outline bg-white p-0 overflow-x-auto">
        <table className="min-w-full border-separate [border-spacing:0]">
          <thead>
            <tr className="text-left text-sm text-muted">
              {["Race Year","Fall","Winter","Spring","Summer"].map(h => (
                <th key={h} className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.race_year} className="text-sm">
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{r.race_year}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{fmt(r.fall_ms)}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{fmt(r.winter_ms)}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{fmt(r.spring_ms)}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{fmt(r.summer_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-3">
        {rows.map(r => (
          <div key={r.race_year} className="card-outline bg-white p-4">
            <div className="font-semibold">Race Year {r.race_year}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
              <Label label="Fall"   v={fmt(r.fall_ms)} />
              <Label label="Winter" v={fmt(r.winter_ms)} />
              <Label label="Spring" v={fmt(r.spring_ms)} />
              <Label label="Summer" v={fmt(r.summer_ms)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Label({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span>{v}</span>
    </div>
  );
}
