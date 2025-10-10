"use client"
import * as React from 'react'
import { TableWrap, T, TH } from '@/components/ui/table'

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

const SeasonCell = ({ attempt }: { attempt?: Attempt }) => {
  if (!attempt) {
    return (
      <td className="text-center py-2">
        <div className="text-neutral-400">—</div>
      </td>
    )
  }

  return (
    <td className="text-center py-2">
      <div className="space-y-1">
        <div className="font-mono font-medium text-sm">
          {formatTime(attempt.main_ms)}
        </div>
        <div className="font-mono text-xs text-neutral-600">
          {formatTime(attempt.climb_sum_ms)}
        </div>
        <div className="font-mono text-xs text-neutral-500">
          {formatTime(attempt.desc_sum_ms)}
        </div>
      </div>
    </td>
  )
}

const OverallCell = ({ attempts }: { attempts: Attempt[] }) => {
  if (attempts.length === 0) {
    return (
      <td className="text-center py-2">
        <div className="text-neutral-400">—</div>
      </td>
    )
  }

  const totalMain = attempts.reduce((sum, a) => sum + a.main_ms, 0)
  const totalClimb = attempts.reduce((sum, a) => sum + (a.climb_sum_ms || 0), 0)
  const totalDesc = attempts.reduce((sum, a) => sum + (a.desc_sum_ms || 0), 0)

  return (
    <td className="text-center py-2">
      <div className="space-y-1">
        <div className="font-mono font-medium text-sm">
          {formatTime(totalMain)}
        </div>
        <div className="font-mono text-xs text-neutral-600">
          {formatTime(totalClimb)}
        </div>
        <div className="font-mono text-xs text-neutral-500">
          {formatTime(totalDesc)}
        </div>
      </div>
    </td>
  )
}

export default function SeasonalTimesTable({ attempts }: { attempts: Attempt[] }) {
  const seasonalData = React.useMemo(() => {
    const data: SeasonalData = {}
    
    attempts.forEach(attempt => {
      // Use race_year which should already be calculated correctly
      // (Fall stays same year, Winter/Spring/Summer roll back to prior Fall year)
      const raceYear = attempt.race_year
      if (!data[raceYear]) {
        data[raceYear] = {}
      }
      
      // Get the best attempt for this season (lowest main_ms)
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
      <div className="text-center py-8 text-neutral-500">
        No attempts found. Click &quot;Backfill my history&quot; to import your data.
      </div>
    )
  }

  return (
    <TableWrap>
      <div className="min-w-[1000px]">
        <T>
          <thead>
            <tr>
              <TH>Race Year</TH>
              <TH>Fall</TH>
              <TH>Winter</TH>
              <TH>Spring</TH>
              <TH>Summer</TH>
              <TH>Overall</TH>
            </tr>
            <tr className="text-xs text-neutral-500">
              <th></th>
              <th className="text-center">Overall / Climb / Descent</th>
              <th className="text-center">Overall / Climb / Descent</th>
              <th className="text-center">Overall / Climb / Descent</th>
              <th className="text-center">Overall / Climb / Descent</th>
              <th className="text-center">Total / Climb / Descent</th>
            </tr>
          </thead>
          <tbody>
            {sortedYears.map(year => {
              const yearData = seasonalData[year]
              const allAttempts = Object.values(yearData).filter(Boolean) as Attempt[]
              
              return (
                <tr key={year} className="hover:bg-neutral-50">
                  <td className="font-medium text-center">
                    {year}
                  </td>
                  <SeasonCell attempt={yearData.fall} />
                  <SeasonCell attempt={yearData.winter} />
                  <SeasonCell attempt={yearData.spring} />
                  <SeasonCell attempt={yearData.summer} />
                  <OverallCell attempts={allAttempts} />
                </tr>
              )
            })}
          </tbody>
        </T>
      </div>
    </TableWrap>
  )
}
