"use client";

import * as React from "react";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import StravaConnect from "@/components/race/StravaConnect";
import Leaderboard from "@/components/race/Leaderboard";
import TrackerBackground from "@/components/race/TrackerBackground";

type AttemptStatus = {
  recorded: boolean;
  reason?: string;
  activity_id?: number;
  main_ms?: number;
  climb_sum_ms?: number;
  desc_sum_ms?: number;
};

const fmt = (ms?: number | null) => {
  if (!ms && ms !== 0) return null;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v, i) => (i === 0 ? String(v) : String(v).padStart(2, "0"))).join(":").replace(/^0:/, "");
};

export default function RaceTracker() {
  const [seasonKey, setSeasonKey] = React.useState<string>(""); // server returns this on page load in your impl
  const [status, setStatus] = React.useState<AttemptStatus | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [rows, setRows] = React.useState<
    { rider: string; fall?: string | null; winter?: string | null; spring?: string | null; summer?: string | null; total?: string | null; climbSum?: string | null; descSum?: string | null; profileUrl?: string | null; }[]
  >([]);

  // initial fetches (season + leaderboard)
  React.useEffect(() => {
    (async () => {
      try {
        const s = await fetch("/api/season-key").then(r => r.ok ? r.text() : ""); // if you have this; otherwise hardcode
        if (s) setSeasonKey(s);
      } catch {}
      await refresh();
    })();
  }, []);

  const refresh = async () => {
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      // adapt to your API shape
      const mapped = (data?.rows || data || []).map((r: Record<string, unknown>) => {
        // Handle case where rider might be an object with name/avatar
        let riderName = "Unknown";
        if (typeof r.rider === 'string') {
          riderName = r.rider;
            } else if (r.rider && typeof r.rider === 'object' && 'name' in r.rider) {
              riderName = (r.rider as { name: string }).name;
        } else if (r.rider_name) {
          riderName = r.rider_name as string;
        }
        
        return {
          rider: riderName,
          fall: r.fall ?? r["2025_FALL"] ?? null,
          winter: r.winter ?? null,
          spring: r.spring ?? null,
          summer: r.summer ?? null,
          total: r.total ?? (r.total_ms ? fmt(r.total_ms as number) : null),
          climbSum: r.climb_sum ?? (r.climb_sum_ms ? fmt(r.climb_sum_ms as number) : null),
          descSum: r.desc_sum ?? (r.desc_sum_ms ? fmt(r.desc_sum_ms as number) : null),
          profileUrl: r.profile ?? r.profile_url ?? null,
        };
      });
      setRows(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const recordNow = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/record", { method: "POST" });
      const json = await res.json();
      setStatus(json as AttemptStatus);
      await refresh();
    } catch (e) {
      console.error(e);
      setStatus({ recorded: false, reason: "client_error" });
    } finally {
      setBusy(false);
    }
  };

  const viewActivityUrl = status?.activity_id
    ? `https://www.strava.com/activities/${status.activity_id}`
    : null;

  return (
    <>
      <SiteHeader />
      <TrackerBackground />
          <main className="relative">
            <section className="section space-y-12">
              <Link href="/" className="text-sm text-muted hover:opacity-70 bg-white/90 px-3 py-1 rounded-md backdrop-blur-sm">← Back to home</Link>

              <header className="space-y-4 bg-white/95 p-8 rounded-xl backdrop-blur-sm">
                <h1 className="h2">Horsetooth Four-Seasons Challenge</h1>
                <p className="text-muted">Authenticate with Strava to log your time for the season window.</p>
              </header>

              {/* Connect */}
              <div className="space-y-6 bg-white/95 p-8 rounded-xl backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-6">
                  <StravaConnect enabled={true} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/strava/powered-by-strava-black.svg"
                    alt="Powered by Strava"
                    className="h-8 w-auto opacity-90"
                    height={32}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  By clicking &quot;Connect with Strava&quot;, I agree to display my name and race times on the public leaderboard. 
                  You can withdraw consent anytime by emailing us.
                </p>
                {seasonKey && (
                  <div className="text-xs text-muted bg-gray-100 px-3 py-2 rounded">Season key: <span className="font-mono">{seasonKey}</span></div>
                )}
              </div>

              {/* Status / JSON */}
              {status && (
                <div className="card-outline p-8 bg-white/95 backdrop-blur-sm">
                  <div className="text-[11px] tracking-widest uppercase text-muted mb-3">
                    {status.recorded ? "Success" : "Error"}
                  </div>
                  <div className="text-sm mb-4">
                    {status.recorded ? "Time recorded successfully!" : `Failed to record: ${status.reason}`}
                  </div>
                  {viewActivityUrl && (
                    <div>
                      <a href={viewActivityUrl} className="btn btn-pill text-sm bg-white border-2 border-gray-300 hover:bg-gray-50 px-4 py-2">View on Strava</a>
                    </div>
                  )}
                </div>
              )}

              {/* Leaderboard */}
              <div className="space-y-6 bg-white/95 p-8 rounded-xl backdrop-blur-sm">
                <h2 className="h2">Leaderboard</h2>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={refresh} className="btn btn-pill bg-white border-2 border-gray-300 hover:bg-gray-50 px-4 py-2 text-sm" disabled={busy}>Refresh</button>
                  <button onClick={recordNow} className="btn btn-primary shadow-lg px-4 py-2 text-sm" disabled={busy}>
                    {busy ? "Recording…" : "Record now"}
                  </button>
                </div>
                
                <div className="pt-4">
                  <Leaderboard rows={rows} />
                </div>
              </div>

              {/* Guidance */}
              <div className="bg-white/95 p-6 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-muted mb-4">
                  Descent Sum = 3 descents from the same activity as your overall time.
                </p>

                {/* Segment links */}
                <div className="text-xs text-muted">
                  <span className="font-semibold">Segments:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      { id: "7977451", name: "Main" },
                      { id: "9589287", name: "Climb 1" },
                      { id: "18229887", name: "Climb 2" },
                      { id: "21056071", name: "Descent 1" },
                      { id: "19057702", name: "Descent 2" },
                      { id: "13590275", name: "Descent 3" }
                    ].map((segment) => (
                      <a
                        key={segment.id}
                        className="underline hover:opacity-70 bg-gray-100 px-3 py-2 rounded"
                        href={`https://www.strava.com/segments/${segment.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {segment.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
        </section>
      </main>
    </>
  );
}
