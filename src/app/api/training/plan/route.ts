import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { APIError } from '@anthropic-ai/sdk/error';
import { formatGoalsForPrompt, parseTrainingGoals } from '@/lib/trainingGoals';

export const runtime = 'nodejs';

/** Snapshot ID from Anthropic docs (stable); override with ANTHROPIC_MODEL. */
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

function parsePlanJson(rawText: string): unknown {
  const stripped = rawText.replace(/```json\s*|```/gi, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const start = stripped.indexOf('{');
    if (start === -1) throw new Error('no_json_start');
    let depth = 0;
    let end = -1;
    for (let i = start; i < stripped.length; i++) {
      const c = stripped[i];
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) throw new Error('unbalanced_json');
    return JSON.parse(stripped.slice(start, end + 1));
  }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function validateDetailedPlan(plan: unknown): plan is Record<string, unknown> {
  if (!isRecord(plan)) return false;
  if (!Array.isArray(plan.days)) return false;
  return true;
}

function validateFlexiblePlan(plan: unknown): plan is Record<string, unknown> {
  if (!isRecord(plan)) return false;
  if (!Array.isArray(plan.intervalMenu) || plan.intervalMenu.length < 3) return false;
  if (!Array.isArray(plan.weeklyRhythm) || plan.weeklyRhythm.length < 2) return false;
  if (typeof plan.philosophy !== 'string' || !plan.philosophy.trim()) return false;
  if (typeof plan.volumeGuidance !== 'string') return false;
  return true;
}

function isAnthropicTransportError(err: unknown): err is APIError {
  return err instanceof APIError;
}

const SDK_ERROR_NAMES = new Set([
  'APIError',
  'APIConnectionError',
  'APIConnectionTimeoutError',
  'APIUserAbortError',
  'AuthenticationError',
  'BadRequestError',
  'NotFoundError',
  'PermissionDeniedError',
  'RateLimitError',
  'InternalServerError',
  'UnprocessableEntityError',
  'ConflictError',
]);

function duckTypedSdkError(err: unknown): { status?: number; message: string } | null {
  if (typeof err !== 'object' || err === null || !(err instanceof Error)) return null;
  const name = err.constructor?.name ?? '';
  if (!SDK_ERROR_NAMES.has(name) && !name.includes('Anthropic')) return null;
  const statusRaw = (err as { status?: unknown }).status;
  const status = typeof statusRaw === 'number' ? statusRaw : undefined;
  return { status, message: err.message };
}

function formatUnknownError(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

const SUBMIT_PLAN_TOOL = 'submit_training_plan';
const FLEXIBLE_MENU_TOOL = 'submit_flexible_training_menu';

const trainingPlanTool = {
  name: SUBMIT_PLAN_TOOL,
  description:
    'Submit the complete weekly training plan. You must call this tool once with all fields filled from the athlete data and coaching instructions.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: true,
    required: ['summary', 'days', 'insights', 'nextWeekPreview'],
    properties: {
      summary: {
        type: 'object',
        additionalProperties: true,
        required: [
          'phase',
          'weekNumber',
          'totalHours',
          'keyFocus',
          'unboundTarget',
          'mainLimiter',
        ],
        properties: {
          phase: { type: 'string' },
          weekNumber: { type: 'number' },
          totalHours: { type: 'string' },
          keyFocus: { type: 'string' },
          unboundTarget: { type: 'string' },
          mainLimiter: { type: 'string' },
        },
      },
      days: {
        type: 'array',
        description:
          'Seven daily entries (Monday–Sunday). Each day: day, type, title, duration, zone, description, intervals (array, empty on rest), fuelingNote (string or null).',
        items: { type: 'object', additionalProperties: true },
      },
      insights: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: true,
          required: ['type', 'title', 'body'],
          properties: {
            type: { type: 'string', enum: ['positive', 'warning', 'critical'] },
            title: { type: 'string' },
            body: { type: 'string' },
          },
        },
      },
      nextWeekPreview: { type: 'string' },
    },
  },
};

