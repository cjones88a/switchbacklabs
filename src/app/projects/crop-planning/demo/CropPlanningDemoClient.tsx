"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "@/components/layout/SiteHeader";

type Field = { id: number; name: string; acreage: number; crops: number };

export default function CropPlanningDemoClient() {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "create-field" | "create-crop"
  >("dashboard");
  const [selectedFieldIdForCrop, setSelectedFieldIdForCrop] = useState<
    number | null
  >(null);
  const [fields, setFields] = useState<Field[]>([
    { id: 1, name: "North 40", acreage: 40, crops: 1 },
    { id: 2, name: "River Bottom", acreage: 85, crops: 2 },
    { id: 3, name: "East Field", acreage: 120, crops: 0 },
  ]);

  const handleSaveField = (field: {
    name: string;
    acreage: number;
    notes?: string;
  }) => {
    const newId = fields.length > 0 ? Math.max(...fields.map((f) => f.id)) + 1 : 1;
    setFields([
      ...fields,
      { id: newId, name: field.name, acreage: field.acreage, crops: 0 },
    ]);
    setCurrentView("dashboard");
  };

  const handleSaveCrop = () => {
    if (selectedFieldIdForCrop != null) {
      setFields((prev) =>
        prev.map((f) =>
          f.id === selectedFieldIdForCrop
            ? { ...f, crops: f.crops + 1 }
            : f
        )
      );
    }
    setSelectedFieldIdForCrop(null);
    setCurrentView("dashboard");
  };

  const totalAcres = fields.reduce((sum, f) => sum + f.acreage, 0);
  const totalCrops = fields.reduce((sum, f) => sum + f.crops, 0);

  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Interactive Prototype
          </p>
          <h1 className="h2">CROP PLANNING DEMO</h1>
          <p className="lead mt-6 max-w-[62ch]">
            Explore the field and crop planning interface. This prototype
            demonstrates the core workflow: create fields, assign crops, and
            build budgets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects/crop-planning" className="btn btn-pill">
              Back to overview
            </Link>
          </div>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <DemoApp
            currentView={currentView}
            setCurrentView={setCurrentView}
            fields={fields}
            selectedFieldIdForCrop={selectedFieldIdForCrop}
            setSelectedFieldIdForCrop={setSelectedFieldIdForCrop}
            onSaveField={handleSaveField}
            onSaveCrop={handleSaveCrop}
            totalAcres={totalAcres}
            totalCrops={totalCrops}
          />
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="container-std py-8 text-sm text-muted flex items-center justify-between">
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

type DemoAppProps = {
  currentView: "dashboard" | "create-field" | "create-crop";
  setCurrentView: (v: "dashboard" | "create-field" | "create-crop") => void;
  fields: Field[];
  selectedFieldIdForCrop: number | null;
  setSelectedFieldIdForCrop: (id: number | null) => void;
  onSaveField: (field: {
    name: string;
    acreage: number;
    notes?: string;
  }) => void;
  onSaveCrop: () => void;
  totalAcres: number;
  totalCrops: number;
};

function DemoApp({
  currentView,
  setCurrentView,
  fields,
  selectedFieldIdForCrop,
  setSelectedFieldIdForCrop,
  onSaveField,
  onSaveCrop,
  totalAcres,
  totalCrops,
}: DemoAppProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-line">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Johnson Family Farm
          </h2>
          <p className="text-sm text-muted mt-1">{totalAcres} total acres</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentView("create-field")}
            className="btn btn-primary text-sm"
          >
            + Add Field
          </button>
        </div>
      </div>

      {currentView === "dashboard" && (
        <DashboardView
          fields={fields}
          totalAcres={totalAcres}
          totalCrops={totalCrops}
          onAddCrop={(fieldId) => {
            setSelectedFieldIdForCrop(fieldId);
            setCurrentView("create-crop");
          }}
        />
      )}

      {currentView === "create-field" && (
        <CreateFieldView
          onCancel={() => setCurrentView("dashboard")}
          onSave={onSaveField}
        />
      )}

      {currentView === "create-crop" && (
        <CreateCropView
          fields={fields}
          selectedFieldId={selectedFieldIdForCrop}
          onCancel={() => {
            setSelectedFieldIdForCrop(null);
            setCurrentView("dashboard");
          }}
          onSave={onSaveCrop}
        />
      )}
    </div>
  );
}

