'use client'

import { useState } from 'react'
import { TableWrap, T, TH, TD } from '@/components/ui/table'

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

type AttemptsByYear = {
  [raceYear: number]: Attempt[]
}

function formatTime(ms: number | null): string {
  if (!ms) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function IndividualAttemptsTable({ attempts }: { attempts: Attempt[] }) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())

  // Group attempts by race year
  const attemptsByYear: AttemptsByYear = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.race_year]) {
      acc[attempt.race_year] = []
    }
    acc[attempt.race_year].push(attempt)
    return acc
  }, {} as AttemptsByYear)

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(year)) {
      newExpanded.delete(year)
    } else {
      newExpanded.add(year)
    }
    setExpandedYears(newExpanded)
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No attempts found. Click &quot;Backfill my history&quot; to import your data.
      </div>
    )
  }

  return (
    <TableWrap>
      <div className="min-w-[800px]">
        <T>
          <thead>
            <tr>
              <TH>Race Year</TH>
              <TH>Season</TH>
              <TH>Overall Time</TH>
              <TH>Climb Sum</TH>
              <TH>Descent Sum</TH>
              <TH>Date</TH>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {Object.entries(attemptsByYear)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([raceYear, yearAttempts]) => {
                const year = parseInt(raceYear)
                const isExpanded = expandedYears.has(year)
                const bestAttempt = yearAttempts[0] // Already sorted by main_ms asc
                
                return (
                  <>
                    {/* Main row for each race year */}
                    <tr 
                      key={year}
                      className="hover:bg-neutral-50 cursor-pointer"
                      onClick={() => toggleYear(year)}
                    >
                      <td className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className={isExpanded ? 'rotate-90' : ''}>▶</span>
                          {year}
                        </div>
                      </td>
                      <td>Best Overall</td>
                      <td className="font-mono font-medium">
                        {formatTime(bestAttempt.main_ms)}
                      </td>
                      <td className="font-mono">{formatTime(bestAttempt.climb_sum_ms)}</td>
                      <td className="font-mono">{formatTime(bestAttempt.desc_sum_ms)}</td>
                      <td className="text-sm text-neutral-500">
                        {formatDate(bestAttempt.created_at)}
                      </td>
                    </tr>
                    
                    {/* Expanded sub-rows for all attempts in this year */}
                    {isExpanded && yearAttempts.map((attempt) => (
                      <tr key={`${year}-${attempt.activity_id}`} className="bg-neutral-25">
                        <td></td>
                        <td className="text-sm text-neutral-600">
                          {attempt.season_name} {attempt.season_year}
                        </td>
                        <td className="font-mono text-sm">
                          {formatTime(attempt.main_ms)}
                        </td>
                        <td className="font-mono text-sm">
                          {formatTime(attempt.climb_sum_ms)}
                        </td>
                        <td className="font-mono text-sm">
                          {formatTime(attempt.desc_sum_ms)}
                        </td>
                        <td className="text-xs text-neutral-400">
                          {formatDate(attempt.created_at)}
                        </td>
                      </tr>
                    ))}
                  </>
                )
              })}
          </tbody>
        </T>
      </div>
    </TableWrap>
  )
}
