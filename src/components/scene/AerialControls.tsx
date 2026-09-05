"use client";

import { MapControls } from "@react-three/drei";
import { useGameStore } from "@/state/gameStore";

export default function AerialControls() {
  const mode = useGameStore((state) => state.mode);
  const focusNonce = useGameStore((state) => state.focusNonce);
  const focusPosition = useGameStore((state) => state.focusPosition);
  const target = mode === "aerial" && focusPosition ? focusPosition : [0, 0, 0];

  return (
    <MapControls
      key={focusNonce}
      enableRotate={false}
      minDistance={18}
      maxDistance={90}
      target={target}
      screenSpacePanning
    />
  );
}
