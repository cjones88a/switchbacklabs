/**
 * Crop budget math for the living prototype.
 * Preset yields, prices, and costs are sample assumptions for the UI, not market data.
 */

export const PROTOTYPE_VERSION = "v0.3";

export const COST_LINES = [
  { key: "seed", label: "Seed" },
  { key: "fertilizer", label: "Fertilizer" },
  { key: "chemical", label: "Chemical" },
  { key: "fuel", label: "Fuel and repairs" },
  { key: "customHire", label: "Custom hire" },
  { key: "insurance", label: "Crop insurance" },
  { key: "landRent", label: "Land rent" },
  { key: "other", label: "Other" },
] as const;

export type CostKey = (typeof COST_LINES)[number]["key"];

export type CropId = "corn" | "soybeans" | "wheat" | "sugarBeets";

export type CropPreset = {
  id: CropId;
  name: string;
  unit: string;
  unitLabel: string;
  yieldPerAcre: number;
  price: number;
  costs: Record<CostKey, number>;
};

/** Round sample figures. The UI must label them as assumptions, not quotes. */
export const CROP_PRESETS: Record<CropId, CropPreset> = {
  corn: {
    id: "corn",
    name: "Corn",
    unit: "bu",
    unitLabel: "bu/acre",
    yieldPerAcre: 180,
    price: 4.5,
    costs: {
      seed: 110,
      fertilizer: 150,
      chemical: 50,
      fuel: 40,
      customHire: 25,
      insurance: 20,
      landRent: 180,
      other: 15,
    },
  },
  soybeans: {
    id: "soybeans",
    name: "Soybeans",
    unit: "bu",
    unitLabel: "bu/acre",
    yieldPerAcre: 55,
    price: 11,
    costs: {
      seed: 70,
      fertilizer: 40,
      chemical: 45,
      fuel: 35,
      customHire: 20,
      insurance: 18,
      landRent: 180,
      other: 12,
    },
  },
  wheat: {
    id: "wheat",
    name: "Wheat",
    unit: "bu",
    unitLabel: "bu/acre",
    yieldPerAcre: 60,
    price: 6,
    costs: {
      seed: 40,
      fertilizer: 70,
      chemical: 25,
      fuel: 30,
      customHire: 15,
      insurance: 12,
      landRent: 140,
      other: 10,
    },
  },
  sugarBeets: {
    id: "sugarBeets",
    name: "Sugar beets",
    unit: "ton",
    unitLabel: "tons/acre",
    yieldPerAcre: 30,
    price: 50,
    costs: {
      seed: 180,
      fertilizer: 160,
      chemical: 120,
      fuel: 60,
      customHire: 80,
      insurance: 30,
      landRent: 200,
      other: 25,
    },
  },
};

export const CROP_IDS = Object.keys(CROP_PRESETS) as CropId[];

export type FieldPlan = {
  id: string;
  name: string;
  acres: number;
  cropId: CropId;
  yieldPerAcre: number;
  price: number;
  costs: Record<CostKey, number>;
  /** Total dollars spent on the line. Null means the actual was not entered. */
  actuals: Record<CostKey, number | null>;
};

export type PlanState = {
  v: 1;
  farmName: string;
  /** Percent added to every price. -30 means 70% of the entered price. */
  pricePct: number;
  yieldPct: number;
  fields: FieldPlan[];
};

export type LineResult = {
  key: CostKey;
  label: string;
  perAcre: number;
  budget: number;
  actual: number | null;
  /** Actual minus budget. Positive is over the budget. Null if no actual was entered. */
  variance: number | null;
};

export type FieldResult = {
  acres: number;
  unit: string;
  unitLabel: string;
  effectiveYield: number;
  effectivePrice: number;
  costPerAcre: number;
  totalCost: number;
  revenue: number;
  margin: number;
  marginPerAcre: number | null;
  breakEvenYield: number | null;
  breakEvenPrice: number | null;
  lines: LineResult[];
};

export type FarmResult = {
  acres: number;
  revenue: number;
  totalCost: number;
  margin: number;
  costPerAcre: number | null;
  marginPerAcre: number | null;
  /** Set when every field uses the same yield unit. Otherwise units cannot be added. */
  unit: string | null;
  breakEvenYield: number | null;
  breakEvenPrice: number | null;
};

export const SAMPLE_ASSUMPTION_LABEL =
  "Sample assumptions, edit to match your operation";

const PCT_MIN = -30;
const PCT_MAX = 30;

