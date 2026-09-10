"use client";

import { useEffect, useMemo, useState } from "react";
import type { PointerEvent } from "react";
import { townData } from "@/data/town";
import { isInteriorShopId } from "@/lib/enterInterior";
import { findNearestProperty } from "@/lib/proximity";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";

const PROXIMITY_RANGE = 4.5;

type MoveCode = "KeyW" | "KeyA" | "KeyS" | "KeyD";

function fireKey(code: string, type: "keydown" | "keyup") {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
}

function holdHandlers(code: MoveCode) {
  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      fireKey(code, "keydown");
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      fireKey(code, "keyup");
    },
    onPointerCancel: () => fireKey(code, "keyup"),
    onPointerLeave: () => fireKey(code, "keyup"),
  };
}

export default function MobileControls() {
  const mode = useGameStore((state) => state.mode);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const [touchCapable, setTouchCapable] = useState(false);

  useEffect(() => {
    const update = () => {
      setTouchCapable(window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const nearest = useMemo(() => {
    if (mode !== "street") return null;
    return findNearestProperty(
      playerPosition,
      [...townData.buildings, ...townData.lots.filter((lot) => !isSouthTreeLotId(lot.id))],
      PROXIMITY_RANGE,
    );
  }, [mode, playerPosition]);

  if (!touchCapable || (mode !== "street" && mode !== "interior")) return null;

  const canEnter = mode === "street" && nearest && isInteriorShopId(nearest.id);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-[70] px-3">
      <div className="flex items-end justify-between gap-3">
        <div className="pointer-events-auto grid grid-cols-3 grid-rows-2 gap-1 select-none touch-none">
          <div />
          <button
            type="button"
            aria-label="Move forward"
            className="h-12 w-12 rounded-lg bg-slate-950/80 text-xl font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90"
            {...holdHandlers("KeyW")}
          >
            ▲
          </button>
          <div />
          <button
            type="button"
            aria-label="Move left"
            className="h-12 w-12 rounded-lg bg-slate-950/80 text-xl font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90"
            {...holdHandlers("KeyA")}
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Move backward"
            className="h-12 w-12 rounded-lg bg-slate-950/80 text-xl font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90"
            {...holdHandlers("KeyS")}
          >
            ▼
          </button>
          <button
            type="button"
            aria-label="Move right"
            className="h-12 w-12 rounded-lg bg-slate-950/80 text-xl font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90"
            {...holdHandlers("KeyD")}
          >
            ▶
          </button>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {mode === "street" && nearest ? (
            <button
              type="button"
              onClick={() => {
                fireKey("KeyE", "keydown");
                fireKey("KeyE", "keyup");
              }}
              className="rounded-lg bg-slate-950/80 px-4 py-3 text-xs font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90"
            >
              INFO
            </button>
          ) : null}

          {canEnter ? (
            <button
              type="button"
              onClick={() => {
                fireKey("KeyF", "keydown");
                fireKey("KeyF", "keyup");
              }}
              className="rounded-lg bg-slate-950/90 px-4 py-3 text-xs font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90"
            >
              ENTER
            </button>
          ) : null}

          {mode === "interior" ? (
            <button
              type="button"
              onClick={() => {
                fireKey("KeyR", "keydown");
                fireKey("KeyR", "keyup");
              }}
              className="rounded-lg bg-slate-950/90 px-4 py-3 text-xs font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90"
            >
              LEAVE
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
