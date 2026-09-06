"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { LotData } from "@/data/town";
import { enterStreetInFront } from "@/lib/enterBuildingStreet";
import { useGameStore } from "@/state/gameStore";

const INSET_COLOR = "#9b8a72";

export default function Lot({ lot }: { lot: LotData }) {
  const start = useRef<[number, number] | null>(null);
  const mode = useGameStore((state) => state.mode);
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
    if (distance <= 5 && mode === "aerial") enterStreetInFront(lot.id);
  };

  return (
    <group onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <mesh position={[x, height / 2, z]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={lot.color} />
      </mesh>
      <mesh position={[x, height + 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width - 1, depth - 1]} />
        <meshStandardMaterial color={INSET_COLOR} />
      </mesh>
    </group>
  );
}
