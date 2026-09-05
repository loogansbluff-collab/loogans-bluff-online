"use client";

import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { LotData } from "@/data/town";
import { useGameStore } from "@/state/gameStore";

export default function Lot({ lot }: { lot: LotData }) {
  const start = useRef<[number, number] | null>(null);
  const selectedId = useGameStore((state) => state.selectedId);
  const setSelectedId = useGameStore((state) => state.setSelectedId);
  const isSelected = selectedId === lot.id;
  const [x, , z] = lot.position;
  const [width, height, depth] = lot.size;

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    start.current = [event.clientX, event.clientY];
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!start.current) return;
    const distance = Math.hypot(event.clientX - start.current[0], event.clientY - start.current[1]);
    start.current = null;
    if (distance <= 5) setSelectedId(lot.id);
  };

  return (
    <group>
      <mesh position={[x, height / 2, z]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={lot.color}
          emissive={isSelected ? "#facc15" : "#000000"}
          emissiveIntensity={isSelected ? 0.55 : 0}
        />
      </mesh>
      <Html position={[x, 0.9, z]} center style={{ pointerEvents: "none" }}>
        <div className="whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white">PROPERTY FOR SALE — COMING SOON</div>
      </Html>
    </group>
  );
}
