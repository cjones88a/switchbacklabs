"use client";

type RiderRow = {
  rider: string;
  fall?: string | null;
  winter?: string | null;
  spring?: string | null;
  summer?: string | null;
  total?: string | null;
  climbSum?: string | null;
  descSum?: string | null;
  profileUrl?: string | null;
};

export default function Leaderboard({
  rows,
}: {
  rows: RiderRow[];
}) {
  // Ensure rows is always an array
  const safeRows = Array.isArray(rows) ? rows : [];
  
  return (
    <div className="card-outline overflow-hidden bg-white/95 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              {["Rider","Fall","Winter","Spring","Summer","Total","Climb Sum","Descent Sum"].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {safeRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No entries yet
                </td>
              </tr>
            ) : (
              safeRows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {r.profileUrl ? (
                      <a href={r.profileUrl} className="underline hover:opacity-70 text-blue-600">{r.rider}</a>
                    ) : (
                      r.rider
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.fall ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.winter ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.spring ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.summer ?? "—"}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{r.total ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.climbSum ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.descSum ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

