"use client";

import { useState, useRef, useCallback } from "react";
import type { Discipline, Ride } from "../data/constants";
import { DISCIPLINES } from "../data/constants";

type Props = {
  discipline: Discipline;
  rides: Ride[];
  onRidesChange: (rides: Ride[]) => void;
};

function parseGPX(xmlString: string): Partial<Ride> | { error: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    if (doc.querySelector("parsererror")) return { error: "Invalid GPX" };
    const trkpts = doc.querySelectorAll("trkpt");
    if (trkpts.length === 0) return { error: "No track points" };

    const name =
      doc.querySelector("trk > name")?.textContent ||
      doc.querySelector("metadata > name")?.textContent ||
      "Imported Ride";
    let totalDist = 0;
    let totalGain = 0;
    let prevLat: number | null = null;
    let prevLon: number | null = null;
    let prevEle: number | null = null;
    let startTime: Date | null = null;
    let endTime: Date | null = null;

    for (let i = 0; i < trkpts.length; i++) {
      const pt = trkpts[i]!;
      const lat = parseFloat(pt.getAttribute("lat") ?? "0");
      const lon = parseFloat(pt.getAttribute("lon") ?? "0");
      const eleNode = pt.querySelector("ele");
      const timeNode = pt.querySelector("time");
      const ele = eleNode ? parseFloat(eleNode.textContent ?? "0") : null;
      const time = timeNode ? new Date(timeNode.textContent!) : null;
      if (i === 0 && time) startTime = time;
      if (time) endTime = time;
      if (ele !== null && prevEle !== null && ele > prevEle) totalGain += ele - prevEle;
      if (prevLat != null && prevLon != null) {
        const R = 6371;
        const dLat = ((lat - prevLat) * Math.PI) / 180;
        const dLon = ((lon - prevLon) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((prevLat * Math.PI) / 180) *
            Math.cos((lat * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        totalDist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }
      prevLat = lat;
      prevLon = lon;
      prevEle = ele;
    }

    const startMs = startTime ? startTime.getTime() : 0;
    const endMs = endTime ? endTime.getTime() : 0;
    const durationMs = Math.max(0, endMs - startMs);
    const durationHrs = durationMs / 3600000;
    const distMiles = totalDist * 0.621371;
    const elevFt = totalGain * 3.28084;
    const hours = Math.floor(durationMs / 3600000);
    const mins = Math.floor((durationMs % 3600000) / 60000);
    const secs = Math.floor((durationMs % 60000) / 1000);
    const duration = `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    const avgSpeed = durationHrs > 0 ? distMiles / durationHrs : 0;

    return {
      name,
      date: startTime ? startTime.toISOString().split("T")[0]! : new Date().toISOString().split("T")[0]!,
      distance: Math.round(distMiles * 10) / 10,
      elevation: Math.round(elevFt),
      duration,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      calories: Math.round(durationHrs * 140 * 0.5 * 4.184),
      notes: "GPX import",
      rating: 0,
      source: "gpx",
    };
  } catch (e) {
    return { error: String(e) };
  }
}

export function RideLogTab({ discipline, rides, onRidesChange }: Props) {
  const d = DISCIPLINES[discipline];
  const filtered = rides.filter((r) => r.discipline === discipline);
  const [showForm, setShowForm] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      Array.from(files).forEach((file) => {
        if (!file.name.toLowerCase().endsWith(".gpx")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const parsed = parseGPX(text);
          if ("error" in parsed) {
            alert(parsed.error);
            return;
          }
          const newRide: Ride = {
            id: `gpx-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            discipline,
            name: parsed.name ?? "Imported",
            date: parsed.date ?? new Date().toISOString().split("T")[0]!,
            distance: parsed.distance ?? 0,
            elevation: parsed.elevation ?? 0,
            duration: parsed.duration ?? "0:00:00",
            avgSpeed: parsed.avgSpeed ?? 0,
            calories: parsed.calories ?? 0,
            notes: parsed.notes,
            rating: parsed.rating ?? 0,
            source: "gpx",
          };
          onRidesChange([newRide, ...rides]);
        };
        reader.readAsText(file);
      });
    },
    [discipline, rides, onRidesChange]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ color: d.color }}>
          Ride Log
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl border text-sm font-medium"
            style={{ borderColor: d.color, color: d.color }}
          >
            Import GPX
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".gpx"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl text-white text-sm font-bold"
            style={{ backgroundColor: d.color }}
          >
            {showForm ? "Cancel" : "+ Log Ride"}
          </button>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFile(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          drag ? "bg-green-50 border-green-400" : "bg-gray-50 dark:bg-gray-800/50 border-gray-300"
        }`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drop GPX files here or click to browse
        </p>
      </div>

      {showForm && (
        <div
          className="rounded-2xl p-5 border-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          style={{ borderColor: d.color }}
        >
          <h3 className="font-semibold mb-3">New Ride (manual)</h3>
          <p className="text-sm text-gray-500 mb-3">
            Form wiring for Phase 2 — use Import GPX or add fields as needed.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 rounded-lg border border-gray-300"
          >
            Close
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {filtered.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-4 shadow-sm"
            style={{ borderLeftColor: d.color }}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{r.name}</h3>
                <span className="text-xs text-gray-500">
                  {r.date} {r.source !== "manual" && `· ${r.source}`}
                </span>
              </div>
              <span className="font-bold" style={{ color: d.color }}>
                {r.distance} mi
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>⬆️ {r.elevation} ft</span>
              <span>⏱️ {r.duration}</span>
              <span>⚡ {r.avgSpeed} mph</span>
              <span>🔥 {r.calories} cal</span>
            </div>
            {r.notes && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">&quot;{r.notes}&quot;</p>
            )}
          </li>
        ))}
      </ul>
      {filtered.length === 0 && !showForm && (
        <p className="text-center text-gray-500 py-8">No rides yet. Import a GPX or log one.</p>
      )}
    </div>
  );
}
