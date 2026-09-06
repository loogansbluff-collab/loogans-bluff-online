"use client";

import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useGameStore } from "@/state/gameStore";

export default function Ground({ size }: { size: number }) {
  const start = useRef<[number, number] | null>(null);
  const setSelectedId = useGameStore((state) => state.setSelectedId);

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    start.current = [event.clientX, event.clientY];
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!start.current) return;
    const distance = Math.hypot(event.clientX - start.current[0], event.clientY - start.current[1]);
    start.current = null;
    if (distance <= 5) setSelectedId(null);
  };

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#314a35" />
    </mesh>
  );
}
