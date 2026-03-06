"use client";

import type { Discipline, RouteInfo } from "../data/constants";
import { DISCIPLINES, ROUTES } from "../data/constants";

type Props = {
  discipline: Discipline;
  onSelectRoute: (route: RouteInfo) => void;
};

const difficultyColor: Record<string, string> = {
  Beginner: "#22c55e",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

export function RoutesTab({ discipline, onSelectRoute }: Props) {
  const d = DISCIPLINES[discipline];
  const list = ROUTES.filter((r) => r.discipline === discipline);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: d.color }}>
        {d.icon} {d.label} Routes — Fort Collins
      </h2>
      <div className="space-y-3">
        {list.map((r) => {
          const dc = difficultyColor[r.difficulty] ?? "#6b7280";
          return (
            <div
              key={r.id}
              className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{r.name}</h3>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded"
                  style={{ backgroundColor: `${dc}20`, color: dc }}
                >
                  {r.difficulty}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>📏 {r.distance} mi</span>
                <span>⬆️ {r.elevation.toLocaleString()} ft</span>
                <span>⏱️ ~{r.estimatedMinutes} min</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {r.features.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: d.bg, color: d.color }}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onSelectRoute(r)}
                className="w-full py-2 rounded-xl font-semibold text-white"
                style={{ backgroundColor: d.color }}
              >
                Navigate
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
