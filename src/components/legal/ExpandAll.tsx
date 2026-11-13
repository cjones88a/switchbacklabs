"use client";

import { useEffect, useState } from "react";

export default function ExpandAll() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const list = document.querySelector("[data-legal-list]");
    if (!list) return;
    const root = list;

    function sync() {
      const nodes = root.querySelectorAll<HTMLDetailsElement>("details[data-legal-section]");
      setExpanded(nodes.length > 0 && Array.from(nodes).every((node) => node.open));
    }

    list.addEventListener("toggle", sync, true);
    return () => list.removeEventListener("toggle", sync, true);
  }, []);

  function toggle() {
    const nodes = Array.from(
      document.querySelectorAll<HTMLDetailsElement>("details[data-legal-section]")
    );
    const next = !(nodes.length > 0 && nodes.every((node) => node.open));
    nodes.forEach((node) => {
      node.open = next;
    });
    setExpanded(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={expanded}
      className="inline-flex min-h-11 items-center rounded-md border border-gray-300 px-3 text-sm text-gray-900 hover:border-gray-400 hover:bg-gray-50"
    >
      {expanded ? "Collapse all" : "Expand all"}
    </button>
  );
}
