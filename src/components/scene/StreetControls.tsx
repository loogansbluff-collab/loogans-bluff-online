"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { townData } from "@/data/town";

const SPEED = 8;
const PLAYER_RADIUS = 0.4;
const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

function isBlocked(x: number, z: number) {
  return townData.buildings.some((building) => {
    const [buildingX, , buildingZ] = building.position;
    const [width, , depth] = building.size;

    return (
      Math.abs(x - buildingX) < width / 2 + PLAYER_RADIUS &&
      Math.abs(z - buildingZ) < depth / 2 + PLAYER_RADIUS
    );
  });
}

export default function StreetControls() {
  const { camera } = useThree();
  const pressedKeys = useRef(new Set<string>());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const movement = useRef(new Vector3());

  useEffect(() => {
    const [x, y, z] = townData.streetSpawn;
    camera.position.set(x, y, z);
    camera.rotation.set(0, 0, 0);

    if (camera instanceof PerspectiveCamera) {
      camera.fov = 70;
      camera.near = 0.1;
      camera.far = 200;
      camera.updateProjectionMatrix();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) pressedKeys.current.add(event.code);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) pressedKeys.current.delete(event.code);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      pressedKeys.current.clear();
    };
  }, [camera]);

  useFrame((_, delta) => {
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;

    if (forward.current.lengthSq() === 0) return;
    forward.current.normalize();
    right.current.set(-forward.current.z, 0, forward.current.x);

    movement.current.set(0, 0, 0);
    if (pressedKeys.current.has("KeyW")) movement.current.add(forward.current);
    if (pressedKeys.current.has("KeyS")) movement.current.sub(forward.current);
    if (pressedKeys.current.has("KeyD")) movement.current.add(right.current);
    if (pressedKeys.current.has("KeyA")) movement.current.sub(right.current);

    if (movement.current.lengthSq() === 0) return;

    movement.current.normalize().multiplyScalar(SPEED * delta);

    const proposedX = camera.position.x + movement.current.x;
    if (!isBlocked(proposedX, camera.position.z)) {
      camera.position.x = proposedX;
    }

    const proposedZ = camera.position.z + movement.current.z;
    if (!isBlocked(camera.position.x, proposedZ)) {
      camera.position.z = proposedZ;
    }

    camera.position.y = townData.streetSpawn[1];
  });

  return <PointerLockControls />;
}
