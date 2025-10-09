'use client'
import * as React from 'react'
import { cn } from '@/lib/cn'

type Tab = { id: string; label: string }
export function Tabs({ tabs, value, onChange }: { tabs: Tab[]; value: string; onChange: (id: string)=>void }) {
  return (
    <div role="tablist" aria-label="Sections" className="flex gap-2 mt-6">
      {tabs.map(t => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            className={cn(
              'rounded-full h-9 px-4 text-sm',
              active ? 'bg-black text-white' : 'bg-white ring-1 ring-[var(--ring)] hover:bg-neutral-50'
            )}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}