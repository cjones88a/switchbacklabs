'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── types ────────────────────────────────────────────────────────────────────

interface StravaData {
  athlete: {
    firstname: string;
    lastname: string;
    profile: string;
    weight: number;
  } | null;
  summary: {
    totalHours30d: number;
    rideCount30d: number;
    longestRideMinutes: number;
    longestRideName: string;
  };
  recentRides: {
    id: number;
    name: string;
    date: string;
    durationMin: number;
    avgWatts: number;
    npWatts: number | null;
    devicePower: boolean;
    avgHr: number | null;
    elevationM: number;
    sportType: string;
  }[];
}

interface Race {
  name: string;
  date: string;
  priority: 'A' | 'B';
}

interface Interval {
  label: string;
  watts: string;
  duration: string;
  note: string;
}

interface PlanDay {
  day: string;
  type: string;
  title: string;
  duration: string;
  zone: string;
  description: string;
  intervals: Interval[];
  fuelingNote: string | null;
}

interface PlanInsight {
  type: 'positive' | 'warning' | 'critical';
  title: string;
  body: string;
}

interface TrainingPlan {
  summary: {
    phase: string;
    weekNumber: number;
    totalHours: string;
    keyFocus: string;
    unboundTarget: string;
    mainLimiter: string;
  };
  days: PlanDay[];
  insights: PlanInsight[];
  nextWeekPreview: string;
}

// ── constants ────────────────────────────────────────────────────────────────

const ZONE_COLORS: Record<string, string> = {
  Z1: 'bg-slate-100 text-slate-600',
  Z2: 'bg-blue-50 text-blue-700',
  Z3: 'bg-green-50 text-green-700',
  Z4: 'bg-amber-50 text-amber-700',
  Z5: 'bg-orange-50 text-orange-700',
  Z6: 'bg-red-50 text-red-700',
  Rest: 'bg-slate-50 text-slate-500',
};

const ZONE_BAR: Record<string, string> = {
  Z1: 'bg-slate-300',
  Z2: 'bg-blue-400',
  Z3: 'bg-green-400',
  Z4: 'bg-amber-400',
  Z5: 'bg-orange-500',
  Z6: 'bg-red-500',
  Rest: 'bg-slate-200',
};

const ZONE_WIDTH: Record<string, string> = {
  Z1: 'w-1/6',
  Z2: 'w-2/6',
  Z3: 'w-3/6',
  Z4: 'w-4/6',
  Z5: 'w-5/6',
  Z6: 'w-full',
  Rest: 'w-0',
};

const INSIGHT_STYLES: Record<string, string> = {
  positive: 'border-green-200 bg-green-50',
  warning: 'border-amber-200 bg-amber-50',
  critical: 'border-red-200 bg-red-50',
};

const INSIGHT_DOT: Record<string, string> = {
  positive: 'bg-green-500',
  warning: 'bg-amber-400',
  critical: 'bg-red-500',
};

type PlanMode = 'simple' | 'detailed';

type SimpleMood = 'strong' | 'moderate' | 'tired';

interface SimpleIntervalRow {
  mood: SimpleMood;
  title: string;
  structure: string;
  watts: string;
  sessionTime: string;
  why: string;
}

