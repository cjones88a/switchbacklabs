import { NextResponse } from 'next/server';
import { exchangeCodeForToken, decodeState } from '@/lib/strava';
import { getSupabaseAdmin } from '@/lib/supabase';
import { traceHeaders } from '@/lib/trace';
import {
  isFetchFailureMessage,
  normalizeOAuthError,
  oauthConfigProblems,
  successRedirectPath,
  trainingErrorPath,
  configIsBlocking,
} from '@/lib/trainingGate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirectToError(req: Request, code: string, missing?: string[]) {
  return NextResponse.redirect(new URL(trainingErrorPath(code, missing), req.url));
}

export async function GET(req: Request) {
  const t = traceHeaders("strava-callback");
  console.time(`[${t.name}] ${t.id}`);

  try {
    const url = new URL(req.url);
    const oauthError = normalizeOAuthError(url.searchParams.get('error'));
    const state = decodeState<{ consent_public?: boolean; next?: string }>(url.searchParams.get('state'));
    console.log(`[${t.name}] ${t.id} query`, {
      error: oauthError,
      hasCode: url.searchParams.has('code'),
      next: state?.next ?? null,
    });

    if (oauthError) {
      const code = oauthError === 'access_denied' ? 'access_denied' : 'missing_code';
      return redirectToError(req, code);
    }

    const problems = oauthConfigProblems(process.env);
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
      athlete?: { id?: number; firstname?: string; lastname?: string; profile?: string };
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

    const athlete = data?.athlete;
    if (!athlete?.id || !data.access_token || !data.refresh_token) {
      console.error(`[${t.name}] ${t.id} incomplete token response`, {
        hasAthlete: !!athlete?.id,
        hasAccess: !!data?.access_token,
        hasRefresh: !!data?.refresh_token,
      });
      return redirectToError(req, 'invalid_token_response');
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (err) {
      console.error(`[${t.name}] ${t.id} supabase client`, err instanceof Error ? err.message : err);
      return redirectToError(req, 'server_misconfigured', ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE']);
    }

    const { data: riderRow, error: rErr } = await supabase
      .from('riders')
      .upsert({
        strava_athlete_id: athlete.id,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        profile: athlete.profile,
        consent_public: !!state?.consent_public,
        consent_public_at: state?.consent_public ? new Date().toISOString() : null,
      }, { onConflict: 'strava_athlete_id' })
      .select('id, strava_athlete_id')
      .single();

    if (rErr || !riderRow) {
      console.error(`[${t.name}] ${t.id} rider upsert`, rErr?.message);
      if (isFetchFailureMessage(rErr?.message)) return redirectToError(req, 'session_store_unreachable');
      return redirectToError(req, 'rider_upsert_failed');
    }

    const expiresSeconds =
      typeof data.expires_at === 'number'
        ? data.expires_at
        : Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 21600);
    const expires_at = new Date(expiresSeconds * 1000).toISOString();
    const { error: tokenErr } = await supabase.from('oauth_tokens').upsert({
      rider_id: riderRow.id,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at,
    }, { onConflict: 'rider_id' });

    if (tokenErr) {
      console.error(`[${t.name}] ${t.id} token upsert`, tokenErr.message);
      if (isFetchFailureMessage(tokenErr.message)) return redirectToError(req, 'session_store_unreachable');
      return redirectToError(req, 'token_store_failed');
    }

    const path = successRedirectPath(state?.next);
    const res = NextResponse.redirect(new URL(path, req.url));
    const cookieBase = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    res.cookies.set('RID', riderRow.id, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });
    res.cookies.set('rider_id', riderRow.id, { ...cookieBase, maxAge: 60 * 60 * 24 * 365 });
    res.headers.set('x-trace-id', t.id);
    res.headers.set('x-handler', t.name);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    console.error(`[${t.name}] ${t.id} unexpected`, message || err);
    if (isFetchFailureMessage(message) || /supabase|timeout/i.test(message)) {
      return redirectToError(req, 'session_store_unreachable');
    }
    return redirectToError(req, 'token_exchange_failed');
  } finally {
    console.timeEnd(`[${t.name}] ${t.id}`);
  }
}
