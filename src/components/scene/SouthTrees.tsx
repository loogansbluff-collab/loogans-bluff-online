"use client";

import { townData } from "@/data/town";
import { isSouthTreeLotId } from "@/lib/southDecor";

export default function SouthTrees() {
  const treeLots = townData.lots.filter((lot) => isSouthTreeLotId(lot.id));

  return (
    <group>
      {treeLots.map((lot, index) => {
        const [x, , z] = lot.position;
        const height = 2.6 + (index % 3) * 0.35;
        return (
          <group key={lot.id} position={[x, 0, z]}>
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.18, 0.24, 1.4, 8]} />
              <meshStandardMaterial color="#5b3a24" />
            </mesh>
            <mesh position={[0, 1.5 + height * 0.25, 0]}>
              <coneGeometry args={[1.1, height, 8]} />
              <meshStandardMaterial color="#2f6b3b" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
