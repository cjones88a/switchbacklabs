"use client";

import * as React from "react";

const KEY = "sbl:4soh-consent";

export default function Consent({
  onChange,
}: {
  onChange?: (v: boolean) => void;
}) {
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      const c = v === "1";
      setChecked(c);
      onChange?.(c);
    } catch {}
  }, [onChange]);

  const toggle = (v: boolean) => {
    setChecked(v);
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch {}
    onChange?.(v);
  };

  return (
    <label className="flex items-start gap-3 text-sm text-gray-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => toggle(e.target.checked)}
        className="mt-1 size-4 rounded border-gray-300 bg-white"
      />
      <span>
        I agree to display my name and race times on the public leaderboard.
        <div className="text-gray-600">You can withdraw consent anytime by emailing us.</div>
      </span>
    </label>
  );
}
