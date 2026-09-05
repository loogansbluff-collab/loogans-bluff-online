"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/state/gameStore";

export default function ModeFade() {
  const mode = useGameStore((state) => state.mode);
  const previousMode = useRef(mode);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (previousMode.current === mode) return;
    previousMode.current = mode;
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 280);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-50 bg-black transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}