const flexibleMenuTool = {
  name: FLEXIBLE_MENU_TOOL,
  description:
    'Submit a personalized flexible training menu: not a rigid day-by-day calendar, but a weekly rhythm plus interval options the athlete picks by feel.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: true,
    required: ['philosophy', 'weeklyRhythm', 'intervalMenu', 'volumeGuidance'],
    properties: {
      philosophy: {
        type: 'string',
        description: '2–4 sentences, specific to this athlete (Strava, races, limiters). Why flexible beats rigid for them.',
      },
      weeklyRhythm: {
        type: 'array',
        minItems: 2,
        description: '3–5 bullets: e.g. which days to slot 2 interval sessions, long Z2, easy day — phrased loosely not as orders.',
        items: {
          type: 'object',
          additionalProperties: true,
          required: ['heading', 'detail'],
          properties: {
            heading: { type: 'string' },
            detail: { type: 'string' },
          },
        },
      },
      intervalMenu: {
        type: 'array',
        minItems: 5,
        description:
          '5–8 distinct workouts. Each has mood strong|moderate|tired for "how you feel" picking. Use exact FTP-based watts.',
        items: {
          type: 'object',
          additionalProperties: true,
          required: ['mood', 'title', 'structure', 'watts', 'sessionTime', 'coachingNote'],
          properties: {
            mood: { type: 'string', enum: ['strong', 'moderate', 'tired'] },
            title: { type: 'string' },
            structure: { type: 'string' },
            watts: { type: 'string' },
            sessionTime: { type: 'string' },
            coachingNote: { type: 'string' },
            timeline: {
              type: 'array',
              minItems: 1,
              description:
                'REQUIRED for each workout: session segments in chronological order for the app chart. Each block: minutes (positive integer) and zone Z1–Z6 or Rest. Bar width = duration; bar height = relative intensity. Expand repeats into alternating work/recovery (e.g. 5×4min with 3min easy between → five 4-min work segments and four 3-min recovery segments unless you specify otherwise). Minutes should sum to sessionTime.',
              items: {
                type: 'object',
                additionalProperties: true,
                required: ['minutes', 'zone'],
                properties: {
                  minutes: { type: 'number' },
                  zone: { type: 'string', enum: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Rest'] },
                  label: { type: 'string', description: 'Optional short label e.g. Warm-up, Intervals, Cool-down' },
                },
              },
            },
          },
        },
      },
      volumeGuidance: {
        type: 'string',
        description: 'One short paragraph tying their stated hours/week to priorities (protect quality, etc.).',
      },
    },
  },
};

