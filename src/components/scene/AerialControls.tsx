"use client";

import { MapControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { ElementRef } from "react";
import { useGameStore } from "@/state/gameStore";

const ORIGIN: [number, number, number] = [0, 0, 0];
const PAN_LIMIT = 20;
const CAMERA_XZ_LIMIT = 54;

function clamp(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
}

export default function AerialControls() {
  const { camera } = useThree();
  const controlsRef = useRef<ElementRef<typeof MapControls>>(null);
  const mode = useGameStore((state) => state.mode);
  const focusNonce = useGameStore((state) => state.focusNonce);
  const focusPosition = useGameStore((state) => state.focusPosition);
  const resetNonce = useGameStore((state) => state.resetNonce);
  const requestedTarget = mode === "aerial" && focusPosition ? focusPosition : ORIGIN;
  const target: [number, number, number] = [
    clamp(requestedTarget[0], PAN_LIMIT),
    requestedTarget[1],
    clamp(requestedTarget[2], PAN_LIMIT),
  ];

  useEffect(() => {
    if (resetNonce === 0) return;
    camera.position.set(0, 45, 45);
    camera.lookAt(0, 0, 0);
  }, [camera, resetNonce]);

  const clampAerialView = () => {
    const controls = controlsRef.current;
    if (!controls) return;

    const clampedTargetX = clamp(controls.target.x, PAN_LIMIT);
    const clampedTargetZ = clamp(controls.target.z, PAN_LIMIT);
    const shiftX = clampedTargetX - controls.target.x;
    const shiftZ = clampedTargetZ - controls.target.z;

    if (shiftX !== 0 || shiftZ !== 0) {
      controls.target.x = clampedTargetX;
      controls.target.z = clampedTargetZ;
      camera.position.x += shiftX;
      camera.position.z += shiftZ;
    }

    camera.position.x = clamp(camera.position.x, CAMERA_XZ_LIMIT);
    camera.position.z = clamp(camera.position.z, CAMERA_XZ_LIMIT);
  };

  return (
    <MapControls
      ref={controlsRef}
      key={`${focusNonce}-${resetNonce}`}
      enableRotate={false}
      minDistance={18}
      maxDistance={90}
      target={target}
      screenSpacePanning
      onChange={clampAerialView}
    />
  );
}
