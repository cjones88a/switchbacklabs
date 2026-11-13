"use client";

import Link from "next/link";
import { DISCLAIMER_TEXT, DISCLAIMER_VERSION } from "@/lib/trainingDisclaimerCopy";

export async function saveDisclaimerAcceptance(): Promise<boolean> {
  const res = await fetch("/api/training/disclaimer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ disclaimerVersion: DISCLAIMER_VERSION }),
  });
  return res.ok;
}

export function DisclaimerCheckbox({
  checked = false,
  disabled,
  onAccept,
}: {
  checked?: boolean;
  disabled?: boolean;
  onAccept: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-left">
      <label htmlFor="training-disclaimer" className="flex cursor-pointer items-start gap-3">
        <input
          id="training-disclaimer"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => {
            if (event.target.checked) onAccept();
          }}
          className="mt-1 h-5 w-5 shrink-0 accent-orange-500"
        />
        <span className="text-sm leading-relaxed text-zinc-700">{DISCLAIMER_TEXT}</span>
      </label>
      <p className="mt-3 pl-8 text-sm">
        <Link href="/terms" className="text-zinc-900 underline underline-offset-4">
          Read the terms
        </Link>
      </p>
    </div>
  );
}

export function DisclaimerAcceptedNote() {
  return (
    <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm leading-relaxed text-zinc-600">
      You accepted this plan disclaimer. The plan is still AI-generated and is not medical advice.{" "}
      <Link href="/terms" className="text-zinc-900 underline underline-offset-4">
        Terms
      </Link>
    </p>
  );
}
