"use client";

import { useEffect } from "react";
import { townData } from "@/data/town";
import { getOwnership } from "@/lib/ownership";
import { useGameStore } from "@/state/gameStore";

export default function BuildingPanel() {
  const selectedId = useGameStore((state) => state.selectedId);
  const setSelectedId = useGameStore((state) => state.setSelectedId);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSelectedId]);

  if (!selectedId) return null;

  const building = townData.buildings.find((item) => item.id === selectedId);
  const lot = townData.lots.find((item) => item.id === selectedId);
  const item = building ?? lot;
  if (!item) return null;

  const status = item.status === "coming_soon" ? "Coming soon" : "Property for sale — coming soon";
  const description = building
    ? building.description
    : "Marked for future sale through the Loogans Bluff Government.";
  const ownership = getOwnership(item.id);

  return (
    <aside className="fixed bottom-4 right-4 z-10 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{item.name}</h2>
          <p className="mt-1 text-xs text-slate-400">{item.id}</p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="rounded px-2 py-1 text-sm text-slate-300 hover:bg-white/10"
          aria-label="Close"
        >
          X
        </button>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div><dt className="text-slate-400">Type</dt><dd className="capitalize">{item.type}</dd></div>
        <div><dt className="text-slate-400">Status</dt><dd>{status}</dd></div>
        <div>
          <dt className="text-slate-400">Owner</dt>
          <dd>{ownership.label}</dd>
          <dd className="mt-1 text-xs text-slate-400">{ownership.detail}</dd>
        </div>
        <div><dt className="text-slate-400">Description</dt><dd>{description}</dd></div>
      </dl>
    </aside>
  );
}
