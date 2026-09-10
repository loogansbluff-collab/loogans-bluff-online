"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import {
  getWestRiverCurve,
  getWestRiverWidth,
  WEST_GROUND_MAX_X,
  WEST_GROUND_MIN_X,
  WEST_RIVER_BANK_WIDTH,
  WEST_RIVER_SAMPLE_COUNT,
} from "@/lib/westWorld";

type StripPoint = {
  left: Vector3;
  right: Vector3;
};

function makeStripGeometry(points: StripPoint[], y: number) {
  const positions: number[] = [];
  const indices: number[] = [];

  points.forEach((point) => {
    positions.push(point.left.x, y, point.left.z);
    positions.push(point.right.x, y, point.right.z);
  });

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export default function WestWorld() {
  const extensionWidth = WEST_GROUND_MAX_X - WEST_GROUND_MIN_X;
  const extensionCenterX = (WEST_GROUND_MIN_X + WEST_GROUND_MAX_X) / 2;

  const { waterGeometry, westBankGeometry, eastBankGeometry } = useMemo(() => {
    const curve = getWestRiverCurve();
    const water: StripPoint[] = [];
    const westBank: StripPoint[] = [];
    const eastBank: StripPoint[] = [];

    for (let i = 0; i <= WEST_RIVER_SAMPLE_COUNT; i += 1) {
      const t = i / WEST_RIVER_SAMPLE_COUNT;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const normal = new Vector3(-tangent.z, 0, tangent.x).normalize();
      const halfWidth = getWestRiverWidth(t) / 2;

      const waterLeft = point.clone().addScaledVector(normal, halfWidth);
      const waterRight = point.clone().addScaledVector(normal, -halfWidth);
      const westOuter = point.clone().addScaledVector(normal, halfWidth + WEST_RIVER_BANK_WIDTH);
      const eastOuter = point.clone().addScaledVector(normal, -(halfWidth + WEST_RIVER_BANK_WIDTH));

      water.push({ left: waterLeft, right: waterRight });
      westBank.push({ left: westOuter, right: waterLeft });
      eastBank.push({ left: waterRight, right: eastOuter });
    }

    return {
      waterGeometry: makeStripGeometry(water, 0.02),
      westBankGeometry: makeStripGeometry(westBank, 0.035),
      eastBankGeometry: makeStripGeometry(eastBank, 0.035),
    };
  }, []);

  return (
    <group>
      <mesh position={[extensionCenterX, -0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[extensionWidth, 396]} />
        <meshStandardMaterial color="#314a35" />
      </mesh>

      <mesh geometry={waterGeometry}>
        <meshStandardMaterial color="#233b48" roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh geometry={westBankGeometry}>
        <meshStandardMaterial color="#6a5b3d" />
      </mesh>
      <mesh geometry={eastBankGeometry}>
        <meshStandardMaterial color="#6a5b3d" />
      </mesh>
    </group>
  );
}
