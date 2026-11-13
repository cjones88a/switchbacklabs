import type { LeaderboardRow } from "@/components/leaderboard/LeaderboardTable";

/**
 * Portfolio demo for /race-trackingV2.
 * Riders and times are fictional. The page must not call Strava or a database.
 */
export const RACE_TRACKER_MODE = "demo" as const;

export type DemoAttempt = {
  race_year: number;
  season_name: string;
  season_year: number;
  activity_id: number;
  main_ms: number;
  climb_sum_ms: number | null;
  desc_sum_ms: number | null;
  created_at: string;
};

const sec = (minutes: number, seconds = 0) => (minutes * 60 + seconds) * 1000;

type SeasonTimes = { main: number; climb: number; desc: number };

function row(
  name: string,
  seasons: {
    fall?: SeasonTimes;
    winter?: SeasonTimes;
    spring?: SeasonTimes;
    summer?: SeasonTimes;
  }
): LeaderboardRow {
  const pick = (s: SeasonTimes | undefined, key: keyof SeasonTimes) => (s ? s[key] : null);
  const mains = [seasons.fall, seasons.winter, seasons.spring, seasons.summer].filter(Boolean) as SeasonTimes[];
  const sum = (key: keyof SeasonTimes) => mains.reduce((total, s) => total + s[key], 0);
  return {
    rider: { name, avatar: null },
    fall_ms: pick(seasons.fall, "main"),
    winter_ms: pick(seasons.winter, "main"),
    spring_ms: pick(seasons.spring, "main"),
    summer_ms: pick(seasons.summer, "main"),
    fall_climb_ms: pick(seasons.fall, "climb"),
    winter_climb_ms: pick(seasons.winter, "climb"),
    spring_climb_ms: pick(seasons.spring, "climb"),
    summer_climb_ms: pick(seasons.summer, "climb"),
    fall_desc_ms: pick(seasons.fall, "desc"),
    winter_desc_ms: pick(seasons.winter, "desc"),
    spring_desc_ms: pick(seasons.spring, "desc"),
    summer_desc_ms: pick(seasons.summer, "desc"),
    total_ms: sum("main"),
    climb_sum_ms: sum("climb"),
    desc_sum_ms: sum("desc"),
  };
}

const t = (mainMin: number, mainSec: number, climbMin: number, descMin: number): SeasonTimes => ({
  main: sec(mainMin, mainSec),
  climb: sec(climbMin),
  desc: sec(descMin),
});

export const DEMO_LEADERBOARDS: Record<number, LeaderboardRow[]> = {
  2026: [
    row("Jordan Hale", { fall: t(54, 12, 21, 14), winter: t(56, 40, 22, 15) }),
    row("Sam Okonkwo", { fall: t(55, 5, 20, 15), winter: t(57, 18, 23, 14) }),
    row("Riley Chen", { fall: t(58, 44, 24, 16), winter: t(57, 2, 22, 15) }),
    row("Casey Nguyen", { fall: t(61, 10, 25, 17) }),
    row("Avery Brooks", { winter: t(59, 33, 23, 16) }),
  ],
  2025: [
    row("Morgan Ellis", {
      fall: t(52, 48, 19, 13),
      winter: t(54, 6, 20, 14),
      spring: t(51, 55, 19, 13),
      summer: t(53, 20, 20, 14),
    }),
    row("Jordan Hale", {
      fall: t(55, 30, 21, 15),
      winter: t(56, 12, 22, 14),
      spring: t(54, 40, 21, 14),
      summer: t(55, 5, 21, 15),
    }),
    row("Quinn Patel", {
      fall: t(57, 15, 23, 16),
      winter: t(58, 50, 24, 16),
      spring: t(56, 28, 22, 15),
      summer: t(59, 4, 24, 17),
    }),
    row("Riley Chen", {
      fall: t(60, 2, 25, 17),
      winter: t(61, 40, 26, 18),
      spring: t(58, 15, 24, 16),
      summer: t(57, 48, 23, 16),
    }),
  ],
  2024: [
    row("Sam Okonkwo", {
      fall: t(56, 20, 22, 15),
      winter: t(58, 5, 23, 16),
      spring: t(55, 44, 21, 15),
      summer: t(57, 10, 22, 15),
    }),
    row("Drew Alvarez", {
      fall: t(63, 18, 27, 18),
      winter: t(64, 2, 28, 19),
      spring: t(61, 50, 26, 18),
      summer: t(62, 33, 26, 18),
    }),
  ],
};

export const DEMO_YEARS = Object.keys(DEMO_LEADERBOARDS)
  .map(Number)
  .sort((a, b) => b - a);

/** Sample history shown on the My Times tab. Not a real athlete. */
export const DEMO_MY_TIMES: DemoAttempt[] = [
  attempt(2026, "FALL", 2025, 9001001, t(54, 12, 21, 14), "2025-10-04T15:10:00Z"),
  attempt(2026, "WINTER", 2025, 9001002, t(56, 40, 22, 15), "2026-01-18T16:02:00Z"),
  attempt(2025, "FALL", 2024, 9000901, t(55, 30, 21, 15), "2024-10-12T15:40:00Z"),
  attempt(2025, "WINTER", 2024, 9000902, t(56, 12, 22, 14), "2025-01-11T16:20:00Z"),
  attempt(2025, "SPRING", 2025, 9000903, t(54, 40, 21, 14), "2025-04-19T15:05:00Z"),
  attempt(2025, "SUMMER", 2025, 9000904, t(55, 5, 21, 15), "2025-07-06T14:48:00Z"),
];

function attempt(
  raceYear: number,
  season: string,
  seasonYear: number,
  activityId: number,
  times: SeasonTimes,
  createdAt: string
): DemoAttempt {
  return {
    race_year: raceYear,
    season_name: season,
    season_year: seasonYear,
    activity_id: activityId,
    main_ms: times.main,
    climb_sum_ms: times.climb,
    desc_sum_ms: times.desc,
    created_at: createdAt,
  };
}
