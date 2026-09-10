"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { WEST_EXIT_Z } from "@/lib/westWorld";

const SIDE_Z = [30, 8, -14, -36, -58, -80, -102, -124, -146, -168];
const NORTH_X = [-30, -18, 18, 30];
const WEST_GATE_CLEARANCE = 9;

type TreeSpec = {
  key: string;
  position: [number, number, number];
  variant: number;
};

type BenchSpec = {
  key: string;
  position: [number, number, number];
  rotationY: number;
};

const WEST_SIDE_Z = SIDE_Z.filter((z) => Math.abs(z - WEST_EXIT_Z) > WEST_GATE_CLEARANCE);

const TREES: TreeSpec[] = [
  ...WEST_SIDE_Z.map((z, index) => ({ key: `west-${index}`, position: [-39.5, 0, z] as [number, number, number], variant: index })),
  ...SIDE_Z.map((z, index) => ({ key: `east-${index}`, position: [39.5, 0, z] as [number, number, number], variant: index + 10 })),
  ...NORTH_X.map((x, index) => ({ key: `north-${index}`, position: [x, 0, -190.5] as [number, number, number], variant: index + 20 })),
];

const BENCHES: BenchSpec[] = [
  ...WEST_SIDE_Z.filter((_, index) => index % 2 === 0).map((z, index) => ({
    key: `west-bench-${index}`,
    position: [-37.5, 0, z] as [number, number, number],
    rotationY: -Math.PI / 2,
  })),
  ...SIDE_Z.filter((_, index) => index % 2 === 0).map((z, index) => ({
    key: `east-bench-${index}`,
    position: [37.5, 0, z] as [number, number, number],
    rotationY: Math.PI / 2,
  })),
  { key: "north-bench-west", position: [-30, 0, -188.4], rotationY: Math.PI },
  { key: "north-bench-east", position: [18, 0, -188.4], rotationY: Math.PI },
];

function LeafClump({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.7, 8, 6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function PerimeterTree({ spec }: { spec: TreeSpec }) {
  const swayRef = useRef<Group>(null);
  const index = spec.variant;
  const trunkHeight = 1.3 + (index % 3) * 0.12;
  const height = 2.35 + (index % 4) * 0.22;
  const crownScale = 0.9 + (index % 5) * 0.04;
  const phase = index * 0.71;
  const lean = ((index % 5) - 2) * 0.014;
  const swayAmount = 0.014 + (index % 3) * 0.004;
  const isBroadleaf = index % 6 === 2;
  const foliageColor = ["#2f6b3b", "#356f3d", "#285d34", "#3f7844"][index % 4];
  const crownY = 1.4 + height * 0.25;

  useFrame(({ clock }) => {
    if (!swayRef.current) return;
    const t = clock.elapsedTime;
    swayRef.current.rotation.z = lean + Math.sin(t * 0.66 + phase) * swayAmount;
    swayRef.current.rotation.x = Math.cos(t * 0.52 + phase * 0.8) * swayAmount * 0.4;
  });

  return (
    <group position={spec.position}>
      <group ref={swayRef}>
        <mesh position={[0, trunkHeight / 2, 0]}>
          <cylinderGeometry args={[0.17, 0.25, trunkHeight, 8]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#5b3a24" : "#654128"} />
        </mesh>

        {isBroadleaf ? (
          <group position={[0, crownY + 0.12, 0]}>
            <LeafClump position={[-0.45, 0, 0]} scale={[1.05, 0.95, 1]} color={foliageColor} />
            <LeafClump position={[0.45, 0.08, 0.04]} scale={[1, 1.05, 0.95]} color="#3f7b46" />
            <LeafClump position={[0, 0.55, -0.04]} scale={[1.08, 1.08, 1]} color="#39743f" />
          </group>
        ) : (
          <group position={[0, crownY, 0]} scale={[crownScale, 1, crownScale]}>
            <mesh>
              <coneGeometry args={[1.02, height, 8]} />
              <meshStandardMaterial color={foliageColor} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

function ParkBench({ spec }: { spec: BenchSpec }) {
  return (
    <group position={spec.position} rotation={[0, spec.rotationY, 0]}>
      <mesh position={[-0.48, 0.22, 0]}>
        <boxGeometry args={[0.14, 0.44, 0.18]} />
        <meshStandardMaterial color="#4a3424" />
      </mesh>
      <mesh position={[0.48, 0.22, 0]}>
        <boxGeometry args={[0.14, 0.44, 0.18]} />
        <meshStandardMaterial color="#4a3424" />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.45, 0.14, 0.42]} />
        <meshStandardMaterial color="#6b4f32" />
      </mesh>
      <mesh position={[0, 0.84, 0.24]}>
        <boxGeometry args={[1.45, 0.48, 0.12]} />
        <meshStandardMaterial color="#6b4f32" />
      </mesh>
    </group>
  );
}

export default function PerimeterDecor() {
  return (
    <group>
      {TREES.map((spec) => (
        <PerimeterTree key={spec.key} spec={spec} />
      ))}
      {BENCHES.map((spec) => (
        <ParkBench key={spec.key} spec={spec} />
      ))}
    </group>
  );
}
