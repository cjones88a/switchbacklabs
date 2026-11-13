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
 * this page does not call Strava or a database.
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
  'rounded-2xl border border-gray-200 bg-white/95 shadow-[0_10px_30px_-16px_rgba(17,24,39,0.28)] backdrop-blur-sm'

const control =
  'h-10 rounded-full border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/25'

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
        <div className="container-std py-10 md:py-14">
          <Link
            href="/"
            className="inline-flex rounded text-sm font-medium text-gray-700 underline-offset-4 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
          >
            ← Back to home
          </Link>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-gray-600">Horsetooth</p>
              <h1 className="mt-3 font-serif text-4xl font-light leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
                Four-Seasons Challenge
              </h1>
            </div>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-950">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" aria-hidden />
              Demo · sample data
            </p>
          </div>

          <div className={`mt-8 px-5 py-5 sm:px-6 ${panel}`} data-tracker-mode={RACE_TRACKER_MODE}>
            <p className="text-sm leading-relaxed text-gray-800">
              These riders and times are fictional, bundled with the site. This page does not connect to
              Strava or a database.
            </p>
            <p className="mt-3 text-sm font-medium text-gray-800">Showing sample season {year}</p>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as 'leaderboard' | 'mine')} className="mt-8">
            <div className={`flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${panel}`}>
              <TabsList className="h-10 w-full border-gray-200 bg-gray-100 shadow-none backdrop-blur-none sm:w-auto">
                <TabsTrigger value="leaderboard" className="h-8 flex-1 px-4 sm:flex-none">
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="mine" className="h-8 flex-1 px-4 sm:flex-none">
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
                      className={`${control} appearance-none pr-9`}
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
                      className="pointer-events-none absolute right-3 h-4 w-4 text-gray-600"
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
                    className={control}
                  >
                    Refresh
                  </button>
                  <p className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden />
                    Recording is off in this demo
                  </p>
                </div>
              ) : (
                <p className="px-1 text-sm text-gray-700 sm:text-right">
                  Sample history for Jordan Hale. Import and backfill are not available.
                </p>
              )}
            </div>

            <TabsContent value="leaderboard" className="mt-6">
              {rows.length === 0 ? (
                <p className={`px-5 py-10 text-sm text-gray-700 ${panel}`}>
                  No sample results for this year.
                </p>
              ) : (
                <LeaderboardTable rows={rows} />
              )}
            </TabsContent>

            <TabsContent value="mine" className="mt-6">
              <SeasonalTimesTable
                attempts={DEMO_MY_TIMES}
                emptyLabel="No sample times in this demo."
              />
            </TabsContent>
          </Tabs>

          <div className={`mt-8 px-5 py-5 sm:px-6 ${panel}`}>
            <p className="text-sm leading-relaxed text-gray-800">
              Same-activity rule: your overall time, 2 climbs, and 3 descents must all come from the same ride.
            </p>
            <div className="mt-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-600">Segments</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SEGMENTS.map((segment) => (
                  <li key={segment.id}>
                    <a
                      className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-900 no-underline shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/25"
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
