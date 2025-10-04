'use client';
import { useEffect, useState } from 'react';

function AddTimeButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      onClick={() => { setPending(true); window.location.href = '/api/strava'; }}
      disabled={pending}
      className="px-5 py-3 rounded-2xl bg-white text-black font-medium hover:opacity-90 disabled:opacity-50"
      aria-label="Add my time via Strava"
    >
      {pending ? 'Redirecting…' : 'Add my time'}
    </button>
  );
}

function fmt(sec: number) {
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  return `${h>0?h+':':''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function RaceTrackerPage() {
  const [authorized, setAuthorized] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [data, setData] = useState<{ stageNames: string[]; rows: any[] } | null>(null);
  const [q, setQ] = useState('');

  // read query params
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setAuthorized(sp.get('authorized') === '1');
    setCode(sp.get('code'));
  }, []);

  // if just authorized, sync immediately
  useEffect(() => {
    if (authorized && code) {
      fetch('/api/times/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      }).finally(() => {
        // clean the URL
        window.history.replaceState({}, '', '/race-tracker');
        // refresh leaderboard
        fetch('/api/leaderboard', { cache: 'no-store' })
          .then(r => r.json()).then(setData).catch(() => {});
      });
    }
  }, [authorized, code]);

  // initial leaderboard load
  useEffect(() => {
    fetch('/api/leaderboard', { cache: 'no-store' })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ stageNames: ['Stage 1','Stage 2','Stage 3','Stage 4'], rows: [] }));
  }, []);

  const rows = (data?.rows ?? []).filter(r => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8 text-white">
      <header className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">4SOH Race Tracker</h1>
        <p className="text-white/70 max-w-2xl">
          Connect your Strava and we&apos;ll pull your latest segment efforts. Complete all stages to earn a <span className="text-white">10-minute bonus</span>.
        </p>
        <AddTimeButton />
      </header>

      <section className="flex items-center justify-between gap-4">
        <div className="text-sm text-white/60">Best 3 total • −10:00 bonus if all 4 stages</div>
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Search riders"
          className="bg-transparent border border-white/20 rounded-xl px-3 py-2 outline-none focus:border-white/40"
          aria-label="Search riders"
        />
      </section>

      <section className="rounded-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-white/5 backdrop-blur sticky top-0">
          <div>#</div><div>Rider</div><div>Best 3</div><div>Bonus</div><div>Final</div>
          <div className="text-right">Stages</div>
        </div>
        <div>
          {rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-white/60">No riders yet. Be the first to add a time!</div>
          ) : rows.map((r, idx) => (
            <div key={r.id} className="grid grid-cols-6 gap-4 px-4 py-3 border-t border-white/10 hover:bg-white/5">
              <div className="font-semibold">{idx+1}</div>
              <div className="truncate">{r.name}</div>
              <div>{fmt(r.score.best3)}</div>
              <div>{r.score.bonus ? `-${fmt(r.score.bonus)}` : '—'}</div>
              <div className="font-semibold">{fmt(r.score.final)}</div>
              <div className="text-right text-sm text-white/70">
                {(data?.stageNames ?? []).map((_, i) => (
                  <span key={i} className={`inline-block min-w-[70px] text-center rounded-md px-2 py-0.5 ml-1 ${r.stages[i] ? 'bg-white/10' : 'bg-white/5 opacity-50'}`}>
                    {r.stages[i] ? fmt(r.stages[i]) : '—'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}