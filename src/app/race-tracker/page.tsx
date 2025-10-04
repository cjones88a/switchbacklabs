'use client';
import { useEffect, useState } from 'react';
import { Table } from '@/components/Table';
import { 
  getOverallLoopLeaderboard, 
  getClimberScoreLeaderboard, 
  getDownhillScoreLeaderboard,
  LeaderboardRow as NewLeaderboardRow
} from '@/lib/leaderboards';

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
  return (
    <button
      onClick={() => {
        const clientId = '179098';
        const redirectUri = 'https://switchbacklabsco.com/api/strava/callback-simple';
        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read,activity:read,activity:read_all&approval_prompt=auto&state=race_tracker`;
        window.location.href = authUrl;
      }}
      className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-colors"
    >
      🚀 Connect Strava & Get My Time
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
    performance?: {
      fetchTime: number;
      cacheHit: boolean;
      dataFreshness: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Legacy state variables (kept for compatibility but not used in new implementation)
  const [data, setData] = useState<{ stageNames: string[]; stageSegments: { [key: number]: number }; rows: LeaderboardRow[] } | null>(null);
  const [climbingData, setClimbingData] = useState<{ stageNames: string[]; stageSegments: { [key: number]: number }; rows: LeaderboardRow[] } | null>(null);
  const [descendingData, setDescendingData] = useState<{ stageNames: string[]; stageSegments: { [key: number]: number }; rows: LeaderboardRow[] } | null>(null);
  const [q, setQ] = useState('');
  
  // New leaderboard data using proper Prisma-style logic
  const [overallLeaderboard, setOverallLeaderboard] = useState<NewLeaderboardRow[]>([]);
  const [climberLeaderboard, setClimberLeaderboard] = useState<NewLeaderboardRow[]>([]);
  const [downhillLeaderboard, setDownhillLeaderboard] = useState<NewLeaderboardRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // read query params
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const success = sp.get('success') === '1';
    const token = sp.get('accessToken');
    const athleteId = sp.get('athleteId');
    const athleteName = sp.get('athleteName');
    const error = sp.get('error');
    const errorDetails = sp.get('details');
    
    if (error) {
      console.error('❌ Strava callback error:', error, errorDetails);
      setError(`Strava connection failed: ${error}${errorDetails ? ` - ${errorDetails}` : ''}`);
      
      // Clean the URL
      window.history.replaceState({}, '', '/race-tracker');
      return;
    }
    
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
        body: JSON.stringify({ accessToken: token })
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
    const loadLeaderboards = async () => {
      try {
        // Load overall leaderboard
        const overallResponse = await fetch('/api/leaderboard', { cache: 'no-store' });
        const overallData = await overallResponse.json();
        setData(overallData);
        
        // Load climbing leaderboard
        const climbingResponse = await fetch('/api/leaderboard/climbing', { cache: 'no-store' });
        const climbingData = await climbingResponse.json();
        setClimbingData(climbingData);
        
        // Load descending leaderboard
        const descendingResponse = await fetch('/api/leaderboard/descending', { cache: 'no-store' });
        const descendingData = await descendingResponse.json();
        setDescendingData(descendingData);
        
      } catch (error) {
        console.error('Failed to load leaderboards:', error);
        // Set fallback data
        const fallbackData = { 
          stageNames: ['Fall 2025','Winter 2025','Spring 2026','Summer 2026'], 
          stageSegments: { 0: 7977451, 1: 0, 2: 0, 3: 0 },
          rows: [] 
        };
        setData(fallbackData);
        setClimbingData(fallbackData);
        setDescendingData(fallbackData);
      }
    };
    
    loadLeaderboards();
  }, []);

  // Function to refresh leaderboard data
  const refreshLeaderboards = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing leaderboard data...');
      
      const [overallData, climberData, downhillData] = await Promise.all([
        getOverallLoopLeaderboard(),
        getClimberScoreLeaderboard(),
        getDownhillScoreLeaderboard()
      ]);
      
      setOverallLeaderboard(overallData.rows);
      setClimberLeaderboard(climberData.rows);
      setDownhillLeaderboard(downhillData.rows);
      
      console.log('✅ Leaderboard data refreshed');
    } catch (error) {
      console.error('Failed to refresh leaderboards:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load new leaderboard data using proper Prisma-style logic
  useEffect(() => {
    refreshLeaderboards();
  }, []);

  // Add refresh on page visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing data...');
        refreshLeaderboards();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Add keyboard shortcut for refresh (F5 or Ctrl+R)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F5 key or Ctrl+R
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        console.log('🔄 Keyboard refresh triggered');
        refreshLeaderboards();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Force refresh on page load (handles browser refresh)
  useEffect(() => {
    const handlePageLoad = () => {
      console.log('🔄 Page loaded, refreshing data...');
      refreshLeaderboards();
    };

    // Refresh immediately on mount
    handlePageLoad();
    
    // Also listen for page load events
    window.addEventListener('load', handlePageLoad);
    return () => window.removeEventListener('load', handlePageLoad);
  }, []);



  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8 text-white">
      <header className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">4SOH Race Tracker</h1>
        <p className="text-white/70 max-w-2xl">
          Connect your Strava and we&apos;ll pull your latest segment efforts. Complete all stages to earn a <span className="text-white">10-minute bonus</span>.
        </p>
        
        
        <AddTimeButton />
        
        {athleteInfo && (
          <div className="text-center mt-4 space-y-2">
            <p className="text-sm text-green-400">
              ✅ Connected as {athleteInfo.name}
            </p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    
                    // Get access token from localStorage or prompt user
                    const accessToken = prompt('Enter your Strava access token to sync data:');
                    
                    if (!accessToken) {
                      setError('Access token required to sync data');
                      return;
                    }
                    
                    console.log('🔄 Syncing Strava data...');
                    
                    const response = await fetch('/api/times/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ accessToken })
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to sync data');
                    }
                    
                    const result = await response.json();
                    console.log('✅ Sync successful:', result);
                    
                    // Refresh leaderboards after sync
                    await refreshLeaderboards();
                    
                  } catch (err) {
                    console.error('❌ Sync failed:', err);
                    setError(err instanceof Error ? err.message : 'Failed to sync data');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? '🔄 Syncing...' : '🔄 Sync My Data'}
              </button>
              
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    
                    // Get access token from localStorage or prompt user
                    const accessToken = prompt('Enter your Strava access token for simple test:');
                    
                    if (!accessToken) {
                      setError('Access token required for test');
                      return;
                    }
                    
                    console.log('🧪 Testing simple sync...');
                    
                    const response = await fetch('/api/test-simple-sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ accessToken })
                    });
                    
                    const result = await response.json();
                    console.log('🧪 Test result:', result);
                    
                    if (result.success) {
                      console.log('✅ Simple sync successful!');
                      // Refresh leaderboards after sync
                      await refreshLeaderboards();
                    } else {
                      setError(`Test failed: ${result.message}`);
                    }
                    
                  } catch (err) {
                    console.error('❌ Test failed:', err);
                    setError(err instanceof Error ? err.message : 'Test failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? '🧪 Testing...' : '🧪 Test 1 Segment'}
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            marginTop: '16px'
          }}>
            <strong>❌ Connection Error:</strong> {error}
            <button
              onClick={() => setError(null)}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
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
        <div style={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>
              🚀 Your Segment 7977451 Performance Dashboard
            </h2>
          </div>
          <div style={{ padding: '24px' }}>
          {segmentData.mostRecentEffort ? (
            <div className="space-y-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>Best Time</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                    {fmt(segmentData.mostRecentEffort.elapsedTime)}
                  </div>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>Total Efforts</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                    {segmentData.totalEfforts}
                  </div>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>PR Rank</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: segmentData.mostRecentEffort.prRank ? '#10b981' : 'white' }}>
                    {segmentData.mostRecentEffort.prRank ? `#${segmentData.mostRecentEffort.prRank}` : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'semibold', color: 'white', margin: 0 }}>📊 Most Recent Effort</h3>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Date:</span>
                      <span>{new Date(segmentData.mostRecentEffort.startDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Activity:</span>
                      <span style={{ fontSize: '14px' }}>{segmentData.mostRecentEffort.activity.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Type:</span>
                      <span>{segmentData.mostRecentEffort.activity.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Distance:</span>
                      <span>{(segmentData.mostRecentEffort.activity.distance / 1000).toFixed(2)} km</span>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'semibold', color: 'white', margin: 0 }}>⚡ Performance Stats</h3>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Data Freshness:</span>
                      <span style={{ fontSize: '14px' }}>{new Date(segmentData.performance?.dataFreshness || Date.now()).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cache Status:</span>
                      <span style={{ fontSize: '14px' }}>{segmentData.performance?.cacheHit ? '⚡ Cached' : '🔄 Fresh'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Fetch Time:</span>
                      <span style={{ fontSize: '14px' }}>{segmentData.performance?.fetchTime?.toFixed(0)}ms</span>
                    </div>
                  </div>
                </div>
              </div>
                
              {segmentData.allEfforts.length > 1 && (
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'semibold', color: 'white', margin: 0 }}>📈 Complete Effort History</h3>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                      {segmentData.allEfforts.map((effort, index: number) => (
                        <div key={effort.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>#{index + 1}</span>
                            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{fmt(effort.elapsedTime)}</span>
                            {effort.prRank && (
                              <span style={{
                                fontSize: '12px',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                padding: '4px 8px',
                                borderRadius: '12px'
                              }}>
                                PR #{effort.prRank}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                            {new Date(effort.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </div>
            ) : (
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#93c5fd'
              }}>
                <strong>ℹ️ No Segment Data Found</strong><br/>
                Complete segment 7977451 on Strava to see your performance data here!
              </div>
            )}
          </div>
        </div>
      )}

      <section className="flex items-center justify-between gap-4">
        <div className="text-sm text-white/60">Individual season times • −10:00 bonus if all 4 stages completed</div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshLeaderboards}
            disabled={refreshing}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            title="Refresh leaderboard data"
          >
            {refreshing ? '🔄' : '🔄'} {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search riders"
            className="bg-transparent border border-white/20 rounded-xl px-3 py-2 outline-none focus:border-white/40"
            aria-label="Search riders"
          />
        </div>
      </section>

      {/* Overall Leaderboard */}
      <Table
        title="Overall Times"
        subtitle="Best time on segment 7977451 per season"
        rows={overallLeaderboard.filter(r => r.riderName.toLowerCase().includes(q.toLowerCase()))}
        icon="🏆"
      />

      {/* Climbing Leaderboard */}
      <Table
        title="Top Pogi's - Here to Tear Legs Off"
        subtitle="Sum of segments 9589287 + 18229887 (only if completed loop)"
        rows={climberLeaderboard.filter(r => r.riderName.toLowerCase().includes(q.toLowerCase()))}
        icon="🏔️"
      />

      {/* Descending Leaderboard */}
      <Table
        title="Top Bruni's - Shrediest DownHillers"
        subtitle="Sum of segments 2105607 + 1359027 (only if completed loop)"
        rows={downhillLeaderboard.filter(r => r.riderName.toLowerCase().includes(q.toLowerCase()))}
        icon="🏂"
      />
    </main>
  );
}