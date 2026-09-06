"use client";

import { townData } from "@/data/town";

export default function Roads() {
  return (
    <group>
      {townData.roads.map((road) => {
        const [x, y, z] = road.position;
        const [width, height, depth] = road.size;
        const color = road.id.startsWith("LB-ALLEY-") ? "#4a3426" : "#5a4030";

        return (
          <mesh key={road.id} position={[x, y, z]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}
