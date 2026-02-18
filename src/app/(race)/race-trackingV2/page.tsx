'use client'

import * as React from 'react'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import TrackerBackground from "@/components/race/TrackerBackground";
import StravaConnect from "@/components/race/StravaConnect";
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Notice } from '@/components/ui/notice'
import { LeaderboardTable, LeaderboardRow } from '@/components/leaderboard/LeaderboardTable'
import MyTimes from '@/components/race/MyTimes'


type AttemptStatus = {
  recorded: boolean;
  reason?: string;
  activity_id?: number;
  main_ms?: number;
  climb_sum_ms?: number;
  desc_sum_ms?: number;
};


export default function Page() {
  return (
    <Suspense>
      <RacePage />
    </Suspense>
  )
}

function RacePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [tab, setTab] = useState<'leaderboard'|'mine'>('leaderboard')
  const [lb, setLb] = useState<LeaderboardRow[]>([])
  const [lbLoading, setLbLoading] = useState(false)
  const [lbErr, setLbErr] = useState<string | null>(null)
  const [lbYear, setLbYear] = useState<number>(2026)
  const [seasonKey, setSeasonKey] = useState<string>("")
  const [status, setStatus] = useState<AttemptStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [backfilling, setBackfilling] = useState(false)
  const [backfillResult, setBackfillResult] = useState<{ imported: number } | null>(null)
  const didAutoBackfill = useRef(false)

  const refreshLeaderboard = useCallback(async () => {
    try {
      setLbLoading(true); setLbErr(null)
      const r = await fetch(`/api/leaderboard-simple?year=${lbYear}`, { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'failed')

      const normalized: LeaderboardRow[] = (j.rows ?? j ?? []).map((r: unknown) => {
        const row = r as Record<string, unknown>;
        const rider = row.rider as Record<string, unknown> | undefined;
        return {
          rider: {
            name: (rider?.name as string) ?? 'Unknown Rider',
            avatar: (rider?.avatar as string) ?? null,
          },
          fall_ms: row.fall_ms as number ?? null,
          winter_ms: row.winter_ms as number ?? null,
          spring_ms: row.spring_ms as number ?? null,
          summer_ms: row.summer_ms as number ?? null,
          fall_climb_ms: row.fall_climb_ms as number ?? null,
          winter_climb_ms: row.winter_climb_ms as number ?? null,
          spring_climb_ms: row.spring_climb_ms as number ?? null,
          summer_climb_ms: row.summer_climb_ms as number ?? null,
          fall_desc_ms: row.fall_desc_ms as number ?? null,
          winter_desc_ms: row.winter_desc_ms as number ?? null,
          spring_desc_ms: row.spring_desc_ms as number ?? null,
          summer_desc_ms: row.summer_desc_ms as number ?? null,
          total_ms: (row.total_ms as number) ?? (row.main_ms as number) ?? null,
          climb_sum_ms: row.climb_sum_ms as number ?? null,
          desc_sum_ms: row.desc_sum_ms as number ?? null,
        };
      })
      setLb(normalized)
    } catch (e: unknown) {
      setLbErr(e instanceof Error ? e.message : String(e))
    } finally {
      setLbLoading(false)
    }
  }, [lbYear])

  const runBackfill = useCallback(async () => {
    setBackfilling(true)
    try {
      const r = await fetch('/api/my-times/backfill', { method: 'POST' })
      const j = await r.json()
      if (j.ok) {
        setBackfillResult({ imported: j.imported })
        await refreshLeaderboard()
      }
    } catch {
      // non-fatal — user can retry from My Times tab
    } finally {
      setBackfilling(false)
    }
  }, [refreshLeaderboard])

  // initial fetches (session + season + leaderboard)
  useEffect(() => {
    (async () => {
      try {
        const [sessionRes, seasonRes] = await Promise.all([
          fetch("/api/debug/session"),
          fetch("/api/season-key"),
        ]);
        if (sessionRes.ok) {
          const { rid } = await sessionRes.json();
          setIsAuthenticated(!!rid);
        }
        if (seasonRes.ok) {
          const s = await seasonRes.text();
          if (s) {
            setSeasonKey(s);
            // Derive current race year from season key:
            // Race year = Spring/Summer calendar year
            // FALL/WINTER: race year = calendar year + 1
            // SPRING/SUMMER: race year = calendar year
            const [calYearStr, season] = s.split('_');
            const calYear = parseInt(calYearStr);
            const raceYear = (season === 'FALL' || season === 'WINTER') ? calYear + 1 : calYear;
            setLbYear(raceYear);
          }
        }
      } catch {}
      await refreshLeaderboard();
    })();
  }, [refreshLeaderboard])

  // Auto-backfill when rider returns from Strava OAuth (?connected=1)
  useEffect(() => {
    if (!isAuthenticated) return
    if (searchParams.get('connected') !== '1') return
    if (didAutoBackfill.current) return
    didAutoBackfill.current = true

    // Strip the query param from the URL without re-rendering
    router.replace('/race-trackingV2', { scroll: false })

    // Switch to My Times tab so the rider sees their history populate
    setTab('mine')
    runBackfill()
  }, [isAuthenticated, searchParams, router, runBackfill])

  // Re-fetch leaderboard when year changes (lbYear is a dep of refreshLeaderboard,
  // so this also fires on initial mount via the session effect above)
  useEffect(() => {
    if (tab === 'leaderboard') refreshLeaderboard()
  }, [lbYear]) // eslint-disable-line react-hooks/exhaustive-deps

  const recordNow = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season_key: seasonKey }),
      });
      const json = await res.json();
      setStatus(json as AttemptStatus);
      await refreshLeaderboard();
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
        <div className="container-page py-8">
          <Link href="/" className="text-sm text-neutral-500 hover:opacity-70 bg-white/90 px-3 py-1 rounded-md backdrop-blur-sm">← Back to home</Link>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] mt-6">
            Horsetooth Four-Seasons Challenge
          </h1>

          {/* Strava connect block */}
          <div className="mt-8 space-y-4 bg-white/95 p-8 rounded-xl backdrop-blur-sm">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">Connected to Strava</span>
                {backfilling && (
                  <span className="text-sm text-neutral-500 animate-pulse">Importing your history…</span>
                )}
                {backfillResult && !backfilling && (
                  <span className="text-sm text-neutral-500">{backfillResult.imported} season{backfillResult.imported !== 1 ? 's' : ''} imported</span>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
            {seasonKey && (
              <div className="text-xs text-neutral-400">Current season: <span className="font-mono">{seasonKey}</span></div>
            )}
          </div>

          {/* Record status */}
          {status && (
            <div className="mt-6 rounded-xl p-6 bg-white/95 backdrop-blur-sm ring-1 ring-neutral-200">
              <div className="text-[11px] tracking-widest uppercase text-neutral-500 mb-2">
                {status.recorded ? "Success" : "Error"}
              </div>
              <div className="text-sm mb-3">
                {status.recorded ? "Time recorded successfully!" : `Failed to record: ${status.reason}`}
              </div>
              {viewActivityUrl && (
                <a
                  href={viewActivityUrl}
                  className="inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none h-8 px-3 text-sm border border-black/10 text-brand-900 hover:bg-black/5"
                >
                  View on Strava
                </a>
              )}
            </div>
          )}

          {/* Year selector + action buttons — shared across both tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <select
              value={lbYear}
              onChange={(e) => setLbYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
              <option value={2021}>2021</option>
              <option value={2020}>2020</option>
              <option value={2019}>2019</option>
              <option value={2018}>2018</option>
              <option value={2017}>2017</option>
            </select>
            {tab === 'leaderboard' && (
              <>
                <Button variant="outline" onClick={refreshLeaderboard} disabled={lbLoading}>Refresh</Button>
                <Button
                  onClick={recordNow}
                  disabled={busy || !isAuthenticated || !seasonKey}
                  title={!isAuthenticated ? 'Connect with Strava first' : undefined}
                >
                  {busy ? 'Recording…' : 'Record now'}
                </Button>
                {lbErr && <Notice>{lbErr}</Notice>}
              </>
            )}
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as 'leaderboard' | 'mine')}>
            <TabsList>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="mine">My Times</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard">
              {lbLoading ? (
                <p className="mt-6 text-sm text-neutral-500">Loading leaderboard…</p>
              ) : (
                <LeaderboardTable rows={lb} />
              )}
            </TabsContent>

            <TabsContent value="mine">
              <div className="mt-4">
                <MyTimes year={lbYear} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Guidance */}
          <div className="mt-8 bg-white/95 p-6 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-neutral-500 mb-4">
              Same-activity rule: your overall time, 2 climbs, and 3 descents must all come from the same ride.
            </p>
            <div className="text-xs text-neutral-500">
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
        </div>
      </main>
    </>
  )
}
