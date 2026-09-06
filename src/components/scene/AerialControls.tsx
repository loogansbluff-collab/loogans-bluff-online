"use client";

import { MapControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useGameStore } from "@/state/gameStore";

const ORIGIN: [number, number, number] = [0, 0, 0];

export default function AerialControls() {
  const { camera } = useThree();
  const mode = useGameStore((state) => state.mode);
  const focusNonce = useGameStore((state) => state.focusNonce);
  const focusPosition = useGameStore((state) => state.focusPosition);
  const resetNonce = useGameStore((state) => state.resetNonce);
  const target = mode === "aerial" && focusPosition ? focusPosition : ORIGIN;

  useEffect(() => {
    if (resetNonce === 0) return;
    camera.position.set(0, 45, 45);
    camera.lookAt(0, 0, 0);
  }, [camera, resetNonce]);

  return (
    <MapControls
      key={`${focusNonce}-${resetNonce}`}
      enableRotate={false}
      minDistance={18}
      maxDistance={90}
      target={target}
      screenSpacePanning
    />
  );
}
