"use client";

import type { Discipline } from "../data/constants";
import { DISCIPLINES } from "../data/constants";

type Props = { discipline: Discipline };

// Placeholder data — Phase 2 can use a weather API
const MOCK_FORECAST = [
  { day: "Today", high: 58, low: 32, precip: 0, rideScore: 85, label: "Great" },
  { day: "Sat", high: 52, low: 28, precip: 20, rideScore: 70, label: "Good" },
  { day: "Sun", high: 55, low: 30, precip: 0, rideScore: 90, label: "Great" },
  { day: "Mon", high: 60, low: 35, precip: 0, rideScore: 95, label: "Ideal" },
];

export function WeatherTab({ discipline }: Props) {
  const d = DISCIPLINES[discipline];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: d.color }}>
        Weather — Fort Collins
      </h2>
      <div className="rounded-2xl p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-1">Current</h3>
        <p className="text-3xl font-bold tabular-nums" style={{ color: d.color }}>
          54°F
        </p>
        <p className="text-sm text-gray-500">Partly cloudy · Wind NW 8 mph</p>
        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
          Ride-ability: <strong className="text-green-600">Good</strong> — dress in layers.
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-3">7-day ride score</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOCK_FORECAST.map((f) => (
            <div
              key={f.day}
              className="rounded-xl p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <div className="text-sm font-medium">{f.day}</div>
              <div className="text-2xl font-bold tabular-nums" style={{ color: d.color }}>
                {f.rideScore}
              </div>
              <div className="text-xs text-gray-500">{f.label}</div>
              <div className="text-xs text-gray-500 mt-1">
                {f.high}° / {f.low}° · {f.precip}% precip
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Phase 2: connect a weather API for live conditions and alerts.
      </p>
    </div>
  );
}
