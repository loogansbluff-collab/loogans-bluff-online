"use client";

import {
  WEST_BRIDGE_DECK_Y,
  WEST_BRIDGE_EAST_X,
  WEST_BRIDGE_WEST_X,
  WEST_BRIDGE_WIDTH,
  WEST_EXIT_Z,
} from "@/lib/westWorld";

const RAIL_HEIGHT = 0.82;
const RAIL_THICKNESS = 0.12;
const POST_SPACING = 3.5;

export default function Bridge() {
  const length = WEST_BRIDGE_EAST_X - WEST_BRIDGE_WEST_X;
  const centerX = (WEST_BRIDGE_EAST_X + WEST_BRIDGE_WEST_X) / 2;
  const railZ = WEST_BRIDGE_WIDTH / 2 - 0.08;
  const postCount = Math.floor(length / POST_SPACING) + 1;

  return (
    <group>
      <mesh position={[centerX, WEST_BRIDGE_DECK_Y, WEST_EXIT_Z]}>
        <boxGeometry args={[length, 0.18, WEST_BRIDGE_WIDTH]} />
        <meshStandardMaterial color="#67635b" roughness={0.88} />
      </mesh>

      <mesh position={[centerX, WEST_BRIDGE_DECK_Y + 0.105, WEST_EXIT_Z]}>
        <boxGeometry args={[length - 0.35, 0.025, 0.055]} />
        <meshStandardMaterial color="#9a8f73" roughness={0.9} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[centerX, WEST_BRIDGE_DECK_Y + RAIL_HEIGHT, WEST_EXIT_Z + side * railZ]}>
            <boxGeometry args={[length, RAIL_THICKNESS, RAIL_THICKNESS]} />
            <meshStandardMaterial color="#494943" roughness={0.82} />
          </mesh>
          <mesh position={[centerX, WEST_BRIDGE_DECK_Y + RAIL_HEIGHT * 0.52, WEST_EXIT_Z + side * railZ]}>
            <boxGeometry args={[length, 0.09, 0.09]} />
            <meshStandardMaterial color="#55554f" roughness={0.85} />
          </mesh>

          {Array.from({ length: postCount }, (_, index) => {
            const x = WEST_BRIDGE_WEST_X + Math.min(index * POST_SPACING, length);
            return (
              <mesh key={`${side}-${index}`} position={[x, WEST_BRIDGE_DECK_Y + RAIL_HEIGHT * 0.5, WEST_EXIT_Z + side * railZ]}>
                <boxGeometry args={[0.13, RAIL_HEIGHT, 0.13]} />
                <meshStandardMaterial color="#454640" roughness={0.86} />
              </mesh>
            );
          })}
        </group>
      ))}

      {[-0.32, 0.32].map((offset) => (
        <mesh key={offset} position={[centerX + offset, WEST_BRIDGE_DECK_Y - 0.17, WEST_EXIT_Z]}>
          <boxGeometry args={[0.22, 0.52, WEST_BRIDGE_WIDTH + 0.2]} />
          <meshStandardMaterial color="#56554f" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}
