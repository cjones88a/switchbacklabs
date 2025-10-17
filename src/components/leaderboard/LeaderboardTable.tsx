'use client';

import * as React from 'react';
import { TableWrap, T, TH, TD } from '@/components/ui/table';
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

export function LeaderboardTable({
  rows,
  defaultSort = 'total_ms',
}: {
  rows: LeaderboardRow[];
  defaultSort?: SortKey;
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>(defaultSort);
  const [asc, setAsc] = React.useState(false);

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
    className,
  }: {
    k: SortKey;
    children: React.ReactNode;
    className?: string;
  }) {
    const active = sortKey === k;
    return (
      <TH className={className}>
        <button
          className={cn(
            'inline-flex items-center gap-1 text-left w-full',
            active && 'text-black'
          )}
          onClick={() => {
            if (sortKey === k) setAsc((s) => !s);
            else {
              setSortKey(k);
              setAsc(k === 'name'); // names ascend by default
            }
          }}
          title="Sort"
        >
          {children}
          <span
            aria-hidden
            className={cn(
              'text-[11px] opacity-50',
              active ? 'opacity-80' : 'opacity-30'
            )}
          >
            {active ? (asc ? '▲' : '▼') : '↕'}
          </span>
        </button>
      </TH>
    );
  }

  return (
    <TableWrap>
      {/* standardized column widths to accommodate climb/descent times */}
      <div className="min-w-[900px]">
        <T>
          <thead>
            <tr>
              <TH className="w-32">Rider</TH>
              <Header k="fall_ms" className="w-24">Fall</Header>
              <Header k="winter_ms" className="w-24">Winter</Header>
              <Header k="spring_ms" className="w-24">Spring</Header>
              <Header k="summer_ms" className="w-24">Summer</Header>
              <Header k="total_ms" className="w-20">Total</Header>
              <Header k="climb_sum_ms" className="w-20">Climb Sum</Header>
              <Header k="desc_sum_ms" className="w-20">Descent Sum</Header>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-sm text-neutral-500">
                  No entries yet for this season.
                </td>
              </tr>
            ) : (
              sorted.map((r, i) => {
                const name = r.rider?.name ?? '—';
                return (
                  <tr key={`${name}-${i}`} className="hover:bg-neutral-50">
                    <TD>
                      <div className="flex items-center gap-3">
                        {r.rider?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.rider.avatar}
                            alt=""
                            className="h-1 w-1 rounded-full object-cover ring-1 ring-black/10"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-1 w-1 rounded-full bg-neutral-200 ring-1 ring-black/10" />
                        )}
                        <span className="font-bold text-neutral-900 ml-6">{name}</span>
                      </div>
                    </TD>
                    <TD>
                      <div className="text-center">
                        <div className="font-mono font-bold text-base mb-1">
                          {fmt(r.fall_ms)}
                        </div>
                        <div className="flex justify-center gap-1 text-[10px]">
                          <span className="font-mono font-semibold text-neutral-600">
                            {fmt(r.fall_climb_ms)}
                          </span>
                          <span className="text-neutral-400">|</span>
                          <span className="font-mono font-semibold text-neutral-500">
                            {fmt(r.fall_desc_ms)}
                          </span>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <div className="text-center">
                        <div className="font-mono font-bold text-base mb-1">
                          {fmt(r.winter_ms)}
                        </div>
                        <div className="flex justify-center gap-1 text-[10px]">
                          <span className="font-mono font-semibold text-neutral-600">
                            {fmt(r.winter_climb_ms)}
                          </span>
                          <span className="text-neutral-400">|</span>
                          <span className="font-mono font-semibold text-neutral-500">
                            {fmt(r.winter_desc_ms)}
                          </span>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <div className="text-center">
                        <div className="font-mono font-bold text-base mb-1">
                          {fmt(r.spring_ms)}
                        </div>
                        <div className="flex justify-center gap-1 text-[10px]">
                          <span className="font-mono font-semibold text-neutral-600">
                            {fmt(r.spring_climb_ms)}
                          </span>
                          <span className="text-neutral-400">|</span>
                          <span className="font-mono font-semibold text-neutral-500">
                            {fmt(r.spring_desc_ms)}
                          </span>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <div className="text-center">
                        <div className="font-mono font-bold text-base mb-1">
                          {fmt(r.summer_ms)}
                        </div>
                        <div className="flex justify-center gap-1 text-[10px]">
                          <span className="font-mono font-semibold text-neutral-600">
                            {fmt(r.summer_climb_ms)}
                          </span>
                          <span className="text-neutral-400">|</span>
                          <span className="font-mono font-semibold text-neutral-500">
                            {fmt(r.summer_desc_ms)}
                          </span>
                        </div>
                      </div>
                    </TD>
                    <TD mono className="font-bold text-base">{fmt(r.total_ms)}</TD>
                    <TD mono className="font-semibold text-sm">{fmt(r.climb_sum_ms)}</TD>
                    <TD mono className="font-semibold text-sm">{fmt(r.desc_sum_ms)}</TD>
                  </tr>
                );
              })
            )}
          </tbody>
        </T>
      </div>
    </TableWrap>
  );
}
