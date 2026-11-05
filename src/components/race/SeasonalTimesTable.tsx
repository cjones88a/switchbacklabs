"use client"
import * as React from 'react'

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

type SeasonalData = {
  [raceYear: number]: {
    fall?: Attempt
    winter?: Attempt
    spring?: Attempt
    summer?: Attempt
  }
}

const formatTime = (ms: number | null | undefined) => {
  if (ms == null) return '—'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return (h ? `${h}:` : '') + `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

const TimeStack = ({ attempt, emphasize }: { attempt?: Attempt; emphasize?: boolean }) => {
  if (!attempt) {
    return <div className="text-center font-mono text-sm text-gray-400">—</div>
  }

  return (
    <div className="text-center">
      <div className={`font-mono text-sm tabular-nums text-gray-900 ${emphasize ? 'font-semibold' : 'font-medium'}`}>
        {formatTime(attempt.main_ms)}
      </div>
      <div className="mt-0.5 font-mono text-[10px] tabular-nums text-gray-500">
        <span className="sr-only">climb </span>
        {formatTime(attempt.climb_sum_ms)}
        <span aria-hidden> · </span>
        <span className="sr-only">descent </span>
        {formatTime(attempt.desc_sum_ms)}
      </div>
    </div>
  )
}

const OverallCell = ({ attempts }: { attempts: Attempt[] }) => {
  if (attempts.length === 0) {
    return <div className="text-center font-mono text-sm text-gray-400">—</div>
  }

  const totalMain = attempts.reduce((sum, a) => sum + a.main_ms, 0)
  const totalClimb = attempts.reduce((sum, a) => sum + (a.climb_sum_ms || 0), 0)
  const totalDesc = attempts.reduce((sum, a) => sum + (a.desc_sum_ms || 0), 0)

  return (
    <div className="text-center">
      <div className="font-mono text-sm font-semibold tabular-nums text-gray-900">
        {formatTime(totalMain)}
      </div>
      <div className="mt-0.5 font-mono text-[10px] tabular-nums text-gray-500">
        <span className="sr-only">climb </span>
        {formatTime(totalClimb)}
        <span aria-hidden> · </span>
        <span className="sr-only">descent </span>
        {formatTime(totalDesc)}
      </div>
    </div>
  )
}

export default function SeasonalTimesTable({
  attempts,
  emptyLabel = 'No attempts found. Click "Backfill my history" to import your data.',
}: {
  attempts: Attempt[]
  emptyLabel?: string
}) {
  const seasonalData = React.useMemo(() => {
    const data: SeasonalData = {}
    
    attempts.forEach(attempt => {
      const raceYear = attempt.race_year
      if (!data[raceYear]) {
        data[raceYear] = {}
      }
      
      const current = data[raceYear][attempt.season_name.toLowerCase() as keyof typeof data[number]]
      if (!current || attempt.main_ms < current.main_ms) {
        data[raceYear][attempt.season_name.toLowerCase() as keyof typeof data[number]] = attempt
      }
    })
    
    return data
  }, [attempts])

  const sortedYears = Object.keys(seasonalData).map(Number).sort((a, b) => b - a)

  if (attempts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-10 text-center text-sm text-gray-500 shadow-[0_12px_40px_-24px_rgba(17,24,39,0.45)] backdrop-blur-md">
        {emptyLabel}
      </div>
    )
  }

  const headers = ['Fall', 'Winter', 'Spring', 'Summer']

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-[0_12px_40px_-24px_rgba(17,24,39,0.45)] backdrop-blur-md">
      <p className="border-b border-gray-200/70 px-4 py-3 text-xs text-gray-500 sm:px-5">
        Each season is the ride time, then climb · descent. Overall adds the seasons on record for that year.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 bg-white/95 px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500 shadow-[4px_0_8px_-6px_rgba(17,24,39,0.45)] backdrop-blur-md sm:px-5"
              >
                Year
              </th>
              {headers.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-gray-500"
                >
                  {label}
                </th>
              ))}
              <th
                scope="col"
                className="bg-gray-900/[0.04] px-3 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-gray-900"
              >
                Overall
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedYears.map(year => {
              const yearData = seasonalData[year]
              const allAttempts = Object.values(yearData).filter(Boolean) as Attempt[]
              
              return (
                <tr key={year} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 whitespace-nowrap border-t border-gray-200/70 bg-white/95 px-4 py-3 text-left font-medium text-gray-900 shadow-[4px_0_8px_-6px_rgba(17,24,39,0.45)] backdrop-blur-md group-hover:bg-white sm:px-5"
                  >
                    {year}
                  </th>
                  <td className="border-t border-gray-200/70 px-3 py-3">
                    <TimeStack attempt={yearData.fall} />
                  </td>
                  <td className="border-t border-gray-200/70 px-3 py-3">
                    <TimeStack attempt={yearData.winter} />
                  </td>
                  <td className="border-t border-gray-200/70 px-3 py-3">
                    <TimeStack attempt={yearData.spring} />
                  </td>
                  <td className="border-t border-gray-200/70 px-3 py-3">
                    <TimeStack attempt={yearData.summer} />
                  </td>
                  <td className="border-t border-gray-200/70 bg-gray-900/[0.04] px-3 py-3">
                    <OverallCell attempts={allAttempts} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
