"use client";

import { MapControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { ElementRef } from "react";
import { townData } from "@/data/town";
import { useGameStore } from "@/state/gameStore";

const LANDING_TARGET: [number, number, number] = [0, 0, 32];
const PAN_X_LIMIT = 28;
const NORTH_TARGET_Z = -28;
const SOUTH_TARGET_Z = 32;
const CAMERA_HEIGHT = 14;
const CAMERA_SOUTH_OFFSET = 38;
const LOOK_AT_Y = 0;
const LOOK_POINT_SOUTH_OFFSET = 12;
const WHEEL_STEP = 8;
const STREET_ENTRY_Z = NORTH_TARGET_Z;
const PLAYER_RADIUS = 0.4;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampRange(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isBlocked(x: number, z: number) {
  return townData.buildings.some((building) => {
    const [buildingX, , buildingZ] = building.position;
    const [width, , depth] = building.size;
    return Math.abs(x - buildingX) < width / 2 + PLAYER_RADIUS && Math.abs(z - buildingZ) < depth / 2 + PLAYER_RADIUS;
  });
}

function findStreetEntry(x: number, z: number): [number, number] {
  const mapLimit = townData.groundSize / 2 - 1;
  const targetX = clamp(x, -mapLimit, mapLimit);
  const targetZ = clamp(z, -mapLimit, mapLimit);

  if (!isBlocked(targetX, targetZ)) return [targetX, targetZ];

  const candidates: Array<[number, number]> = [];

  for (const road of townData.roads) {
    const [roadX, , roadZ] = road.position;
    const [width, , depth] = road.size;

    if (width >= depth) {
      candidates.push([
        clampRange(targetX, roadX - width / 2 + 1, roadX + width / 2 - 1),
        roadZ,
      ]);
    } else {
      candidates.push([
        roadX,
        clampRange(targetZ, roadZ - depth / 2 + 1, roadZ + depth / 2 - 1),
      ]);
    }
  }

  candidates.push([townData.streetSpawn[0], townData.streetSpawn[2]]);

  const openCandidates = candidates.filter(([candidateX, candidateZ]) => !isBlocked(candidateX, candidateZ));
  openCandidates.sort(
    (a, b) =>
      Math.hypot(a[0] - targetX, a[1] - targetZ) - Math.hypot(b[0] - targetX, b[1] - targetZ),
  );

  return openCandidates[0] ?? [townData.streetSpawn[0], townData.streetSpawn[2]];
}

export default function AerialControls() {
  const { camera } = useThree();
  const controlsRef = useRef<ElementRef<typeof MapControls>>(null);
  const enteringStreet = useRef(false);
  const returnFramePending = useRef(true);
  const lockedTargetZ = useRef(LANDING_TARGET[2]);
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const focusNonce = useGameStore((state) => state.focusNonce);
  const focusPosition = useGameStore((state) => state.focusPosition);
  const resetNonce = useGameStore((state) => state.resetNonce);
  const requestedTarget = mode === "aerial" && focusPosition ? focusPosition : LANDING_TARGET;
  const target: [number, number, number] = [
    clamp(requestedTarget[0], -PAN_X_LIMIT, PAN_X_LIMIT),
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

    const clampedX = clamp(targetX, -PAN_X_LIMIT, PAN_X_LIMIT);
    const clampedZ = clamp(targetZ, NORTH_TARGET_Z, SOUTH_TARGET_Z);
    lockedTargetZ.current = clampedZ;
    controls.target.set(clampedX, 0, clampedZ);
    camera.position.set(clampedX, CAMERA_HEIGHT, clampedZ + CAMERA_SOUTH_OFFSET);
    applyObliqueLook(clampedX, clampedZ);
    controls.update();
  };

  const enterStreetAtTarget = () => {
    const controls = controlsRef.current;
    if (!controls || enteringStreet.current || mode !== "aerial") return;

    const [entryX, entryZ] = findStreetEntry(controls.target.x, controls.target.z);
    enteringStreet.current = true;
    camera.position.set(entryX, townData.streetSpawn[1], entryZ);
    camera.rotation.set(0, 0, 0);
    setPlayerPosition([entryX, townData.streetSpawn[1], entryZ]);
    setMode("street");
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

      if (event.deltaY < 0 && nextZ <= STREET_ENTRY_Z) {
        enterStreetAtTarget();
      }
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

    const targetX = clamp(playerPosition[0], -PAN_X_LIMIT, PAN_X_LIMIT);
    const targetZ = clamp(playerPosition[2], NORTH_TARGET_Z, SOUTH_TARGET_Z);
    setAerialPose(targetX, targetZ);
    returnFramePending.current = false;
  });

  const clampHorizontalPan = () => {
    const controls = controlsRef.current;
    if (!controls) return;

    const targetX = clamp(controls.target.x, -PAN_X_LIMIT, PAN_X_LIMIT);
    controls.target.x = targetX;
    controls.target.y = 0;
    controls.target.z = lockedTargetZ.current;
    camera.position.x = targetX;
    camera.position.y = CAMERA_HEIGHT;
    camera.position.z = lockedTargetZ.current + CAMERA_SOUTH_OFFSET;
    applyObliqueLook(targetX, lockedTargetZ.current);
  };

  return (
    <MapControls
      ref={controlsRef}
      key={`${focusNonce}-${resetNonce}`}
      enableRotate={false}
      enableZoom={false}
      target={target}
      screenSpacePanning={false}
      onChange={clampHorizontalPan}
    />
  );
}
