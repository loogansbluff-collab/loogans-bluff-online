"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import InteriorCounter from "@/components/interior/InteriorCounter";
import InteriorShelf from "@/components/interior/InteriorShelf";
import InteriorSign from "@/components/interior/InteriorSign";
import { exitInterior } from "@/lib/enterInterior";
import { useGameStore } from "@/state/gameStore";

const SPEED = 6;
const EYE_HEIGHT = 1.7;
const ROOM_HALF_WIDTH = 5;
const ROOM_HALF_DEPTH = 6;
const PLAYER_RADIUS = 0.4;
const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

function InteriorControls() {
  const { camera } = useThree();
  const pressedKeys = useRef(new Set<string>());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const movement = useRef(new Vector3());

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 3.5);
    camera.rotation.set(0, Math.PI, 0);

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

export default function ShopInterior() {
  const interiorId = useGameStore((state) => state.interiorId);
  const wallColor = "#d6d3d1";
  const floorColor = "#78716c";
  const ceilingColor = "#e7e5e4";
  const wallThickness = 0.2;
  const wallHeight = 4;
  const doorWidth = 2.4;
  const doorHeight = 2.7;
  const frontSideWidth = (ROOM_HALF_WIDTH * 2 - doorWidth) / 2;
  const isBarber = interiorId === "LB-BARBER-001";

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={0.7} />

      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[ROOM_HALF_WIDTH * 2, 0.1, ROOM_HALF_DEPTH * 2]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      <mesh position={[0, wallHeight + 0.05, 0]}>
        <boxGeometry args={[ROOM_HALF_WIDTH * 2, 0.1, ROOM_HALF_DEPTH * 2]} />
        <meshStandardMaterial color={ceilingColor} />
      </mesh>

      <mesh position={[0, wallHeight / 2, -ROOM_HALF_DEPTH]}>
        <boxGeometry args={[ROOM_HALF_WIDTH * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh position={[-ROOM_HALF_WIDTH, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, ROOM_HALF_DEPTH * 2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh position={[ROOM_HALF_WIDTH, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, ROOM_HALF_DEPTH * 2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh position={[-(doorWidth + frontSideWidth) / 2, wallHeight / 2, ROOM_HALF_DEPTH]}>
        <boxGeometry args={[frontSideWidth, wallHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[(doorWidth + frontSideWidth) / 2, wallHeight / 2, ROOM_HALF_DEPTH]}>
        <boxGeometry args={[frontSideWidth, wallHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[0, doorHeight + (wallHeight - doorHeight) / 2, ROOM_HALF_DEPTH]}>
        <boxGeometry args={[doorWidth, wallHeight - doorHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {isBarber ? (
        <>
          <InteriorCounter position={[0, 0.55, 1.4]} />
          <mesh position={[-1.6, 0.55, -1.2]}>
            <boxGeometry args={[0.9, 1.1, 0.9]} />
            <meshStandardMaterial color="#3f3f46" />
          </mesh>
          <mesh position={[1.6, 0.55, -1.2]}>
            <boxGeometry args={[0.9, 1.1, 0.9]} />
            <meshStandardMaterial color="#3f3f46" />
          </mesh>
          <InteriorSign text="BARBER" position={[0, 2.75, -5.84]} />
          <InteriorShelf position={[-4.25, 1.15, -1.6]} />
        </>
      ) : null}

      <InteriorControls />
    </>
  );
}
