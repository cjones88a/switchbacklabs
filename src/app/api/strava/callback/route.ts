import { NextResponse } from 'next/server';
import { exchangeCodeForToken, decodeState } from '@/lib/strava';
import { traceHeaders } from '@/lib/trace';
import {
  configIsBlocking,
  normalizeOAuthError,
  successRedirectPath,
  trainingConfigProblems,
  trainingErrorPath,
} from '@/lib/trainingGate';
import {
  createTrainingSession,
  sealTrainingSession,
  TRAINING_COOKIE_NAME,
  trainingCookieOptions,
} from '@/lib/trainingCookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirectToError(req: Request, code: string, missing?: string[]) {
  return NextResponse.redirect(new URL(trainingErrorPath(code, missing), req.url));
}

export async function GET(req: Request) {
  const t = traceHeaders('strava-callback');
  console.time(`[${t.name}] ${t.id}`);

  try {
    const url = new URL(req.url);
    const oauthError = normalizeOAuthError(url.searchParams.get('error'));
    const state = decodeState<{ next?: string }>(url.searchParams.get('state'));
    console.log(`[${t.name}] ${t.id} query`, {
      error: oauthError,
      hasCode: url.searchParams.has('code'),
      next: state?.next ?? null,
    });

    if (oauthError) {
      const code = oauthError === 'access_denied' ? 'access_denied' : 'missing_code';
      return redirectToError(req, code);
    }

    const problems = trainingConfigProblems(process.env);
    if (configIsBlocking(problems)) {
      return redirectToError(req, 'server_misconfigured', problems.missing);
    }

    const code = url.searchParams.get('code');
    if (!code) return redirectToError(req, 'missing_code');

    let data: {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
      expires_in?: number;
      athlete?: { id?: number };
    };
    try {
      data = await exchangeCodeForToken(code);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      console.error(`[${t.name}] ${t.id} token exchange`, message);
      if (message === 'missing_strava_env') {
        return redirectToError(req, 'server_misconfigured', ['STRAVA_CLIENT_ID', 'STRAVA_CLIENT_SECRET']);
      }
      return redirectToError(req, 'token_exchange_failed');
    }

    if (!data?.access_token || !data.refresh_token) {
      console.error(`[${t.name}] ${t.id} incomplete token response`);
      return redirectToError(req, 'invalid_token_response');
    }

    const expiresAt =
      typeof data.expires_at === 'number'
        ? data.expires_at * 1000
        : Date.now() + (Number(data.expires_in) || 21600) * 1000;
    const session = createTrainingSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      athleteId: typeof data.athlete?.id === 'number' ? data.athlete.id : null,
    });

    let sealed: string;
    try {
      sealed = sealTrainingSession(session, process.env.TRAINING_SESSION_SECRET);
    } catch (err) {
      console.error(`[${t.name}] ${t.id} seal`, err instanceof Error ? err.message : err);
      return redirectToError(req, 'server_misconfigured', ['TRAINING_SESSION_SECRET']);
    }

    const res = NextResponse.redirect(new URL(successRedirectPath(state?.next), req.url));
    res.cookies.set(TRAINING_COOKIE_NAME, sealed, trainingCookieOptions());
    res.headers.set('x-trace-id', t.id);
    res.headers.set('x-handler', t.name);
    return res;
  } catch (err) {
    console.error(`[${t.name}] ${t.id} unexpected`, err instanceof Error ? err.message : err);
    return redirectToError(req, 'token_exchange_failed');
  } finally {
    console.timeEnd(`[${t.name}] ${t.id}`);
  }
}
