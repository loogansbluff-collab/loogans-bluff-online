"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { townData } from "@/data/town";
import { isSouthTreeLotId } from "@/lib/southDecor";

function LeafClump({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.72, 8, 6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function ParkBench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-0.5, 0.23, 0]}>
        <boxGeometry args={[0.14, 0.46, 0.34]} />
        <meshStandardMaterial color="#4a3424" />
      </mesh>
      <mesh position={[0.5, 0.23, 0]}>
        <boxGeometry args={[0.14, 0.46, 0.34]} />
        <meshStandardMaterial color="#4a3424" />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.5, 0.14, 0.42]} />
        <meshStandardMaterial color="#6b4f32" />
      </mesh>
      <mesh position={[0, 0.82, 0.19]}>
        <boxGeometry args={[1.5, 0.5, 0.12]} />
        <meshStandardMaterial color="#6b4f32" />
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
  const foliageColor = ["#2f6b3b", "#3f7b46", "#285d34", "#477f49"][index % 4];
  const isBroadleaf = index === 2 || index === 6;

  useFrame(({ clock }) => {
    if (!swayRef.current) return;
    const t = clock.elapsedTime;
    swayRef.current.rotation.z = lean + Math.sin(t * 0.72 + phase) * swayAmount;
    swayRef.current.rotation.x = Math.cos(t * 0.57 + phase * 0.7) * swayAmount * 0.45;
  });

  const crownY = 1.45 + height * 0.25;

  return (
    <group position={position}>
      <group ref={swayRef}>
        <mesh position={[0, trunkHeight / 2, 0]}>
          <cylinderGeometry args={[0.18, 0.27, trunkHeight, 8]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#5b3a24" : "#6a4428"} />
        </mesh>

        {isBroadleaf ? (
          <group position={[0, crownY + 0.15, 0]}>
            <LeafClump position={[-0.55, 0.05, 0]} scale={[1.15, 1.0, 1.05]} color={foliageColor} />
            <LeafClump position={[0.52, 0.12, 0.05]} scale={[1.05, 1.12, 1.0]} color="#4d884d" />
            <LeafClump position={[0, 0.65, -0.05]} scale={[1.12, 1.18, 1.08]} color="#39743f" />
            <LeafClump position={[0.05, -0.42, 0.08]} scale={[1.25, 0.9, 1.08]} color="#326b3a" />
          </group>
        ) : (
          <group position={[0, crownY, 0]} scale={[crownScale, 1, crownScale]}>
            <mesh>
              <coneGeometry args={[1.08, height, 8]} />
              <meshStandardMaterial color={foliageColor} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

export default function SouthTrees() {
  const treeLots = townData.lots.filter((lot) => isSouthTreeLotId(lot.id));
  const sortedTreeLots = [...treeLots].sort((a, b) => a.position[0] - b.position[0]);
  const benchPositions: [number, number, number][] = [];

  for (let index = 0; index < sortedTreeLots.length - 1; index += 1) {
    const [leftX, , leftZ] = sortedTreeLots[index].position;
    const [rightX, , rightZ] = sortedTreeLots[index + 1].position;
    const gap = rightX - leftX;
    const benchX = (leftX + rightX) / 2;
    const benchZ = (leftZ + rightZ) / 2;

    if (gap < 3 || Math.abs(benchX) < 1.5) continue;
    benchPositions.push([benchX, 0, benchZ]);
  }

  return (
    <group>
      {treeLots.map((lot, index) => {
        const [x, , z] = lot.position;
        return <SouthTree key={lot.id} index={index} position={[x, 0, z]} />;
      })}

      {benchPositions.map((position) => (
        <ParkBench key={`bench-${position[0]}`} position={position} />
      ))}
    </group>
  );
}
