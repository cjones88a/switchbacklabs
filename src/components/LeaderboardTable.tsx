"use client";
import useSWR from "swr";
import { useEffect, useState } from "react";

const fetcher = (u: string) => fetch(u).then((r) => r.json());
function fmt(ms: number | null | undefined) {
  if (ms == null) return "—";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  return h ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}` : `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function LeaderboardTable({ seasonKey }: { seasonKey: string }) {
  const year = Number(seasonKey.split("_")[0]);
  const { data, mutate, isLoading } = useSWR(`/api/leaderboard?year=${year}`, fetcher);

  const rows = data?.rows ?? [];
  const [debug, setDebug] = useState("");

  // fire once after OAuth to record in the current season
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("connected") === "1") {
      fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season_key: seasonKey }),
      }).then(() => mutate());
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      window.history.replaceState({}, "", url.toString());
    }
  }, [seasonKey, mutate]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => mutate()} className="text-xs underline">Refresh</button>
        <button
          onClick={async () => {
            const r = await fetch("/api/record", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ season_key: seasonKey }),
            });
            const j = await r.json();
            setDebug(JSON.stringify(j, null, 2));
            mutate();
          }}
          className="text-xs rounded border px-2 py-1"
        >
          Record now
        </button>
      </div>

      {debug && <pre className="text-xs bg-gray-50 border rounded p-2 overflow-x-auto">{debug}</pre>}

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Rider</th>
              <th className="p-2 text-right">Fall</th>
              <th className="p-2 text-right">Winter</th>
              <th className="p-2 text-right">Spring</th>
              <th className="p-2 text-right">Summer</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Climb Sum</th>
              <th className="p-2 text-right" title="Desc_1 + Desc_2 + Desc_3 (same activity)">Descent Sum</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="p-2 text-gray-500" colSpan={8}>Loading…</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td className="p-2 text-gray-500" colSpan={8}>No entries yet.</td></tr>
            )}
                {rows.map((r: { rider?: { name: string }; by_season: Record<string, number | null>; total_ms: number; climb_sum_ms: number | null; desc_sum_ms: number | null }, i: number) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.rider?.name}</td>
                <td className="p-2 text-right">{fmt(r.by_season.FALL)}</td>
                <td className="p-2 text-right">{fmt(r.by_season.WINTER)}</td>
                <td className="p-2 text-right">{fmt(r.by_season.SPRING)}</td>
                <td className="p-2 text-right">{fmt(r.by_season.SUMMER)}</td>
                <td className="p-2 text-right">{fmt(r.total_ms)}</td>
                <td className="p-2 text-right">{fmt(r.climb_sum_ms)}</td>
                <td className="p-2 text-right">{fmt(r.desc_sum_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Descent Sum = 3 descents from the same activity as your overall time.</p>
    </div>
  );
}
