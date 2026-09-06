"use client";

import { useGameStore } from "@/state/gameStore";

export default function TopHud() {
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const requestFocus = useGameStore((state) => state.requestFocus);

  const returnToAerial = () => {
    requestFocus([playerPosition[0], 0, playerPosition[2]]);
    if (document.pointerLockElement) document.exitPointerLock();
    setMode("aerial");
  };

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 text-center">
      {mode === "aerial" ? (
        <button
          type="button"
          onClick={() => setMode("street")}
          className="pointer-events-auto rounded bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg"
        >
          WALK AROUND LOOGANS BLUFF
        </button>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={returnToAerial}
            className="pointer-events-auto relative z-[60] rounded bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            RETURN TO TOWN VIEW
          </button>
          <p className="rounded bg-black/70 px-3 py-1 text-xs text-white">
            Click the canvas to look around. Esc returns to town view. Wheel out also returns. WASD moves.
          </p>
        </div>
      )}
    </div>
  );
}
