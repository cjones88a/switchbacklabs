'use client'

import { useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import TrackerBackground from '@/components/race/TrackerBackground'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import SeasonalTimesTable from '@/components/race/SeasonalTimesTable'
import { DEMO_LEADERBOARDS, DEMO_MY_TIMES, DEMO_YEARS, RACE_TRACKER_MODE } from '@/lib/raceDemoData'

/**
 * Static portfolio demo. RACE_TRACKER_MODE is fixed to "demo":
 * this page does not call Strava or Supabase, so a paused project cannot break it.
 */

const SEGMENTS = [
  { id: '7977451', name: 'Main' },
  { id: '9589287', name: 'Climb 1' },
  { id: '18229887', name: 'Climb 2' },
  { id: '21056071', name: 'Descent 1' },
  { id: '19057702', name: 'Descent 2' },
  { id: '13590275', name: 'Descent 3' },
]

export default function Page() {
  const [tab, setTab] = useState<'leaderboard' | 'mine'>('leaderboard')
  const [year, setYear] = useState<number>(DEMO_YEARS[0] ?? 2026)
  const rows = DEMO_LEADERBOARDS[year] ?? []

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

          <div className="mt-8 bg-white/95 p-8 rounded-xl backdrop-blur-sm ring-1 ring-amber-200/80" data-tracker-mode={RACE_TRACKER_MODE}>
            <p className="text-[11px] tracking-widest uppercase text-amber-800/80 mb-2">Demo with sample data</p>
            <p className="text-sm text-neutral-700 leading-relaxed max-w-2xl">
              These riders and times are fictional, bundled with the site. This portfolio build does not
              connect to Strava or Supabase, so it still renders if those services are paused or unconfigured.
            </p>
            <p className="mt-3 text-xs text-neutral-400">Showing sample season: <span className="font-mono">{year}</span></p>
          </div>

          {tab === 'leaderboard' && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                aria-label="Race year"
              >
                {DEMO_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
              </select>
              <Button variant="outline" type="button" onClick={() => setYear(DEMO_YEARS[0] ?? 2026)}>
                Refresh
              </Button>
              <Button type="button" disabled title="Recording is off in this demo">
                Record now
              </Button>
              <span className="text-xs text-neutral-600 bg-white/90 px-2 py-1 rounded-md">
                Recording is off in this demo.
              </span>
            </div>
          )}

          <Tabs value={tab} onValueChange={(value) => setTab(value as 'leaderboard' | 'mine')}>
            <TabsList>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="mine">My Times</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard">
              {rows.length === 0 ? (
                <p className="mt-6 text-sm text-neutral-500">No sample results for this year.</p>
              ) : (
                <LeaderboardTable rows={rows} />
              )}
            </TabsContent>

            <TabsContent value="mine">
              <div className="mt-4 space-y-3">
                <p className="text-sm text-neutral-500">
                  Sample history for Jordan Hale. Import and backfill are not available in the demo.
                </p>
                <SeasonalTimesTable attempts={DEMO_MY_TIMES} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 bg-white/95 p-6 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-neutral-500 mb-4">
              Same-activity rule: your overall time, 2 climbs, and 3 descents must all come from the same ride.
            </p>
            <div className="text-xs text-neutral-500">
              <span className="font-semibold">Segments:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {SEGMENTS.map((segment) => (
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
