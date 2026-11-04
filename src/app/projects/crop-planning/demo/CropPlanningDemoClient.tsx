"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import {
  CROP_IDS,
  CROP_PRESETS,
  PROTOTYPE_VERSION,
  SAMPLE_ASSUMPTION_LABEL,
  type CostKey,
  type CropId,
  type FieldPlan,
  type PlanState,
  decodePlan,
  encodePlan,
  farmResult,
  fieldFromPreset,
  fieldResult,
  planToCsv,
  samplePlan,
  sensitivityMargins,
  sharePath,
} from "@/lib/cropBudget";

const STORAGE_KEY = "switchback-crop-plan-v1";
const STEPS = [-30, -15, 0, 15, 30];

export default function CropPlanningDemoClient() {
  const [plan, setPlan] = useState<PlanState>(samplePlan);
  const [ready, setReady] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("plan");
    const decoded = fromUrl ? decodePlan(fromUrl) : null;
    if (decoded) {
      setPlan(decoded);
    } else {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const stored = saved ? decodePlan(saved) : null;
      if (stored) setPlan(stored);
    }
    if (params.get("feedback") === "1") setFeedbackOpen(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, encodePlan(plan));
  }, [plan, ready]);

  const farm = useMemo(() => farmResult(plan), [plan]);
  const grid = useMemo(() => sensitivityMargins(plan.fields, STEPS), [plan.fields]);

  function updateField(id: string, patch: Partial<FieldPlan>) {
    setPlan((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    }));
    setShareNote("");
  }

  function setCost(id: string, key: CostKey, perAcre: number) {
    setPlan((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.id === id ? { ...field, costs: { ...field.costs, [key]: perAcre } } : field
      ),
    }));
  }

  function setActual(id: string, key: CostKey, actual: number | null) {
    setPlan((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.id === id ? { ...field, actuals: { ...field.actuals, [key]: actual } } : field
      ),
    }));
  }

  function changeCrop(id: string, cropId: CropId) {
    setPlan((current) => ({
      ...current,
      fields: current.fields.map((field) => {
        if (field.id !== id) return field;
        const next = fieldFromPreset({ id: field.id, name: field.name, acres: field.acres, cropId });
        return next;
      }),
    }));
  }

  function addField() {
    const next = fieldFromPreset({
      id: `field-${Date.now()}`,
      name: "New field",
      acres: 40,
      cropId: "corn",
    });
    setPlan((current) => ({ ...current, fields: [...current.fields, next] }));
  }

  function removeField(id: string) {
    setPlan((current) => ({ ...current, fields: current.fields.filter((field) => field.id !== id) }));
  }

  function resetSample() {
    const fresh = samplePlan();
    setPlan(fresh);
    window.localStorage.removeItem(STORAGE_KEY);
    window.history.replaceState(null, "", window.location.pathname);
    setShareNote("Reset to the sample plan.");
  }

  async function share() {
    const path = sharePath(plan);
    const url = `${window.location.origin}${path}`;
    window.history.replaceState(null, "", path);
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("Share link copied. Anyone who opens it sees this scenario.");
    } catch {
      setShareNote("Share link is in the address bar.");
    }
  }

  function downloadCsv() {
    const blob = new Blob([planToCsv(plan)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "crop-budget.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <SiteHeader />
      <div className="sticky top-16 md:top-24 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container-std py-2 flex items-center justify-between gap-3">
          <Link href="/projects/crop-planning#changelog" className="text-xs text-muted hover:text-gray-900">
            Prototype {PROTOTYPE_VERSION}
          </Link>
          <button type="button" className="btn btn-primary text-sm" onClick={() => setFeedbackOpen(true)}>
            Give feedback
          </button>
        </div>
      </div>
      <section className="relative">
        <div className="section !pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <p className="text-[11px] tracking-widest uppercase text-muted">Living prototype</p>
            <Link
              href="/projects/crop-planning#changelog"
              className="text-[11px] tracking-widest uppercase text-gray-900 underline underline-offset-4"
            >
              Prototype {PROTOTYPE_VERSION}
            </Link>
          </div>
          <h1 className="h2">CROP BUDGET</h1>
          <p className="lead mt-6 max-w-[68ch]">
            A plan you can change in the room. {SAMPLE_ASSUMPTION_LABEL}. Nothing is saved on a server. The numbers stay in this browser, and a share link carries the exact scenario.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects/crop-planning" className="btn btn-pill">
              Case study
            </Link>
            <button type="button" className="btn btn-primary" onClick={() => setFeedbackOpen(true)}>
              Give feedback
            </button>
          </div>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std pb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <label className="block min-w-0 flex-1">
              <span className="block text-[11px] tracking-widest uppercase text-muted">Farm</span>
              <input
                value={plan.farmName}
                onChange={(event) => setPlan({ ...plan, farmName: event.target.value })}
                className="mt-2 w-full max-w-md bg-transparent text-2xl font-semibold text-gray-900 outline-none border-b border-transparent focus:border-gray-900"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary text-sm" onClick={share}>
                Share this plan
              </button>
              <button type="button" className="btn btn-pill text-sm" onClick={downloadCsv}>
                Download CSV
              </button>
              <button type="button" className="btn btn-pill text-sm" onClick={resetSample}>
                Reset to sample
              </button>
            </div>
          </div>
          {shareNote ? <p className="mt-3 text-sm text-muted">{shareNote}</p> : null}

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Revenue" value={money(farm.revenue)} />
            <Stat label="Total cost" value={money(farm.totalCost)} />
            <Stat label="Cost / acre" value={farm.costPerAcre == null ? "—" : money(farm.costPerAcre)} />
            <Stat label="Total margin" value={money(farm.margin)} emphasize />
            <Stat label="Margin / acre" value={farm.marginPerAcre == null ? "—" : money(farm.marginPerAcre)} />
            <Stat
              label={farm.unit ? `Break-even yield (${farm.unit})` : "Break-even yield"}
              value={farm.breakEvenYield == null ? "Per field" : number(farm.breakEvenYield)}
            />
            <Stat
              label={farm.unit ? `Break-even price ($/${farm.unit})` : "Break-even price"}
              value={farm.breakEvenPrice == null ? "Per field" : money(farm.breakEvenPrice, 2)}
            />
            <Stat label="Acres" value={number(farm.acres)} />
          </div>
          {farm.unit == null ? (
            <p className="mt-3 text-sm text-muted">
              Break-even yield and price stay on each field when the crops use different units.
            </p>
          ) : null}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Slider
              label="Price scenario"
              value={plan.pricePct}
              onChange={(pricePct) => setPlan({ ...plan, pricePct })}
            />
            <Slider
              label="Yield scenario"
              value={plan.yieldPct}
              onChange={(yieldPct) => setPlan({ ...plan, yieldPct })}
            />
          </div>

          <div id="sensitivity" className="mt-10">
            <h2 className="font-serif text-2xl font-light text-gray-900">Margin across price and yield</h2>
            <p className="mt-2 text-sm text-muted max-w-[62ch]">
              Each cell is the whole-farm margin if every field&apos;s price and yield move together. The highlighted cell is the scenario on the sliders when it lands on a step.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[11px] tracking-widest uppercase text-muted font-medium">
                      Yield \ Price
                    </th>
                    {STEPS.map((step) => (
                      <th key={step} className="p-2 text-right font-medium text-gray-700">
                        {signedPct(step)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STEPS.map((yieldStep) => (
                    <tr key={yieldStep} className="border-t border-gray-200">
                      <th className="p-2 text-left font-medium text-gray-700">{signedPct(yieldStep)}</th>
                      {STEPS.map((priceStep) => {
                        const cell = grid.find(
                          (item) => item.pricePct === priceStep && item.yieldPct === yieldStep
                        );
                        const active = plan.pricePct === priceStep && plan.yieldPct === yieldStep;
                        return (
                          <td
                            key={priceStep}
                            className={`p-2 text-right tabular-nums ${
                              active ? "bg-gray-900 text-white" : "text-gray-800"
                            }`}
                          >
                            {money(cell?.margin ?? 0)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-light text-gray-900">Fields</h2>
            <button type="button" className="btn btn-pill text-sm" onClick={addField}>
              Add field
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">{SAMPLE_ASSUMPTION_LABEL}.</p>

          <div className="mt-4 space-y-4">
            {plan.fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                pricePct={plan.pricePct}
                yieldPct={plan.yieldPct}
                onChange={(patch) => updateField(field.id, patch)}
                onCrop={(cropId) => changeCrop(field.id, cropId)}
                onCost={(key, value) => setCost(field.id, key, value)}
                onActual={(key, value) => setActual(field.id, key, value)}
                onRemove={() => removeField(field.id)}
              />
            ))}
            {plan.fields.length === 0 ? (
              <p className="text-muted">No fields yet. Add one to start a budget.</p>
            ) : null}
          </div>
        </div>
      </section>

      {feedbackOpen ? (
        <FeedbackPanel plan={plan} onClose={() => setFeedbackOpen(false)} />
      ) : null}

      <footer className="border-t border-line">
        <div className="container-std py-8 text-sm text-muted flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>© Switchback Labs — Fort Collins, CO</div>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

function FieldCard({
  field,
  pricePct,
  yieldPct,
  onChange,
  onCrop,
  onCost,
  onActual,
  onRemove,
}: {
  field: FieldPlan;
  pricePct: number;
  yieldPct: number;
  onChange: (patch: Partial<FieldPlan>) => void;
  onCrop: (cropId: CropId) => void;
  onCost: (key: CostKey, value: number) => void;
  onActual: (key: CostKey, value: number | null) => void;
  onRemove: () => void;
}) {
  const result = fieldResult(field, pricePct, yieldPct);
  const preset = CROP_PRESETS[field.cropId];
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem_10rem_auto] sm:items-end">
        <label className="block">
          <span className="text-[11px] tracking-widest uppercase text-muted">Field</span>
          <input
            value={field.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-[11px] tracking-widest uppercase text-muted">Acres</span>
          <input
            type="number"
            min={0}
            step="0.1"
            value={field.acres}
            onChange={(event) => onChange({ acres: Number(event.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-[11px] tracking-widest uppercase text-muted">Crop</span>
          <select
            value={field.cropId}
            onChange={(event) => onCrop(event.target.value as CropId)}
            className={inputClass}
          >
            {CROP_IDS.map((id) => (
              <option key={id} value={id}>
                {CROP_PRESETS[id].name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="text-sm text-muted hover:text-gray-900 sm:mb-2" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] tracking-widest uppercase text-muted">
            Expected yield ({preset.unitLabel})
          </span>
          <input
            type="number"
            min={0}
            step="0.1"
            value={field.yieldPerAcre}
            onChange={(event) => onChange({ yieldPerAcre: Number(event.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-[11px] tracking-widest uppercase text-muted">
            Price ($/{preset.unit})
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={field.price}
            onChange={(event) => onChange({ price: Number(event.target.value) })}
            className={inputClass}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-muted">{SAMPLE_ASSUMPTION_LABEL}.</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-widest uppercase text-muted">
              <th className="py-2 pr-3 font-medium">Cost line</th>
              <th className="py-2 pr-3 font-medium">Budget $/acre</th>
              <th className="py-2 pr-3 font-medium">Actual $</th>
              <th className="py-2 font-medium">Variance</th>
            </tr>
          </thead>
          <tbody>
            {result.lines.map((line) => (
              <tr key={line.key} className="border-t border-gray-100">
                <td className="py-2 pr-3 text-gray-900">{line.label}</td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    aria-label={`${line.label} budget per acre`}
                    value={line.perAcre}
                    onChange={(event) => onCost(line.key, Number(event.target.value))}
                    className={`${inputClass} max-w-[8rem]`}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    aria-label={`${line.label} actual spend`}
                    placeholder="Optional"
                    value={line.actual ?? ""}
                    onChange={(event) =>
                      onActual(line.key, event.target.value === "" ? null : Number(event.target.value))
                    }
                    className={`${inputClass} max-w-[8rem]`}
                  />
                </td>
                <td className="py-2 tabular-nums text-gray-700">
                  {line.variance == null ? "—" : money(line.variance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">Variance is actual spend minus the budget for that line. Positive means over.</p>

      <dl className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <Mini label="Revenue" value={money(result.revenue)} />
        <Mini label="Total cost" value={money(result.totalCost)} />
        <Mini label="Cost / acre" value={money(result.costPerAcre)} />
        <Mini label="Margin" value={money(result.margin)} />
        <Mini label="Margin / acre" value={result.marginPerAcre == null ? "—" : money(result.marginPerAcre)} />
        <Mini
          label={`Break-even yield (${preset.unitLabel})`}
          value={result.breakEvenYield == null ? "—" : number(result.breakEvenYield)}
        />
        <Mini
          label={`Break-even price ($/${preset.unit})`}
          value={result.breakEvenPrice == null ? "—" : money(result.breakEvenPrice, 2)}
        />
      </dl>
    </article>
  );
}

function FeedbackPanel({ plan, onClose }: { plan: PlanState; onClose: () => void }) {
  const [trying, setTrying] = useState("");
  const [confusing, setConfusing] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [attach, setAttach] = useState(true);

  function scenarioUrl() {
    if (!attach) return "";
    return `${window.location.origin}${sharePath(plan)}`;
  }

  function body() {
    return [
      `Prototype ${PROTOTYPE_VERSION}`,
      `Usefulness: ${rating ?? "not rated"} of 5`,
      "",
      "What were you trying to do?",
      trying.trim() || "(blank)",
      "",
      "What was confusing?",
      confusing.trim() || "(blank)",
      "",
      attach ? `Scenario: ${scenarioUrl()}` : "Scenario: not attached",
    ].join("\n");
  }

  function openGitHub() {
    const url = new URL("https://github.com/cjones88a/switchbacklabs/issues/new");
    url.searchParams.set("title", `Crop prototype ${PROTOTYPE_VERSION} feedback`);
    url.searchParams.set("body", body());
    url.searchParams.set("labels", "prototype-feedback");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function mailHref() {
    const subject = encodeURIComponent(`Crop prototype ${PROTOTYPE_VERSION} feedback`);
    return `mailto:switchbacklabsco@gmail.com?subject=${subject}&body=${encodeURIComponent(body())}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6" role="presentation">
      <button type="button" className="absolute inset-0 bg-gray-900/40" aria-label="Close feedback" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-5 sm:p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-muted">Prototype {PROTOTYPE_VERSION}</p>
            <h2 id="feedback-title" className="mt-1 text-xl font-semibold text-gray-900">
              Give feedback
            </h2>
          </div>
          <button type="button" className="text-sm text-muted hover:text-gray-900" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">
          This opens a GitHub issue with what you write. Nothing is stored in the prototype.
        </p>
        <label className="block mt-4">
          <span className="text-sm font-medium text-gray-900">What were you trying to do?</span>
          <textarea value={trying} onChange={(event) => setTrying(event.target.value)} rows={3} className={`${inputClass} mt-1`} />
        </label>
        <label className="block mt-4">
          <span className="text-sm font-medium text-gray-900">What was confusing?</span>
          <textarea value={confusing} onChange={(event) => setConfusing(event.target.value)} rows={3} className={`${inputClass} mt-1`} />
        </label>
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-gray-900">Usefulness, 1 to 5</legend>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                aria-pressed={rating === score}
                onClick={() => setRating(score)}
                className={`h-10 w-10 rounded-md border text-sm font-medium ${
                  rating === score ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-900"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="mt-4 flex items-start gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            className="mt-1"
            checked={attach}
            onChange={(event) => setAttach(event.target.checked)}
          />
          Attach current scenario
        </label>
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <button type="button" className="btn btn-primary" onClick={openGitHub} disabled={rating == null}>
            Open GitHub issue
          </button>
          <a href={mailHref()} className="text-sm text-gray-900 underline underline-offset-4">
            Email instead
          </a>
        </div>
        {rating == null ? (
          <p className="mt-2 text-xs text-muted">Pick a rating to open the issue.</p>
        ) : null}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-xl border border-gray-200 bg-white p-4">
      <span className="flex items-center justify-between text-sm font-medium text-gray-900">
        {label}
        <span className="tabular-nums">{signedPct(value)}</span>
      </span>
      <input
        type="range"
        min={-30}
        max={30}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-gray-900"
      />
    </label>
  );
}

function Stat({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${emphasize ? "border-gray-900 bg-white" : "border-gray-200 bg-white"}`}>
      <div className="text-[11px] tracking-widest uppercase text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-gray-900">{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-widest uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-medium tabular-nums text-gray-900">{value}</dd>
    </div>
  );
}

const inputClass =
  "w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900";

function money(value: number, digits = 0): string {
  const formatted = Math.abs(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return value < 0 ? `−${formatted}` : formatted;
}

function number(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function signedPct(value: number): string {
  if (value > 0) return `+${value}%`;
  return `${value}%`;
}
