"use client";

import { PointerLockControls, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import InteriorCounter from "@/components/interior/InteriorCounter";
import InteriorOfferBoard from "@/components/interior/InteriorOfferBoard";
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
    const faceRoomFrame = window.requestAnimationFrame(() => {
      camera.lookAt(0, EYE_HEIGHT, -ROOM_HALF_DEPTH);
    });

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
      window.cancelAnimationFrame(faceRoomFrame);
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

function BarberFloor() {
  const tiles = [];
  for (let x = -5; x < 5; x += 1) {
    for (let z = -6; z < 6; z += 1) {
      const isDark = (x + z) % 2 === 0;
      tiles.push(
        <mesh key={`${x}-${z}`} position={[x + 0.5, -0.045, z + 0.5]}>
          <boxGeometry args={[1, 0.08, 1]} />
          <meshStandardMaterial color={isDark ? "#111111" : "#f5f1e8"} />
        </mesh>,
      );
    }
  }
  return <>{tiles}</>;
}

function BarberDress() {
  const larryChairTexture = useTexture("/interior/larry-chair.png");
  const barryChairTexture = useTexture("/interior/barry-chair.png");

  return (
    <>
      <BarberFloor />
      <pointLight position={[0, 3.55, 0]} intensity={1.2} distance={18} color="#ffd8a8" />
      <InteriorCounter position={[3.0, 0.55, 2.15]} />
      <mesh position={[-2, 1.6, -2.7]}>
        <planeGeometry args={[2.4, 3.2]} />
        <meshBasicMaterial map={larryChairTexture} transparent alphaTest={0.05} />
      </mesh>
      <mesh position={[2, 1.6, -2.7]}>
        <planeGeometry args={[2.4, 3.2]} />
        <meshBasicMaterial map={barryChairTexture} transparent alphaTest={0.05} />
      </mesh>
      <mesh position={[-2, 2.15, -5.83]}>
        <planeGeometry args={[1.5, 1.55]} />
        <meshStandardMaterial color="#e5f3ff" emissive="#dbeafe" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[2, 2.15, -5.83]}>
        <planeGeometry args={[1.5, 1.55]} />
        <meshStandardMaterial color="#e5f3ff" emissive="#dbeafe" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[-4.45, 0.45, 2.05]}>
        <boxGeometry args={[0.75, 0.9, 2.6]} />
        <meshStandardMaterial color="#7c5a3b" />
      </mesh>
      <InteriorShelf position={[-4.25, 1.15, -1.6]} />
      {[-2.2, -1.6, -1].map((z, index) => (
        <mesh key={z} position={[-3.86, 1.5, z]}>
          <cylinderGeometry args={[0.13 + index * 0.015, 0.13 + index * 0.015, 0.42, 10]} />
          <meshStandardMaterial color={index === 0 ? "#f5f1e8" : index === 1 ? "#d4a373" : "#9ca3af"} />
        </mesh>
      ))}
      <mesh position={[0, 0.14, -5.45]}>
        <boxGeometry args={[9.6, 0.16, 0.16]} />
        <meshStandardMaterial color="#8b5e3c" />
      </mesh>
      <mesh position={[-4.82, 0.14, 0]}>
        <boxGeometry args={[0.16, 0.16, 11.6]} />
        <meshStandardMaterial color="#8b5e3c" />
      </mesh>
      <mesh position={[4.82, 0.14, 0]}>
        <boxGeometry args={[0.16, 0.16, 11.6]} />
        <meshStandardMaterial color="#8b5e3c" />
      </mesh>
      <InteriorOfferBoard />
      <InteriorSign text="We only offer SCALP cuts!" position={[0, 3.65, -5.82]} />
    </>
  );
}

export default function ShopInterior() {
  const interiorId = useGameStore((state) => state.interiorId);
  const isBarber = interiorId === "LB-BARBER-001";
  const wallColor = isBarber ? "#f3ead7" : "#d6d3d1";
  const floorColor = "#78716c";
  const ceilingColor = "#e7e5e4";
  const wallThickness = 0.2;
  const wallHeight = 4;
  const doorWidth = 2.4;
  const doorHeight = 2.7;
  const frontSideWidth = (ROOM_HALF_WIDTH * 2 - doorWidth) / 2;

  return (
    <>
      <ambientLight intensity={isBarber ? 1.0 : 0.9} />
      <directionalLight position={[3, 5, 2]} intensity={0.7} />

      {!isBarber ? (
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[ROOM_HALF_WIDTH * 2, 0.1, ROOM_HALF_DEPTH * 2]} />
          <meshStandardMaterial color={floorColor} />
        </mesh>
      ) : null}

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

      {isBarber ? <BarberDress /> : null}

      <InteriorControls />
    </>
  );
}
