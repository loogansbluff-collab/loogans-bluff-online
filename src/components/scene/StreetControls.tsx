"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { townData } from "@/data/town";
import { useGameStore } from "@/state/gameStore";

const SPEED = 8;
const PLAYER_RADIUS = 0.4;
const EDGE_PADDING = 1;
const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

function clampToLimit(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
}

function isBlocked(x: number, z: number) {
  return townData.buildings.some((building) => {
    const [buildingX, , buildingZ] = building.position;
    const [width, , depth] = building.size;
    return Math.abs(x - buildingX) < width / 2 + PLAYER_RADIUS && Math.abs(z - buildingZ) < depth / 2 + PLAYER_RADIUS;
  });
}

export default function StreetControls() {
  const { camera } = useThree();
  const setMode = useGameStore((state) => state.setMode);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const pressedKeys = useRef(new Set<string>());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const movement = useRef(new Vector3());
  const escapeReady = useRef(false);
  const limit = townData.groundSize / 2 - EDGE_PADDING;

  useEffect(() => {
    const [x, y, z] = townData.streetSpawn;
    camera.position.set(x, y, z);
    camera.rotation.set(0, 0, 0);
    setPlayerPosition([x, y, z]);

    if (camera instanceof PerspectiveCamera) {
      camera.fov = 70;
      camera.near = 0.1;
      camera.far = 200;
      camera.updateProjectionMatrix();
    }

    const returnToAerial = () => {
      if (document.pointerLockElement) document.exitPointerLock();
      setMode("aerial");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) {
        pressedKeys.current.add(event.code);
        return;
      }

      if (event.code === "Escape" && !document.pointerLockElement && escapeReady.current) {
        event.preventDefault();
        returnToAerial();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) pressedKeys.current.delete(event.code);
    };

    const onPointerLockChange = () => {
      escapeReady.current = !document.pointerLockElement;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) {
        event.preventDefault();
        returnToAerial();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      pressedKeys.current.clear();
    };
  }, [camera, setMode, setPlayerPosition]);

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

        const proposedX = clampToLimit(camera.position.x + movement.current.x, limit);
        if (!isBlocked(proposedX, camera.position.z)) camera.position.x = proposedX;

        const proposedZ = clampToLimit(camera.position.z + movement.current.z, limit);
        if (!isBlocked(camera.position.x, proposedZ)) camera.position.z = proposedZ;
      }
    }

    camera.position.x = clampToLimit(camera.position.x, limit);
    camera.position.z = clampToLimit(camera.position.z, limit);
    camera.position.y = townData.streetSpawn[1];

    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z]);
  });

  return <PointerLockControls />;
}
