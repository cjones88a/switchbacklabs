"use client";

import * as React from "react";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import Consent from "@/components/race/Consent";
import StravaConnect from "@/components/race/StravaConnect";
import Alert from "@/components/ui/Alert";
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
  const [consent, setConsent] = React.useState(false);
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
      const mapped = (data?.rows || data || []).map((r: Record<string, unknown>) => ({
        rider: r.rider_name ?? r.rider ?? "Unknown",
        fall: r.fall ?? r["2025_FALL"] ?? null,
        winter: r.winter ?? null,
        spring: r.spring ?? null,
        summer: r.summer ?? null,
        total: r.total ?? (r.total_ms ? fmt(r.total_ms as number) : null),
        climbSum: r.climb_sum ?? (r.climb_sum_ms ? fmt(r.climb_sum_ms as number) : null),
        descSum: r.desc_sum ?? (r.desc_sum_ms ? fmt(r.desc_sum_ms as number) : null),
        profileUrl: r.profile ?? r.profile_url ?? null,
      }));
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
      <main className="relative">
        <TrackerBackground />
        <section className="container-std py-10 md:py-14 space-y-8">
          <Link href="/" className="underline text-sm">← Back to home</Link>

          <header className="space-y-2">
            <h1 className="h2">Horsetooth Four-Seasons Challenge</h1>
            <p className="text-muted">Authenticate with Strava to log your time for the season window.</p>
          </header>

          {/* Consent + Connect */}
          <div className="space-y-4">
            <Consent onChange={setConsent} />
            <div className="flex flex-wrap items-center gap-4">
              <StravaConnect enabled={consent} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/strava/powered-by-strava-black.svg"
                alt="Powered by Strava"
                className="h-8 w-auto opacity-90"
                height={32}
              />
            </div>
            {seasonKey && (
              <div className="text-xs text-muted">Season key: <span className="font-mono">{seasonKey}</span></div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={refresh} className="btn btn-ghost" disabled={busy}>Refresh</button>
            <button onClick={recordNow} className="btn btn-primary" disabled={busy}>
              {busy ? "Recording…" : "Record now"}
            </button>
          </div>

          {/* Status / JSON */}
          {status && (
            <Alert variant={status.recorded ? "success" : "warning"}>
              <pre className="text-sm overflow-x-auto">{JSON.stringify({
                recorded: status.recorded,
                activity_id: status.activity_id,
                main_ms: status.main_ms,
                climb_sum_ms: status.climb_sum_ms,
                desc_sum_ms: status.desc_sum_ms,
                reason: status.reason,
              }, null, 2)}</pre>

              {viewActivityUrl && (
                <div className="mt-3">
                  <a href={viewActivityUrl} className="underline">View on Strava</a>
                </div>
              )}
            </Alert>
          )}

          {/* Guidance */}
          <p className="text-xs text-muted">
            Descent Sum = 3 descents from the same activity as your overall time.
          </p>

          {/* Leaderboard */}
          <div className="space-y-3">
            <Leaderboard rows={rows} />
          </div>

          {/* Segment links (optional—kept from your old UI) */}
          <div className="text-xs text-muted">
            Segments:&nbsp;
            <a className="underline" href="https://www.strava.com/segments/7977451">View on Strava</a>
            &nbsp;·&nbsp;
            <a className="underline" href="https://www.strava.com/segments/9589287">View on Strava</a>
            &nbsp;·&nbsp;
            <a className="underline" href="https://www.strava.com/segments/18229887">View on Strava</a>
            &nbsp;·&nbsp;
            <a className="underline" href="https://www.strava.com/segments/21056071">View on Strava</a>
            &nbsp;·&nbsp;
            <a className="underline" href="https://www.strava.com/segments/19057702">View on Strava</a>
            &nbsp;·&nbsp;
            <a className="underline" href="https://www.strava.com/segments/13590275">View on Strava</a>
          </div>
        </section>
      </main>
    </>
  );
}
