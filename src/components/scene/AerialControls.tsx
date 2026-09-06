"use client";

import { MapControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { ElementRef } from "react";
import { townData } from "@/data/town";
import { useGameStore } from "@/state/gameStore";

const LANDING_TARGET: [number, number, number] = [0, 0, 20];
const PAN_X_LIMIT = 28;
const PAN_Z_MIN = -32;
const PAN_Z_MAX = 32;
const CAMERA_X_LIMIT = 58;
const CAMERA_Z_MIN = -46;
const CAMERA_Z_MAX = 66;
const START_POSITION: [number, number, number] = [0, 42, 55];
const RETURN_HEIGHT = 42;
const RETURN_SOUTH_OFFSET = 35;
const STREET_ENTER_DISTANCE = 12;
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
    clamp(requestedTarget[2], PAN_Z_MIN, PAN_Z_MAX),
  ];

  const returningAbovePlayer =
    focusPosition !== null &&
    Math.abs(focusPosition[0] - playerPosition[0]) < 0.01 &&
    Math.abs(focusPosition[2] - playerPosition[2]) < 0.01 &&
    Math.abs(playerPosition[1] - townData.streetSpawn[1]) < 0.01;

  useEffect(() => {
    lockedTargetZ.current = target[2];
  }, [focusNonce, resetNonce, target[2]]);

  useEffect(() => {
    if (resetNonce === 0) return;
    returnFramePending.current = false;
    lockedTargetZ.current = LANDING_TARGET[2];
    camera.position.set(...START_POSITION);
    camera.lookAt(...LANDING_TARGET);
  }, [camera, resetNonce]);

  useFrame(() => {
    if (!returnFramePending.current || !returningAbovePlayer) return;

    const controls = controlsRef.current;
    if (!controls) return;

    const targetX = clamp(playerPosition[0], -PAN_X_LIMIT, PAN_X_LIMIT);
    const targetZ = clamp(playerPosition[2], PAN_Z_MIN, PAN_Z_MAX);
    lockedTargetZ.current = targetZ;
    controls.target.set(targetX, 0, targetZ);
    camera.position.set(
      targetX,
      RETURN_HEIGHT,
      clamp(targetZ + RETURN_SOUTH_OFFSET, CAMERA_Z_MIN, CAMERA_Z_MAX),
    );
    camera.lookAt(targetX, 0, targetZ);
    controls.update();
    returnFramePending.current = false;
  });

  const clampAndMaybeEnterStreet = () => {
    const controls = controlsRef.current;
    if (!controls) return;

    const clampedTargetX = clamp(controls.target.x, -PAN_X_LIMIT, PAN_X_LIMIT);
    const clampedTargetZ = clamp(lockedTargetZ.current, PAN_Z_MIN, PAN_Z_MAX);
    const shiftX = clampedTargetX - controls.target.x;
    const shiftZ = clampedTargetZ - controls.target.z;

    controls.target.x = clampedTargetX;
    controls.target.y = 0;
    controls.target.z = clampedTargetZ;

    if (shiftX !== 0) camera.position.x += shiftX;
    if (shiftZ !== 0) camera.position.z += shiftZ;

    camera.position.x = clamp(camera.position.x, -CAMERA_X_LIMIT, CAMERA_X_LIMIT);
    camera.position.z = clamp(camera.position.z, CAMERA_Z_MIN, CAMERA_Z_MAX);

    if (enteringStreet.current || mode !== "aerial") return;

    const distance = camera.position.distanceTo(controls.target);
    if (distance >= STREET_ENTER_DISTANCE) return;

    const [entryX, entryZ] = findStreetEntry(controls.target.x, controls.target.z);
    enteringStreet.current = true;
    camera.position.set(entryX, townData.streetSpawn[1], entryZ);
    camera.rotation.set(0, 0, 0);
    setPlayerPosition([entryX, townData.streetSpawn[1], entryZ]);
    setMode("street");
  };

  return (
    <MapControls
      ref={controlsRef}
      key={`${focusNonce}-${resetNonce}`}
      enableRotate={false}
      minDistance={8}
      maxDistance={90}
      target={target}
      screenSpacePanning={false}
      onChange={clampAndMaybeEnterStreet}
    />
  );
}
