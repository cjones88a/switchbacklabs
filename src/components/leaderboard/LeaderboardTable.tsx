'use client';

import * as React from 'react';
import { TableWrap, T, TH, TD } from '@/components/ui/table';
import { cn } from '@/lib/cn';

export type LeaderboardRow = {
  rider: { firstname: string; lastname: string; profile?: string | null };
  fall_ms: number | null;
  winter_ms: number | null;
  spring_ms: number | null;
  summer_ms: number | null;
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
        const an = `${a.rider?.lastname ?? ''} ${a.rider?.firstname ?? ''}`.trim().toLowerCase();
        const bn = `${b.rider?.lastname ?? ''} ${b.rider?.firstname ?? ''}`.trim().toLowerCase();
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
      <TH>
        <button
          className={cn(
            'inline-flex items-center gap-1 text-left',
            active && 'text-black',
            className
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
      {/* a little wider for all columns on mobile */}
      <div className="min-w-[780px]">
        <T>
          <thead>
            <tr>
              <TH>Rider</TH>
              <Header k="fall_ms">Fall</Header>
              <Header k="winter_ms">Winter</Header>
              <Header k="spring_ms">Spring</Header>
              <Header k="summer_ms">Summer</Header>
              <Header k="total_ms">Total</Header>
              <Header k="climb_sum_ms">Climb Sum</Header>
              <Header k="desc_sum_ms">Descent Sum</Header>
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
                const name = `${r.rider?.firstname ?? ''} ${r.rider?.lastname ?? ''}`.trim();
                return (
                  <tr key={`${name}-${i}`} className="hover:bg-neutral-50">
                    <TD>
                      <div className="flex items-center gap-3">
                        {r.rider?.profile ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.rider.profile}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-neutral-200 ring-1 ring-black/10" />
                        )}
                        <span className="font-medium text-neutral-900">{name || '—'}</span>
                      </div>
                    </TD>
                    <TD mono>{fmt(r.fall_ms)}</TD>
                    <TD mono>{fmt(r.winter_ms)}</TD>
                    <TD mono>{fmt(r.spring_ms)}</TD>
                    <TD mono>{fmt(r.summer_ms)}</TD>
                    <TD mono>{fmt(r.total_ms)}</TD>
                    <TD mono>{fmt(r.climb_sum_ms)}</TD>
                    <TD mono>{fmt(r.desc_sum_ms)}</TD>
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