function DashboardView({
  fields,
  totalAcres,
  totalCrops,
  onAddCrop,
}: {
  fields: Field[];
  totalAcres: number;
  totalCrops: number;
  onAddCrop: (fieldId: number) => void;
}) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          My Fields
        </h3>
        <p className="text-sm text-muted">
          Manage your fields and crop plantings
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div
            key={field.id}
            className="border border-line rounded-lg p-6 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-lg text-gray-900">
                  {field.name}
                </h4>
                <p className="text-sm text-muted">{field.acreage} acres</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {field.crops} {field.crops === 1 ? "crop" : "crops"}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAddCrop(field.id)}
                className="btn btn-pill text-sm flex-1"
              >
                + Add Crop
              </button>
              <button
                type="button"
                className="text-sm text-muted hover:text-gray-900 px-3"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-line">
        <h4 className="font-semibold text-gray-900 mb-4">Farm Summary</h4>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {fields.length}
            </div>
            <div className="text-sm text-muted">Total Fields</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {totalAcres}
            </div>
            <div className="text-sm text-muted">Total Acres</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {totalCrops}
            </div>
            <div className="text-sm text-muted">Crop Plantings</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateFieldView({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (field: {
    name: string;
    acreage: number;
    notes?: string;
  }) => void;
}) {
  const [fieldName, setFieldName] = useState("");
  const [acreage, setAcreage] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: fieldName,
      acreage: parseFloat(acreage),
      notes: notes || undefined,
    });
  };

  const inputClass =
    "w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Create New Field
        </h3>
        <p className="text-sm text-muted">Add a field to your farm</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Field Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="e.g., North 40, River Bottom"
            className={inputClass}
            required
          />
          <p className="text-xs text-muted mt-1">
            Give your field a memorable name
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Acreage <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={acreage}
            onChange={(e) => setAcreage(e.target.value)}
            placeholder="e.g., 40.5"
            className={inputClass}
            required
          />
          <p className="text-xs text-muted mt-1">
            Total acres for this field
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Notes <span className="text-muted text-xs">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Soil type, irrigation notes, etc."
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn btn-primary">
            Create Field
          </button>
          <button type="button" onClick={onCancel} className="btn btn-pill">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const CROP_TYPES = [
  "Corn",
  "Soybeans",
  "Wheat",
  "Cotton",
  "Vegetables",
  "Other",
];

function CreateCropView({
  fields,
  selectedFieldId,
  onCancel,
  onSave,
}: {
  fields: Field[];
  selectedFieldId: number | null;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [fieldId, setFieldId] = useState(
    selectedFieldId != null ? String(selectedFieldId) : ""
  );
  const [cropType, setCropType] = useState("");
  const [variety, setVariety] = useState("");
  const [plantedAcres, setPlantedAcres] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [expectedYield, setExpectedYield] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  const inputClass =
    "w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2";

  const projectedRevenue =
    expectedYield &&
    expectedPrice &&
    plantedAcres &&
    parseFloat(expectedYield) * parseFloat(expectedPrice) * parseFloat(plantedAcres);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Create Crop Planting
        </h3>
        <p className="text-sm text-muted">
          Assign a crop to a field and set expectations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Select Field <span className="text-red-500">*</span>
          </label>
          <select
            value={fieldId || (selectedFieldId != null ? String(selectedFieldId) : "")}
            onChange={(e) => setFieldId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Choose a field...</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name} ({field.acreage} acres)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Crop Type <span className="text-red-500">*</span>
          </label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Choose a crop...</option>
            {CROP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Variety/Hybrid
          </label>
          <input
            type="text"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            placeholder="e.g., Pioneer 1197, NK Brand"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Planted Acres <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={plantedAcres}
            onChange={(e) => setPlantedAcres(e.target.value)}
            placeholder="e.g., 40"
            className={inputClass}
            required
          />
          <p className="text-xs text-muted mt-1">
            Can be less than total field acreage
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Planting Date
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Expected Harvest
            </label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Expected Yield
            </label>
            <input
              type="number"
              step="0.1"
              value={expectedYield}
              onChange={(e) => setExpectedYield(e.target.value)}
              placeholder="e.g., 180"
              className={inputClass}
            />
            <p className="text-xs text-muted mt-1">
              bushels/acre or tons/acre
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Expected Price
            </label>
            <input
              type="number"
              step="0.01"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              placeholder="e.g., 4.50"
              className={inputClass}
            />
            <p className="text-xs text-muted mt-1">$ per unit</p>
          </div>
        </div>

        {projectedRevenue != null && !Number.isNaN(projectedRevenue) && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-900 mb-1">
              Projected Revenue
            </div>
            <div className="text-2xl font-bold text-green-700">
              $
              {projectedRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {expectedYield} bu/acre × ${expectedPrice}/bu × {plantedAcres}{" "}
              acres
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn btn-primary">
            Create Crop Planting
          </button>
          <button type="button" onClick={onCancel} className="btn btn-pill">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
