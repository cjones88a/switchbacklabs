/** Parse / normalize power–time timeline for flexible interval menu cards */

export type TimelineZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Rest';

export interface TimelineSegment {
  minutes: number;
  zone: TimelineZone;
  label?: string;
}

/** Relative bar height (%) for each zone — time is encoded by flex-grow width */
export const TIMELINE_ZONE_HEIGHT_PCT: Record<TimelineZone, number> = {
  Rest: 14,
  Z1: 24,
  Z2: 34,
  Z3: 48,
  Z4: 62,
  Z5: 78,
  Z6: 92,
};

export const TIMELINE_ZONE_BAR: Record<TimelineZone, string> = {
  Rest: 'bg-slate-200',
  Z1: 'bg-slate-300',
  Z2: 'bg-blue-400',
  Z3: 'bg-green-400',
  Z4: 'bg-amber-400',
  Z5: 'bg-orange-500',
  Z6: 'bg-red-500',
};

function coerceZone(z: string | undefined): TimelineZone {
  const u = String(z || '').trim().toUpperCase();
  if (u === 'REST' || u === 'RECOVERY' || u === 'EASY') return 'Rest';
  if (u === 'Z1') return 'Z1';
  if (u === 'Z2') return 'Z2';
  if (u === 'Z3') return 'Z3';
  if (u === 'Z4') return 'Z4';
  if (u === 'Z5') return 'Z5';
  if (u === 'Z6') return 'Z6';
  return 'Z3';
}

export function parseModelTimeline(raw: unknown): TimelineSegment[] {
  if (!Array.isArray(raw)) return [];
  const out: TimelineSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const m = (item as { minutes?: unknown }).minutes;
    const zone = (item as { zone?: unknown }).zone;
    const label = (item as { label?: unknown }).label;
    const minutes = typeof m === 'number' ? m : typeof m === 'string' ? parseFloat(m) : NaN;
    if (!Number.isFinite(minutes) || minutes <= 0) continue;
    out.push({
      minutes: Math.max(1, Math.round(minutes)),
      zone: coerceZone(String(zone)),
      label: typeof label === 'string' && label.trim() ? label.trim() : undefined,
    });
  }
  return out;
}

function zoneFromWorkClause(clause: string): TimelineZone {
  if (/\(Z6\)|\bZ6\b/i.test(clause)) return 'Z6';
  if (/\(Z5\)|\bZ5\b|VO2|vo2/i.test(clause)) return 'Z5';
  if (/\(Z4\)|\bZ4\b|threshold|\bFTP\b|lactate/i.test(clause)) return 'Z4';
  if (/\(Z3\)|\bZ3\b|tempo|sweet/i.test(clause)) return 'Z3';
  if (/\(Z2\)|\bZ2\b/i.test(clause)) return 'Z2';
  if (/\(Z1\)|\bZ1\b/i.test(clause)) return 'Z1';
  if (/building\s+to\s+Z3/i.test(clause)) return 'Z3';
  if (/alternat/i.test(clause)) return 'Z4';
  return 'Z4';
}

function zoneFromRecoveryClause(clause: string): TimelineZone {
  if (/\bZ2\b/i.test(clause)) return 'Z2';
  if (/\bZ1\b|active\s+recovery/i.test(clause)) return 'Z1';
  return 'Rest';
}

function expandRepsBlock(clause: string): TimelineSegment[] | null {
  const m = clause.match(/(\d+)\s*[×x]\s*(\d+)\s*min/i);
  if (!m) return null;
  const reps = parseInt(m[1], 10);
  const workMin = parseInt(m[2], 10);
  if (reps < 1 || workMin < 1 || reps > 99 || workMin > 240) return null;

  const restMatch = clause.match(
    /(?:with\s+)?(\d+)\s*min\s*(?:easy|recovery|Z1|Z2|active\s+recovery)(?:\s*between)?/i
  );
  const restMin = restMatch ? parseInt(restMatch[1], 10) : 0;
  const workZone = zoneFromWorkClause(clause);
  const restZone = zoneFromRecoveryClause(clause);
  const segs: TimelineSegment[] = [];
  for (let i = 0; i < reps; i++) {
    segs.push({ minutes: workMin, zone: workZone });
    if (restMin > 0 && i < reps - 1) segs.push({ minutes: restMin, zone: restZone });
  }
  return segs;
}

function singleMinuteClause(clause: string): TimelineSegment | null {
  const trimmed = clause.trim();
  if (!trimmed) return null;
  if (expandRepsBlock(trimmed)) return null;

  const dm = trimmed.match(/(\d+)\s*(?:min|minutes)\b/i);
  if (!dm) return null;
  const minutes = parseInt(dm[1], 10);
  if (minutes < 1 || minutes > 480) return null;

  let zone: TimelineZone;
  let label: string | undefined;
  if (/warm-?up|warm up/i.test(trimmed)) {
    zone = /Z1|Z2/i.test(trimmed) ? (/\bZ1\b/i.test(trimmed) ? 'Z1' : 'Z2') : 'Z2';
    label = 'Warm-up';
  } else if (/cool|cool-?down/i.test(trimmed)) {
    zone = zoneFromRecoveryClause(trimmed);
    label = 'Cool-down';
  } else if (/\beasy\b|recovery|\bbetween\b|active\s+recovery/i.test(trimmed)) {
    zone = zoneFromRecoveryClause(trimmed);
  } else {
    zone = zoneFromWorkClause(trimmed);
  }

  return { minutes, zone, label };
}

/** Best-effort timeline from free-text structure (comma-separated clauses). */
export function parseStructureTimeline(structure: string): TimelineSegment[] | null {
  const parts = structure
    .split(/,\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: TimelineSegment[] = [];
  for (const part of parts) {
    const expanded = expandRepsBlock(part);
    if (expanded && expanded.length) {
      out.push(...expanded);
      continue;
    }
    const one = singleMinuteClause(part);
    if (one) out.push(one);
  }
  return out.length ? out : null;
}

export function resolveFlexibleTimeline(row: {
  structure: string;
  timeline?: unknown;
}): TimelineSegment[] {
  const model = parseModelTimeline(row.timeline);
  if (model.length > 0) return model;
  return parseStructureTimeline(row.structure) ?? [];
}

export function totalTimelineMinutes(segments: TimelineSegment[]): number {
  return segments.reduce((a, s) => a + s.minutes, 0);
}
