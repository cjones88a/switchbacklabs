/** CSV download + helpers for /training plan export (Excel-friendly) */

function csvCell(s: string): string {
  const t = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[",\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

export function downloadCsv(filename: string, csv: string): void {
  const bom = '\ufeff';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function row(cells: string[]): string {
  return cells.map(csvCell).join(',') + '\r\n';
}

export interface DetailedPlanLike {
  summary: {
    phase: string;
    weekNumber: number;
    totalHours: string;
    keyFocus: string;
    unboundTarget?: string;
    mainLimiter?: string;
  };
  days: Array<{
    day: string;
    type: string;
    title: string;
    duration: string;
    zone: string;
    description: string;
    intervals: Array<{ label: string; watts: string; duration: string; note: string }>;
    fuelingNote: string | null;
  }>;
  insights: Array<{ type: string; title: string; body: string }>;
  nextWeekPreview?: string;
}

export function detailedPlanToCsv(plan: DetailedPlanLike): string {
  const lines: string[] = [];
  lines.push(row(['Section', 'Field', 'Value']));
  lines.push(row(['Summary', 'Phase', plan.summary.phase]));
  lines.push(row(['Summary', 'Week', String(plan.summary.weekNumber)]));
  lines.push(row(['Summary', 'Target volume', plan.summary.totalHours]));
  lines.push(row(['Summary', 'Key focus', plan.summary.keyFocus]));
  if (plan.summary.unboundTarget)
    lines.push(row(['Summary', 'Unbound target', plan.summary.unboundTarget]));
  if (plan.summary.mainLimiter)
    lines.push(row(['Summary', 'Main limiter', plan.summary.mainLimiter]));
  lines.push(row([]));

  lines.push(row(['Insights', 'Type', 'Title', 'Body']));
  for (const i of plan.insights) {
    lines.push(row(['Insight', i.type, i.title, i.body]));
  }
  lines.push(row([]));

  lines.push(
    row([
      'Day',
      'Type',
      'Title',
      'Duration',
      'Zone',
      'Description',
      'Intervals',
      'Fueling note',
    ])
  );
  for (const d of plan.days) {
    const intText = d.intervals
      .map((x) => `${x.label}: ${x.watts} ${x.duration}${x.note ? ` (${x.note})` : ''}`)
      .join(' | ');
    lines.push(
      row([
        d.day,
        d.type,
        d.title,
        d.duration,
        d.zone,
        d.description,
        intText,
        d.fuelingNote ?? '',
      ])
    );
  }
  lines.push(row([]));
  if (plan.nextWeekPreview) {
    lines.push(row(['Next week preview', '', plan.nextWeekPreview]));
  }
  return lines.join('');
}

export interface FlexiblePlanLike {
  philosophy: string;
  weeklyRhythm: Array<{ heading: string; detail: string }>;
  intervalMenu: Array<{
    mood: string;
    title: string;
    structure: string;
    watts: string;
    sessionTime: string;
    coachingNote: string;
  }>;
  volumeGuidance: string;
}

export function flexiblePlanToCsv(plan: FlexiblePlanLike, meta: { ftp: number; hoursPerWeek: number }): string {
  const lines: string[] = [];
  lines.push(row(['Flexible training menu', '', '']));
  lines.push(row(['FTP (w)', String(meta.ftp), '']));
  lines.push(row(['Hours / week (target)', String(meta.hoursPerWeek), '']));
  lines.push(row([]));
  lines.push(row(['Philosophy', '', plan.philosophy]));
  lines.push(row([]));
  lines.push(row(['Weekly rhythm', 'Heading', 'Detail']));
  for (const r of plan.weeklyRhythm) {
    lines.push(row(['', r.heading, r.detail]));
  }
  lines.push(row([]));
  lines.push(row(['Volume guidance', '', plan.volumeGuidance]));
  lines.push(row([]));
  lines.push(row(['Mood', 'Title', 'Structure', 'Watts', 'Session length', 'Coaching note']));
  for (const m of plan.intervalMenu) {
    lines.push(
      row([m.mood, m.title, m.structure, m.watts, m.sessionTime, m.coachingNote])
    );
  }
  return lines.join('');
}

export function exportFilename(prefix: string): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${prefix}-${y}-${mo}-${day}.csv`;
}
