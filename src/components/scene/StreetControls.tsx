"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { townData } from "@/data/town";
import {
  getEastBridgeDeckHeight,
  isInEastBridgeRailZone,
  isInEastLake,
} from "@/lib/eastLake";
import {
  EAST_WALK_MAX_X,
  NORTH_SOUTH_WALK_LIMIT,
  WEST_WALK_MIN_X,
  isInCountryWestHouse,
  isInCountryWestRoadblock,
  isInWestBridgeRailZone,
  isInWestRiverChannel,
  isOutsideWestRuralTravelCorridor,
} from "@/lib/westWorld";
import { useGameStore } from "@/state/gameStore";

const SPEED = 8;
const PLAYER_RADIUS = 0.4;
const TOUCH_LOOK_SPEED = 0.004;
const MAX_LOOK_UP = MathUtils.degToRad(80);
const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isBlocked(x: number, z: number) {
  if (isInEastBridgeRailZone(x, z)) return true;
  if (isInEastLake(x, z)) return true;
  if (isInCountryWestRoadblock(x, z)) return true;
  if (isInCountryWestHouse(x, z)) return true;
  if (isInWestBridgeRailZone(x, z)) return true;
  if (isInWestRiverChannel(x, z)) return true;
  if (isOutsideWestRuralTravelCorridor(x, z)) return true;

  return townData.buildings.some((building) => {
    const [buildingX, , buildingZ] = building.position;
    const [width, , depth] = building.size;
    return Math.abs(x - buildingX) < width / 2 + PLAYER_RADIUS && Math.abs(z - buildingZ) < depth / 2 + PLAYER_RADIUS;
  });
}

export default function StreetControls() {
  const { camera, gl } = useThree();
  const setMode = useGameStore((state) => state.setMode);
  const requestFocus = useGameStore((state) => state.requestFocus);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setStreetEntry = useGameStore((state) => state.setStreetEntry);
  const setStreetEntryYaw = useGameStore((state) => state.setStreetEntryYaw);
  const pressedKeys = useRef(new Set<string>());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const movement = useRef(new Vector3());
  const returningToAerial = useRef(false);
  const wasPointerLocked = useRef(false);
  const touchLook = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const streetY = townData.streetSpawn[1];
    const oneShotEntry = useGameStore.getState().streetEntry;
    const oneShotEntryYaw = useGameStore.getState().streetEntryYaw;
    const landedFromAerial = Math.abs(camera.position.y - streetY) < 0.05;
    const [spawnX, , spawnZ] = townData.streetSpawn;
    const entryX = oneShotEntry?.[0] ?? (landedFromAerial ? camera.position.x : spawnX);
    const entryZ = oneShotEntry?.[2] ?? (landedFromAerial ? camera.position.z : spawnZ);

    camera.position.set(entryX, streetY, entryZ);
    camera.rotation.order = "YXZ";
    camera.rotation.set(0, oneShotEntryYaw ?? 0, 0);
    setPlayerPosition([entryX, streetY, entryZ]);
    setStreetEntry(null);
    setStreetEntryYaw(null);

    if (camera instanceof PerspectiveCamera) {
      camera.fov = 70;
      camera.near = 0.1;
      camera.far = 200;
      camera.updateProjectionMatrix();
    }

    const returnToAerial = () => {
      if (returningToAerial.current) return;
      returningToAerial.current = true;
      requestFocus([camera.position.x, 0, camera.position.z]);
      if (document.pointerLockElement) document.exitPointerLock();
      setStreetEntry(null);
      setStreetEntryYaw(null);
      setMode("aerial");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) {
        pressedKeys.current.add(event.code);
        return;
      }

      if (event.code === "Escape") {
        event.preventDefault();
        returnToAerial();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) pressedKeys.current.delete(event.code);
    };

    const onPointerLockChange = () => {
      const locked = Boolean(document.pointerLockElement);
      if (wasPointerLocked.current && !locked) returnToAerial();
      wasPointerLocked.current = locked;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        event.preventDefault();
        returnToAerial();
      }
    };

    const canvas = gl.domElement;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      touchLook.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
    };

    const onTouchMove = (event: TouchEvent) => {
      const active = touchLook.current;
      if (!active) return;
      const touch = Array.from(event.touches).find((item) => item.identifier === active.id);
      if (!touch) return;

      event.preventDefault();
      const dx = touch.clientX - active.x;
      const dy = touch.clientY - active.y;
      active.x = touch.clientX;
      active.y = touch.clientY;

      camera.rotation.y -= dx * TOUCH_LOOK_SPEED;
      camera.rotation.x -= dy * TOUCH_LOOK_SPEED;
      camera.rotation.x = MathUtils.clamp(camera.rotation.x, -MAX_LOOK_UP, MAX_LOOK_UP);
    };

    const clearTouchLook = () => {
      touchLook.current = null;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("pointerlockchange", onPointerLockChange);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", clearTouchLook);
    canvas.addEventListener("touchcancel", clearTouchLook);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", clearTouchLook);
      canvas.removeEventListener("touchcancel", clearTouchLook);
      touchLook.current = null;
      pressedKeys.current.clear();
    };
  }, [camera, gl, requestFocus, setMode, setPlayerPosition, setStreetEntry, setStreetEntryYaw]);

  useFrame((_, delta) => {
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;

    if (forward.current.lengthSq() > 0) {
      forward.current.normalize();
      right.current.set(-forward.current.z, 0, forward.current.x);
      movement.current.set(0, 0, 0);

      if (pressedKeys.current.has("KeyW")) movement.current.add(forward.current);
      if (pressedKeys.current.has("KeyS")) movement.current.sub(forward.current);
      if (pressedKeys.current.has("KeyD")) movement.current.add(right.current);
      if (pressedKeys.current.has("KeyA")) movement.current.sub(right.current);

      if (movement.current.lengthSq() > 0) {
        movement.current.normalize().multiplyScalar(SPEED * delta);

        const proposedX = clamp(camera.position.x + movement.current.x, WEST_WALK_MIN_X, EAST_WALK_MAX_X);
        if (!isBlocked(proposedX, camera.position.z)) camera.position.x = proposedX;

        const proposedZ = clamp(
          camera.position.z + movement.current.z,
          -NORTH_SOUTH_WALK_LIMIT,
          NORTH_SOUTH_WALK_LIMIT,
        );
        if (!isBlocked(camera.position.x, proposedZ)) camera.position.z = proposedZ;
      }
    }

    camera.position.x = clamp(camera.position.x, WEST_WALK_MIN_X, EAST_WALK_MAX_X);
    camera.position.z = clamp(camera.position.z, -NORTH_SOUTH_WALK_LIMIT, NORTH_SOUTH_WALK_LIMIT);
    camera.position.y =
      townData.streetSpawn[1] + getEastBridgeDeckHeight(camera.position.x, camera.position.z);

    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z]);
  });

  return <PointerLockControls />;
}