function normalizeAthleteData(raw: unknown): Record<string, unknown> {
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function buildContext(athleteData: Record<string, unknown>, ftp: number) {
  const summaryIn =
    'summary' in athleteData &&
    athleteData.summary &&
    typeof athleteData.summary === 'object'
      ? (athleteData.summary as Record<string, unknown>)
      : {};

  const recentRides = Array.isArray(athleteData.recentRides)
    ? (athleteData.recentRides as unknown[])
    : [];

  const summary = {
    longestRideMinutes: Number(summaryIn.longestRideMinutes) || 0,
    longestRideName: summaryIn.longestRideName != null ? String(summaryIn.longestRideName) : '—',
    totalHours30d: Number(summaryIn.totalHours30d) || 0,
    rideCount30d: Number(summaryIn.rideCount30d) || 0,
  };

  const ridesSummary = recentRides
    .slice(0, 10)
    .map((r: unknown) => {
      const row = r && typeof r === 'object' ? (r as Record<string, unknown>) : {};
      const name = String(row.name ?? 'Ride');
      const durationMin = Number(row.durationMin) || 0;
      const avgWatts = Number(row.avgWatts) || 0;
      const npWatts = row.npWatts != null ? Number(row.npWatts) : null;
      const devicePower = Boolean(row.devicePower);
      const sportType = String(row.sportType ?? '');
      return `- ${name}: ${durationMin} min, ${avgWatts}w avg${npWatts && Number.isFinite(npWatts) ? ` / ${npWatts}w NP` : ''}${devicePower ? ' (power meter)' : ' (estimated)'} [${sportType}]`;
    })
    .join('\n');

  const zoneLines = `POWER ZONES (based on ${ftp}w FTP):
- Z1 Recovery: <${Math.round(ftp * 0.55)}w
- Z2 Endurance: ${Math.round(ftp * 0.56)}–${Math.round(ftp * 0.75)}w
- Z3 Tempo: ${Math.round(ftp * 0.76)}–${Math.round(ftp * 0.87)}w
- Z4 Sweet Spot: ${Math.round(ftp * 0.88)}–${Math.round(ftp * 0.94)}w
- Z5 Threshold: ${Math.round(ftp * 0.95)}–${Math.round(ftp * 1.05)}w
- Z6 VO2: >${Math.round(ftp * 1.06)}w`;

  return { summary, ridesSummary, zoneLines };
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    console.error('[training/plan] ANTHROPIC_API_KEY is not set');
    return NextResponse.json(
      { error: 'server_misconfigured', code: 'missing_anthropic_key' },
      { status: 503 }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const body = await req.json();
    const planStyle = body.planStyle === 'simple' ? 'simple' : 'detailed';
    const athleteData = normalizeAthleteData(body.athleteData);
    const { inputs } = body;

    if (!inputs || typeof inputs !== 'object') {
      return NextResponse.json({ error: 'missing_data' }, { status: 400 });
    }

    const { ftp, weightLbs, hoursPerWeek, races, goals: goalsRaw } = inputs as {
      ftp?: number;
      weightLbs?: number;
      hoursPerWeek?: number;
      races?: { name: string; date: string; priority: string }[];
      goals?: unknown;
    };

    if (typeof ftp !== 'number' || !Number.isFinite(ftp) || ftp < 30 || ftp > 600) {
      return NextResponse.json({ error: 'invalid_inputs' }, { status: 400 });
    }

    const goals = parseTrainingGoals(goalsRaw);
    if (!goals) {
      return NextResponse.json({ error: 'invalid_inputs' }, { status: 400 });
    }
    const goalsBlock = formatGoalsForPrompt(goals);

    const raceList = Array.isArray(races)
      ? races.map((r) => `- ${r.name} on ${r.date} (${r.priority} race)`).join('\n')
      : '';

    const hours =
      typeof hoursPerWeek === 'number' && Number.isFinite(hoursPerWeek) ? hoursPerWeek : 8;

    const hasWeight = typeof weightLbs === 'number' && Number.isFinite(weightLbs) && weightLbs > 0;
    const wtkg = hasWeight ? (weightLbs * 0.453592).toFixed(1) : null;
    const wkg = hasWeight && wtkg ? (ftp / parseFloat(wtkg)).toFixed(2) : null;

    const { summary, ridesSummary, zoneLines } = buildContext(athleteData, ftp);

    if (planStyle === 'detailed') {
      if (!hasWeight || !Array.isArray(races) || races.length === 0) {
        return NextResponse.json({ error: 'invalid_inputs' }, { status: 400 });
      }
    }

    let prompt: string;
    let toolName: string;
    let tools: (typeof trainingPlanTool | typeof flexibleMenuTool)[];

    if (planStyle === 'simple') {
      const athleteLines =
        hasWeight && wkg
          ? `- FTP: ${ftp}w\n- Weight: ${weightLbs}lbs (${wtkg}kg) → ${wkg} w/kg`
          : `- FTP: ${ftp}w\n- Weight: not provided`;

      prompt = `You are an expert MTB and gravel endurance coach. This athlete wants a FLEXIBLE week — not a rigid day-by-day schedule.

They aim for roughly TWO quality interval sessions per week plus a couple of Z2 / easy rides, choosing workouts by how they feel. Racing context: ~2–4 hour events (XCM, gravel, marathon MTB).

${athleteLines}
- Available hours/week (target): ${hours}
- Longest recent ride: ${summary.longestRideMinutes} min (${summary.longestRideName})
- Volume last 30 days: ${summary.totalHours30d} hours across ${summary.rideCount30d} rides

${raceList ? `RACE CALENDAR:\n${raceList}\n` : 'RACE CALENDAR: none listed — infer general durability.\n'}

RECENT RIDES:
${ridesSummary || '(no rides in the last 30 days — keep prescriptions conservative and encourage consistency)'}

${goalsBlock}

${zoneLines}

Instructions:
- Weight racing type (endurance vs sprint vs both) and course style (climbing / flat / rolling / mixed) when choosing interval types, intensity, and coaching tone.
- Personalize using Strava data, volume, races, AND the racing context above.
- intervalMenu: 5–8 unique options; spread across moods strong, moderate, and tired. Include at least one "low energy" option that is truly easy or very short.
- Every intervalMenu item MUST include timeline[] (see tool schema): ordered { minutes, zone, optional label } matching the structure text; expand interval sets into alternating work/recovery blocks.
- Use concrete watt targets derived from their FTP (reference the zones above).
- weeklyRhythm: loose skeleton (e.g. "Tue–Fri pick two days for intervals") — not Monday=mandatory X.
- philosophy: warm, specific, anti-perfectionism.
- volumeGuidance: tie ${hours}h/week to protecting the two quality sessions.

Call ${FLEXIBLE_MENU_TOOL} once with the full object. No plain-text-only reply.`;

      toolName = FLEXIBLE_MENU_TOOL;
      tools = [flexibleMenuTool];
    } else {
      const weightLbsVal = weightLbs as number;
      prompt = `You are an expert MTB and gravel endurance coach. Build ONE weekly training plan for this athlete. Use their racing type and course style below to bias workouts (e.g. climbing courses → sustained climbing load; sprint focus → neuromuscular / short VO2; endurance → tempo and long Z2).

ATHLETE DATA:
- FTP: ${ftp}w
- Weight: ${weightLbsVal}lbs (${(weightLbsVal * 0.453592).toFixed(1)}kg) → ${(ftp / (weightLbsVal * 0.453592)).toFixed(2)} w/kg
- Available hours/week: ${hours}
- Longest recent ride: ${summary.longestRideMinutes} min (${summary.longestRideName})
- Volume last 30 days: ${summary.totalHours30d} hours across ${summary.rideCount30d} rides

${goalsBlock}

RACE CALENDAR:
${raceList}

RECENT RIDES:
${ridesSummary || '(no rides in the last 30 days)'}

${zoneLines}

Rules:
- Let racing type and course style influence workout selection, weekly distribution, and insights (e.g. flat + sprint → punchy repeats; endurance + climbing → longer sub-threshold and climbing-specific notes).
- Include all 7 days (Monday through Sunday).
- Use zone labels: Z1, Z2, Z3, Z4, Z5, Z6, or Rest.
- day.type: rest | intervals | endurance | long | mtb
- intervals: empty array on rest/easy days; otherwise specific watt targets and durations.
- fuelingNote: string or null per day.
- insights: 1–4 items with type positive | warning | critical.

Call ${SUBMIT_PLAN_TOOL} with the full plan. Do not reply with plain text only.`;

      toolName = SUBMIT_PLAN_TOOL;
      tools = [trainingPlanTool];
    }

    const message = await anthropic.messages.create({
      model,
      max_tokens: 8192,
      tools,
      tool_choice: { type: 'tool', name: toolName },
      messages: [{ role: 'user', content: prompt }],
    });

    if (!Array.isArray(message.content)) {
      console.error('[training/plan] Missing message.content', message);
      return NextResponse.json({ error: 'bad_api_response' }, { status: 502 });
    }

    const toolBlock = message.content.find(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use' && b.name === toolName
    );

    let payload: unknown;

    if (toolBlock) {
      payload = toolBlock.input;
    } else {
      const rawText = message.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('');
      if (!rawText.trim()) {
        console.error('[training/plan] No tool_use and no text; stop_reason=', message.stop_reason);
        return NextResponse.json({ error: 'no_plan_in_response' }, { status: 502 });
      }
      try {
        payload = parsePlanJson(rawText);
      } catch (e) {
        console.error('[training/plan] JSON parse failed:', e, rawText.slice(0, 500));
        return NextResponse.json({ error: 'invalid_model_json' }, { status: 502 });
      }
    }

    if (planStyle === 'simple') {
      if (!validateFlexiblePlan(payload)) {
        console.error('[training/plan] Flexible plan failed validation:', JSON.stringify(payload).slice(0, 400));
        return NextResponse.json({ error: 'invalid_plan_shape' }, { status: 502 });
      }
      return NextResponse.json({ planStyle: 'simple', flexiblePlan: payload });
    }

    if (!validateDetailedPlan(payload)) {
      console.error('[training/plan] Plan failed validation:', JSON.stringify(payload).slice(0, 400));
      return NextResponse.json({ error: 'invalid_plan_shape' }, { status: 502 });
    }

    return NextResponse.json({ planStyle: 'detailed', plan: payload });
  } catch (err) {
    if (isAnthropicTransportError(err)) {
      const code = err.status;
      if (typeof code === 'number') {
        console.error('[training/plan] Anthropic HTTP error:', code, err.message);
        return NextResponse.json({ error: 'anthropic_api', code }, { status: 502 });
      }
      console.error('[training/plan] Anthropic transport error (no status):', err.name, err.message);
      return NextResponse.json(
        {
          error: 'anthropic_connection',
          message: err.message.slice(0, 400),
        },
        { status: 503 }
      );
    }

    const duck = duckTypedSdkError(err);
    if (duck) {
      if (typeof duck.status === 'number') {
        return NextResponse.json({ error: 'anthropic_api', code: duck.status }, { status: 502 });
      }
      return NextResponse.json(
        { error: 'anthropic_connection', message: duck.message.slice(0, 400) },
        { status: 503 }
      );
    }

    const reason = formatUnknownError(err).slice(0, 400);
    console.error('[training/plan] Unexpected error:', err);
    return NextResponse.json({ error: 'generation_failed', reason }, { status: 500 });
  }
}
