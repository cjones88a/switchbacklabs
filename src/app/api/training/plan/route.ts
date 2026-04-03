import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { athleteData, inputs } = body;

    if (!athleteData || !inputs) {
      return NextResponse.json({ error: 'missing_data' }, { status: 400 });
    }

    const { ftp, weightLbs, hoursPerWeek, races } = inputs;
    const wtkg = weightLbs ? (weightLbs * 0.453592).toFixed(1) : null;
    const wkg = ftp && wtkg ? (ftp / parseFloat(wtkg)).toFixed(2) : null;

    // build a concise activity summary for the prompt
    const ridesSummary = athleteData.recentRides
      .slice(0, 10)
      .map((r: {
        name: string;
        durationMin: number;
        avgWatts: number;
        npWatts: number | null;
        devicePower: boolean;
        sportType: string;
      }) =>
        `- ${r.name}: ${r.durationMin} min, ${r.avgWatts}w avg${r.npWatts ? ` / ${r.npWatts}w NP` : ''}${r.devicePower ? ' (power meter)' : ' (estimated)'} [${r.sportType}]`
      )
      .join('\n');

    const raceList = races
      .map((r: { name: string; date: string; priority: string }) =>
        `- ${r.name} on ${r.date} (${r.priority} race)`
      )
      .join('\n');

    const prompt = `You are an expert MTB and gravel endurance coach. Generate a detailed weekly training plan for this athlete.

ATHLETE DATA:
- FTP: ${ftp}w
- Weight: ${weightLbs}lbs (${wtkg}kg) → ${wkg} w/kg
- Available hours/week: ${hoursPerWeek}
- Longest recent ride: ${athleteData.summary.longestRideMinutes} min (${athleteData.summary.longestRideName})
- Volume last 30 days: ${athleteData.summary.totalHours30d} hours across ${athleteData.summary.rideCount30d} rides

RACE CALENDAR:
${raceList}

RECENT RIDES:
${ridesSummary}

POWER ZONES (based on ${ftp}w FTP):
- Z1 Recovery: <${Math.round(ftp * 0.55)}w
- Z2 Endurance: ${Math.round(ftp * 0.56)}–${Math.round(ftp * 0.75)}w
- Z3 Tempo: ${Math.round(ftp * 0.76)}–${Math.round(ftp * 0.87)}w
- Z4 Sweet Spot: ${Math.round(ftp * 0.88)}–${Math.round(ftp * 0.94)}w
- Z5 Threshold: ${Math.round(ftp * 0.95)}–${Math.round(ftp * 1.05)}w
- Z6 VO2: >${Math.round(ftp * 1.06)}w

Generate a response in this EXACT JSON format (no markdown, no prose outside the JSON):

{
  "summary": {
    "phase": "string (e.g. Base Build)",
    "weekNumber": 1,
    "totalHours": "string (e.g. 7-8h)",
    "keyFocus": "string (1-2 sentences)",
    "unboundTarget": "string (e.g. 185-210w for 7-8 hours)",
    "mainLimiter": "string (athlete's current biggest limiter)"
  },
  "days": [
    {
      "day": "Monday",
      "type": "rest|intervals|endurance|long|mtb",
      "title": "string",
      "duration": "string (e.g. 60 min or 3-4 hrs)",
      "zone": "Z1|Z2|Z3|Z4|Z5|Z6|Rest",
      "description": "string (2-3 sentences, specific and actionable)",
      "intervals": [
        {
          "label": "string (e.g. Warm-up, Interval 1)",
          "watts": "string (e.g. 243-256w)",
          "duration": "string (e.g. 15 min)",
          "note": "string (brief coaching cue)"
        }
      ],
      "fuelingNote": "string or null"
    }
  ],
  "insights": [
    {
      "type": "positive|warning|critical",
      "title": "string",
      "body": "string"
    }
  ],
  "nextWeekPreview": "string (1 sentence on what changes next week)"
}

Make intervals array empty [] for rest/easy days. Be specific with wattage targets. Focus on Unbound 100 durability as the primary goal.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    // strip any markdown fences
    const clean = rawText.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);

    return NextResponse.json({ plan });
  } catch (err) {
    console.error('Training plan generation error:', err);
    return NextResponse.json({ error: 'generation_failed' }, { status: 500 });
  }
}
