"use client";

import { useState } from "react";
import type { Discipline } from "../data/constants";
import { DISCIPLINES } from "../data/constants";

type Props = { discipline: Discipline };

export function ToolkitTab({ discipline }: Props) {
  const d = DISCIPLINES[discipline];
  const [weight, setWeight] = useState(175);
  const [width, setWidth] = useState(discipline === "mountain" ? 2.4 : discipline === "road" ? 28 : 40);
  const [tubeless, setTubeless] = useState(discipline !== "road");

  let front = 0;
  let rear = 0;
  let note = "";
  if (discipline === "mountain") {
    const base = weight * 0.14 + 10;
    front = Math.max(Math.round(base - 3), 18);
    rear = Math.min(Math.round(base), 35);
    note = tubeless ? "Tubeless. +5–8 PSI if running tubes." : "Tubeless recommended.";
  } else if (discipline === "road") {
    const base = weight * 0.28 + 30 - (width > 28 ? 5 : 0);
    front = Math.round(base - 5);
    rear = Math.round(base);
    note = `Wider tires (${width}mm) = lower pressure, more comfort.`;
  } else {
    const base = weight * 0.18 + 15;
    front = Math.round(base - 3);
    rear = Math.round(base);
    note = tubeless ? "Tubeless. ±3 PSI for conditions." : "Tubeless recommended for gravel.";
  }

  const widthLabel = discipline === "mountain" ? "Tire width (in)" : "Tire width (mm)";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: d.color }}>
        Toolkit — Tire Pressure
      </h2>
      <div className="rounded-2xl p-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderColor: `${d.color}40` }}>
        <h3 className="font-semibold mb-4">Calculator</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Rider weight (lbs)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value) || 0)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {widthLabel}
            </label>
            <input
              type="number"
              step={discipline === "mountain" ? 0.1 : 1}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value) || 0)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tubeless"
              checked={tubeless}
              onChange={(e) => setTubeless(e.target.checked)}
              className="rounded"
              style={{ accentColor: d.color }}
            />
            <label htmlFor="tubeless" className="text-sm">
              Tubeless
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: d.bg }}>
            <div className="text-xs font-semibold text-gray-500 uppercase">Front</div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: d.color }}>
              {front}
            </div>
            <div className="text-sm text-gray-500">PSI</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: d.bg }}>
            <div className="text-xs font-semibold text-gray-500 uppercase">Rear</div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: d.color }}>
              {rear}
            </div>
            <div className="text-sm text-gray-500">PSI</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 italic">💡 {note}</p>
      </div>
      <div className="rounded-2xl p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-2">Quick reference</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>Stem bolts: 5–6 Nm</li>
          <li>Seatpost: 5–7 Nm</li>
          <li>Thru-axle: 12–15 Nm</li>
          <li>Chain stretch limit: 0.5%</li>
        </ul>
      </div>
    </div>
  );
}
