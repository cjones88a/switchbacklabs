"use client";
import * as React from "react";
import { buildForceConsentUrl } from "@/lib/strava";
import SeasonalTimesTable from "./SeasonalTimesTable";

type Attempt = {
  race_year: number
  season_name: string
  season_year: number
  activity_id: number
  main_ms: number
  climb_sum_ms: number | null
  desc_sum_ms: number | null
  created_at: string
}


export default function MyTimes() {
  const [attempts, setAttempts] = React.useState<Attempt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [importing, setImporting] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/my-times/individual", { cache: "no-store" });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j?.error || r.statusText);
        setLoading(false);
        return;
      }
      const j = await r.json();
      setAttempts(j.data || []);
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
      ) : (
        <SeasonalTimesTable attempts={attempts} />
      )}
    </div>
  );
}

