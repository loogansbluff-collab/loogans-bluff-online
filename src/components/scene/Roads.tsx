"use client";

import { townData } from "@/data/town";

export default function Roads() {
  return (
    <group>
      {townData.roads.map((road) => {
        const [x, y, z] = road.position;
        const [width, height, depth] = road.size;

        return (
          <mesh key={road.id} position={[x, y, z]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#5a4030" />
          </mesh>
        );
      })}
    </group>
  );
}
