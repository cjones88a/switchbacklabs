'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StravaTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStravaAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the Strava auth URL
      const response = await fetch('/api/strava/initiate');
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to Strava for authorization
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get Strava auth URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const testSegmentFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This will be called after OAuth redirect
      const response = await fetch('/api/strava/test-segment');
      const data = await response.json();
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Strava OAuth Test</CardTitle>
            <CardDescription>
              Test the Strava OAuth flow and fetch segment data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Step 1: Connect to Strava</h3>
              <p className="text-sm text-gray-600">
                Click the button below to authorize with Strava and get your access token.
              </p>
              <Button 
                onClick={handleStravaAuth} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Connecting...' : 'Connect to Strava'}
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Step 2: Test Segment Fetch</h3>
              <p className="text-sm text-gray-600">
                After connecting, test fetching your times for segment 7977451.
              </p>
              <Button 
                onClick={testSegmentFetch} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Fetching...' : 'Get My Segment Times'}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Success!</h4>
                <pre className="text-xs text-green-700 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Make sure your Strava API callback domain is set to: <code className="bg-blue-100 px-1 rounded">switchbacklabsco.com</code></li>
                <li>2. Add your Strava Client ID and Secret to <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
                <li>3. Click &quot;Connect to Strava&quot; to start the OAuth flow</li>
                <li>4. After authorization, you&apos;ll be redirected back here</li>
                <li>5. Click &quot;Get My Segment Times&quot; to test the API</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
