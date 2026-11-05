'use client'

import { useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import TrackerBackground from '@/components/race/TrackerBackground'
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

const EXTRA_YEARS = [2023, 2022]

const panel =
  'rounded-2xl border border-white/80 bg-white/80 shadow-[0_12px_40px_-24px_rgba(17,24,39,0.45)] backdrop-blur-md'

export default function Page() {
  const [tab, setTab] = useState<'leaderboard' | 'mine'>('leaderboard')
  const [year, setYear] = useState<number>(DEMO_YEARS[0] ?? 2026)
  const rows = DEMO_LEADERBOARDS[year] ?? []
  const years = [...DEMO_YEARS, ...EXTRA_YEARS.filter((y) => !DEMO_YEARS.includes(y))]

  return (
    <>
      <SiteHeader />
      <TrackerBackground />
      <main className="relative">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
          <Link
            href="/"
            className="text-sm text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 rounded"
          >
            ← Back to home
          </Link>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Horsetooth</p>
              <h1 className="mt-2 max-w-[16ch] font-serif text-4xl font-light leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
                Four-Seasons Challenge
              </h1>
            </div>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/90 bg-amber-50/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-950 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              Demo · sample data
            </p>
          </div>

          <div className={`mt-8 px-5 py-4 sm:px-6 ${panel}`} data-tracker-mode={RACE_TRACKER_MODE}>
            <p className="max-w-2xl text-sm leading-relaxed text-gray-700">
              These riders and times are fictional, bundled with the site. This portfolio build does not
              connect to Strava or Supabase, so it still renders if those services are paused or unconfigured.
            </p>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as 'leaderboard' | 'mine')} className="mt-6">
            <div className={`flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between ${panel}`}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="leaderboard" className="flex-1 sm:flex-none">
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="mine" className="flex-1 sm:flex-none">
                  My Times
                </TabsTrigger>
              </TabsList>

              {tab === 'leaderboard' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative inline-flex items-center">
                    <span className="sr-only">Race year</span>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="appearance-none rounded-full border border-gray-200/90 bg-white/90 py-2 pl-4 pr-9 text-sm font-medium text-gray-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      className="pointer-events-none absolute right-3 h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </label>
                  <button
                    type="button"
                    onClick={() => setYear(DEMO_YEARS[0] ?? 2026)}
                    className="rounded-full border border-gray-200/90 bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                  >
                    Refresh
                  </button>
                  <p className="px-1 text-xs text-gray-500">Recording is off in this demo.</p>
                </div>
              ) : (
                <p className="px-1 text-xs text-gray-500 sm:text-right">
                  Sample history for Jordan Hale. Import and backfill are not available.
                </p>
              )}
            </div>

            <TabsContent value="leaderboard">
              {rows.length === 0 ? (
                <p className={`px-5 py-10 text-sm text-gray-500 ${panel}`}>
                  No sample results for this year.
                </p>
              ) : (
                <LeaderboardTable rows={rows} />
              )}
            </TabsContent>

            <TabsContent value="mine">
              <SeasonalTimesTable
                attempts={DEMO_MY_TIMES}
                emptyLabel="No sample times in this demo."
              />
            </TabsContent>
          </Tabs>

          <div className={`mt-6 px-5 py-5 sm:px-6 ${panel}`}>
            <p className="text-sm leading-relaxed text-gray-700">
              Same-activity rule: your overall time, 2 climbs, and 3 descents must all come from the same ride.
            </p>
            <div className="mt-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">Segments</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SEGMENTS.map((segment) => (
                  <li key={segment.id}>
                    <a
                      className="inline-flex items-center rounded-full border border-gray-200/90 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-800 no-underline shadow-sm hover:border-gray-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                      href={`https://www.strava.com/segments/${segment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {segment.name}
                      <span className="sr-only"> on Strava</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
