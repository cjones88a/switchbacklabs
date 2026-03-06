"use client";

import type { Discipline, Ride } from "../data/constants";
import { DISCIPLINES } from "../data/constants";

type Props = {
  discipline: Discipline;
  rides: Ride[];
};

function StatCard({
  label,
  value,
  unit,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-sm text-center min-w-[100px] flex-1"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value}
        {unit && <span className="text-sm font-semibold ml-0.5">{unit}</span>}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function DashboardTab({ discipline, rides }: Props) {
  const d = DISCIPLINES[discipline];
  const filtered = rides.filter((r) => r.discipline === discipline);
  const totalMiles = filtered.reduce((s, r) => s + r.distance, 0);
  const totalElev = filtered.reduce((s, r) => s + r.elevation, 0);
  const totalCal = filtered.reduce((s, r) => s + r.calories, 0);
  const avgSpeed =
    filtered.length > 0
      ? (filtered.reduce((s, r) => s + r.avgSpeed, 0) / filtered.length).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: d.color }}>
        {d.icon} {d.label} Dashboard
      </h2>
      <div className="grid grid-cols-2 sm:flex flex-wrap gap-3">
        <StatCard label="Miles" value={totalMiles.toFixed(1)} icon="📏" color={d.color} />
        <StatCard label="Elevation" value={totalElev.toLocaleString()} unit="ft" icon="⬆️" color={d.color} />
        <StatCard label="Avg Speed" value={avgSpeed} unit="mph" icon="⚡" color={d.color} />
        <StatCard label="Calories" value={totalCal.toLocaleString()} icon="🔥" color={d.color} />
        <StatCard label="Rides" value={filtered.length} icon="🚴" color={d.color} />
      </div>
      <div className="rounded-2xl p-5 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="font-semibold mb-3">Recent Rides</h3>
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No rides yet. Log one or import a GPX.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: d.color }}>
                    {r.distance} mi
                  </div>
                  <div className="text-xs text-gray-500">{r.elevation} ft</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
