'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LeaderboardEntry } from '@/types/race';

// For single stage results
interface StageLeaderboardEntry {
  rank: number;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    stravaId: number;
  };
  timeInSeconds: number;
  date: string;
  stageId?: string;
}

interface RaceConfig {
  name: string;
  bonusMinutes: number;
  stages: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }>;
}

export default function RaceTrackerPage() {
  const [leaderboard, setLeaderboard] = useState<(LeaderboardEntry | StageLeaderboardEntry)[]>([]);
  const [raceConfig, setRaceConfig] = useState<RaceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('overall');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedStage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedStage !== 'overall') {
        params.append('stageId', selectedStage);
      } else {
        params.append('includeBonus', 'true');
      }
      
      const response = await fetch(`/api/leaderboard?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      
      if (data.raceConfig) {
        setRaceConfig(data.raceConfig);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStravaConnect = async () => {
    try {
      const response = await fetch('/api/strava/initiate');
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setError('Failed to initiate Strava connection');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">4SOH Race Tracker</h1>
          <p className="text-lg text-gray-600 mb-6">
            Connect your Strava account to automatically track your race times
          </p>
          
          <Button onClick={handleStravaConnect} size="lg">
            Connect Strava Account
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {raceConfig && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{raceConfig.name}</CardTitle>
              <CardDescription>
                {raceConfig.bonusMinutes > 0 && (
                  <span className="text-green-600 font-medium">
                    Complete all stages to get a {raceConfig.bonusMinutes}-minute bonus!
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {raceConfig.stages.map((stage) => (
                  <div key={stage.id} className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">{stage.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(stage.startDate).toLocaleDateString()} - {new Date(stage.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                  {selectedStage === 'overall' ? 'Overall standings' : 'Stage results'}
                </CardDescription>
              </div>
              
              {raceConfig && (
                <div className="flex gap-2">
                  <Button
                    variant={selectedStage === 'overall' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStage('overall')}
                  >
                    Overall
                  </Button>
                  {raceConfig.stages.map((stage) => (
                    <Button
                      key={stage.id}
                      variant={selectedStage === stage.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStage(stage.id)}
                    >
                      {stage.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No results yet. Be the first to complete a stage!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div key={`${entry.participant.id}-${'stageId' in entry ? entry.stageId : 'overall'}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-400 w-8">
                          {entry.rank}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {entry.participant.firstName} {entry.participant.lastName}
                          </h3>
                          {selectedStage === 'overall' && 'stageResults' in entry && (
                            <p className="text-sm text-gray-600">
                              {Object.keys(entry.stageResults || {}).length} stages completed
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {formatTime('timeInSeconds' in entry ? entry.timeInSeconds : entry.totalTime)}
                        </div>
                        {selectedStage !== 'overall' && 'date' in entry && (
                          <div className="text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < leaderboard.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
