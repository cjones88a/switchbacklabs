'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export type LeaderboardRow = {
  rider: { name: string; avatar?: string | null };
  fall_ms: number | null;
  winter_ms: number | null;
  spring_ms: number | null;
  summer_ms: number | null;
  fall_climb_ms: number | null;
  winter_climb_ms: number | null;
  spring_climb_ms: number | null;
  summer_climb_ms: number | null;
  fall_desc_ms: number | null;
  winter_desc_ms: number | null;
  spring_desc_ms: number | null;
  summer_desc_ms: number | null;
  total_ms: number | null;
  climb_sum_ms: number | null;
  desc_sum_ms: number | null;
};

function fmt(ms?: number | null) {
  if (!ms) return '—';
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return (h ? `${h}:` : '') + `${m}`.padStart(2, '0') + ':' + `${s}`.padStart(2, '0');
}

type SortKey =
  | 'name'
  | 'fall_ms'
  | 'winter_ms'
  | 'spring_ms'
  | 'summer_ms'
  | 'total_ms'
  | 'climb_sum_ms'
  | 'desc_sum_ms';

const SEASONS: { key: 'fall_ms' | 'winter_ms' | 'spring_ms' | 'summer_ms'; climb: keyof LeaderboardRow; desc: keyof LeaderboardRow; label: string }[] = [
  { key: 'fall_ms', climb: 'fall_climb_ms', desc: 'fall_desc_ms', label: 'Fall' },
  { key: 'winter_ms', climb: 'winter_climb_ms', desc: 'winter_desc_ms', label: 'Winter' },
  { key: 'spring_ms', climb: 'spring_climb_ms', desc: 'spring_desc_ms', label: 'Spring' },
  { key: 'summer_ms', climb: 'summer_climb_ms', desc: 'summer_desc_ms', label: 'Summer' },
];

function SeasonTime({
  main,
  climb,
  desc,
}: {
  main: number | null;
  climb: number | null;
  desc: number | null;
}) {
  if (main == null) {
    return <div className="text-center text-sm text-gray-400">—</div>;
  }

  return (
    <div className="text-center">
      <div className="font-mono text-sm font-medium tabular-nums text-gray-900">{fmt(main)}</div>
      <div className="mt-1 font-mono text-xs tabular-nums text-gray-600">
        <span className="sr-only">climb </span>
        {fmt(climb)}
        <span aria-hidden> · </span>
        <span className="sr-only">descent </span>
        {fmt(desc)}
      </div>
    </div>
  );
}

export function LeaderboardTable({
  rows,
  defaultSort = 'total_ms',
}: {
  rows: LeaderboardRow[];
  defaultSort?: SortKey;
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>(defaultSort);
  const [asc, setAsc] = React.useState(true);

  const sorted = React.useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      if (sortKey === 'name') {
        const an = (a.rider?.name ?? '').toLowerCase();
        const bn = (b.rider?.name ?? '').toLowerCase();
        return an.localeCompare(bn);
      }
      const av = (a as Record<string, unknown>)[sortKey] as number ?? Infinity;
      const bv = (b as Record<string, unknown>)[sortKey] as number ?? Infinity;
      return av - bv;
    });
    if (!asc) list.reverse();
    return list;
  }, [rows, sortKey, asc]);

  function Header({
    k,
    children,
    emphasize,
  }: {
    k: SortKey;
    children: React.ReactNode;
    emphasize?: boolean;
  }) {
    const active = sortKey === k;
    return (
      <th
        scope="col"
        aria-sort={active ? (asc ? 'ascending' : 'descending') : 'none'}
        className={cn(
          'bg-gray-100 px-3 py-3.5 text-center align-bottom',
          emphasize && 'bg-amber-50'
        )}
      >
        <button
          type="button"
          className={cn(
            'inline-flex w-full items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 rounded',
            active ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'
          )}
          onClick={() => {
            if (sortKey === k) setAsc((s) => !s);
            else {
              setSortKey(k);
              setAsc(true);
            }
          }}
          aria-label={`Sort by ${typeof children === 'string' ? children : 'column'}`}
        >
          {children}
          <span aria-hidden className={cn('text-xs', active ? 'text-gray-900' : 'text-gray-400')}>
            {active ? (asc ? '↑' : '↓') : '↕'}
          </span>
        </button>
      </th>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-[0_10px_30px_-16px_rgba(17,24,39,0.28)] backdrop-blur-sm">
      <p className="border-b border-gray-200 px-4 py-3 text-sm text-gray-700 sm:px-5">
        Each season is the ride time, then climb · descent.
        <span className="sm:hidden"> Scroll sideways for the other seasons.</span>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] table-fixed border-separate border-spacing-0 text-sm">
          <colgroup>
            <col className="w-[24%]" />
            <col span={4} />
            <col className="w-[12%]" />
            <col span={2} />
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 border-r border-gray-200 bg-gray-100 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 sm:px-5"
              >
                Rider
              </th>
              {SEASONS.map((season) => (
                <Header key={season.key} k={season.key}>
                  {season.label}
                </Header>
              ))}
              <Header k="total_ms" emphasize>
                Total
              </Header>
              <Header k="climb_sum_ms">Climb</Header>
              <Header k="desc_sum_ms">Descent</Header>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-sm text-gray-500">
                  No entries yet for this season.
                </td>
              </tr>
            ) : (
              sorted.map((r, i) => {
                const name = r.rider?.name ?? '—';
                const seasonsRidden = [r.fall_ms, r.winter_ms, r.spring_ms, r.summer_ms].filter((ms) => ms != null).length;
                const leader = i === 0 && sortKey === 'total_ms' && asc && seasonsRidden === 4;
                const surface = leader ? 'bg-amber-50 group-hover:bg-amber-100' : i % 2 === 1 ? 'bg-gray-50 group-hover:bg-gray-100' : 'bg-white group-hover:bg-gray-50';
                return (
                  <tr key={`${name}-${i}`} className="group">
                    <td className={cn('sticky left-0 z-10 border-r border-t border-gray-200 px-4 py-4 sm:px-5', surface)}>
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        {r.rider?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.rider.avatar}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                              leader ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'
                            )}
                            aria-hidden
                          >
                            {i + 1}
                          </span>
                        )}
                        <span className="font-medium text-gray-900">{name}</span>
                      </div>
                    </td>
                    {SEASONS.map((season) => (
                      <td key={season.key} className={cn('border-t border-gray-200 px-3 py-4', surface)}>
                        <SeasonTime
                          main={r[season.key] as number | null}
                          climb={r[season.climb] as number | null}
                          desc={r[season.desc] as number | null}
                        />
                      </td>
                    ))}
                    <td className={cn('border-t border-gray-200 px-3 py-4 text-center font-mono text-sm font-semibold tabular-nums text-gray-900', leader ? 'bg-amber-100 group-hover:bg-amber-100' : surface)}>
                      {fmt(r.total_ms)}
                    </td>
                    <td className={cn('border-t border-gray-200 px-3 py-4 text-center font-mono text-sm tabular-nums text-gray-700', surface)}>
                      {fmt(r.climb_sum_ms)}
                    </td>
                    <td className={cn('border-t border-gray-200 px-3 py-4 text-center font-mono text-sm tabular-nums text-gray-700', surface)}>
                      {fmt(r.desc_sum_ms)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
