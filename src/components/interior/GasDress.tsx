"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { PointLight } from "three";

function Fluorescent({ x, z, phase }: { x: number; z: number; phase: number }) {
  const light = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.elapsedTime * 8 + phase;
    const flutter = Math.sin(t) > 0.82 ? 0.25 : 0;
    light.current.intensity = 0.62 - flutter + Math.sin(t * 0.37) * 0.04;
  });

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 3.78, 0]}>
        <boxGeometry args={[2.5, 0.08, 0.28]} />
        <meshStandardMaterial color="#d9e7d7" emissive="#cfe7d0" emissiveIntensity={0.7} />
      </mesh>
      <pointLight ref={light} position={[0, 3.5, 0]} intensity={0.62} distance={8} color="#d8f0d6" />
    </group>
  );
}

function GasStool({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.16, 14]} />
        <meshStandardMaterial color="#6b3f2a" />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 10]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
    </group>
  );
}

export default function GasDress() {
  return (
    <>
      <Fluorescent x={-2.2} z={-0.8} phase={0.2} />
      <Fluorescent x={2.1} z={-2.6} phase={1.7} />

      <group position={[0, 2.05, -5.82]}>
        <mesh>
          <boxGeometry args={[7.0, 3.55, 0.14]} />
          <meshStandardMaterial color="#26332b" />
        </mesh>
        <Text position={[0, 1.34, 0.09]} fontSize={0.34} maxWidth={6.3} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          Skeeter&apos;s Gas &amp; CO
        </Text>
        <Text position={[0, 0.9, 0.09]} fontSize={0.3} maxWidth={6.3} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          WE Pump...Sometimes!
        </Text>
        <Text position={[0, 0.48, 0.09]} fontSize={0.24} maxWidth={6.3} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          No Public Washroom
        </Text>
        <Text position={[0, 0.12, 0.09]} fontSize={0.22} maxWidth={6.3} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          PeePee bucket out back
        </Text>
        <Text position={[0, -0.28, 0.09]} fontSize={0.22} maxWidth={6.3} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          0.1 SOL worth of $LOOGANS
        </Text>
        <Text position={[0, -0.66, 0.09]} fontSize={0.2} maxWidth={6.3} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          Connect Phantom wallet to:
        </Text>
        <Text position={[0, -1.08, 0.09]} fontSize={0.31} maxWidth={6.3} textAlign="center" anchorX="center" anchorY="middle" color="#22c55e">
          $Buy Regular (maybe)
        </Text>
        <Text position={[0, -1.45, 0.09]} fontSize={0.31} maxWidth={6.3} textAlign="center" anchorX="center" anchorY="middle" color="#ef4444">
          Refund
        </Text>
      </group>

      <group position={[-4.45, 0, -0.75]}>
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[0.9, 1.08, 2.5]} />
          <meshStandardMaterial color="#6b4f35" />
        </mesh>
        <mesh position={[0, 1.16, 0]}>
          <boxGeometry args={[1.02, 0.14, 2.7]} />
          <meshStandardMaterial color="#4b3628" />
        </mesh>
        <mesh position={[0.1, 1.45, -0.55]}>
          <boxGeometry args={[0.42, 0.34, 0.34]} />
          <meshStandardMaterial color="#30343b" />
        </mesh>
        <mesh position={[0.22, 1.56, -0.54]}>
          <boxGeometry args={[0.16, 0.06, 0.2]} />
          <meshStandardMaterial color="#8fa58f" />
        </mesh>
      </group>
      <GasStool x={-3.58} z={-1.45} />

      <group position={[4.58, 0, -0.35]}>
        {[-1.7, 0, 1.7].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.62, 0.12, 1.35]} /><meshStandardMaterial color="#74705f" /></mesh>
            <mesh position={[0, 1.05, 0]}><boxGeometry args={[0.62, 0.12, 1.35]} /><meshStandardMaterial color="#74705f" /></mesh>
            <mesh position={[0, 1.65, 0]}><boxGeometry args={[0.62, 0.12, 1.35]} /><meshStandardMaterial color="#74705f" /></mesh>
            {[-0.42, 0, 0.42].map((dz, i) => (
              <mesh key={dz} position={[-0.08, 0.72 + i * 0.38, dz]}>
                <boxGeometry args={[0.32, 0.38, 0.28]} />
                <meshStandardMaterial color={i % 2 === 0 ? "#9a3412" : "#475569"} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <group position={[4.1, 0, -4.62]}>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[1.25, 2.25, 1.0]} />
          <meshStandardMaterial color="#cbd5d1" />
        </mesh>
        <mesh position={[-0.28, 1.2, -0.51]}>
          <boxGeometry args={[0.5, 1.7, 0.05]} />
          <meshStandardMaterial color="#b7d2cc" emissive="#8fb8ad" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0.32, 1.2, -0.51]}>
          <boxGeometry args={[0.5, 1.7, 0.05]} />
          <meshStandardMaterial color="#b7d2cc" emissive="#8fb8ad" emissiveIntensity={0.12} />
        </mesh>
      </group>
    </>
  );
}
