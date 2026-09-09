"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { townData } from "@/data/town";
import { isSouthTreeLotId } from "@/lib/southDecor";

function Crow({ position, rotation = [0, 0, 0], scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#080808" />
      </mesh>
      <mesh position={[0.14, 0.11, 0]}>
        <sphereGeometry args={[0.11, 8, 6]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      <mesh position={[0.27, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.045, 0.18, 5]} />
        <meshStandardMaterial color="#242424" />
      </mesh>
      <mesh position={[-0.1, -0.02, 0]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.12, 0.28, 5]} />
        <meshStandardMaterial color="#0b0b0b" />
      </mesh>
      <mesh position={[-0.05, -0.17, -0.05]}>
        <boxGeometry args={[0.025, 0.19, 0.025]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.03, -0.17, 0.05]}>
        <boxGeometry args={[0.025, 0.19, 0.025]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}

function FlyingBird({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[-0.18, 0, 0]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.38, 0.045, 0.055]} />
        <meshStandardMaterial color="#151515" />
      </mesh>
      <mesh position={[0.18, 0, 0]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.38, 0.045, 0.055]} />
        <meshStandardMaterial color="#151515" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.08, 6, 5]} />
        <meshStandardMaterial color="#181818" />
      </mesh>
    </group>
  );
}

function LeafClump({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.72, 8, 6]} />
      <meshStandardMaterial color={color} />
    </mesh>
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
  const foliageColor = ["#2f6b3b", "#3f7b46", "#285d34", "#477f49"][index % 4];
  const isBroadleaf = index === 2 || index === 6;
  const isSplitPine = index === 3 || index === 7;

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

        <mesh position={[0.5 * branchSide, 1.18, 0]} rotation={[0, 0, branchSide * -0.92]}>
          <cylinderGeometry args={[0.07, 0.1, 1.05, 6]} />
          <meshStandardMaterial color="#5b3a24" />
        </mesh>
        <mesh position={[-0.42 * branchSide, 1.48, 0.08]} rotation={[0.18, 0, branchSide * 1.02]}>
          <cylinderGeometry args={[0.055, 0.085, 0.88, 6]} />
          <meshStandardMaterial color="#5b3a24" />
        </mesh>
        {index % 3 === 0 ? (
          <mesh position={[0.18, 1.72, -0.12]} rotation={[0.55, 0.25, -0.55]}>
            <cylinderGeometry args={[0.045, 0.07, 0.72, 6]} />
            <meshStandardMaterial color="#5b3a24" />
          </mesh>
        ) : null}

        {isBroadleaf ? (
          <group position={[0, crownY + 0.15, 0]}>
            <LeafClump position={[-0.55, 0.05, 0]} scale={[1.15, 1.0, 1.05]} color={foliageColor} />
            <LeafClump position={[0.52, 0.12, 0.05]} scale={[1.05, 1.12, 1.0]} color="#4d884d" />
            <LeafClump position={[0, 0.65, -0.05]} scale={[1.12, 1.18, 1.08]} color="#39743f" />
            <LeafClump position={[0.05, -0.42, 0.08]} scale={[1.25, 0.9, 1.08]} color="#326b3a" />
          </group>
        ) : isSplitPine ? (
          <group position={[0, crownY, 0]}>
            <mesh position={[-0.38, -0.15, 0]} rotation={[0, 0, 0.08]}>
              <coneGeometry args={[0.9, height * 0.92, 7]} />
              <meshStandardMaterial color={foliageColor} />
            </mesh>
            <mesh position={[0.48, 0.18, 0]} rotation={[0, 0, -0.11]}>
              <coneGeometry args={[0.78, height * 0.78, 7]} />
              <meshStandardMaterial color="#356f3d" />
            </mesh>
          </group>
        ) : (
          <group position={[0, crownY, 0]} scale={[crownScale, 1, crownScale]}>
            <mesh>
              <coneGeometry args={[1.08, height, 8]} />
              <meshStandardMaterial color={foliageColor} />
            </mesh>
            <mesh position={[0.34 * branchSide, -0.36, 0.14]} scale={[0.72, 0.68, 0.72]}>
              <coneGeometry args={[0.95, height * 0.82, 7]} />
              <meshStandardMaterial color={index % 2 === 0 ? "#3b7742" : "#2b6337"} />
            </mesh>
          </group>
        )}

        {index === 1 ? <Crow position={[0.78, 2.45, 0.02]} rotation={[0, -0.45, 0]} scale={1.05} /> : null}
        {index === 5 ? <Crow position={[-0.72, 2.72, 0.02]} rotation={[0, 0.55, 0]} scale={1.12} /> : null}
        {index === 7 ? <Crow position={[0.45, 3.05, 0.05]} rotation={[0, -0.2, 0]} scale={0.95} /> : null}
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

      <FlyingBird position={[-11.5, 4.25, 39.5]} scale={1.25} />
      <FlyingBird position={[-10.3, 4.75, 39.0]} scale={0.95} />
      <FlyingBird position={[10.8, 4.35, 40.2]} scale={1.15} />
    </group>
  );
}