export function emptyActuals(): Record<CostKey, number | null> {
  return {
    seed: null,
    fertilizer: null,
    chemical: null,
    fuel: null,
    customHire: null,
    insurance: null,
    landRent: null,
    other: null,
  };
}

export function fieldFromPreset(
  partial: { id: string; name: string; acres: number; cropId: CropId }
): FieldPlan {
  const preset = CROP_PRESETS[partial.cropId];
  return {
    id: partial.id,
    name: partial.name,
    acres: partial.acres,
    cropId: partial.cropId,
    yieldPerAcre: preset.yieldPerAcre,
    price: preset.price,
    costs: { ...preset.costs },
    actuals: emptyActuals(),
  };
}

export function samplePlan(): PlanState {
  return {
    v: 1,
    farmName: "Sample farm",
    pricePct: 0,
    yieldPct: 0,
    fields: [
      fieldFromPreset({ id: "north-40", name: "North 40", acres: 40, cropId: "corn" }),
      fieldFromPreset({
        id: "river-bottom",
        name: "River bottom",
        acres: 85,
        cropId: "soybeans",
      }),
      fieldFromPreset({ id: "east-field", name: "East field", acres: 120, cropId: "wheat" }),
    ],
  };
}

export function scenarioFactor(pct: number): number {
  return 1 + pct / 100;
}

/** Actual total minus the budget for that line. Null when the actual was left blank. */
export function lineVariance(
  perAcre: number,
  acres: number,
  actual: number | null
): number | null {
  if (actual == null || !Number.isFinite(actual)) return null;
  return actual - perAcre * acres;
}

export function fieldResult(field: FieldPlan, pricePct: number, yieldPct: number): FieldResult {
  const preset = CROP_PRESETS[field.cropId];
  const acres = finiteOr(field.acres, 0);
  const effectiveYield = finiteOr(field.yieldPerAcre, 0) * scenarioFactor(yieldPct);
  const effectivePrice = finiteOr(field.price, 0) * scenarioFactor(pricePct);
  const lines: LineResult[] = COST_LINES.map((line) => {
    const perAcre = finiteOr(field.costs[line.key], 0);
    const actual = field.actuals[line.key];
    return {
      key: line.key,
      label: line.label,
      perAcre,
      budget: perAcre * acres,
      actual: actual == null || !Number.isFinite(actual) ? null : actual,
      variance: lineVariance(perAcre, acres, actual),
    };
  });
  const costPerAcre = lines.reduce((sum, line) => sum + line.perAcre, 0);
  const totalCost = costPerAcre * acres;
  const revenue = acres * effectiveYield * effectivePrice;
  const margin = revenue - totalCost;
  return {
    acres,
    unit: preset.unit,
    unitLabel: preset.unitLabel,
    effectiveYield,
    effectivePrice,
    costPerAcre,
    totalCost,
    revenue,
    margin,
    marginPerAcre: acres > 0 ? margin / acres : null,
    breakEvenYield: effectivePrice > 0 ? costPerAcre / effectivePrice : null,
    breakEvenPrice: effectiveYield > 0 ? costPerAcre / effectiveYield : null,
    lines,
  };
}

export function farmResult(plan: Pick<PlanState, "fields" | "pricePct" | "yieldPct">): FarmResult {
  const results = plan.fields.map((field) => fieldResult(field, plan.pricePct, plan.yieldPct));
  const acres = results.reduce((sum, row) => sum + row.acres, 0);
  const revenue = results.reduce((sum, row) => sum + row.revenue, 0);
  const totalCost = results.reduce((sum, row) => sum + row.totalCost, 0);
  const margin = revenue - totalCost;
  const units = new Set(results.map((row) => row.unit));
  const sameUnit = results.length > 0 && units.size === 1;
  const yieldWeight = results.reduce((sum, row) => sum + row.acres * row.effectiveYield, 0);
  const priceWeight = results.reduce((sum, row) => sum + row.acres * row.effectivePrice, 0);
  return {
    acres,
    revenue,
    totalCost,
    margin,
    costPerAcre: acres > 0 ? totalCost / acres : null,
    marginPerAcre: acres > 0 ? margin / acres : null,
    unit: sameUnit ? results[0].unit : null,
    breakEvenYield: sameUnit && priceWeight > 0 ? totalCost / priceWeight : null,
    breakEvenPrice: sameUnit && yieldWeight > 0 ? totalCost / yieldWeight : null,
  };
}

