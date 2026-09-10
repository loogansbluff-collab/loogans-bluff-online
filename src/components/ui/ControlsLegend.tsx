"use client";

import { townData } from "@/data/town";
import { isInteriorShopId } from "@/lib/enterInterior";
import { findNearestProperty } from "@/lib/proximity";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";

const PROXIMITY_RANGE = 4.5;

export default function ControlsLegend() {
  const mode = useGameStore((state) => state.mode);
  const playerPosition = useGameStore((state) => state.playerPosition);

  let controls: string[];

  if (mode === "aerial") {
    controls = [
      "1. Drag to pan all directions",
      "2. Arial View: Wheel North & South",
      "3. Exit walk mode: Esc or wheel South",
      "4. Tap a building to spawn in front view",
    ];
  } else if (mode === "interior") {
    controls = ["WASD move", "Mouse look", "R = leave shop"];
  } else {
    controls = ["WASD move", "Mouse look", "Esc = town view", "Wheel out = town view", "E inspect nearby property"];
    const nearest = findNearestProperty(
      playerPosition,
      [...townData.buildings, ...townData.lots.filter((lot) => !isSouthTreeLotId(lot.id))],
      PROXIMITY_RANGE,
    );
    if (nearest && isInteriorShopId(nearest.id)) controls.push("F = enter shop");
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-20 rounded bg-slate-950/75 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm">
      <div className="font-semibold uppercase tracking-wide text-slate-300">Controls</div>
      <ul className="mt-1 space-y-0.5">
        {controls.map((control) => (
          <li key={control}>{control}</li>
        ))}
      </ul>
    </div>
  );
}
