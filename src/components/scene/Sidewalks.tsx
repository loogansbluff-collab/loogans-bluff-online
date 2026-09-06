"use client";

import { townData } from "@/data/town";

const SIDEWALK_COLOR = "#9aa3ad";
const SIDEWALK_WIDTH = 1.4;
const SIDEWALK_HEIGHT = 0.08;

export default function Sidewalks() {
  return (
    <group>
      {townData.roads.flatMap((road) => {
        const [x, , z] = road.position;
        const [width, , depth] = road.size;
        const vertical = depth > width;
        const roadHalf = (vertical ? width : depth) / 2;
        const offset = roadHalf + SIDEWALK_WIDTH / 2;

        if (vertical) {
          return [
            <mesh key={`${road.id}-left`} position={[x - offset, 0.06, z]}>
              <boxGeometry args={[SIDEWALK_WIDTH, SIDEWALK_HEIGHT, depth]} />
              <meshStandardMaterial color={SIDEWALK_COLOR} />
            </mesh>,
            <mesh key={`${road.id}-right`} position={[x + offset, 0.06, z]}>
              <boxGeometry args={[SIDEWALK_WIDTH, SIDEWALK_HEIGHT, depth]} />
              <meshStandardMaterial color={SIDEWALK_COLOR} />
            </mesh>,
          ];
        }

        return [
          <mesh key={`${road.id}-north`} position={[x, 0.06, z - offset]}>
            <boxGeometry args={[width, SIDEWALK_HEIGHT, SIDEWALK_WIDTH]} />
            <meshStandardMaterial color={SIDEWALK_COLOR} />
          </mesh>,
          <mesh key={`${road.id}-south`} position={[x, 0.06, z + offset]}>
            <boxGeometry args={[width, SIDEWALK_HEIGHT, SIDEWALK_WIDTH]} />
            <meshStandardMaterial color={SIDEWALK_COLOR} />
          </mesh>,
        ];
      })}
    </group>
  );
}
