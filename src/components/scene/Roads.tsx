"use client";

import { townData } from "@/data/town";

type TrailPoint = [number, number];

const SOUTH_PATH_POINTS: TrailPoint[] = [
  [0, 39],
  [0.25, 41.5],
  [-0.25, 44],
  [0.2, 46.5],
];

const SOUTH_PATH_SEGMENTS = SOUTH_PATH_POINTS.slice(0, -1).map(([x1, z1], index) => {
  const [x2, z2] = SOUTH_PATH_POINTS[index + 1];
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz);

  return {
    id: `south-path-${index + 1}`,
    position: [(x1 + x2) / 2, 0.025, (z1 + z2) / 2] as [number, number, number],
    size: [0.8, 0.03, length + 0.08] as [number, number, number],
    rotation: Math.atan2(dx, dz),
  };
});

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
