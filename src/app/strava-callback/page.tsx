'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StravaCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      router.push('/strava-test?error=auth_failed');
      return;
    }

    if (!code) {
      router.push('/strava-test?error=no_code');
      return;
    }

    // Process the OAuth callback
    const processCallback = async () => {
      try {
        const response = await fetch('/api/strava/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
            redirectUri: window.location.origin
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (state === 'race_tracker') {
            router.push(`/race-tracker?success=true&participantId=${data.participantId}`);
          } else {
            router.push(`/strava-test?success=true&participantId=${data.participantId}`);
          }
        } else {
          router.push('/strava-test?error=callback_failed');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        router.push('/strava-test?error=callback_failed');
      }
    };

    processCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Strava authorization...</p>
      </div>
    </div>
  );
}
