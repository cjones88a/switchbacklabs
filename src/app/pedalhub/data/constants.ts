/**
 * PedalHub Phase 1 — shared constants and sample data.
 * Auth-ready: ride/bike types include optional user_id for future Supabase.
 */

export type Discipline = "mountain" | "road" | "gravel";

export const DISCIPLINES: Record<
  Discipline,
  { label: string; icon: string; color: string; accent: string; bg: string }
> = {
  mountain: {
    label: "Mountain",
    icon: "⛰️",
    color: "#2d6a4f",
    accent: "#40916c",
    bg: "rgba(45,106,79,0.08)",
  },
  road: {
    label: "Road",
    icon: "🛣️",
    color: "#1d3557",
    accent: "#457b9d",
    bg: "rgba(29,53,87,0.08)",
  },
  gravel: {
    label: "Gravel",
    icon: "🪨",
    color: "#7f5539",
    accent: "#b08968",
    bg: "rgba(127,85,57,0.08)",
  },
};

export interface Ride {
  id: string;
  name: string;
  discipline: Discipline;
  date: string;
  distance: number;
  elevation: number;
  duration: string;
  avgSpeed: number;
  hr?: number;
  calories: number;
  notes?: string;
  rating: number;
  source: "manual" | "gpx" | "strava" | "garmin" | "wahoo";
  userId?: string; // auth-ready
}

export interface RouteInfo {
  id: string;
  name: string;
  discipline: Discipline;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  distance: number;
  elevation: number;
  estimatedMinutes: number;
  features: string[];
  rating: number;
  /** GeoJSON LineString [lng, lat][] for Mapbox */
  coordinates: [number, number][];
}

// Fort Collins area center
export const PEDALHUB_CENTER: [number, number] = [-105.0844, 40.5853];

export const SAMPLE_RIDES: Ride[] = [
  {
    id: "1",
    name: "Horsetooth Loop",
    discipline: "mountain",
    date: "2026-03-02",
    distance: 18.4,
    elevation: 2100,
    duration: "2:15:00",
    avgSpeed: 8.2,
    hr: 152,
    calories: 1240,
    notes: "Chunky descent was mint",
    rating: 5,
    source: "manual",
  },
  {
    id: "2",
    name: "Highway 14 Out & Back",
    discipline: "road",
    date: "2026-03-01",
    distance: 42.6,
    elevation: 1800,
    duration: "1:52:00",
    avgSpeed: 22.8,
    hr: 145,
    calories: 1580,
    notes: "Strong headwind coming back",
    rating: 4,
    source: "manual",
  },
  {
    id: "3",
    name: "Bobcat Ridge Gravel",
    discipline: "gravel",
    date: "2026-02-28",
    distance: 31.2,
    elevation: 2400,
    duration: "2:30:00",
    avgSpeed: 12.5,
    hr: 148,
    calories: 1720,
    notes: "Mixed surface perfection",
    rating: 5,
    source: "manual",
  },
];

// Routes with real coordinates (Fort Collins area). GeoJSON: [lng, lat].
const FC = PEDALHUB_CENTER;

function lineFromStart(
  start: [number, number],
  segments: [number, number][][]
): [number, number][] {
  const out: [number, number][] = [start];
  let [lng, lat] = start;
  for (const seg of segments) {
    for (const p of seg) {
      lng += p[0];
      lat += p[1];
      out.push([lng, lat]);
    }
  }
  return out;
}

