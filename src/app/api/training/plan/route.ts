import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { APIError } from '@anthropic-ai/sdk/error';

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

function validatePlanShape(plan: unknown): plan is Record<string, unknown> {
  if (!isRecord(plan)) return false;
  if (!Array.isArray(plan.days)) return false;
  return true;
}

/**
 * APIConnectionError / timeout / abort extend APIError but set status to undefined.
 * We were only branching on numeric status, so those became misleading generation_failed.
 */
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
    const { athleteData, inputs } = body;

    if (!athleteData || typeof athleteData !== 'object' || !inputs || typeof inputs !== 'object') {
      return NextResponse.json({ error: 'missing_data' }, { status: 400 });
    }

    const { ftp, weightLbs, hoursPerWeek, races } = inputs as {
      ftp?: number;
      weightLbs?: number;
      hoursPerWeek?: number;
      races?: { name: string; date: string; priority: string }[];
    };

    if (
      typeof ftp !== 'number' ||
      !Number.isFinite(ftp) ||
      typeof weightLbs !== 'number' ||
      !Number.isFinite(weightLbs) ||
      !Array.isArray(races) ||
      races.length === 0
    ) {
      return NextResponse.json({ error: 'invalid_inputs' }, { status: 400 });
    }

    const summaryIn =
      athleteData &&
      typeof athleteData === 'object' &&
      'summary' in athleteData &&
      athleteData.summary &&
      typeof athleteData.summary === 'object'
        ? (athleteData.summary as Record<string, unknown>)
        : {};

    const recentRides = Array.isArray(
      (athleteData as { recentRides?: unknown }).recentRides
    )
      ? (athleteData as { recentRides: unknown[] }).recentRides
      : [];

    const summary = {
      longestRideMinutes: Number(summaryIn.longestRideMinutes) || 0,
      longestRideName: summaryIn.longestRideName != null ? String(summaryIn.longestRideName) : '—',
      totalHours30d: Number(summaryIn.totalHours30d) || 0,
      rideCount30d: Number(summaryIn.rideCount30d) || 0,
    };

    const wtkg = (weightLbs * 0.453592).toFixed(1);
    const wkg = (ftp / parseFloat(wtkg)).toFixed(2);

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

    const raceList = races
      .map((r) => `- ${r.name} on ${r.date} (${r.priority} race)`)
      .join('\n');

    const hours =
      typeof hoursPerWeek === 'number' && Number.isFinite(hoursPerWeek) ? hoursPerWeek : 8;

    const prompt = `You are an expert MTB and gravel endurance coach. Build ONE weekly training plan for this athlete. Primary goal: Unbound 100–style durability and sustainable power.

ATHLETE DATA:
- FTP: ${ftp}w
- Weight: ${weightLbs}lbs (${wtkg}kg) → ${wkg} w/kg
- Available hours/week: ${hours}
- Longest recent ride: ${summary.longestRideMinutes} min (${summary.longestRideName})
- Volume last 30 days: ${summary.totalHours30d} hours across ${summary.rideCount30d} rides

RACE CALENDAR:
${raceList}

RECENT RIDES:
${ridesSummary || '(no rides in the last 30 days)'}

POWER ZONES (based on ${ftp}w FTP):
- Z1 Recovery: <${Math.round(ftp * 0.55)}w
- Z2 Endurance: ${Math.round(ftp * 0.56)}–${Math.round(ftp * 0.75)}w
- Z3 Tempo: ${Math.round(ftp * 0.76)}–${Math.round(ftp * 0.87)}w
- Z4 Sweet Spot: ${Math.round(ftp * 0.88)}–${Math.round(ftp * 0.94)}w
- Z5 Threshold: ${Math.round(ftp * 0.95)}–${Math.round(ftp * 1.05)}w
- Z6 VO2: >${Math.round(ftp * 1.06)}w

Rules:
- Include all 7 days (Monday through Sunday).
- Use zone labels: Z1, Z2, Z3, Z4, Z5, Z6, or Rest.
- day.type: rest | intervals | endurance | long | mtb
- intervals: empty array on rest/easy days; otherwise specific watt targets and durations.
- fuelingNote: string or null per day.
- insights: 1–4 items with type positive | warning | critical.

Call ${SUBMIT_PLAN_TOOL} with the full plan. Do not reply with plain text only.`;

    const message = await anthropic.messages.create({
      model,
      max_tokens: 8192,
      tools: [trainingPlanTool],
      tool_choice: { type: 'tool', name: SUBMIT_PLAN_TOOL },
      messages: [{ role: 'user', content: prompt }],
    });

    if (!Array.isArray(message.content)) {
      console.error('[training/plan] Missing message.content', message);
      return NextResponse.json({ error: 'bad_api_response' }, { status: 502 });
    }

    const toolBlock = message.content.find(
      (b): b is Anthropic.Messages.ToolUseBlock =>
        b.type === 'tool_use' && b.name === SUBMIT_PLAN_TOOL
    );

    let plan: unknown;

    if (toolBlock) {
      plan = toolBlock.input;
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
        plan = parsePlanJson(rawText);
      } catch (e) {
        console.error('[training/plan] JSON parse failed:', e, rawText.slice(0, 500));
        return NextResponse.json({ error: 'invalid_model_json' }, { status: 502 });
      }
    }

    if (!validatePlanShape(plan)) {
      console.error('[training/plan] Plan failed validation:', JSON.stringify(plan).slice(0, 400));
      return NextResponse.json({ error: 'invalid_plan_shape' }, { status: 502 });
    }

    return NextResponse.json({ plan });
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
