"use client";

import { MapControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { ElementRef } from "react";
import { townData } from "@/data/town";
import { EAST_AERIAL_MAX_X, WEST_AERIAL_MIN_X } from "@/lib/westWorld";
import { useGameStore } from "@/state/gameStore";

const LANDING_TARGET: [number, number, number] = [0, 0, 32];
const NORTH_TARGET_Z = -197;
const SOUTH_TARGET_Z = 32;
const CAMERA_HEIGHT = 14;
const CAMERA_SOUTH_OFFSET = 38;
const LOOK_AT_Y = 0;
const LOOK_POINT_SOUTH_OFFSET = 12;
const WHEEL_STEP = 8;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function AerialControls() {
  const { camera } = useThree();
  const controlsRef = useRef<ElementRef<typeof MapControls>>(null);
  const returnFramePending = useRef(true);
  const lockedTargetZ = useRef(LANDING_TARGET[2]);
  const mode = useGameStore((state) => state.mode);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const focusNonce = useGameStore((state) => state.focusNonce);
  const focusPosition = useGameStore((state) => state.focusPosition);
  const resetNonce = useGameStore((state) => state.resetNonce);
  const requestedTarget = mode === "aerial" && focusPosition ? focusPosition : LANDING_TARGET;
  const target: [number, number, number] = [
    clamp(requestedTarget[0], WEST_AERIAL_MIN_X, EAST_AERIAL_MAX_X),
    0,
    clamp(requestedTarget[2], NORTH_TARGET_Z, SOUTH_TARGET_Z),
  ];

  const returningAbovePlayer =
    focusPosition !== null &&
    Math.abs(focusPosition[0] - playerPosition[0]) < 0.01 &&
    Math.abs(focusPosition[2] - playerPosition[2]) < 0.01 &&
    Math.abs(playerPosition[1] - townData.streetSpawn[1]) < 0.01;

  const applyObliqueLook = (targetX: number, targetZ: number) => {
    camera.lookAt(targetX, LOOK_AT_Y, targetZ + LOOK_POINT_SOUTH_OFFSET);
  };

  const setAerialPose = (targetX: number, targetZ: number) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const clampedX = clamp(targetX, WEST_AERIAL_MIN_X, EAST_AERIAL_MAX_X);
    const clampedZ = clamp(targetZ, NORTH_TARGET_Z, SOUTH_TARGET_Z);
    lockedTargetZ.current = clampedZ;
    controls.target.set(clampedX, 0, clampedZ);
    camera.position.set(clampedX, CAMERA_HEIGHT, clampedZ + CAMERA_SOUTH_OFFSET);
    applyObliqueLook(clampedX, clampedZ);
    controls.update();
  };

  useEffect(() => {
    lockedTargetZ.current = target[2];
  }, [focusNonce, resetNonce, target[2]]);

  useEffect(() => {
    if (resetNonce === 0) return;
    returnFramePending.current = false;
    lockedTargetZ.current = LANDING_TARGET[2];
    camera.position.set(0, CAMERA_HEIGHT, LANDING_TARGET[2] + CAMERA_SOUTH_OFFSET);
    applyObliqueLook(LANDING_TARGET[0], LANDING_TARGET[2]);
  }, [camera, resetNonce]);

  useEffect(() => {
    if (mode !== "aerial") return;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;
      const controls = controlsRef.current;
      if (!controls) return;

      event.preventDefault();
      const direction = event.deltaY < 0 ? -1 : 1;
      const nextZ = clamp(
        lockedTargetZ.current + direction * WHEEL_STEP,
        NORTH_TARGET_Z,
        SOUTH_TARGET_Z,
      );

      setAerialPose(controls.target.x, nextZ);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Escape") return;
      if (document.pointerLockElement) document.exitPointerLock();

      const controls = controlsRef.current;
      if (!controls) return;

      controls.enabled = false;
      window.requestAnimationFrame(() => {
        if (controlsRef.current === controls) controls.enabled = true;
      });
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mode]);

  useFrame(() => {
    if (!returnFramePending.current || !returningAbovePlayer) return;

    const targetX = clamp(playerPosition[0], WEST_AERIAL_MIN_X, EAST_AERIAL_MAX_X);
    const targetZ = clamp(playerPosition[2], NORTH_TARGET_Z, SOUTH_TARGET_Z);
    setAerialPose(targetX, targetZ);
    returnFramePending.current = false;
  });

  const clampAerialPan = () => {
    const controls = controlsRef.current;
    if (!controls) return;

    const targetX = clamp(controls.target.x, WEST_AERIAL_MIN_X, EAST_AERIAL_MAX_X);
    const targetZ = clamp(controls.target.z, NORTH_TARGET_Z, SOUTH_TARGET_Z);
    lockedTargetZ.current = targetZ;
    controls.target.set(targetX, 0, targetZ);
    camera.position.set(targetX, CAMERA_HEIGHT, targetZ + CAMERA_SOUTH_OFFSET);
    applyObliqueLook(targetX, targetZ);
  };

  return (
    <MapControls
      ref={controlsRef}
      key={`${focusNonce}-${resetNonce}`}
      enableRotate={false}
      enableZoom={false}
      target={target}
      screenSpacePanning={false}
      onChange={clampAerialPan}
    />
  );
}
