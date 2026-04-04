/** Minimal training context for /api/training/plan — two quick questions for the AI */

export const RACING_TYPE_OPTIONS = [
  { id: 'endurance', label: 'Endurance — long efforts, steady power' },
  { id: 'sprint', label: 'Sprint / punch — short hard efforts, attacks' },
  { id: 'both', label: 'Both' },
] as const;

export const COURSE_STYLE_OPTIONS = [
  { id: 'climbing', label: 'Climbing' },
  { id: 'flat', label: 'Flat' },
  { id: 'rolling', label: 'Rolling' },
  { id: 'mixed', label: 'All of the above' },
] as const;

export type RacingTypeId = (typeof RACING_TYPE_OPTIONS)[number]['id'];
export type CourseStyleId = (typeof COURSE_STYLE_OPTIONS)[number]['id'];

export interface TrainingGoalsPayload {
  racingType: RacingTypeId;
  courseStyle: CourseStyleId;
}

const RACING_IDS = new Set<string>(RACING_TYPE_OPTIONS.map((o) => o.id));
const COURSE_IDS = new Set<string>(COURSE_STYLE_OPTIONS.map((o) => o.id));

function labelById<T extends { id: string; label: string }>(options: readonly T[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

export function formatGoalsForPrompt(g: TrainingGoalsPayload): string {
  return `RACING CONTEXT (from athlete):
- Type of racing they care about: ${labelById(RACING_TYPE_OPTIONS, g.racingType)}
- Typical course style: ${labelById(COURSE_STYLE_OPTIONS, g.courseStyle)}`;
}

export function parseTrainingGoals(raw: unknown): TrainingGoalsPayload | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const racingType = o.racingType;
  const courseStyle = o.courseStyle;

  if (
    typeof racingType !== 'string' ||
    !RACING_IDS.has(racingType) ||
    typeof courseStyle !== 'string' ||
    !COURSE_IDS.has(courseStyle)
  ) {
    return null;
  }

  return {
    racingType: racingType as RacingTypeId,
    courseStyle: courseStyle as CourseStyleId,
  };
}

export function isGoalsFormComplete(f: { racingType: string; courseStyle: string }): boolean {
  return RACING_IDS.has(f.racingType) && COURSE_IDS.has(f.courseStyle);
}
