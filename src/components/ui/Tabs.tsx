"use client";
import * as React from "react";

type Tab = { id: string; label: string };

export default function Tabs({
  tabs,
  value,
  onChange,
  className = "",
}: {
  tabs: Tab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 border-b border-line ${className}`}>
      {tabs.map(t => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            className={`px-4 py-2 text-sm rounded-t-xl border-x border-t border-line -mb-[1px]
              ${active ? "bg-white" : "bg-[hsl(var(--pb-paper))] hover:bg-white/70"}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