export const ROUTES: RouteInfo[] = [
  {
    id: "mtb-horsetooth",
    name: "Horsetooth Mountain Loop",
    discipline: "mountain",
    difficulty: "Advanced",
    distance: 18.4,
    elevation: 2100,
    estimatedMinutes: 135,
    features: ["Technical rock gardens", "Fast bermed turns", "Punchy climbs"],
    rating: 4.8,
    coordinates: lineFromStart([FC[0] - 0.08, FC[1] + 0.04], [
      [
        [0.02, 0.015],
        [0.03, 0.02],
        [0.02, 0.025],
        [0.01, 0.02],
        [-0.01, 0.03],
        [-0.02, 0.02],
        [-0.03, 0],
        [-0.02, -0.02],
        [0, -0.025],
        [0.02, -0.02],
        [0.03, 0],
        [0.02, 0.02],
      ],
    ]),
  },
  {
    id: "mtb-lory",
    name: "Lory State Park",
    discipline: "mountain",
    difficulty: "Intermediate",
    distance: 12.5,
    elevation: 1400,
    estimatedMinutes: 90,
    features: ["Flowy singletrack", "Scenic overlooks", "Wildlife"],
    rating: 4.6,
    coordinates: lineFromStart([FC[0] - 0.06, FC[1] + 0.05], [
      [
        [0.025, 0.01],
        [0.02, 0.02],
        [0, 0.025],
        [-0.02, 0.02],
        [-0.025, 0],
        [-0.01, -0.02],
        [0.02, -0.015],
      ],
    ]),
  },
  {
    id: "road-rist",
    name: "Rist Canyon",
    discipline: "road",
    difficulty: "Advanced",
    distance: 38,
    elevation: 3200,
    estimatedMinutes: 125,
    features: ["Cat 3 climb", "Sweeping descents", "Low traffic"],
    rating: 4.7,
    coordinates: lineFromStart([FC[0] - 0.05, FC[1]], [
      [
        [0.04, 0.03],
        [0.06, 0.04],
        [0.05, 0.02],
        [0.03, -0.01],
        [0.02, -0.02],
        [-0.02, -0.015],
        [-0.04, 0],
        [-0.03, 0.02],
      ],
    ]),
  },
  {
    id: "road-bingham",
    name: "Bingham Hill Loop",
    discipline: "road",
    difficulty: "Beginner",
    distance: 22,
    elevation: 400,
    estimatedMinutes: 70,
    features: ["Flat terrain", "Farm views", "Good warmup"],
    rating: 4.0,
    coordinates: lineFromStart([FC[0], FC[1] - 0.02], [
      [
        [0.03, 0],
        [0.03, 0.02],
        [0, 0.03],
        [-0.03, 0.02],
        [-0.03, 0],
        [-0.02, -0.02],
        [0, -0.02],
      ],
    ]),
  },
  {
    id: "grav-bobcat",
    name: "Bobcat Ridge",
    discipline: "gravel",
    difficulty: "Advanced",
    distance: 31,
    elevation: 2400,
    estimatedMinutes: 150,
    features: ["Mixed surface", "Remote feel", "Epic vistas"],
    rating: 4.8,
    coordinates: lineFromStart([FC[0] + 0.04, FC[1] - 0.03], [
      [
        [-0.02, 0.02],
        [-0.03, 0.03],
        [-0.02, 0.02],
        [0.01, 0.025],
        [0.03, 0.02],
        [0.02, -0.01],
        [0, -0.02],
        [-0.02, -0.015],
      ],
    ]),
  },
  {
    id: "grav-red-mountain",
    name: "Red Mountain Open Space",
    discipline: "gravel",
    difficulty: "Intermediate",
    distance: 18,
    elevation: 1200,
    estimatedMinutes: 90,
    features: ["Well-maintained gravel", "Wildflowers (spring)", "Gentle rollers"],
    rating: 4.5,
    coordinates: lineFromStart([FC[0] + 0.03, FC[1]], [
      [
        [-0.02, 0.015],
        [-0.025, 0.02],
        [-0.01, 0.02],
        [0.02, 0.01],
        [0.02, -0.01],
      ],
    ]),
  },
];

export type TabId =
  | "dashboard"
  | "rides"
  | "routes"
  | "navigate"
  | "weather"
  | "toolkit";

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Home", icon: "📊" },
  { id: "rides", label: "Rides", icon: "🚴" },
  { id: "routes", label: "Routes", icon: "🗺️" },
  { id: "navigate", label: "Ride", icon: "🧭" },
  { id: "weather", label: "Weather", icon: "🌤️" },
  { id: "toolkit", label: "Toolkit", icon: "🧰" },
];
