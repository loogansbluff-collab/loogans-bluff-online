"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { BuildingData } from "@/data/town";
import { useGameStore } from "@/state/gameStore";

export default function Building({ building }: { building: BuildingData }) {
  const start = useRef<[number, number] | null>(null);
  const selectedId = useGameStore((state) => state.selectedId);
  const setSelectedId = useGameStore((state) => state.setSelectedId);
  const isSelected = selectedId === building.id;
  const [x, , z] = building.position;
  const [width, height, depth] = building.size;

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    start.current = [event.clientX, event.clientY];
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!start.current) return;
    const distance = Math.hypot(event.clientX - start.current[0], event.clientY - start.current[1]);
    start.current = null;
    if (distance <= 5) setSelectedId(building.id);
  };

  return (
    <mesh position={[x, height / 2, z]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={building.color}
        emissive={isSelected ? "#facc15" : "#000000"}
        emissiveIntensity={isSelected ? 0.55 : 0}
      />
    </mesh>
  );
}