export function sensitivityMargins(
  fields: FieldPlan[],
  steps: number[] = [-30, -15, 0, 15, 30]
): { pricePct: number; yieldPct: number; margin: number }[] {
  const cells: { pricePct: number; yieldPct: number; margin: number }[] = [];
  for (const yieldPct of steps) {
    for (const pricePct of steps) {
      cells.push({
        pricePct,
        yieldPct,
        margin: farmResult({ fields, pricePct, yieldPct }).margin,
      });
    }
  }
  return cells;
}

export function planToCsv(plan: PlanState): string {
  const header = [
    "Field",
    "Acres",
    "Crop",
    "Unit",
    "Yield per acre",
    "Price",
    "Scenario price %",
    "Scenario yield %",
    "Revenue",
    "Total cost",
    "Cost per acre",
    "Margin",
    "Margin per acre",
    "Break-even yield",
    "Break-even price",
    ...COST_LINES.flatMap((line) => [
      `${line.label} budget $/acre`,
      `${line.label} budget $`,
      `${line.label} actual $`,
      `${line.label} variance $`,
    ]),
  ];
  const rows = plan.fields.map((field) => {
    const result = fieldResult(field, plan.pricePct, plan.yieldPct);
    return [
      field.name,
      field.acres,
      CROP_PRESETS[field.cropId].name,
      result.unit,
      field.yieldPerAcre,
      field.price,
      plan.pricePct,
      plan.yieldPct,
      result.revenue,
      result.totalCost,
      result.costPerAcre,
      result.margin,
      result.marginPerAcre ?? "",
      result.breakEvenYield ?? "",
      result.breakEvenPrice ?? "",
      ...result.lines.flatMap((line) => [
        line.perAcre,
        line.budget,
        line.actual ?? "",
        line.variance ?? "",
      ]),
    ];
  });
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function encodePlan(plan: PlanState): string {
  return toBase64Url(JSON.stringify(plan));
}

export function decodePlan(raw: string): PlanState | null {
  try {
    const parsed = JSON.parse(fromBase64Url(raw)) as unknown;
    return normalizePlan(parsed);
  } catch {
    return null;
  }
}

export function sharePath(plan: PlanState): string {
  return `/projects/crop-planning/demo?plan=${encodePlan(plan)}`;
}

function normalizePlan(value: unknown): PlanState | null {
  if (!isRecord(value) || value.v !== 1) return null;
  const farmName = typeof value.farmName === "string" ? value.farmName.slice(0, 80) : "";
  const pricePct = clampPct(value.pricePct);
  const yieldPct = clampPct(value.yieldPct);
  if (!farmName || pricePct == null || yieldPct == null || !Array.isArray(value.fields)) return null;
  if (value.fields.length > 24) return null;
  const fields: FieldPlan[] = [];
  for (const item of value.fields) {
    const field = normalizeField(item);
    if (!field) return null;
    fields.push(field);
  }
  return { v: 1, farmName, pricePct, yieldPct, fields };
}

function normalizeField(value: unknown): FieldPlan | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.slice(0, 40) : "";
  const name = typeof value.name === "string" ? value.name.slice(0, 80) : "";
  const cropId = value.cropId;
  if (!id || !name || typeof cropId !== "string" || !isCropId(cropId)) return null;
  const acres = inRange(value.acres, 0, 100_000);
  const yieldPerAcre = inRange(value.yieldPerAcre, 0, 100_000);
  const price = inRange(value.price, 0, 1_000_000);
  if (acres == null || yieldPerAcre == null || price == null || !isRecord(value.costs)) return null;
  const costs = {} as Record<CostKey, number>;
  const actuals = emptyActuals();
  const rawActuals = isRecord(value.actuals) ? value.actuals : {};
  for (const line of COST_LINES) {
    const perAcre = inRange(value.costs[line.key], 0, 1_000_000);
    if (perAcre == null) return null;
    costs[line.key] = perAcre;
    if (rawActuals[line.key] == null || rawActuals[line.key] === "") {
      actuals[line.key] = null;
    } else {
      const actual = inRange(rawActuals[line.key], 0, 100_000_000);
      if (actual == null) return null;
      actuals[line.key] = actual;
    }
  }
  return { id, name, acres, cropId, yieldPerAcre, price, costs, actuals };
}

function isCropId(value: string): value is CropId {
  return value in CROP_PRESETS;
}

function clampPct(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.min(PCT_MAX, Math.max(PCT_MIN, n));
}

function inRange(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
