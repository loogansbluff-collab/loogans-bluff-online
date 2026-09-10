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

  const moveButtonClass =
    "h-10 w-10 rounded-md bg-slate-950/80 text-lg font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90";
  const actionButtonClass =
    "min-w-[3.5rem] rounded-md bg-slate-950/85 px-3 py-2 text-[11px] font-bold text-white shadow-lg backdrop-blur-sm active:bg-slate-700/90";

  return (
    <div className="pointer-events-none fixed bottom-14 left-2 right-2 z-[70]">
      <div className="flex w-full items-end justify-between gap-2">
        <div className="pointer-events-auto grid shrink-0 grid-cols-3 grid-rows-2 gap-1 select-none touch-none">
          <div />
          <button
            type="button"
            aria-label="Move forward"
            className={moveButtonClass}
            {...holdHandlers("KeyW")}
          >
            ▲
          </button>
          <div />
          <button
            type="button"
            aria-label="Move left"
            className={moveButtonClass}
            {...holdHandlers("KeyA")}
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Move backward"
            className={moveButtonClass}
            {...holdHandlers("KeyS")}
          >
            ▼
          </button>
          <button
            type="button"
            aria-label="Move right"
            className={moveButtonClass}
            {...holdHandlers("KeyD")}
          >
            ▶
          </button>
        </div>

        <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-1.5">
          {mode === "street" && nearest ? (
            <button
              type="button"
              onClick={() => {
                fireKey("KeyE", "keydown");
                fireKey("KeyE", "keyup");
              }}
              className={actionButtonClass}
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
              className={actionButtonClass}
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
              className={actionButtonClass}
            >
              LEAVE
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
