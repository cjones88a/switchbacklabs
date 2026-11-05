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

const TimeStack = ({ attempt }: { attempt?: Attempt }) => {
  if (!attempt) {
    return <div className="text-center text-sm text-gray-400">—</div>
  }

  return (
    <div className="text-center">
      <div className="font-mono text-sm font-medium tabular-nums text-gray-900">
        {formatTime(attempt.main_ms)}
      </div>
      <div className="mt-1 font-mono text-xs tabular-nums text-gray-600">
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
      <div className="mt-1 font-mono text-xs tabular-nums text-gray-600">
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
      <div className="rounded-2xl border border-gray-200 bg-white/95 px-5 py-10 text-center text-sm text-gray-700 shadow-[0_10px_30px_-16px_rgba(17,24,39,0.28)] backdrop-blur-sm">
        {emptyLabel}
      </div>
    )
  }

  const headers = ['Fall', 'Winter', 'Spring', 'Summer']

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-[0_10px_30px_-16px_rgba(17,24,39,0.28)] backdrop-blur-sm">
      <p className="border-b border-gray-200 px-4 py-3 text-sm text-gray-700 sm:px-5">
        Each season is the ride time, then climb · descent. Overall adds the seasons on record for that year.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 border-r border-gray-200 bg-gray-100 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 sm:px-5"
              >
                Year
              </th>
              {headers.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="bg-gray-100 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  {label}
                </th>
              ))}
              <th
                scope="col"
                className="bg-amber-50 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-900"
              >
                Overall
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedYears.map((year, i) => {
              const yearData = seasonalData[year]
              const allAttempts = Object.values(yearData).filter(Boolean) as Attempt[]
              const surface = i % 2 === 1 ? 'bg-gray-50 group-hover:bg-gray-100' : 'bg-white group-hover:bg-gray-50'
              
              return (
                <tr key={year} className="group">
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 whitespace-nowrap border-r border-t border-gray-200 px-4 py-4 text-left font-medium text-gray-900 sm:px-5 ${surface}`}
                  >
                    {year}
                  </th>
                  <td className={`border-t border-gray-200 px-3 py-4 ${surface}`}>
                    <TimeStack attempt={yearData.fall} />
                  </td>
                  <td className={`border-t border-gray-200 px-3 py-4 ${surface}`}>
                    <TimeStack attempt={yearData.winter} />
                  </td>
                  <td className={`border-t border-gray-200 px-3 py-4 ${surface}`}>
                    <TimeStack attempt={yearData.spring} />
                  </td>
                  <td className={`border-t border-gray-200 px-3 py-4 ${surface}`}>
                    <TimeStack attempt={yearData.summer} />
                  </td>
                  <td className={`border-t border-gray-200 bg-amber-50 px-3 py-4 group-hover:bg-amber-100`}>
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
