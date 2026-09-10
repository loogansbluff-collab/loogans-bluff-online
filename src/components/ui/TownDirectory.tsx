"use client";

import { useMemo, useState } from "react";
import { townData } from "@/data/town";
import { enterStreetInFront } from "@/lib/enterBuildingStreet";
import { isSouthTreeLotId } from "@/lib/southDecor";

const AQUATICS_SOURCE_ID = "LB-COMMUNITY-001";
const AQUATICS_DIRECTORY_ID = "LB-AQUATICS-001";
const AQUATICS_DIRECTORY_NAME = "Bluff Aquatics Centre";

function getDirectoryBuildingName(id: string, name: string) {
  return id === AQUATICS_SOURCE_ID ? AQUATICS_DIRECTORY_NAME : name;
}

function getDirectoryBuildingId(id: string) {
  return id === AQUATICS_SOURCE_ID ? AQUATICS_DIRECTORY_ID : id;
}

export default function TownDirectory() {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("");

  const normalizedFilter = filter.trim().toLowerCase();
  const buildings = useMemo(
    () =>
      townData.buildings.filter((item) => {
        const directoryName = getDirectoryBuildingName(item.id, item.name).toLowerCase();
        const directoryId = getDirectoryBuildingId(item.id).toLowerCase();
        return !normalizedFilter || directoryName.includes(normalizedFilter) || directoryId.includes(normalizedFilter);
      }),
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

  return (
    <aside className="fixed bottom-4 right-4 z-20 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-slate-950/90 text-white shadow-2xl backdrop-blur-sm">
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
                {buildings.map((building) => {
                  const directoryName = getDirectoryBuildingName(building.id, building.name);
                  const directoryId = getDirectoryBuildingId(building.id);
                  return (
                    <button
                      key={building.id}
                      type="button"
                      onClick={() => enterStreetInFront(building.id)}
                      className="block w-full rounded px-2 py-2 text-left hover:bg-white/10"
                    >
                      <div className="text-xs font-medium">{directoryName}</div>
                      <div className="text-[10px] text-slate-500">{directoryId}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Lots</div>
              <div className="space-y-1">
                {lots.map((lot) => (
                  <button
                    key={lot.id}
                    type="button"
                    onClick={() => enterStreetInFront(lot.id)}
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
