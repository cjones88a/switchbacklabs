"use client";

import { useState } from "react";
import { PedalHubMap } from "./PedalHubMap";
import type { Discipline, RouteInfo } from "../data/constants";
import { DISCIPLINES, ROUTES } from "../data/constants";

type Props = {
  discipline: Discipline;
};

export function NavigateTab({ discipline }: Props) {
  const d = DISCIPLINES[discipline];
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null);
  const routes = ROUTES.filter((r) => r.discipline === discipline);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ color: d.color }}>
          Ride — Map &amp; Navigate
        </h2>
        {selectedRoute && (
          <button
            type="button"
            onClick={() => setSelectedRoute(null)}
            className="text-sm font-medium"
            style={{ color: d.color }}
          >
            ← All routes
          </button>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
        <PedalHubMap
          route={selectedRoute}
          userPosition={null}
          showUserLocation={true}
          className="w-full"
        />
      </div>

      {selectedRoute ? (
        <div className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold">{selectedRoute.name}</h3>
          <p className="text-sm text-gray-500">
            {selectedRoute.distance} mi · {selectedRoute.elevation} ft · ~{selectedRoute.estimatedMinutes} min
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Route is on the map. Turn-by-turn and elevation profile coming in a later phase.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a route to see it on the map and navigate. Map centers on your location when available.
          </p>
          {routes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRoute(r)}
              className="w-full text-left rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex justify-between items-center"
            >
              <span className="font-medium">{r.name}</span>
              <span className="text-sm text-gray-500">
                {r.distance} mi · {r.elevation} ft
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
