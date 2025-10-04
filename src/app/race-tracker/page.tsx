'use client';
import { useEffect, useState } from 'react';

interface LeaderboardRow {
  id: string;
  name: string;
  stages: {
    [key: number]: number | undefined;
  };
  score: {
    best3: number;
    bonus: number;
    final: number;
  };
}

function AddTimeButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      onClick={() => { setPending(true); window.location.href = '/api/strava/auth-simple'; }}
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
  const [athleteInfo, setAthleteInfo] = useState<{id: string, name: string} | null>(null);
  const [segmentData, setSegmentData] = useState<{
    segmentId: number;
    athlete: {
      id: number;
      firstName: string;
      lastName: string;
      username?: string;
      profile?: string;
    };
    mostRecentEffort?: {
      id: number;
      elapsedTime: number;
      startDate: string;
      prRank?: number;
      activity: {
        id: number;
        name: string;
        type: string;
        distance: number;
        startDate: string;
      };
    };
    allEfforts: Array<{
      id: number;
      elapsedTime: number;
      startDate: string;
      prRank?: number;
    }>;
    totalEfforts: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ stageNames: string[]; rows: LeaderboardRow[] } | null>(null);
  const [q, setQ] = useState('');

  // read query params
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const success = sp.get('success') === '1';
    const token = sp.get('accessToken');
    const athleteId = sp.get('athleteId');
    const athleteName = sp.get('athleteName');
    
    if (success && token && athleteId && athleteName) {
      setAthleteInfo({ id: athleteId, name: athleteName });
      
      // Clean the URL
      window.history.replaceState({}, '', '/race-tracker');
      
      // Fetch segment data immediately
      fetchSegmentData(token);
    }
  }, []);

  const fetchSegmentData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching segment 7977451 data...');
      const response = await fetch(`/api/strava/segment-7977451?accessToken=${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch segment data');
      }
      
      const segmentData = await response.json();
      setSegmentData(segmentData);
      console.log('✅ Segment data fetched successfully');
      
    } catch (err) {
      console.error('❌ Error fetching segment data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch segment data');
    } finally {
      setLoading(false);
    }
  };

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
        
        {athleteInfo && (
          <div className="text-center mt-4">
            <p className="text-sm text-green-400">
              ✅ Connected as {athleteInfo.name}
            </p>
          </div>
        )}
        
        {error && (
          <div className="text-center mt-4">
            <p className="text-sm text-red-400">
              ❌ {error}
            </p>
          </div>
        )}
      </header>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white/70">Fetching your segment data...</p>
        </div>
      )}

      {segmentData && (
        <section className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Your Segment 7977451 Performance</h2>
            
            {segmentData.mostRecentEffort ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Most Recent Effort</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/70">Time:</span>
                        <span className="font-bold text-xl">{fmt(segmentData.mostRecentEffort.elapsedTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Date:</span>
                        <span>{new Date(segmentData.mostRecentEffort.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Activity:</span>
                        <span className="text-sm">{segmentData.mostRecentEffort.activity.name}</span>
                      </div>
                      {segmentData.mostRecentEffort.prRank && (
                        <div className="flex justify-between">
                          <span className="text-white/70">PR Rank:</span>
                          <span className="text-green-400 font-semibold">#{segmentData.mostRecentEffort.prRank}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Activity Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/70">Type:</span>
                        <span>{segmentData.mostRecentEffort.activity.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Distance:</span>
                        <span>{(segmentData.mostRecentEffort.activity.distance / 1000).toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Total Efforts:</span>
                        <span>{segmentData.totalEfforts}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {segmentData.allEfforts.length > 1 && (
                  <div className="p-4 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">All Efforts on This Segment</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {segmentData.allEfforts.map((effort, index: number) => (
                        <div key={effort.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white/50">#{index + 1}</span>
                            <span className="font-medium">{fmt(effort.elapsedTime)}</span>
                          </div>
                          <div className="text-sm text-white/70">
                            {new Date(effort.startDate).toLocaleDateString()}
                            {effort.prRank && (
                              <span className="ml-2 text-green-400">PR #{effort.prRank}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70">No efforts found for this segment</p>
                <p className="text-sm text-white/50 mt-2">
                  Complete this segment on Strava to see your time here!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

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