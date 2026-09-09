"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { townData } from "@/data/town";
import { isSouthTreeLotId } from "@/lib/southDecor";

function Crow({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation} scale={0.65}>
      <mesh>
        <sphereGeometry args={[0.13, 8, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.1, 0.08, 0]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color="#0d0d0d" />
      </mesh>
      <mesh position={[0.2, 0.08, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.035, 0.13, 5]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
      <mesh position={[-0.05, -0.12, -0.045]}>
        <boxGeometry args={[0.02, 0.16, 0.02]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.02, -0.12, 0.045]}>
        <boxGeometry args={[0.02, 0.16, 0.02]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}

function FlyingBird({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[-0.11, 0, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.24, 0.025, 0.035]} />
        <meshStandardMaterial color="#242424" />
      </mesh>
      <mesh position={[0.11, 0, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.24, 0.025, 0.035]} />
        <meshStandardMaterial color="#242424" />
      </mesh>
    </group>
  );
}

function SouthTree({ index, position }: { index: number; position: [number, number, number] }) {
  const swayRef = useRef<Group>(null);
  const height = 2.45 + (index % 4) * 0.28;
  const trunkHeight = 1.35 + (index % 3) * 0.12;
  const crownScale = 0.92 + (index % 5) * 0.045;
  const lean = ((index % 5) - 2) * 0.018;
  const phase = index * 0.83;
  const swayAmount = 0.018 + (index % 3) * 0.006;
  const branchSide = index % 2 === 0 ? 1 : -1;
  const foliageColor = ["#2f6b3b", "#356f3d", "#2b6337", "#3a7441"][index % 4];

  useFrame(({ clock }) => {
    if (!swayRef.current) return;
    const t = clock.elapsedTime;
    swayRef.current.rotation.z = lean + Math.sin(t * 0.72 + phase) * swayAmount;
    swayRef.current.rotation.x = Math.cos(t * 0.57 + phase * 0.7) * swayAmount * 0.45;
  });

  return (
    <group position={position}>
      <group ref={swayRef}>
        <mesh position={[0, trunkHeight / 2, 0]}>
          <cylinderGeometry args={[0.17, 0.25, trunkHeight, 8]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#5b3a24" : "#634129"} />
        </mesh>

        <mesh position={[0.28 * branchSide, 1.05, 0]} rotation={[0, 0, branchSide * -0.85]}>
          <cylinderGeometry args={[0.055, 0.08, 0.75, 6]} />
          <meshStandardMaterial color="#5b3a24" />
        </mesh>
        {index % 3 !== 1 ? (
          <mesh position={[-0.22 * branchSide, 1.32, 0.08]} rotation={[0.2, 0, branchSide * 0.95]}>
            <cylinderGeometry args={[0.04, 0.065, 0.58, 6]} />
            <meshStandardMaterial color="#5b3a24" />
          </mesh>
        ) : null}

        <group position={[0, 1.45 + height * 0.25, 0]} scale={[crownScale, 1, crownScale]}>
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[1.08, height, 8]} />
            <meshStandardMaterial color={foliageColor} />
          </mesh>
          <mesh position={[0.28 * branchSide, -0.22, 0.12]} scale={[0.7, 0.72, 0.7]}>
            <coneGeometry args={[0.9, height * 0.82, 7]} />
            <meshStandardMaterial color={foliageColor} />
          </mesh>
        </group>

        {index === 1 ? <Crow position={[0.38, 1.57, 0]} rotation={[0, -0.35, 0]} /> : null}
        {index === 5 ? <Crow position={[-0.34, 1.78, 0.05]} rotation={[0, 0.5, 0]} /> : null}
      </group>
    </group>
  );
}

export default function SouthTrees() {
  const treeLots = townData.lots.filter((lot) => isSouthTreeLotId(lot.id));

  return (
    <group>
      {treeLots.map((lot, index) => {
        const [x, , z] = lot.position;
        return <SouthTree key={lot.id} index={index} position={[x, 0, z]} />;
      })}

      <FlyingBird position={[-9.5, 5.2, 45]} scale={0.85} />
      <FlyingBird position={[-8.6, 5.65, 44.6]} scale={0.65} />
      <FlyingBird position={[10.2, 4.9, 46.2]} scale={0.72} />
    </group>
  );
}
