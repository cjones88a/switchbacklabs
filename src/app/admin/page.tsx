"use client";
import { useEffect, useMemo, useState } from "react";

const SEASONS = ["FALL", "WINTER", "SPRING", "SUMMER"] as const;

function fmtLocal(utcIso?: string | null) {
  if (!utcIso) return "";
  const d = new Date(utcIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toUTC(localValue: string) {
  // datetime-local returns local time; toISOString converts to UTC
  return new Date(localValue).toISOString();
}

type OverrideRow = { id: string; start_at: string; end_at: string; reason: string | null; created_at: string };

export default function AdminPage() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [season, setSeason] = useState<(typeof SEASONS)[number]>("FALL");
  const season_key = useMemo(() => `${year}_${season}`, [year, season]);

  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);

  // form state
  const [baseStart, setBaseStart] = useState<string>("");
  const [baseEnd, setBaseEnd] = useState<string>("");
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [ovStart, setOvStart] = useState<string>("");
  const [ovEnd, setOvEnd] = useState<string>("");
  const [ovReason, setOvReason] = useState<string>("");

  // load cached key
  useEffect(() => {
    const k = localStorage.getItem("adminKey") || "";
    if (k) {
      setAdminKey(k);
      setAuthed(true);
    }
  }, []);

  async function fetchWindows() {
    if (!authed) return;
    const headers = { "x-admin-key": adminKey };
    const [baseRes, ovRes] = await Promise.all([
      fetch(`/api/admin/base-window?season_key=${season_key}`, { headers }),
      fetch(`/api/admin/windows?season_key=${season_key}`, { headers }),
    ]);
    const baseJson = await baseRes.json();
    const ovJson = await ovRes.json();

    const base = baseJson?.base ?? null;
    setBaseStart(fmtLocal(base?.start_at ?? ""));
    setBaseEnd(fmtLocal(base?.end_at ?? ""));
    setOverrides(ovJson?.overrides ?? []);
  }

  useEffect(() => { 
    fetchWindows(); 
  }, [authed, season_key, adminKey]);

  // auth submit
  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!adminKey) return;
    localStorage.setItem("adminKey", adminKey);
    setAuthed(true);
  }

  async function saveBase() {
    if (!baseStart || !baseEnd) return alert("Enter both start and end");
    const start_at = toUTC(baseStart);
    const end_at = toUTC(baseEnd);
    if (new Date(end_at) <= new Date(start_at)) return alert("End must be after start");
    const r = await fetch("/api/admin/base-window", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ season_key, start_at, end_at }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed to save");
    await fetchWindows();
    alert("Base window saved.");
  }

  async function addOverride() {
    if (!ovStart || !ovEnd) return alert("Enter both start and end");
    const start_at = toUTC(ovStart);
    const end_at = toUTC(ovEnd);
    if (new Date(end_at) <= new Date(start_at)) return alert("End must be after start");
    const r = await fetch("/api/admin/windows", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ season_key, start_at, end_at, reason: ovReason || undefined }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed to add override");
    setOvStart(""); setOvEnd(""); setOvReason("");
    await fetchWindows();
  }

  async function removeOverride(id: string) {
    const r = await fetch(`/api/admin/windows/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed to delete");
    await fetchWindows();
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <form onSubmit={submitPassword} className="space-y-2">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="4SOH-Royals"
          />
          <button className="rounded-md border px-4 py-2" type="submit">Enter</button>
        </form>
        <p className="text-xs text-gray-500">Password is only stored in your browser (localStorage) and sent as a header to the admin API.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin — Season Windows</h1>

      <div className="flex gap-3 items-center">
        <div>
          <label className="block text-xs text-gray-600">Year</label>
          <input type="number" className="rounded-md border px-3 py-2 w-24"
                 value={year} onChange={(e) => setYear(Number(e.target.value || thisYear))} />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Season</label>
          <select className="rounded-md border px-3 py-2"
                  value={season} onChange={(e) => setSeason(e.target.value as typeof SEASONS[number])}>
            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="text-sm text-gray-600">Editing <code className="px-1 rounded bg-gray-50 border">{season_key}</code></div>
        <button className="text-xs underline" onClick={() => { localStorage.removeItem("adminKey"); setAuthed(false); }}>Sign out</button>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">Base Window</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600">Start (local)</label>
            <input type="datetime-local" className="w-full rounded-md border px-3 py-2"
                   value={baseStart} onChange={(e) => setBaseStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">End (local)</label>
            <input type="datetime-local" className="w-full rounded-md border px-3 py-2"
                   value={baseEnd} onChange={(e) => setBaseEnd(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button onClick={saveBase} className="rounded-md border px-4 py-2">Save</button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Override Weekends</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-600">Start (local)</label>
            <input type="datetime-local" className="w-full rounded-md border px-3 py-2"
                   value={ovStart} onChange={(e) => setOvStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">End (local)</label>
            <input type="datetime-local" className="w-full rounded-md border px-3 py-2"
                   value={ovEnd} onChange={(e) => setOvEnd(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Reason (optional)</label>
            <input type="text" className="w-full rounded-md border px-3 py-2"
                   value={ovReason} onChange={(e) => setOvReason(e.target.value)} placeholder="Trail closure makeup" />
          </div>
          <div className="flex items-end">
            <button onClick={addOverride} className="rounded-md border px-4 py-2">Add</button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Start</th>
                <th className="p-2 text-left">End</th>
                <th className="p-2 text-left">Reason</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2">{fmtLocal(o.start_at)}</td>
                  <td className="p-2">{fmtLocal(o.end_at)}</td>
                  <td className="p-2">{o.reason ?? "—"}</td>
                  <td className="p-2 text-right">
                    <button onClick={() => removeOverride(o.id)} className="text-xs underline">Delete</button>
                  </td>
                </tr>
              ))}
              {overrides.length === 0 && (
                <tr><td className="p-2 text-gray-500" colSpan={4}>No overrides.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
