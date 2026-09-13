"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { exitInterior } from "@/lib/enterInterior";

const SPEED = 6;
const EYE_HEIGHT = 1.7;
const ROOM_HALF_WIDTH = 5;
const ROOM_HALF_DEPTH = 6;
const PLAYER_RADIUS = 0.4;
const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

function NewInteriorControls() {
  const { camera } = useThree();
  const pressedKeys = useRef(new Set<string>());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const movement = useRef(new Vector3());

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 3.5);
    camera.lookAt(0, EYE_HEIGHT, -ROOM_HALF_DEPTH);

    const onKeyDown = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) {
        pressedKeys.current.add(event.code);
        return;
      }

      if (event.code === "KeyR") {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          (target instanceof HTMLElement && target.isContentEditable)
        ) {
          return;
        }
        event.preventDefault();
        exitInterior();
      }
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
        camera.position.x += movement.current.x;
        camera.position.z += movement.current.z;
      }
    }

    camera.position.x = Math.max(
      -ROOM_HALF_WIDTH + PLAYER_RADIUS,
      Math.min(ROOM_HALF_WIDTH - PLAYER_RADIUS, camera.position.x),
    );
    camera.position.z = Math.max(
      -ROOM_HALF_DEPTH + PLAYER_RADIUS,
      Math.min(ROOM_HALF_DEPTH - PLAYER_RADIUS, camera.position.z),
    );
    camera.position.y = EYE_HEIGHT;
  });

  return <PointerLockControls />;
}

export default function NewShopInterior() {
  return (
    <>
      <NewInteriorControls />

      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[10, 0.1, 12]} />
        <meshStandardMaterial color="#6b6258" roughness={0.9} />
      </mesh>

      <mesh position={[0, 4, -5.95]}>
        <boxGeometry args={[10, 8, 0.1]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.95} />
      </mesh>
      <mesh position={[-4.95, 4, 0]}>
        <boxGeometry args={[0.1, 8, 12]} />
        <meshStandardMaterial color="#9f968d" roughness={0.95} />
      </mesh>
      <mesh position={[4.95, 4, 0]}>
        <boxGeometry args={[0.1, 8, 12]} />
        <meshStandardMaterial color="#9f968d" roughness={0.95} />
      </mesh>

      <mesh position={[-3.1, 4, 5.95]}>
        <boxGeometry args={[3.8, 8, 0.1]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.95} />
      </mesh>
      <mesh position={[3.1, 4, 5.95]}>
        <boxGeometry args={[3.8, 8, 0.1]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 6.4, 5.95]}>
        <boxGeometry args={[2.4, 3.2, 0.1]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.95} />
      </mesh>

      <mesh position={[0, 7.95, 0]}>
        <boxGeometry args={[10, 0.1, 12]} />
        <meshStandardMaterial color="#c9c5bf" roughness={1} />
      </mesh>
    </>
  );
}