function buildSimpleIntervalMenu(ftp: number): SimpleIntervalRow[] {
  const z2lo = Math.round(ftp * 0.6);
  const z2hi = Math.round(ftp * 0.78);
  const ssLo = Math.round(ftp * 0.88);
  const ssHi = Math.round(ftp * 0.95);
  const ssMid = Math.round(ftp * 0.915);
  const overUp = Math.round(ftp * 1.05);
  const tempoLo = Math.round(ftp * 0.76);
  const tempoHi = Math.round(ftp * 0.9);
  const vo2Lo = Math.round(ftp * 1.1);
  const vo2Hi = Math.round(ftp * 1.19);
  const punch = Math.round(ftp * 1.28);

  return [
    {
      mood: 'strong',
      title: 'Sweet spot blocks',
      structure: '2×20 min (or 2×15 while building)',
      watts: `${ssLo}–${ssHi}w`,
      sessionTime: '~60–75 min with warm-up / cool-down',
      why: 'High ROI for endurance: pushes FTP and efficiency without full threshold stress.',
    },
    {
      mood: 'strong',
      title: 'Threshold over-unders',
      structure: '3×12 min: each block = 3 min steady + 1 min over, repeat 3×',
      watts: `${ssMid}w steady / ${overUp}w over`,
      sessionTime: '~65–80 min total',
      why: 'Trains “recover while working” — useful on punchy climbs mid-race.',
    },
    {
      mood: 'moderate',
      title: 'Tempo cruise',
      structure: '3×15 min',
      watts: `${tempoLo}–${tempoHi}w`,
      sessionTime: '~55–70 min',
      why: 'Aerobic load without digging a deep hole. Good mid-week if you are not fully fresh.',
    },
    {
      mood: 'moderate',
      title: 'VO2 micro-intervals',
      structure: '6×3 min hard, 3 min easy',
      watts: `${vo2Lo}–${vo2Hi}w`,
      sessionTime: '~60 min',
      why: 'Short reps add up to real climbing power when you want something sharp, not long.',
    },
    {
      mood: 'tired',
      title: '30 / 30s',
      structure: '10×30 sec on, 30 sec easy',
      watts: `${punch}w+ (open hard, not a target to average)`,
      sessionTime: '~35–45 min with warm-up',
      why: 'Neuromuscular punch with little sustained fatigue — fine before a weekend long ride.',
    },
    {
      mood: 'tired',
      title: 'Optional: second Z2 instead',
      structure: 'Replace intervals with 45–75 min easy spin',
      watts: `${z2lo}–${z2hi}w if using power`,
      sessionTime: 'Flexible',
      why: 'If legs are cooked, bank easy volume instead of forcing quality.',
    },
  ];
}

