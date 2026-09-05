"use client";

import { useGameStore } from "@/state/gameStore";

export default function ControlsLegend() {
  const mode = useGameStore((state) => state.mode);

  const controls =
    mode === "aerial"
      ? ["Drag to pan", "Scroll to zoom", "Click a building for info"]
      : ["WASD move", "Mouse look", "Esc release mouse", "Walk near a building to see its name", "E inspect nearby property"];

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
