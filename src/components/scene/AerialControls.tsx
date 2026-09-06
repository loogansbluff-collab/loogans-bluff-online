"use client";

import { MapControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { ElementRef } from "react";
import { townData } from "@/data/town";
import { useGameStore } from "@/state/gameStore";

const ORIGIN: [number, number, number] = [0, 0, 0];
const PAN_LIMIT = townData.groundSize * 0.2;
const CAMERA_XZ_LIMIT = townData.groundSize * 0.85;
const START_HEIGHT = 140;
const RETURN_HEIGHT = 55;
const STREET_ENTER_DISTANCE = 12;
const PLAYER_RADIUS = 0.4;

function clamp(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
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
  const targetX = clamp(x, mapLimit);
  const targetZ = clamp(z, mapLimit);

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
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const focusNonce = useGameStore((state) => state.focusNonce);
  const focusPosition = useGameStore((state) => state.focusPosition);
  const resetNonce = useGameStore((state) => state.resetNonce);
  const requestedTarget = mode === "aerial" && focusPosition ? focusPosition : ORIGIN;
  const target: [number, number, number] = [
    clamp(requestedTarget[0], PAN_LIMIT),
    requestedTarget[1],
    clamp(requestedTarget[2], PAN_LIMIT),
  ];
  const returningAbovePlayer =
    focusPosition !== null &&
    Math.abs(focusPosition[0] - playerPosition[0]) < 0.01 &&
    Math.abs(focusPosition[2] - playerPosition[2]) < 0.01 &&
    Math.abs(playerPosition[1] - townData.streetSpawn[1]) < 0.01;

  useEffect(() => {
    if (resetNonce === 0) return;
    returnFramePending.current = false;
    camera.position.set(0, START_HEIGHT, START_HEIGHT);
    camera.lookAt(0, 0, 0);
  }, [camera, resetNonce]);

  useFrame(() => {
    if (!returnFramePending.current || !returningAbovePlayer) return;

    const controls = controlsRef.current;
    if (!controls) return;

    const targetX = clamp(playerPosition[0], PAN_LIMIT);
    const targetZ = clamp(playerPosition[2], PAN_LIMIT);
    controls.target.set(targetX, 0, targetZ);
    camera.position.set(targetX, RETURN_HEIGHT, clamp(targetZ + RETURN_HEIGHT, CAMERA_XZ_LIMIT));
    camera.lookAt(targetX, 0, targetZ);
    controls.update();
    returnFramePending.current = false;
  });

  const clampAndMaybeEnterStreet = () => {
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
      maxDistance={280}
      target={target}
      screenSpacePanning
      onChange={clampAndMaybeEnterStreet}
    />
  );
}
