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

type AppState = 'loading' | 'unauthenticated' | 'setup' | 'generating' | 'plan';

export default function TrainingPage() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [stravaData, setStravaData] = useState<StravaData | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);

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
      if (!res.ok) throw new Error('generation_failed');
      const { plan: generatedPlan } = await res.json();
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
              Powered by your Strava data + AI coaching
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

            {/* race calendar */}
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

            {/* generate button */}
            <button
              onClick={generatePlan}
              disabled={!ftp || !weightLbs || races.length === 0}
              className="w-full bg-[#FC4C02] text-white text-sm font-bold py-4 rounded-2xl disabled:opacity-30 hover:bg-orange-600 transition-colors shadow-sm"
            >
              Generate my training plan
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
              onClick={() => setAppState('setup')}
              className="text-xs text-zinc-400 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Edit inputs
            </button>
          </div>

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

          {/* regenerate */}
          <div className="mt-6 pb-8">
            <button
              onClick={generatePlan}
              className="w-full border border-zinc-200 text-zinc-600 text-sm font-medium py-3 rounded-2xl hover:bg-zinc-50 transition-colors"
            >
              Regenerate plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
