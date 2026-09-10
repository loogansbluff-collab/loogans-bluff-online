"use client";

import { WEST_GROUND_MAX_X, WEST_GROUND_MIN_X, WEST_RIVER_SEGMENTS } from "@/lib/westWorld";

const BANK_WIDTH = 2.2;

export default function WestWorld() {
  const extensionWidth = WEST_GROUND_MAX_X - WEST_GROUND_MIN_X;
  const extensionCenterX = (WEST_GROUND_MIN_X + WEST_GROUND_MAX_X) / 2;

  return (
    <group>
      <mesh position={[extensionCenterX, -0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[extensionWidth, 396]} />
        <meshStandardMaterial color="#314a35" />
      </mesh>

      {WEST_RIVER_SEGMENTS.map((segment, index) => {
        const bankOffset = segment.width / 2 + BANK_WIDTH / 2;
        return (
          <group key={index} position={[segment.x, 0, segment.z]} rotation={[0, segment.rotationY, 0]}>
            <mesh position={[0, 0.018, 0]}>
              <boxGeometry args={[segment.width, 0.05, segment.length]} />
              <meshStandardMaterial color="#233b48" roughness={0.35} metalness={0.05} />
            </mesh>
            <mesh position={[-bankOffset, 0.035, 0]}>
              <boxGeometry args={[BANK_WIDTH, 0.08, segment.length]} />
              <meshStandardMaterial color="#6a5b3d" />
            </mesh>
            <mesh position={[bankOffset, 0.035, 0]}>
              <boxGeometry args={[BANK_WIDTH, 0.08, segment.length]} />
              <meshStandardMaterial color="#6a5b3d" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
