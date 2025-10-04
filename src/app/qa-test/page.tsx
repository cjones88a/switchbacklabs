'use client';

import { useState } from 'react';

export default function QATestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    athlete: { id: number; name: string };
    validationTimestamp: string;
    segments: Array<{
      segmentId: number;
      segmentName: string;
      segmentType: string;
      actualTime: number | null;
      actualTimeFormatted: string;
      activityName?: string;
      activityDate?: string;
      prRank?: number;
      error?: string;
    }>;
    totals: {
      climbing: { totalTime: number; totalTimeFormatted: string; segments: number };
      descending: { totalTime: number; totalTimeFormatted: string; segments: number };
    };
    summary: {
      overallLoop: {
        segmentId: number;
        segmentName: string;
        segmentType: string;
        actualTime: number | null;
        actualTimeFormatted: string;
        activityName?: string;
        activityDate?: string;
        prRank?: number;
        error?: string;
      } | null;
      climbingTotal: string;
      descendingTotal: string;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runQAValidation = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Get access token from localStorage or prompt user
      const accessToken = prompt('Enter Strava access token for QA validation:');
      
      if (!accessToken) {
        setError('Access token required');
        setLoading(false);
        return;
      }

      console.log('🧪 Starting QA validation...');
      
      const response = await fetch(`/api/qa/validate-segments?accessToken=${accessToken}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'QA validation failed');
      }
      
      const data = await response.json();
      setResults(data);
      console.log('✅ QA validation complete:', data);
      
    } catch (err) {
      console.error('❌ QA validation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8 text-white">
      <header className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">🧪 QA Segment Validation</h1>
        <p className="text-white/70">
          Validate Colt Jones segment times against actual Strava data
        </p>
      </header>

      <div className="space-y-6">
        <button
          onClick={runQAValidation}
          disabled={loading}
          className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? '🔄 Running QA Validation...' : '🧪 Run QA Validation'}
        </button>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className="p-6 bg-green-500/20 border border-green-500/30 rounded-xl">
              <h2 className="text-2xl font-bold text-green-300 mb-4">
                ✅ QA Validation Results
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Athlete:</strong> {results.athlete.name} (ID: {results.athlete.id})
                </div>
                <div>
                  <strong>Validation Time:</strong> {new Date(results.validationTimestamp).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Overall Loop */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2">🏆 Overall Loop</h3>
                {results.summary.overallLoop ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>Time:</strong> {results.summary.overallLoop.actualTimeFormatted}</div>
                    <div><strong>Activity:</strong> {results.summary.overallLoop.activityName}</div>
                    <div><strong>Date:</strong> {results.summary.overallLoop.activityDate ? new Date(results.summary.overallLoop.activityDate).toLocaleDateString() : 'N/A'}</div>
                    {results.summary.overallLoop.prRank && (
                      <div><strong>PR Rank:</strong> #{results.summary.overallLoop.prRank}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-300">No effort found</div>
                )}
              </div>

              {/* Climbing Total */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2">🏔️ Climbing Total</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Total Time:</strong> {results.totals.climbing.totalTimeFormatted}</div>
                  <div><strong>Segments:</strong> {results.totals.climbing.segments}</div>
                </div>
              </div>

              {/* Descending Total */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2">🏂 Descending Total</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Total Time:</strong> {results.totals.descending.totalTimeFormatted}</div>
                  <div><strong>Segments:</strong> {results.totals.descending.segments}</div>
                </div>
              </div>
            </div>

            {/* Detailed Segment Results */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">📊 Detailed Segment Results</h3>
              <div className="space-y-3">
                {results.segments.map((segment, index: number) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-white">
                          {segment.segmentName} (ID: {segment.segmentId})
                        </div>
                        <div className="text-sm text-white/70">
                          Type: {segment.segmentType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {segment.actualTimeFormatted}
                        </div>
                        {segment.error && (
                          <div className="text-sm text-red-300">{segment.error}</div>
                        )}
                      </div>
                    </div>
                    {segment.activityName && (
                      <div className="text-sm text-white/60 mt-2">
                        Activity: {segment.activityName} ({segment.activityDate ? new Date(segment.activityDate).toLocaleDateString() : 'N/A'})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
