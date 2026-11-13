"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authorizePath } from "@/lib/trainingGate";
import { DisclaimerAcceptedNote, DisclaimerCheckbox, saveDisclaimerAcceptance } from "./DisclaimerCheckbox";

export function TrainingConnect() {
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/training/disclaimer")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { accepted?: boolean } | null) => {
        if (!cancelled && data?.accepted) setAccepted(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function accept() {
    setChecked(true);
    setSaving(true);
    setError(null);
    const ok = await saveDisclaimerAcceptance();
    setSaving(false);
    if (!ok) {
      setChecked(false);
      setError("Could not save that. Please try the checkbox again.");
      return;
    }
    setAccepted(true);
  }

  return (
    <div className="mb-6 text-left">
      {accepted ? (
        <DisclaimerAcceptedNote />
      ) : (
        <DisclaimerCheckbox checked={checked} disabled={saving} onAccept={accept} />
      )}
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="mt-4">
        {accepted ? (
          <a
            href={authorizePath("/training")}
            className="block w-full rounded-xl bg-[#FC4C02] py-3 px-6 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Connect with Strava
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-describedby="training-disclaimer"
            className="block w-full cursor-not-allowed rounded-xl bg-[#FC4C02] py-3 px-6 text-sm font-semibold text-white opacity-30"
          >
            Connect with Strava
          </button>
        )}
      </div>
      <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
        Strava access is read-only. The app reads your activities to draft a plan.{" "}
        <Link href="/privacy" className="text-zinc-700 underline underline-offset-2">
          Privacy
        </Link>
      </p>
    </div>
  );
}
