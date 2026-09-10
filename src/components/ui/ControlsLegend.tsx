"use client";

import { useState } from "react";
import { townData } from "@/data/town";
import { isInteriorShopId } from "@/lib/enterInterior";
import { findNearestProperty } from "@/lib/proximity";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";

const PROXIMITY_RANGE = 4.5;

export default function ControlsLegend() {
  const mode = useGameStore((state) => state.mode);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const [expanded, setExpanded] = useState(false);

  let controls: string[];

  if (mode === "aerial") {
    controls = [
      "Aerial view: Drag to pan all or wheel north & south",
      "Exit walk mode: Esc or wheel South",
      "Tap a building to spawn in front view",
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
    <aside className="fixed bottom-4 left-4 z-20 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-slate-950/90 text-white shadow-2xl backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
        aria-expanded={expanded}
      >
        <span className="uppercase tracking-wide text-slate-300">Controls</span>
        <span className="text-slate-400">{expanded ? "−" : "+"}</span>
      </button>

      {expanded ? (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-white">
          <ul className="space-y-1">
            {controls.map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
