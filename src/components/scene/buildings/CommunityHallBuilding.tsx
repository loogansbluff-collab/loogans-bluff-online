"use client";

import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { BuildingData } from "@/data/town";

type Handler = (event: ThreeEvent<PointerEvent>) => void;

const WINDOW_X = [-6.4, -4.25, -2.1, 2.1, 4.25, 6.4];
const WINDOW_Y = [2.5, 5.25, 8.0];
const STALL_X = [-11.5, -8.2, -4.9, 4.9, 8.2, 11.5];
const STALL_ROW_Z = [9.7, 18.9];

export default function CommunityHallBuilding({
  building,
  onPointerDown,
  onPointerUp,
}: {
  building: BuildingData;
  onPointerDown: Handler;
  onPointerUp: Handler;
}) {
  const [x, , z] = building.position;
  const [width, height, depth] = building.size;
  const frontZ = depth / 2 + 0.055;

  return (
    <group>
      <group position={[x, 0, z]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={building.color} />
        </mesh>

        <mesh position={[0, height + 0.12, 0]}>
          <boxGeometry args={[width + 0.4, 0.24, depth + 0.4]} />
          <meshStandardMaterial color="#111111" />
        </mesh>

        {WINDOW_Y.flatMap((windowY) =>
          WINDOW_X.map((windowX) => (
            <group key={`${windowX}-${windowY}`} position={[windowX, windowY, frontZ]}>
              <mesh>
                <boxGeometry args={[1.55, 1.55, 0.09]} />
                <meshStandardMaterial color="#91c9df" emissive="#6aa9c2" emissiveIntensity={0.28} />
              </mesh>
              <mesh position={[0, 0, 0.06]}>
                <boxGeometry args={[0.055, 1.55, 0.035]} />
                <meshStandardMaterial color="#d9dde0" />
              </mesh>
              <mesh position={[0, 0, 0.06]}>
                <boxGeometry args={[1.55, 0.055, 0.035]} />
                <meshStandardMaterial color="#d9dde0" />
              </mesh>
            </group>
          )),
        )}

        <mesh position={[0, 1.45, frontZ + 0.03]}>
          <boxGeometry args={[2.4, 2.9, 0.14]} />
          <meshStandardMaterial color="#31363a" />
        </mesh>
        <mesh position={[0, 1.45, frontZ + 0.11]}>
          <boxGeometry args={[1.95, 2.45, 0.05]} />
          <meshStandardMaterial color="#82b7c8" emissive="#5e94a7" emissiveIntensity={0.22} />
        </mesh>
        <mesh position={[0, 1.45, frontZ + 0.15]}>
          <boxGeometry args={[0.06, 2.45, 0.04]} />
          <meshStandardMaterial color="#d9dde0" />
        </mesh>

        <group position={[0, 4.05, frontZ + 0.13]}>
          <mesh>
            <boxGeometry args={[2.7, 0.82, 0.06]} />
            <meshStandardMaterial color="#f5e7c8" />
          </mesh>
          <Text position={[0, 0, 0.04]} fontSize={0.18} maxWidth={2.35} lineHeight={1.12} textAlign="center" anchorX="center" anchorY="middle" color="#1f2937">
            {"UNDER CONSTRUCTION\ncheck back soon"}
          </Text>
        </group>

        <group position={[0, height + 0.55, 0]}>
          <mesh>
            <boxGeometry args={[16.5, 1.35, 0.34]} />
            <meshStandardMaterial color="#171717" />
          </mesh>
          <Text position={[0, 0, 0.19]} fontSize={0.64} maxWidth={15.6} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
            COMMUNITY HALL
          </Text>
        </group>
      </group>

      <group position={[x, 0, z]}>
        <mesh position={[0, 0.035, 14.5]}>
          <boxGeometry args={[28, 0.07, 16]} />
          <meshStandardMaterial color="#55585b" />
        </mesh>

        <mesh position={[0, 0.08, 19.25]}>
          <boxGeometry args={[3, 0.025, 9.5]} />
          <meshStandardMaterial color="#686b6e" />
        </mesh>

        {STALL_ROW_Z.flatMap((rowZ) =>
          STALL_X.map((stallX) => (
            <mesh key={`${rowZ}-${stallX}`} position={[stallX, 0.085, rowZ]}>
              <boxGeometry args={[0.08, 0.025, 4.2]} />
              <meshStandardMaterial color="#eee8d6" />
            </mesh>
          )),
        )}

        {[-13.2, -3.2, 3.2, 13.2].map((lineX) => (
          <mesh key={lineX} position={[lineX, 0.085, 14.5]}>
            <boxGeometry args={[0.08, 0.025, 14.4]} />
            <meshStandardMaterial color="#eee8d6" />
          </mesh>
        ))}

        {[7.6, 11.8, 17.1, 21.3].map((lineZ) => (
          <mesh key={lineZ} position={[0, 0.086, lineZ]}>
            <boxGeometry args={[26.4, 0.025, 0.08]} />
            <meshStandardMaterial color="#eee8d6" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
