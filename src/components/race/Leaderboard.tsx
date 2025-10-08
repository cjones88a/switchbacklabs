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
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block card p-0 overflow-x-auto">
        <table className="min-w-full border-separate [border-spacing:0]">
          <thead>
            <tr className="text-left text-sm text-muted">
              {["Rider","Fall","Winter","Spring","Summer","Total","Climb Sum","Descent Sum"].map(h => (
                <th key={h} className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="text-sm">
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">
                  {r.profileUrl ? (
                    <a href={r.profileUrl} className="underline">{r.rider}</a>
                  ) : r.rider}
                </td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{r.fall ?? "—"}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{r.winter ?? "—"}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{r.spring ?? "—"}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{r.summer ?? "—"}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{r.total ?? "—"}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{r.climbSum ?? "—"}</td>
                <td className="px-4 py-3 border-b border-[hsl(var(--pb-line))]">{r.descSum ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="card p-4">
            <div className="font-semibold">{r.rider}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
              <LabelVal label="Fall"   value={r.fall} />
              <LabelVal label="Winter" value={r.winter} />
              <LabelVal label="Spring" value={r.spring} />
              <LabelVal label="Summer" value={r.summer} />
              <LabelVal label="Total"  value={r.total} />
              <LabelVal label="Climb"  value={r.climbSum} />
              <LabelVal label="Desc"   value={r.descSum} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function LabelVal({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span>{value ?? "—"}</span>
    </div>
  );
}
