"use client";

import { useGameStore } from "@/state/gameStore";

export default function TopHud() {
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);
  const requestAerialReset = useGameStore((state) => state.requestAerialReset);

  const returnToAerial = () => {
    if (document.pointerLockElement) document.exitPointerLock();
    setMode("aerial");
  };

  const resetTownView = () => {
    if (document.pointerLockElement) document.exitPointerLock();
    setMode("aerial");
    requestAerialReset();
  };

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-20 -translate-x-1/2 text-center">
      {mode === "aerial" ? (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setMode("street")}
            className="pointer-events-auto rounded bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            WALK AROUND LOOGANS BLUFF
          </button>
          <button
            type="button"
            onClick={resetTownView}
            className="pointer-events-auto rounded bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            RESET TOWN VIEW
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={returnToAerial}
            className="pointer-events-auto rounded bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            RETURN TO TOWN VIEW
          </button>
          <p className="rounded bg-black/70 px-3 py-1 text-xs text-white">
            Click the canvas to look around. Esc releases the mouse. WASD moves.
          </p>
        </div>
      )}
    </div>
  );
}
