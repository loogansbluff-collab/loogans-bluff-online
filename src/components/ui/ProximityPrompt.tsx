"use client";

import { townData } from "@/data/town";
import { findNearestProperty } from "@/lib/proximity";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";

const PROXIMITY_RANGE = 4.5;

export default function ProximityPrompt() {
  const mode = useGameStore((state) => state.mode);
  const playerPosition = useGameStore((state) => state.playerPosition);

  if (mode !== "street") return null;

  const nearest = findNearestProperty(
    playerPosition,
    [...townData.buildings, ...townData.lots.filter((lot) => !isSouthTreeLotId(lot.id))],
    PROXIMITY_RANGE,
  );

  if (!nearest) return null;

  const isLot = nearest.type === "lot";

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded bg-black/75 px-4 py-2 text-center text-sm text-white shadow-lg backdrop-blur-sm">
      <div className="font-semibold">{nearest.name}</div>
      {isLot ? <div className="text-xs text-slate-300">Coming soon</div> : null}
      <div className="mt-1 text-xs text-slate-200">Press E for info</div>
    </div>
  );
}
