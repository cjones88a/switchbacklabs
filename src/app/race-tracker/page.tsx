'use client';
import { useEffect, useState } from 'react';
import { TeslaButton, TeslaCard, TeslaMetric, TeslaAlert } from '@/components/TeslaUI';

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
  
  const handleClick = () => {
    console.log('🚀 Button clicked! Redirecting to OAuth...');
    setPending(true);
    window.location.href = '/api/strava/auth-simple';
  };
  
  return (
    <div className="space-y-4">
      <TeslaButton
        onClick={handleClick}
        loading={pending}
        size="lg"
        variant="primary"
      >
        🚀 Connect Strava & Get My Time
      </TeslaButton>
      
      {/* Debug buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            console.log('🔧 Debug button clicked');
            alert('Debug button works!');
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          🔧 Debug Test
        </button>
        
        <button
          onClick={() => {
            console.log('🔍 Testing OAuth API...');
            fetch('/api/debug')
              .then(r => r.json())
              .then(data => {
                console.log('Debug data:', data);
                alert(`Environment check: ${JSON.stringify(data.environment, null, 2)}`);
              })
              .catch(err => {
                console.error('Debug error:', err);
                alert('Debug API failed: ' + err.message);
              });
          }}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          🔍 Check Environment
        </button>
        
        <button
          onClick={async () => {
            console.log('🚀 Testing OAuth API response...');
            try {
              const response = await fetch('/api/strava/auth-simple');
              console.log('OAuth API response:', response);
              console.log('Response status:', response.status);
              console.log('Response headers:', response.headers);
              
              if (response.redirected) {
                console.log('✅ Redirect detected, going to:', response.url);
                window.location.href = response.url;
              } else {
                const text = await response.text();
                console.log('Response body:', text);
                alert('No redirect - API returned: ' + text);
              }
            } catch (error) {
              console.error('OAuth API error:', error);
              alert('OAuth API failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          🚀 Test OAuth API
        </button>
        
        <button
          onClick={() => {
            console.log('🚀 Direct redirect to Strava...');
            const clientId = '179098';
            const redirectUri = 'https://switchbacklabsco.com/api/strava/callback-simple';
            const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read,activity:read,activity:read_all&approval_prompt=auto&state=race_tracker`;
            console.log('Auth URL:', authUrl);
            window.location.href = authUrl;
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          🚀 Direct Strava
        </button>
      </div>
    </div>
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
    performance?: {
      fetchTime: number;
      cacheHit: boolean;
      dataFreshness: string;
    };
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
      
      // Sync times with database and fetch segment data
      syncTimesAndFetchData(token);
    }
  }, []);

  const syncTimesAndFetchData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // First, sync the times with the database
      console.log('🔄 Syncing times with database...');
      const syncResponse = await fetch('/api/times/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: token })
      });
      
      if (!syncResponse.ok) {
        const errorData = await syncResponse.json();
        throw new Error(errorData.message || 'Failed to sync times');
      }
      
      console.log('✅ Times synced successfully');
      
      // Then fetch the segment data for display
      console.log('🔄 Fetching segment 7977451 data...');
      const segmentResponse = await fetch(`/api/strava/segment-7977451?accessToken=${token}`);
      
      if (segmentResponse.ok) {
        const segmentData = await segmentResponse.json();
        setSegmentData(segmentData);
        console.log('✅ Segment data fetched successfully');
      }
      
      // Finally, refresh the leaderboard to show the new data
      console.log('🔄 Refreshing leaderboard...');
      const leaderboardResponse = await fetch('/api/leaderboard', { cache: 'no-store' });
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setData(leaderboardData);
        console.log('✅ Leaderboard refreshed with new data');
      }
      
    } catch (err) {
      console.error('❌ Error syncing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync data');
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
          <div className="mt-4">
            <TeslaAlert
              type="error"
              title="Connection Error"
              message={error}
              onClose={() => setError(null)}
            />
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
        <TeslaCard title="🚀 Your Segment 7977451 Performance Dashboard">
          {segmentData.mostRecentEffort ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TeslaMetric
                  label="Best Time"
                  value={fmt(segmentData.mostRecentEffort.elapsedTime)}
                  trend={segmentData.mostRecentEffort.prRank ? 'up' : 'neutral'}
                />
                <TeslaMetric
                  label="Total Efforts"
                  value={segmentData.totalEfforts}
                  trend="neutral"
                />
                <TeslaMetric
                  label="PR Rank"
                  value={segmentData.mostRecentEffort.prRank ? `#${segmentData.mostRecentEffort.prRank}` : 'N/A'}
                  trend={segmentData.mostRecentEffort.prRank ? 'up' : 'neutral'}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TeslaCard title="📊 Most Recent Effort">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Date:</span>
                      <span>{new Date(segmentData.mostRecentEffort.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Activity:</span>
                      <span className="text-sm">{segmentData.mostRecentEffort.activity.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Type:</span>
                      <span>{segmentData.mostRecentEffort.activity.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Distance:</span>
                      <span>{(segmentData.mostRecentEffort.activity.distance / 1000).toFixed(2)} km</span>
                    </div>
                  </div>
                </TeslaCard>
                
                <TeslaCard title="⚡ Performance Stats">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Data Freshness:</span>
                      <span className="text-sm">{new Date(segmentData.performance?.dataFreshness || Date.now()).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Cache Status:</span>
                      <span className="text-sm">{segmentData.performance?.cacheHit ? '⚡ Cached' : '🔄 Fresh'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Fetch Time:</span>
                      <span className="text-sm">{segmentData.performance?.fetchTime?.toFixed(0)}ms</span>
                    </div>
                  </div>
                </TeslaCard>
              </div>
                
              {segmentData.allEfforts.length > 1 && (
                <TeslaCard title="📈 Complete Effort History">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {segmentData.allEfforts.map((effort, index: number) => (
                      <div key={effort.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-white/50 font-mono">#{index + 1}</span>
                          <span className="font-bold text-lg">{fmt(effort.elapsedTime)}</span>
                          {effort.prRank && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                              PR #{effort.prRank}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-white/70">
                          {new Date(effort.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </TeslaCard>
              )}
              </div>
            ) : (
              <TeslaAlert
                type="info"
                title="No Segment Data Found"
                message="Complete segment 7977451 on Strava to see your performance data here!"
              />
            )}
        </TeslaCard>
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