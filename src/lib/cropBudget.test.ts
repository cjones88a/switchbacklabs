import { describe, expect, it } from "vitest";
import {
  CROP_PRESETS,
  decodePlan,
  encodePlan,
  farmResult,
  fieldFromPreset,
  fieldResult,
  lineVariance,
  samplePlan,
} from "./cropBudget";

describe("crop budget math", () => {
  const corn = fieldFromPreset({ id: "north", name: "North 40", acres: 40, cropId: "corn" });

  it("computes margin from yield, price, acres, and cost lines", () => {
    const result = fieldResult(corn, 0, 0);
    // 110+150+50+40+25+20+180+15 = 590 per acre
    expect(result.costPerAcre).toBe(590);
    expect(result.totalCost).toBe(590 * 40);
    expect(result.revenue).toBe(40 * 180 * 4.5);
    expect(result.margin).toBe(40 * 180 * 4.5 - 590 * 40);
    expect(result.marginPerAcre).toBeCloseTo(220);
  });

  it("computes break-even yield and break-even price", () => {
    const result = fieldResult(corn, 0, 0);
    expect(result.breakEvenYield).toBeCloseTo(590 / 4.5);
    expect(result.breakEvenPrice).toBeCloseTo(590 / 180);
  });

  it("moves break-evens with the price and yield scenario", () => {
    const priced = fieldResult(corn, 10, 0);
    const yielded = fieldResult(corn, 0, -20);
    expect(priced.effectivePrice).toBeCloseTo(4.95);
    expect(priced.breakEvenYield).toBeCloseTo(590 / 4.95);
    expect(yielded.effectiveYield).toBeCloseTo(144);
    expect(yielded.breakEvenPrice).toBeCloseTo(590 / 144);
    expect(priced.margin).toBeCloseTo(40 * 180 * 4.95 - 590 * 40);
  });

  it("returns null break-evens when price or yield is zero", () => {
    const free = { ...corn, price: 0, yieldPerAcre: 0 };
    const result = fieldResult(free, 0, 0);
    expect(result.breakEvenYield).toBeNull();
    expect(result.breakEvenPrice).toBeNull();
    expect(result.margin).toBe(-590 * 40);
  });

  it("computes variance as actual minus budget, and skips a blank actual", () => {
    expect(lineVariance(110, 40, 5000)).toBe(600);
    expect(lineVariance(110, 40, 4000)).toBe(-400);
    expect(lineVariance(110, 40, null)).toBeNull();
    const withActual = {
      ...corn,
      actuals: { ...corn.actuals, seed: 5000 },
    };
    const seed = fieldResult(withActual, 0, 0).lines.find((line) => line.key === "seed");
    expect(seed?.budget).toBe(4400);
    expect(seed?.variance).toBe(600);
    expect(fieldResult(corn, 0, 0).lines.every((line) => line.variance == null)).toBe(true);
  });

  it("rolls a farm up in dollars and blends break-evens only when the unit matches", () => {
    const plan = samplePlan();
    const farm = farmResult(plan);
    const fields = plan.fields.map((field) => fieldResult(field, 0, 0));
    expect(farm.revenue).toBeCloseTo(fields.reduce((sum, row) => sum + row.revenue, 0));
    expect(farm.totalCost).toBeCloseTo(fields.reduce((sum, row) => sum + row.totalCost, 0));
    expect(farm.margin).toBeCloseTo(farm.revenue - farm.totalCost);
    expect(farm.unit).toBe("bu");
    expect(farm.breakEvenYield).not.toBeNull();
    expect(farm.breakEvenPrice).not.toBeNull();

    const mixed = farmResult({
      ...plan,
      fields: [
        ...plan.fields,
        fieldFromPreset({ id: "beets", name: "Beets", acres: 20, cropId: "sugarBeets" }),
      ],
    });
    expect(mixed.unit).toBeNull();
    expect(mixed.breakEvenYield).toBeNull();
    expect(mixed.breakEvenPrice).toBeNull();
    expect(mixed.margin).not.toBe(0);
  });
});

describe("crop plan share URL", () => {
  it("round-trips a plan, including an actual and the scenario sliders", () => {
    const plan = samplePlan();
    plan.farmName = "Advisor copy";
    plan.pricePct = -15;
    plan.yieldPct = 10;
    plan.fields[0].yieldPerAcre = 175;
    plan.fields[0].costs.seed = 125;
    plan.fields[0].actuals.fertilizer = 7000;
    plan.fields[1].cropId = "sugarBeets";
    plan.fields[1].yieldPerAcre = CROP_PRESETS.sugarBeets.yieldPerAcre;
    plan.fields[1].price = CROP_PRESETS.sugarBeets.price;

    const decoded = decodePlan(encodePlan(plan));
    expect(decoded).toEqual(plan);
    expect(farmResult(decoded!).margin).toBeCloseTo(farmResult(plan).margin);
  });

  it("rejects a tampered payload and an unknown crop", () => {
    expect(decodePlan("not-a-plan")).toBeNull();
    const plan = samplePlan();
    const encoded = encodePlan(plan);
    const broken = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))
      )
    );
    broken.fields[0].cropId = "canola";
    const payload = btoa(JSON.stringify(broken)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    expect(decodePlan(payload)).toBeNull();
  });
});
