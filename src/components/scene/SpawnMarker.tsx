"use client";

import { townData } from "@/data/town";

export default function SpawnMarker() {
  const [x, , z] = townData.streetSpawn;

  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.45, 0.7, 32]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </group>
  );
}
