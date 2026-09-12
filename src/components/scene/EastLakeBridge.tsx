"use client";

import { Text } from "@react-three/drei";
import {
  EAST_BRIDGE_ARCH_HEIGHT,
  EAST_BRIDGE_DECK_BASE_Y,
  EAST_BRIDGE_EAST_X,
  EAST_BRIDGE_PATH_WEST_X,
  EAST_BRIDGE_PATH_WIDTH,
  EAST_BRIDGE_WEST_X,
  EAST_BRIDGE_WIDTH,
  EAST_BRIDGE_Z,
} from "@/lib/eastLake";

const SEGMENTS = 28;
const DECK_THICKNESS = 0.3;
const RAIL_HEIGHT = 0.92;
const RAIL_THICKNESS = 0.12;
const POST_THICKNESS = 0.14;
const SIGN_HEIGHT = 5.2;
const SIGN_BOARD_HEIGHT = 1.5;
const SIGN_BOARD_WIDTH = 8.4;

function deckHeightAt(t: number) {
  const arch = Math.sin(Math.PI * t);
  return EAST_BRIDGE_DECK_BASE_Y + EAST_BRIDGE_ARCH_HEIGHT * arch * arch;
}

export default function EastLakeBridge() {
  const span = EAST_BRIDGE_EAST_X - EAST_BRIDGE_WEST_X;
  const segmentDx = span / SEGMENTS;
  const pathLength = EAST_BRIDGE_WEST_X - EAST_BRIDGE_PATH_WEST_X;
  const pathCenterX = (EAST_BRIDGE_WEST_X + EAST_BRIDGE_PATH_WEST_X) / 2;
  const railZ = EAST_BRIDGE_WIDTH / 2 - 0.12;

  return (
    <group>
      <mesh position={[pathCenterX, 0.03, EAST_BRIDGE_Z]}>
        <boxGeometry args={[pathLength, 0.06, EAST_BRIDGE_PATH_WIDTH]} />
        <meshStandardMaterial color="#4a3426" roughness={0.96} />
      </mesh>

      {Array.from({ length: SEGMENTS }, (_, index) => {
        const t0 = index / SEGMENTS;
        const t1 = (index + 1) / SEGMENTS;
        const x0 = EAST_BRIDGE_WEST_X + span * t0;
        const x1 = EAST_BRIDGE_WEST_X + span * t1;
        const y0 = deckHeightAt(t0);
        const y1 = deckHeightAt(t1);
        const centerX = (x0 + x1) / 2;
        const centerY = (y0 + y1) / 2;
        const angle = Math.atan2(y1 - y0, x1 - x0);
        const segmentLength = Math.hypot(segmentDx, y1 - y0);

        return (
          <group key={index}>
            <mesh position={[centerX, centerY - DECK_THICKNESS / 2, EAST_BRIDGE_Z]} rotation={[0, 0, angle]}>
              <boxGeometry args={[segmentLength + 0.08, DECK_THICKNESS, EAST_BRIDGE_WIDTH]} />
              <meshStandardMaterial color="#665b4a" roughness={0.9} />
            </mesh>

            {[-1, 1].map((side) => (
              <mesh
                key={`${index}-${side}`}
                position={[centerX, centerY + RAIL_HEIGHT, EAST_BRIDGE_Z + side * railZ]}
                rotation={[0, 0, angle]}
              >
                <boxGeometry args={[segmentLength + 0.1, RAIL_THICKNESS, RAIL_THICKNESS]} />
                <meshStandardMaterial color="#454640" roughness={0.86} />
              </mesh>
            ))}
          </group>
        );
      })}

      {Array.from({ length: SEGMENTS + 1 }, (_, index) => {
        const t = index / SEGMENTS;
        const x = EAST_BRIDGE_WEST_X + span * t;
        const y = deckHeightAt(t);

        return [-1, 1].map((side) => (
          <mesh key={`${index}-${side}`} position={[x, y + RAIL_HEIGHT * 0.5, EAST_BRIDGE_Z + side * railZ]}>
            <boxGeometry args={[POST_THICKNESS, RAIL_HEIGHT, POST_THICKNESS]} />
            <meshStandardMaterial color="#3f413c" roughness={0.9} />
          </mesh>
        ));
      })}

      <group position={[EAST_BRIDGE_WEST_X - 0.35, 0, EAST_BRIDGE_Z]}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0, SIGN_HEIGHT / 2, side * (SIGN_BOARD_WIDTH / 2 - 0.45)]}>
            <boxGeometry args={[0.32, SIGN_HEIGHT, 0.32]} />
            <meshStandardMaterial color="#403a31" roughness={0.92} />
          </mesh>
        ))}

        <mesh position={[0, SIGN_HEIGHT - SIGN_BOARD_HEIGHT / 2 + 0.05, 0]}>
          <boxGeometry args={[0.28, SIGN_BOARD_HEIGHT, SIGN_BOARD_WIDTH]} />
          <meshStandardMaterial color="#6f2e2e" roughness={0.86} />
        </mesh>

        <Text
          position={[-0.16, SIGN_HEIGHT - SIGN_BOARD_HEIGHT / 2 + 0.05, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.43}
          maxWidth={SIGN_BOARD_WIDTH - 0.7}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          color="#fff3d6"
        >
          {"BUTTINKSKI'S IN YOUR HOLE GOLF"}
        </Text>

        <Text
          position={[0.16, SIGN_HEIGHT - SIGN_BOARD_HEIGHT / 2 + 0.05, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.43}
          maxWidth={SIGN_BOARD_WIDTH - 0.7}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          color="#fff3d6"
        >
          {"BUTTINKSKI'S IN YOUR HOLE GOLF"}
        </Text>
      </group>
    </group>
  );
}
