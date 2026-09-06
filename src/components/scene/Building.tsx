"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { BuildingData } from "@/data/town";
import { enterStreetInFront } from "@/lib/enterBuildingStreet";
import { useGameStore } from "@/state/gameStore";
import MainStreetBuilding from "@/components/scene/buildings/MainStreetBuilding";

const MAIN_STREET_IDS = new Set([
  "LB-BARBER-001",
  "LB-LIQUOR-001",
  "LB-HARDWARE-001",
  "LB-GAS-001",
  "LB-TAVERN-001",
  "LB-REPAIR-001",
]);

export default function Building({ building }: { building: BuildingData }) {
  const start = useRef<[number, number] | null>(null);
  const mode = useGameStore((state) => state.mode);
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
    if (distance <= 5 && mode === "aerial") enterStreetInFront(building.id);
  };

  return (
    <group>
      <mesh position={[x, 0.075, z]}>
        <boxGeometry args={[width + 0.6, 0.15, depth + 0.6]} />
        <meshStandardMaterial color="#262626" />
      </mesh>

      {MAIN_STREET_IDS.has(building.id) ? (
        <MainStreetBuilding building={building} onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      ) : (
        <mesh position={[x, height / 2, z]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={building.color} />
        </mesh>
      )}
    </group>
  );
}