function SimpleIntervalCard({ row }: { row: SimpleIntervalRow }) {
  const [open, setOpen] = useState(false);
  const moodLabel =
    row.mood === 'strong' ? 'Good legs' : row.mood === 'moderate' ? 'Moderate' : 'Low energy';
  const moodClass =
    row.mood === 'strong'
      ? 'bg-emerald-50 text-emerald-800'
      : row.mood === 'moderate'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-slate-100 text-slate-600';

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-md shrink-0 ${moodClass}`}>
          {moodLabel}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900">{row.title}</div>
          <div className="text-xs font-mono text-orange-600 font-semibold mt-1">{row.watts}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{row.structure}</div>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-300 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-zinc-50 text-sm text-zinc-600 leading-relaxed">
          <p className="mt-3">
            <span className="text-xs font-semibold text-zinc-500">Session length · </span>
            {row.sessionTime}
          </p>
          <p className="mt-2 text-xs">{row.why}</p>
        </div>
      )}
    </div>
  );
}

// ── sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-zinc-50 rounded-xl p-4">
      <div className="text-xs text-zinc-400 font-medium mb-1">{label}</div>
      <div className="text-2xl font-semibold text-zinc-900">{value}</div>
      {sub && <div className="text-xs text-zinc-400 mt-1">{sub}</div>}
    </div>
  );
}

function DayCard({ day }: { day: PlanDay }) {
  const [open, setOpen] = useState(day.type !== 'rest');
  const zoneColor = ZONE_COLORS[day.zone] ?? ZONE_COLORS.Rest;
  const barColor = ZONE_BAR[day.zone] ?? ZONE_BAR.Rest;
  const barWidth = ZONE_WIDTH[day.zone] ?? ZONE_WIDTH.Rest;

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-zinc-500">
            {day.day.slice(0, 3).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">{day.title}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{day.duration}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${zoneColor}`}>
            {day.zone}
          </span>
          <svg
            className={`w-4 h-4 text-zinc-300 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-zinc-50">
          <p className="text-sm text-zinc-600 leading-relaxed mt-3 mb-3">{day.description}</p>

          {day.intervals.length > 0 && (
            <div className="space-y-2 mb-3">
              {day.intervals.map((interval, i) => (
                <div key={i} className="bg-zinc-50 rounded-xl p-3">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-zinc-700">{interval.label}</span>
                    <span className="text-xs font-mono text-zinc-900 font-semibold">{interval.watts}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden mb-1.5">
                    <div className={`h-full rounded-full ${barColor} ${barWidth} transition-all`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{interval.duration}</span>
                    {interval.note && (
                      <span className="text-xs text-zinc-400 italic text-right max-w-[60%]">{interval.note}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {day.fuelingNote && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <div className="text-xs font-semibold text-amber-700 mb-1">Fueling</div>
              <p className="text-xs text-amber-700 leading-relaxed">{day.fuelingNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────────────

type AppState = 'loading' | 'unauthenticated' | 'setup' | 'generating' | 'plan' | 'simple_plan';

export default function TrainingPage() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [stravaData, setStravaData] = useState<StravaData | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [planMode, setPlanMode] = useState<PlanMode>('simple');

  // form inputs
  const [ftp, setFtp] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('8');
  const [races, setRaces] = useState<Race[]>([
    { name: 'Unbound 100', date: '2026-06-07', priority: 'A' },
  ]);
  const [newRaceName, setNewRaceName] = useState('');
  const [newRaceDate, setNewRaceDate] = useState('');
  const [newRacePriority, setNewRacePriority] = useState<'A' | 'B'>('B');

  // fetch strava data on mount
  useEffect(() => {
    async function fetchStrava() {
      try {
        const res = await fetch('/api/training/strava');
        if (res.status === 401) {
          setAppState('unauthenticated');
          return;
        }
        if (!res.ok) throw new Error('strava_error');
        const data = await res.json();
        setStravaData(data);
        // pre-fill weight from Strava if available
        if (data.athlete?.weight) {
          setWeightLbs(Math.round(data.athlete.weight * 2.20462).toString());
        }
        setAppState('setup');
      } catch {
        setError('Could not load your Strava data. Please try again.');
        setAppState('setup');
      }
    }
    fetchStrava();
  }, []);

  function showSimplePlan() {
    const f = parseInt(ftp, 10);
    if (!Number.isFinite(f) || f < 50 || f > 600) {
      setError('Enter a realistic FTP (watts) to see power targets.');
      return;
    }
    setError(null);
    setAppState('simple_plan');
  }

  function goSetupFromSimple() {
    setAppState('setup');
  }

  async function generatePlan() {
    if (!ftp || !weightLbs || races.length === 0) return;
    setAppState('generating');
    setError(null);
    try {
      const res = await fetch('/api/training/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteData: stravaData,
          inputs: {
            ftp: parseInt(ftp),
            weightLbs: parseFloat(weightLbs),
            hoursPerWeek: parseFloat(hoursPerWeek),
            races,
          },
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errType = (payload as { error?: string }).error;
        const errCode = (payload as { code?: string | number }).code;
        const errMsg = (payload as { message?: string; reason?: string }).message
          ?? (payload as { reason?: string }).reason;
        if (
          errType === 'server_misconfigured' ||
          errCode === 'missing_anthropic_key'
        ) {
          setError('Training plan is not configured on the server yet (API key). Contact the site owner.');
        } else if (errType === 'anthropic_connection') {
          setError(
            errMsg
              ? `Could not reach AI service: ${errMsg}`
              : 'Could not reach the AI service (network / TLS). Try again or check Vercel logs.'
          );
        } else if (errType === 'anthropic_api' && errCode === 401) {
          setError('AI service rejected the API key. Check Vercel env ANTHROPIC_API_KEY.');
        } else if (errType === 'anthropic_api' && (errCode === 404 || errCode === 400)) {
          setError('AI model or request was rejected. Set ANTHROPIC_MODEL on Vercel or contact support.');
        } else if (errType === 'anthropic_api') {
          setError(`AI service error (${String(errCode)}). Try again in a minute.`);
        } else if (
          errType === 'invalid_model_json' ||
          errType === 'invalid_plan_shape' ||
          errType === 'no_plan_in_response' ||
          errType === 'bad_api_response'
        ) {
          setError('The AI returned an unexpected format. Tap regenerate or try again in a moment.');
        } else if (errType === 'invalid_inputs') {
          setError('Check FTP, weight, and at least one race, then try again.');
        } else if (errType === 'generation_failed' && errMsg) {
          setError(`Plan failed: ${errMsg}`);
        } else {
          setError('Plan generation failed. Please try again.');
        }
        setAppState('setup');
        return;
      }
      const { plan: generatedPlan } = payload as { plan: TrainingPlan };
      setPlan(generatedPlan);
      setAppState('plan');
    } catch {
      setError('Plan generation failed. Please try again.');
      setAppState('setup');
    }
  }

  function addRace() {
    if (!newRaceName || !newRaceDate) return;
    setRaces([...races, { name: newRaceName, date: newRaceDate, priority: newRacePriority }]);
    setNewRaceName('');
    setNewRaceDate('');
  }

  function removeRace(i: number) {
    setRaces(races.filter((_, idx) => idx !== i));
  }

  const wkg =
    ftp && weightLbs
      ? (parseInt(ftp) / (parseFloat(weightLbs) * 0.453592)).toFixed(2)
      : null;

  // ── render: loading ──────────────────────────────────────────────────────

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-400">Loading your Strava data…</p>
        </div>
      </div>
    );
  }

  // ── render: not authenticated ────────────────────────────────────────────

  if (appState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Connect Strava</h1>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Connect your Strava account to get a personalized training plan built from your actual ride data.
          </p>
          <Link
            href="/api/strava/authorize?next=/training"
            className="block w-full bg-[#FC4C02] text-white text-sm font-semibold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Connect with Strava
          </Link>
          <Link href="/" className="block mt-4 text-xs text-zinc-400 hover:text-zinc-600">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ── render: generating ───────────────────────────────────────────────────

  if (appState === 'generating') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 border-2 border-zinc-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Building your plan</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Analyzing your Strava data and generating a personalized week…
          </p>
        </div>
      </div>
    );
  }

  // ── render: simple flexible menu (no AI) ────────────────────────────────

  if (appState === 'simple_plan') {
    const f = parseInt(ftp, 10);
    const menu = buildSimpleIntervalMenu(f);
    const z = {
      z2lo: Math.round(f * 0.6),
      z2hi: Math.round(f * 0.78),
    };
    const hours = parseFloat(hoursPerWeek) || 8;

    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-lg mx-auto px-4 py-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 mb-1 block">
                ← Switchback Labs
              </Link>
              <h1 className="text-xl font-bold text-zinc-900">Flexible week</h1>
              <p className="text-xs text-zinc-400 mt-0.5">FTP {f}w · ~{hours}h/week target</p>
            </div>
            <button
              type="button"
              onClick={goSetupFromSimple}
              className="text-xs text-zinc-400 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Edit FTP
            </button>
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl p-4 mb-5 shadow-sm">
            <p className="text-sm text-zinc-700 leading-relaxed">
              Flexible beats perfect: two quality sessions done consistently beat a rigid plan that falls apart by week three.
              For <span className="font-medium">2–4 hour</span> XCM / gravel / marathon MTB, rotate intervals that build{' '}
              <span className="font-medium">sustainable threshold</span> and the ability to{' '}
              <span className="font-medium">punch climbs</span> without blowing up.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
            <div className="text-xs font-semibold text-orange-800 mb-2">Weekly skeleton</div>
            <ul className="text-sm text-orange-900 space-y-2 leading-snug">
              <li>
                <span className="font-semibold">Tue–Fri (pick 2 days):</span> interval session — choose from the menu by how you feel.
              </li>
              <li>
                <span className="font-semibold">Weekend:</span> long Z2 ride{' '}
                <span className="font-mono text-xs">~2.5–4h @ {z.z2lo}–{z.z2hi}w</span> (feel-based is fine).
              </li>
              <li>
                <span className="font-semibold">Other day:</span> easy spin or MTB{' '}
                <span className="text-orange-800/90">60–90 min, no power target</span>.
              </li>
            </ul>
            <p className="text-xs text-orange-800/80 mt-3">
              If you only have ~{hours}h/week, protect the two quality sessions and keep everything else truly easy.
            </p>
          </div>

          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Interval menu</div>
          <p className="text-xs text-zinc-400 mb-3">Open a card before each session — pick by mood, not by calendar.</p>

          <div className="space-y-2 mb-3">
            <div className="text-[11px] font-semibold text-zinc-500 px-1">When you have legs</div>
            {menu.filter((r) => r.mood === 'strong').map((row) => (
              <SimpleIntervalCard key={row.title} row={row} />
            ))}
          </div>
          <div className="space-y-2 mb-3">
            <div className="text-[11px] font-semibold text-zinc-500 px-1">When you feel moderate</div>
            {menu.filter((r) => r.mood === 'moderate').map((row) => (
              <SimpleIntervalCard key={row.title} row={row} />
            ))}
          </div>
          <div className="space-y-2 mb-6">
            <div className="text-[11px] font-semibold text-zinc-500 px-1">When you&apos;re cooked</div>
            {menu.filter((r) => r.mood === 'tired').map((row) => (
              <SimpleIntervalCard key={row.title} row={row} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setPlanMode('detailed');
              goSetupFromSimple();
            }}
            className="w-full border border-zinc-200 text-zinc-600 text-sm font-medium py-3 rounded-2xl hover:bg-zinc-50 transition-colors"
          >
            Switch to detailed AI plan
          </button>
        </div>
      </div>
    );
  }

  // ── render: setup form ───────────────────────────────────────────────────

  if (appState === 'setup') {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-lg mx-auto px-4 py-8">

          {/* header */}
          <div className="mb-8">
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 mb-4 block">
              ← Switchback Labs
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900">Training Coach</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Flexible menu or a full AI week — Strava powers the detailed option.
            </p>
          </div>

          {/* strava summary */}
          {stravaData && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {stravaData.athlete?.profile && (
                  <img
                    src={stravaData.athlete.profile}
                    alt="profile"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    {stravaData.athlete?.firstname} {stravaData.athlete?.lastname}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#FC4C02]" />
                    <span className="text-xs text-zinc-400">Strava connected</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Last 30 days"
                  value={`${stravaData.summary.totalHours30d}h`}
                  sub={`${stravaData.summary.rideCount30d} rides`}
                />
                <StatCard
                  label="Longest ride"
                  value={`${Math.round(stravaData.summary.longestRideMinutes / 60 * 10) / 10}h`}
                  sub={stravaData.summary.longestRideName?.slice(0, 12) + '…'}
                />
                <StatCard
                  label="Activities"
                  value={stravaData.summary.rideCount30d.toString()}
                  sub="rides synced"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* form */}
          <div className="space-y-5">

            {/* ftp + weight */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900 mb-4">Your fitness</h2>
              {planMode === 'simple' && (
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                  For the flexible menu you only need FTP. Weight and races are used for the detailed AI plan.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">FTP (watts)</label>
                  <input
                    type="number"
                    value={ftp}
                    onChange={(e) => setFtp(e.target.value)}
                    placeholder="e.g. 270"
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Weight (lbs)</label>
                  <input
                    type="number"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                    placeholder="e.g. 185"
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>
              {wkg && (
                <div className="text-xs text-zinc-400 bg-zinc-50 rounded-lg px-3 py-2">
                  {wkg} w/kg — {parseFloat(wkg) >= 3.5 ? 'solid Cat 3 level' : parseFloat(wkg) >= 3.0 ? 'strong amateur' : 'developing base'}
                </div>
              )}
              <div className="mt-3">
                <label className="text-xs text-zinc-500 mb-1.5 block">Hours available per week</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="4"
                    max="15"
                    step="0.5"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    className="flex-1 accent-orange-500"
                  />
                  <span className="text-sm font-semibold text-zinc-900 w-10 text-right">
                    {hoursPerWeek}h
                  </span>
                </div>
              </div>
            </div>

            {/* plan style */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900">Plan style</h2>
              <label className="flex gap-3 items-start p-3 rounded-xl border border-zinc-100 cursor-pointer has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50/40 transition-colors">
                <input
                  type="radio"
                  name="planMode"
                  checked={planMode === 'simple'}
                  onChange={() => setPlanMode('simple')}
                  className="mt-1 accent-orange-500 shrink-0"
                />
                <div>
                  <div className="text-sm font-medium text-zinc-900">Keep it simple</div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Two quality sessions + Z2 rides. Pick intervals from a mood-based menu — no rigid day-by-day AI schedule.
                  </p>
                </div>
              </label>
              <label className="flex gap-3 items-start p-3 rounded-xl border border-zinc-100 cursor-pointer has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50/40 transition-colors">
                <input
                  type="radio"
                  name="planMode"
                  checked={planMode === 'detailed'}
                  onChange={() => setPlanMode('detailed')}
                  className="mt-1 accent-orange-500 shrink-0"
                />
                <div>
                  <div className="text-sm font-medium text-zinc-900">Detailed AI plan</div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Full week built from your Strava data, races, and FTP — more structured day cards.
                  </p>
                </div>
              </label>
            </div>

            {/* race calendar (detailed plan only) */}
            {planMode === 'detailed' && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900 mb-4">Race calendar</h2>
              <div className="space-y-2 mb-4">
                {races.map((race, i) => (
                  <div key={i} className="flex items-center gap-2 bg-zinc-50 rounded-xl px-3 py-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${race.priority === 'A' ? 'bg-orange-100 text-orange-700' : 'bg-zinc-200 text-zinc-500'}`}>
                      {race.priority}
                    </span>
                    <span className="text-sm text-zinc-800 flex-1">{race.name}</span>
                    <span className="text-xs text-zinc-400">{race.date}</span>
                    <button
                      onClick={() => removeRace(i)}
                      className="text-zinc-300 hover:text-red-400 transition-colors ml-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* add race */}
              <div className="border-t border-zinc-100 pt-4">
                <div className="text-xs text-zinc-400 mb-2">Add a race</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={newRaceName}
                    onChange={(e) => setNewRaceName(e.target.value)}
                    placeholder="Race name"
                    className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={newRaceDate}
                    onChange={(e) => setNewRaceDate(e.target.value)}
                    className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={newRacePriority}
                    onChange={(e) => setNewRacePriority(e.target.value as 'A' | 'B')}
                    className="border border-zinc-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="A">A race (peak for this)</option>
                    <option value="B">B race (race through)</option>
                  </select>
                  <button
                    onClick={addRace}
                    disabled={!newRaceName || !newRaceDate}
                    className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-30 hover:bg-zinc-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* primary action */}
            <button
              type="button"
              onClick={() => (planMode === 'simple' ? showSimplePlan() : generatePlan())}
              disabled={
                planMode === 'simple'
                  ? !ftp
                  : !ftp || !weightLbs || races.length === 0
              }
              className="w-full bg-[#FC4C02] text-white text-sm font-bold py-4 rounded-2xl disabled:opacity-30 hover:bg-orange-600 transition-colors shadow-sm"
            >
              {planMode === 'simple' ? 'Show my flexible plan' : 'Generate detailed plan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── render: plan ─────────────────────────────────────────────────────────

  if (appState === 'plan' && plan) {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const orderedDays = daysOfWeek
      .map((d) => plan.days.find((pd) => pd.day === d))
      .filter(Boolean) as PlanDay[];

    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-lg mx-auto px-4 py-8">

          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 mb-1 block">
                ← Switchback Labs
              </Link>
              <h1 className="text-xl font-bold text-zinc-900">Week {plan.summary.weekNumber}</h1>
              <p className="text-xs text-zinc-400">{plan.summary.phase}</p>
            </div>
            <button
              onClick={() => {
                setPlanMode('detailed');
                setAppState('setup');
              }}
              className="text-xs text-zinc-400 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Edit inputs
            </button>
          </div>

          <p className="text-xs text-zinc-400 mb-4">Detailed AI week · day-by-day schedule</p>

          {/* plan summary */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-4 mb-5 shadow-sm">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatCard label="Target volume" value={plan.summary.totalHours} />
              <StatCard label="Phase" value={plan.summary.phase} />
              <StatCard label="Week" value={`#${plan.summary.weekNumber}`} />
            </div>
            <div className="bg-zinc-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-zinc-500 mb-1">This week&apos;s focus</div>
              <p className="text-sm text-zinc-700 leading-relaxed">{plan.summary.keyFocus}</p>
            </div>
            {plan.summary.unboundTarget && (
              <div className="mt-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
                <div className="text-xs font-semibold text-orange-600 mb-1">Unbound target pace</div>
                <p className="text-sm text-orange-700">{plan.summary.unboundTarget}</p>
              </div>
            )}
          </div>

          {/* insights */}
          {plan.insights.length > 0 && (
            <div className="space-y-2 mb-5">
              {plan.insights.map((insight, i) => (
                <div
                  key={i}
                  className={`border rounded-2xl p-4 ${INSIGHT_STYLES[insight.type]}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${INSIGHT_DOT[insight.type]}`} />
                    <span className="text-xs font-semibold text-zinc-700">{insight.title}</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed pl-4">{insight.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* day selector pills */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {orderedDays.map((day) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(activeDay === day.day ? null : day.day)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  activeDay === day.day
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300'
                }`}
              >
                {day.day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* day cards */}
          <div className="space-y-3">
            {orderedDays
              .filter((day) => !activeDay || day.day === activeDay)
              .map((day) => (
                <DayCard key={day.day} day={day} />
              ))}
          </div>

          {/* next week preview */}
          {plan.nextWeekPreview && (
            <div className="mt-5 bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-zinc-400 mb-1">Next week</div>
              <p className="text-sm text-zinc-600">{plan.nextWeekPreview}</p>
            </div>
          )}

          {/* regenerate & flexible option */}
          <div className="mt-6 pb-8 space-y-3">
            <button
              type="button"
              onClick={generatePlan}
              className="w-full border border-zinc-200 text-zinc-600 text-sm font-medium py-3 rounded-2xl hover:bg-zinc-50 transition-colors"
            >
              Regenerate detailed plan
            </button>
            <button
              type="button"
              onClick={() => {
                setPlanMode('simple');
                setAppState('setup');
              }}
              className="w-full text-zinc-500 text-sm py-2 hover:text-zinc-700 transition-colors"
            >
              Prefer a flexible menu instead?
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
