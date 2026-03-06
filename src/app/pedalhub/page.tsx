"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DISCIPLINES,
  TABS,
  SAMPLE_RIDES,
  type Discipline,
  type TabId,
  type Ride,
  type RouteInfo,
} from "./data/constants";
import { DashboardTab } from "./components/DashboardTab";
import { RideLogTab } from "./components/RideLogTab";
import { RoutesTab } from "./components/RoutesTab";
import { NavigateTab } from "./components/NavigateTab";
import { WeatherTab } from "./components/WeatherTab";
import { ToolkitTab } from "./components/ToolkitTab";

export default function PedalHubPage() {
  const [discipline, setDiscipline] = useState<Discipline>("mountain");
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [rides, setRides] = useState<Ride[]>(SAMPLE_RIDES);
  const [navigateRoute, setNavigateRoute] = useState<RouteInfo | null>(null);

  const d = DISCIPLINES[discipline];

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header
        className="text-white px-4 pt-6 pb-4 rounded-b-3xl shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${d.color}, ${d.accent})`,
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">PedalHub</h1>
            <p className="text-sm opacity-90">Cycling command center</p>
          </div>
          <Link
            href="/"
            className="text-sm opacity-90 hover:underline"
          >
            Switchback Labs
          </Link>
        </div>
        <div className="flex gap-2">
          {(Object.keys(DISCIPLINES) as Discipline[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setDiscipline(key)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                discipline === key
                  ? "bg-white/25 border-2 border-white"
                  : "bg-white/10 border-2 border-white/30"
              }`}
            >
              {DISCIPLINES[key].icon} {DISCIPLINES[key].label}
            </button>
          ))}
        </div>
      </header>

      {/* Tabs bar */}
      <div className="flex gap-1 px-2 pt-3 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "text-white shadow-md"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            style={activeTab === tab.id ? { backgroundColor: d.color } : undefined}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-4">
        {activeTab === "dashboard" && (
          <DashboardTab discipline={discipline} rides={rides} />
        )}
        {activeTab === "rides" && (
          <RideLogTab
            discipline={discipline}
            rides={rides}
            onRidesChange={setRides}
          />
        )}
        {activeTab === "routes" && (
          <RoutesTab
            discipline={discipline}
            onSelectRoute={(route: RouteInfo) => {
              setNavigateRoute(route);
              setActiveTab("navigate");
            }}
          />
        )}
        {activeTab === "navigate" && (
          <NavigateTab
            discipline={discipline}
            initialRoute={navigateRoute}
            onClearRoute={() => setNavigateRoute(null)}
          />
        )}
        {activeTab === "weather" && <WeatherTab discipline={discipline} />}
        {activeTab === "toolkit" && <ToolkitTab discipline={discipline} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around py-2 safe-area-pb">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs font-medium ${
              activeTab === tab.id ? "text-white" : "text-gray-500"
            }`}
            style={activeTab === tab.id ? { backgroundColor: d.color } : undefined}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
