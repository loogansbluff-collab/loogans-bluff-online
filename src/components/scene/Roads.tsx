"use client";

import { townData } from "@/data/town";

const SOUTH_PATH_SEGMENTS = [
  { id: "south-path-1", position: [0, 0.025, 44] as [number, number, number], size: [1.2, 0.03, 8] as [number, number, number], rotation: 0 },
  { id: "south-path-2", position: [1.2, 0.025, 50] as [number, number, number], size: [1.15, 0.03, 6] as [number, number, number], rotation: -0.18 },
  { id: "south-path-3", position: [-0.6, 0.025, 55] as [number, number, number], size: [1.1, 0.03, 5] as [number, number, number], rotation: 0.24 },
  { id: "south-path-4", position: [0.4, 0.025, 59] as [number, number, number], size: [1.0, 0.03, 4] as [number, number, number], rotation: -0.16 },
];

export default function Roads() {
  return (
    <group>
      {townData.roads.map((road) => {
        let [x, y, z] = road.position;
        let [width, height, depth] = road.size;
        const color = road.id.startsWith("LB-ALLEY-") ? "#4a3426" : "#5a4030";

        if (road.id === "LB-ROAD-NS-001") {
          z = -3.5;
          depth = 85;
        }

        return (
          <mesh key={road.id} position={[x, y, z]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}

      {SOUTH_PATH_SEGMENTS.map((segment) => (
        <mesh key={segment.id} position={segment.position} rotation={[0, segment.rotation, 0]}>
          <boxGeometry args={segment.size} />
          <meshStandardMaterial color="#4a3426" />
        </mesh>
      ))}
    </group>
  );
}
