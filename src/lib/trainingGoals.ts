/** Shared training questionnaire — options, validation, and prompt text for /api/training/plan */

export const PRIMARY_GOAL_OPTIONS = [
  { id: 'climbing', label: 'Get faster at climbing' },
  { id: 'endurance', label: 'Build endurance for long races' },
  { id: 'pacing', label: 'Improve race-day pacing' },
  { id: 'fit_fun', label: 'Just stay fit and have fun' },
] as const;

export const RACE_SECOND_HALF_OPTIONS = [
  { id: 'strong', label: 'Strong — I negative split or hold steady' },
  { id: 'fade', label: 'Fade but manageable — lose a little time' },
  { id: 'blow_up', label: 'Blow up — fall apart after hour 2' },
  { id: 'unknown', label: "Haven't raced enough to know" },
] as const;

export const LIMITER_OPTIONS = [
  { id: 'climbing', label: 'Climbing — I lose time going up' },
  { id: 'sustained', label: 'Sustained power — hard to hold pace for hours' },
  { id: 'punchy', label: 'Punchy efforts — attacks and technical sections' },
  { id: 'descending', label: 'Descending / technical skills' },
] as const;

export const STRUCTURE_PREF_OPTIONS = [
  { id: 'flexible', label: 'Very flexible — give me options to choose from' },
  { id: 'loose', label: 'Loosely structured — a weekly template I can move around' },
  { id: 'full', label: 'Fully structured — tell me exactly what to do each day' },
] as const;

export const WEEK_HABIT_OPTIONS = [
  { id: 'trainer_zwift', label: '2+ rides on a trainer or Zwift' },
  { id: 'outdoor_mtb', label: 'Regular outdoor MTB rides' },
  { id: 'outdoor_gravel', label: 'Regular outdoor gravel rides' },
  { id: 'gym_strength', label: 'Gym or strength work' },
  { id: 'trail_run_xt', label: 'Trail running or cross-training' },
  { id: 'inconsistent', label: 'Pretty inconsistent right now' },
] as const;

export type PrimaryGoalId = (typeof PRIMARY_GOAL_OPTIONS)[number]['id'];
export type RaceSecondHalfId = (typeof RACE_SECOND_HALF_OPTIONS)[number]['id'];
export type LimiterId = (typeof LIMITER_OPTIONS)[number]['id'];
export type StructurePrefId = (typeof STRUCTURE_PREF_OPTIONS)[number]['id'];
export type WeekHabitId = (typeof WEEK_HABIT_OPTIONS)[number]['id'];

export interface TrainingGoalsPayload {
  primaryGoal: PrimaryGoalId;
  raceSecondHalf: RaceSecondHalfId;
  limiter: LimiterId;
  structurePref: StructurePrefId;
  weekHabits: WeekHabitId[];
}

const PRIMARY_IDS = new Set<string>(PRIMARY_GOAL_OPTIONS.map((o) => o.id));
const RACE_IDS = new Set<string>(RACE_SECOND_HALF_OPTIONS.map((o) => o.id));
const LIMITER_IDS = new Set<string>(LIMITER_OPTIONS.map((o) => o.id));
const STRUCTURE_IDS = new Set<string>(STRUCTURE_PREF_OPTIONS.map((o) => o.id));
const HABIT_IDS = new Set<string>(WEEK_HABIT_OPTIONS.map((o) => o.id));

function labelById<T extends { id: string; label: string }>(options: readonly T[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

export function formatGoalsForPrompt(g: TrainingGoalsPayload): string {
  const habits = g.weekHabits.map((id) => labelById(WEEK_HABIT_OPTIONS, id));
  return `ATHLETE GOALS (from questionnaire):
- Primary goal right now: ${labelById(PRIMARY_GOAL_OPTIONS, g.primaryGoal)}
- How they feel in the back half of a race: ${labelById(RACE_SECOND_HALF_OPTIONS, g.raceSecondHalf)}
- Biggest limiter on the bike: ${labelById(LIMITER_OPTIONS, g.limiter)}
- How structured they want training: ${labelById(STRUCTURE_PREF_OPTIONS, g.structurePref)}
- Typical training week (check all that applied): ${habits.join('; ')}`;
}

export function parseTrainingGoals(raw: unknown): TrainingGoalsPayload | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const primaryGoal = o.primaryGoal;
  const raceSecondHalf = o.raceSecondHalf;
  const limiter = o.limiter;
  const structurePref = o.structurePref;
  const weekHabits = o.weekHabits;

  if (
    typeof primaryGoal !== 'string' ||
    !PRIMARY_IDS.has(primaryGoal) ||
    typeof raceSecondHalf !== 'string' ||
    !RACE_IDS.has(raceSecondHalf) ||
    typeof limiter !== 'string' ||
    !LIMITER_IDS.has(limiter) ||
    typeof structurePref !== 'string' ||
    !STRUCTURE_IDS.has(structurePref) ||
    !Array.isArray(weekHabits) ||
    weekHabits.length === 0
  ) {
    return null;
  }

  const habits: WeekHabitId[] = [];
  for (const h of weekHabits) {
    if (typeof h !== 'string' || !HABIT_IDS.has(h)) return null;
    if (!habits.includes(h as WeekHabitId)) habits.push(h as WeekHabitId);
  }

  return {
    primaryGoal: primaryGoal as PrimaryGoalId,
    raceSecondHalf: raceSecondHalf as RaceSecondHalfId,
    limiter: limiter as LimiterId,
    structurePref: structurePref as StructurePrefId,
    weekHabits: habits,
  };
}

export function isGoalsFormComplete(f: {
  primaryGoal: string;
  raceSecondHalf: string;
  limiter: string;
  structurePref: string;
  weekHabits: string[];
}): boolean {
  return (
    PRIMARY_IDS.has(f.primaryGoal) &&
    RACE_IDS.has(f.raceSecondHalf) &&
    LIMITER_IDS.has(f.limiter) &&
    STRUCTURE_IDS.has(f.structurePref) &&
    f.weekHabits.length > 0 &&
    f.weekHabits.every((id) => HABIT_IDS.has(id))
  );
}
