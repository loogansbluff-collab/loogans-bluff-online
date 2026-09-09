"use client";

import { PointerLockControls, Text, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import InteriorCounter from "@/components/interior/InteriorCounter";
import InteriorOfferBoard from "@/components/interior/InteriorOfferBoard";
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
  const garryTooSexyTexture = useTexture("/interior/garry-toosexy.png");
  const fishTankTexture = useTexture("/interior/fish-tank.png");

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
      <mesh position={[3.65, 1.6, -0.8]}>
        <planeGeometry args={[2.4, 3.2]} />
        <meshBasicMaterial map={garryTooSexyTexture} transparent alphaTest={0.05} />
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
      <mesh position={[-4.88, 1.65, -1.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.0, 2.2]} />
        <meshBasicMaterial map={fishTankTexture} transparent alphaTest={0.05} />
      </mesh>
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

function LiquorDress() {
  const womanTexture = useTexture("/interior/woman-liquor.png");
  const garryTexture = useTexture("/interior/garry-liquor.png");
  const larryTexture = useTexture("/interior/larry-liquor.png");
  const barryTexture = useTexture("/interior/barry-liquor.png");

  return (
    <>
      <group position={[0, 2.05, -5.82]}>
        <mesh>
          <boxGeometry args={[6.6, 3.5, 0.14]} />
          <meshStandardMaterial color="#4b2e1f" />
        </mesh>
        <Text position={[0, 0.85, 0.09]} fontSize={0.34} maxWidth={5.9} lineHeight={1.28} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          {"We Lied.\nWe only sell ToKillYa\nEnglish translation: Bluff Tequila"}
        </Text>
        <Text position={[0, -0.2, 0.09]} fontSize={0.24} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          0.1 SOL worth of $LOOGANS
        </Text>
        <Text position={[0, -0.62, 0.09]} fontSize={0.22} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          Connect Phantom wallet to:
        </Text>
        <Text position={[0, -1.08, 0.09]} fontSize={0.36} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#22c55e">
          $Buy ToKillYa
        </Text>
        <Text position={[0, -1.48, 0.09]} fontSize={0.36} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#ef4444">
          Refund
        </Text>
      </group>

      <mesh position={[-3.35, 1.25, -0.85]}>
        <planeGeometry args={[1.9, 2.8]} />
        <meshBasicMaterial map={womanTexture} transparent alphaTest={0.05} />
      </mesh>
      <mesh position={[-2.85, 1.15, 1.1]}>
        <planeGeometry args={[1.2, 1.95]} />
        <meshBasicMaterial map={garryTexture} transparent alphaTest={0.05} />
      </mesh>
      <mesh position={[-4.15, 1.3, -4.75]}>
        <planeGeometry args={[1.5, 2.6]} />
        <meshBasicMaterial map={larryTexture} transparent alphaTest={0.05} />
      </mesh>
      <mesh position={[3.75, 1.3, -4.7]}>
        <planeGeometry args={[1.5, 2.6]} />
        <meshBasicMaterial map={barryTexture} transparent alphaTest={0.05} />
      </mesh>
    </>
  );
}

function HardwareDress() {
  return (
    <>
      <group position={[0, 2.05, -5.82]}>
        <mesh>
          <boxGeometry args={[6.6, 3.5, 0.14]} />
          <meshStandardMaterial color="#3f3a32" />
        </mesh>
        <Text
          position={[0, 0.88, 0.09]}
          fontSize={0.34}
          maxWidth={5.9}
          lineHeight={1.2}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#f8fafc"
        >
          {"WE SELL ALL KINDS OF TOOLS\nSome even function."}
        </Text>
        <Text
          position={[0, -0.15, 0.09]}
          fontSize={0.24}
          maxWidth={5.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#f8fafc"
        >
          0.1 SOL worth of $LOOGANS
        </Text>
        <Text
          position={[0, -0.58, 0.09]}
          fontSize={0.22}
          maxWidth={5.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#f8fafc"
        >
          Connect Phantom wallet to:
        </Text>
        <Text
          position={[0, -1.05, 0.09]}
          fontSize={0.36}
          maxWidth={5.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#22c55e"
        >
          $Buy Toolbag
        </Text>
        <Text
          position={[0, -1.45, 0.09]}
          fontSize={0.36}
          maxWidth={5.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#ef4444"
        >
          Refund
        </Text>
      </group>

      <group position={[4.35, 0, -0.6]}>
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[0.9, 0.18, 3.4]} />
          <meshStandardMaterial color="#8b5e3c" />
        </mesh>
        <mesh position={[-0.32, 0.43, -1.25]}>
          <boxGeometry args={[0.18, 0.86, 0.18]} />
          <meshStandardMaterial color="#5b4636" />
        </mesh>
        <mesh position={[-0.32, 0.43, 1.25]}>
          <boxGeometry args={[0.18, 0.86, 0.18]} />
          <meshStandardMaterial color="#5b4636" />
        </mesh>
        <mesh position={[0.32, 0.43, -1.25]}>
          <boxGeometry args={[0.18, 0.86, 0.18]} />
          <meshStandardMaterial color="#5b4636" />
        </mesh>
        <mesh position={[0.32, 0.43, 1.25]}>
          <boxGeometry args={[0.18, 0.86, 0.18]} />
          <meshStandardMaterial color="#5b4636" />
        </mesh>
      </group>

      <group position={[-4.84, 2.0, -1.25]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[3.5, 2.4, 0.12]} />
          <meshStandardMaterial color="#8a7b68" />
        </mesh>
        <mesh position={[-0.9, 0.35, 0.12]}>
          <boxGeometry args={[0.18, 1.25, 0.16]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <mesh position={[-0.55, 0.78, 0.12]}>
          <boxGeometry args={[0.85, 0.22, 0.16]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh position={[0.45, 0.12, 0.12]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.22, 1.35, 0.16]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <mesh position={[0.78, 0.62, 0.12]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.7, 0.24, 0.16]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh position={[1.15, -0.52, 0.12]}>
          <boxGeometry args={[0.22, 0.9, 0.16]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      </group>
    </>
  );
}

function PawnshopDress() {
  return (
    <>
      <group position={[0, 2.05, -5.82]}>
        <mesh>
          <boxGeometry args={[6.6, 3.5, 0.14]} />
          <meshStandardMaterial color="#3b2f2f" />
        </mesh>
        <Text position={[0, 0.92, 0.09]} fontSize={0.38} maxWidth={5.9} lineHeight={1.18} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          {"NEED CASH?\nBRING SOMETHING YOU'LL MISS."}
        </Text>
        <Text position={[0, -0.12, 0.09]} fontSize={0.24} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          0.1 SOL worth of $LOOGANS
        </Text>
        <Text position={[0, -0.55, 0.09]} fontSize={0.22} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          Connect Phantom wallet to:
        </Text>
        <Text position={[0, -1.03, 0.09]} fontSize={0.36} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#22c55e">
          $Buy Regret
        </Text>
        <Text position={[0, -1.44, 0.09]} fontSize={0.36} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#ef4444">
          Refund
        </Text>
      </group>

      <group position={[-4.28, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[3.55, 0.58, 0]}>
          <boxGeometry args={[1.15, 0.14, 0.54]} />
          <meshStandardMaterial color="#76563d" />
        </mesh>
        <mesh position={[3.75, 0.82, 0.01]} rotation={[0.05, 0.1, -0.02]}>
          <boxGeometry args={[0.58, 0.28, 0.26]} />
          <meshStandardMaterial color="#d4af37" metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[3.05, 0.92, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.46, 12]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[3.05, 1.19, 0]}>
          <boxGeometry args={[0.14, 0.07, 0.1]} />
          <meshStandardMaterial color="#111827" />
        </mesh>

        <mesh position={[2.05, 0.55, 0]}>
          <boxGeometry args={[1.12, 0.9, 0.54]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
        <mesh position={[2.05, 0.6, 0.3]}>
          <boxGeometry args={[0.86, 0.58, 0.04]} />
          <meshStandardMaterial color="#111827" />
        </mesh>

        <mesh position={[1.05, 0.4, 0]}>
          <boxGeometry args={[0.82, 0.68, 0.5]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <mesh position={[1.05, 0.44, 0.27]}>
          <boxGeometry args={[0.62, 0.42, 0.04]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>

        <mesh position={[0.18, 0.45, 0]}>
          <boxGeometry args={[0.54, 0.62, 0.48]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
        <mesh position={[0.18, 0.82, 0]}>
          <boxGeometry args={[0.28, 0.15, 0.28]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        <mesh position={[0.18, 0.93, 0]}>
          <boxGeometry args={[0.07, 0.13, 0.07]} />
          <meshStandardMaterial color="#374151" />
        </mesh>

        <mesh position={[-0.55, 0.34, 0]}>
          <boxGeometry args={[0.4, 0.54, 0.4]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
      </group>

      <group position={[4.28, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <group position={[-2.85, 0.6, 0]}>
          <mesh>
            <boxGeometry args={[0.38, 0.68, 0.16]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          <mesh position={[0, 0, 0.11]}><boxGeometry args={[0.46, 0.05, 0.04]} /><meshStandardMaterial color="#111827" /></mesh>
          <mesh position={[0, 0.2, 0.11]}><boxGeometry args={[0.46, 0.05, 0.04]} /><meshStandardMaterial color="#111827" /></mesh>
          <mesh position={[0, -0.2, 0.11]}><boxGeometry args={[0.46, 0.05, 0.04]} /><meshStandardMaterial color="#111827" /></mesh>
          <mesh position={[-0.18, 0, 0.11]}><boxGeometry args={[0.04, 0.74, 0.04]} /><meshStandardMaterial color="#111827" /></mesh>
          <mesh position={[0.18, 0, 0.11]}><boxGeometry args={[0.04, 0.74, 0.04]} /><meshStandardMaterial color="#111827" /></mesh>
        </group>

        <mesh position={[-1.95, 0.42, 0]}>
          <boxGeometry args={[0.9, 0.66, 0.4]} />
          <meshStandardMaterial color="#312e2b" />
        </mesh>
        <mesh position={[-1.95, 0.76, 0]}>
          <boxGeometry args={[0.62, 0.1, 0.32]} />
          <meshStandardMaterial color="#57534e" />
        </mesh>

        <mesh position={[-1.05, 0.34, 0]}>
          <boxGeometry args={[0.7, 0.3, 0.5]} />
          <meshStandardMaterial color="#52525b" />
        </mesh>
        <mesh position={[-1.05, 0.66, 0]}>
          <boxGeometry args={[0.7, 0.3, 0.5]} />
          <meshStandardMaterial color="#71717a" />
        </mesh>

        <mesh position={[-0.18, 0.42, 0]}>
          <boxGeometry args={[0.72, 0.7, 0.54]} />
          <meshStandardMaterial color="#d6d3d1" />
        </mesh>
        <mesh position={[-0.18, 0.48, 0.3]}>
          <boxGeometry args={[0.46, 0.24, 0.04]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>

        <group position={[0.65, 0.42, 0]}>
          <mesh>
            <boxGeometry args={[0.72, 0.58, 0.52]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
          <mesh position={[-0.16, 0.12, 0.29]} rotation={[0, 0, 0.45]}><boxGeometry args={[0.06, 0.46, 0.04]} /><meshStandardMaterial color="#111827" /></mesh>
          <mesh position={[0.1, 0.06, 0.29]} rotation={[0, 0, -0.55]}><boxGeometry args={[0.06, 0.48, 0.04]} /><meshStandardMaterial color="#111827" /></mesh>
          <mesh position={[0.2, -0.1, 0.29]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.06, 0.4, 0.04]} /><meshStandardMaterial color="#111827" /></mesh>
        </group>
      </group>

      <group position={[3.7, 1.22, -4.15]}>
        <mesh>
          <boxGeometry args={[1.35, 0.58, 0.08]} />
          <meshStandardMaterial color="#3f3a32" />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <boxGeometry args={[0.1, 0.58, 0.1]} />
          <meshStandardMaterial color="#6b4f3a" />
        </mesh>
        <mesh position={[0, -0.72, 0]}>
          <boxGeometry args={[0.72, 0.08, 0.42]} />
          <meshStandardMaterial color="#6b4f3a" />
        </mesh>
        <Text position={[0, 0, 0.05]} fontSize={0.11} maxWidth={1.2} lineHeight={1.05} textAlign="center" anchorX="center" anchorY="middle" color="#fef08a">
          Stolen items 50% off
        </Text>
      </group>

      {[
        [-3.72, 1.08, -3.75, "24K. Probably."],
        [-3.72, 1.35, -3.05, "Proven 24K process."],
        [-3.72, 1.12, -2.05, "Works if you hit it. Tail-light guarantee."],
        [-3.72, 0.92, -1.05, "Vintage. You haul it."],
        [-3.72, 1.12, -0.18, "Used blender. Salsa not included."],
        [-3.72, 0.78, 0.55, "Used bath salts. Don't ask."],
        [3.72, 1.08, -2.85, "Display model. It rings if you believe."],
        [3.72, 0.98, -1.95, "Mom still thinks this is at school."],
        [3.72, 0.98, -1.05, "Rewind not included."],
        [3.72, 1.02, -0.18, "May still be under recall."],
        [3.72, 0.9, 0.65, "Chargers for phones that don't exist."],
      ].map(([x, y, z, label]) => (
        <group key={label as string} position={[x as number, y as number, z as number]}>
          <mesh>
            <boxGeometry args={[0.9, 0.28, 0.05]} />
            <meshStandardMaterial color="#f5e7c8" />
          </mesh>
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.085}
            maxWidth={0.8}
            lineHeight={1.06}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#1f2937"
          >
            {label as string}
          </Text>
        </group>
      ))}
    </>
  );
}

export default function ShopInterior() {
  const interiorId = useGameStore((state) => state.interiorId);
  const isBarber = interiorId === "LB-BARBER-001";
  const isLiquor = interiorId === "LB-LIQUOR-001";
  const isHardware = interiorId === "LB-HARDWARE-001";
  const isPawnshop = interiorId === "LB-REPAIR-001";
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
      <mesh position={[0, wallHeight / 2, -ROOM_HALF_DEPTH]}><boxGeometry args={[ROOM_HALF_WIDTH * 2, wallHeight, wallThickness]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[-ROOM_HALF_WIDTH, wallHeight / 2, 0]}><boxGeometry args={[wallThickness, wallHeight, ROOM_HALF_DEPTH * 2]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[ROOM_HALF_WIDTH, wallHeight / 2, 0]}><boxGeometry args={[wallThickness, wallHeight, ROOM_HALF_DEPTH * 2]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[-(doorWidth + frontSideWidth) / 2, wallHeight / 2, ROOM_HALF_DEPTH]}><boxGeometry args={[frontSideWidth, wallHeight, wallThickness]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[(doorWidth + frontSideWidth) / 2, wallHeight / 2, ROOM_HALF_DEPTH]}><boxGeometry args={[frontSideWidth, wallHeight, wallThickness]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[0, doorHeight + (wallHeight - doorHeight) / 2, ROOM_HALF_DEPTH]}><boxGeometry args={[doorWidth, wallHeight - doorHeight, wallThickness]} /><meshStandardMaterial color={wallColor} /></mesh>

      {isBarber ? <BarberDress /> : null}
      {isLiquor ? <LiquorDress /> : null}
      {isHardware ? <HardwareDress /> : null}
      {isPawnshop ? <PawnshopDress /> : null}

      <InteriorControls />
    </>
  );
}
