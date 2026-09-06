"use client";

import { useEffect, useMemo, useState } from "react";
import { townData } from "@/data/town";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";

export default function TownDirectory() {
  const mode = useGameStore((state) => state.mode);
  const setSelectedId = useGameStore((state) => state.setSelectedId);
  const requestFocus = useGameStore((state) => state.requestFocus);
  const [expanded, setExpanded] = useState(mode === "aerial");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setExpanded(mode === "aerial");
  }, [mode]);

  const normalizedFilter = filter.trim().toLowerCase();
  const buildings = useMemo(
    () =>
      townData.buildings.filter(
        (item) =>
          !normalizedFilter ||
          item.name.toLowerCase().includes(normalizedFilter) ||
          item.id.toLowerCase().includes(normalizedFilter),
      ),
    [normalizedFilter],
  );
  const lots = useMemo(
    () =>
      townData.lots.filter(
        (item) =>
          !isSouthTreeLotId(item.id) &&
          (!normalizedFilter ||
            item.name.toLowerCase().includes(normalizedFilter) ||
            item.id.toLowerCase().includes(normalizedFilter)),
      ),
    [normalizedFilter],
  );

  const selectProperty = (id: string, position: [number, number, number]) => {
    const [x, , z] = position;
    setSelectedId(id);
    requestFocus([x, 0, z]);
  };

  return (
    <aside className="fixed right-4 top-20 z-20 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-slate-950/90 text-white shadow-2xl backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
        aria-expanded={expanded}
      >
        <span>Town Directory</span>
        <span className="text-slate-400">{expanded ? "−" : "+"}</span>
      </button>

      {expanded ? (
        <div className="border-t border-white/10 p-3">
          <input
            type="text"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter name or ID"
            className="mb-3 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-white/30"
          />

          <div className="max-h-[56vh] space-y-4 overflow-y-auto pr-1">
            <section>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Buildings</div>
              <div className="space-y-1">
                {buildings.map((building) => (
                  <button
                    key={building.id}
                    type="button"
                    onClick={() => selectProperty(building.id, building.position)}
                    className="block w-full rounded px-2 py-2 text-left hover:bg-white/10"
                  >
                    <div className="text-xs font-medium">{building.name}</div>
                    <div className="text-[10px] text-slate-500">{building.id}</div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Lots</div>
              <div className="space-y-1">
                {lots.map((lot) => (
                  <button
                    key={lot.id}
                    type="button"
                    onClick={() => selectProperty(lot.id, lot.position)}
                    className="block w-full rounded px-2 py-2 text-left hover:bg-white/10"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span>{lot.name}</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase text-slate-400">Lot</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{lot.id}</div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
