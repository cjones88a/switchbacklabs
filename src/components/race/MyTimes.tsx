"use client";
import * as React from "react";
import { buildForceConsentUrl } from "@/lib/strava";

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
  const [importing, setImporting] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/my-times", { cache: "no-store" });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j?.error || r.statusText);
        setLoading(false);
        return;
      }
      const j = await r.json();
      setRows(j.items || j.rows || []);
    } catch {
      setErr("network_error");
    } finally {
      setLoading(false);
    }
  };

  const backfill = async () => {
    setImporting(true);
    setErr(null);
    try {
      const r = await fetch("/api/my-times/backfill", { method: "POST" });
      const j = await r.json();
      if (!j.ok) {
        setErr(j.error || "Backfill failed");
        setImporting(false);
        return;
      }
      // Re-load data after successful backfill
      await loadData();
    } catch {
      setErr("Backfill failed");
    } finally {
      setImporting(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-sm text-muted">Loading…</div>;
  if (err === "not_authenticated") {
    return <div className="text-sm">Connect with Strava to view your historical times.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Backfill button and error display */}
      <div className="flex items-center gap-3">
        <button
          onClick={backfill}
          disabled={importing}
          className="btn btn-pill bg-black text-white hover:opacity-90 disabled:opacity-50 px-4 py-2 text-sm"
          title="Imports all of your historical efforts from Strava and updates your yearly grid"
        >
          {importing ? "Importing…" : "Backfill my history"}
        </button>
        {err && (
          <div className="text-sm">
            <p className="text-red-600">{err}</p>
            {(err.includes('404') || err.includes('Record Not Found') || err.includes('permissions')) && (
              <p className="mt-1 text-muted">
                If this mentions permissions or &quot;Record Not Found&quot;, re-connect with full scope:{' '}
                <a className="underline text-blue-600 hover:text-blue-800" href={buildForceConsentUrl()}>
                  upgrade Strava permissions
                </a>
                , then run Backfill again.
              </p>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading your times…</p>
      ) : !rows.length ? (
        <div className="text-sm text-muted">No historical times found yet. Click &quot;Backfill my history&quot; to import your data.</div>
      ) : (
        <div className="overflow-x-auto">
          {/* Desktop table */}
          <div className="hidden md:block card-outline bg-white p-0 overflow-x-auto">
            <table className="min-w-full border-separate [border-spacing:0]">
              <thead>
                <tr className="text-left text-sm text-muted bg-gray-50">
                  {["Race Year","Fall","Winter","Spring","Summer"].map(h => (
                    <th key={h} className="px-6 py-4 border-b border-[hsl(var(--pb-line))] font-semibold uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.race_year} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 border-b border-[hsl(var(--pb-line))] font-semibold">{r.race_year}</td>
                    <td className="px-6 py-4 border-b border-[hsl(var(--pb-line))] font-mono">{fmt(r.fall_ms)}</td>
                    <td className="px-6 py-4 border-b border-[hsl(var(--pb-line))] font-mono">{fmt(r.winter_ms)}</td>
                    <td className="px-6 py-4 border-b border-[hsl(var(--pb-line))] font-mono">{fmt(r.spring_ms)}</td>
                    <td className="px-6 py-4 border-b border-[hsl(var(--pb-line))] font-mono">{fmt(r.summer_ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-3">
            {rows.map(r => (
              <div key={r.race_year} className="card-outline bg-white p-4">
                <div className="font-semibold text-lg mb-3">Race Year {r.race_year}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Label label="Fall"   v={fmt(r.fall_ms)} />
                  <Label label="Winter" v={fmt(r.winter_ms)} />
                  <Label label="Spring" v={fmt(r.spring_ms)} />
                  <Label label="Summer" v={fmt(r.summer_ms)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted font-medium">{label}</span>
      <span className="font-mono font-semibold">{v}</span>
    </div>
  );
}
