"use client";

import { Canvas } from "@react-three/fiber";
import GasDress from "@/components/interior/GasDress";
import InteriorTouchLook from "@/components/interior/InteriorTouchLook";
import ShopInterior from "@/components/interior/ShopInterior";
import TavernDress from "@/components/interior/TavernDress";
import { useGameStore } from "@/state/gameStore";

const INTERIOR_CAMERA: [number, number, number] = [0, 1.7, 3.5];

export default function InteriorCanvas() {
  const interiorId = useGameStore((state) => state.interiorId);
  const isTavern = interiorId === "LB-TAVERN-001";
  const isGas = interiorId === "LB-GAS-001";

  return (
    <Canvas
      camera={{ position: INTERIOR_CAMERA, fov: 70, near: 0.1, far: 100 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#111827"]} />
      <ShopInterior />
      <InteriorTouchLook />
      {isTavern ? <TavernDress /> : null}
      {isGas ? <GasDress /> : null}
    </Canvas>
  );
}
