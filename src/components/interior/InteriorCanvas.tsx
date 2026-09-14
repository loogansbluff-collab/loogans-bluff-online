"use client";

import { Canvas } from "@react-three/fiber";
import AquaticsInterior from "@/components/interior/AquaticsInterior";
import GasDress from "@/components/interior/GasDress";
import InteriorFixtures from "@/components/interior/InteriorFixtures";
import InteriorLights from "@/components/interior/InteriorLights";
import InteriorTouchLook from "@/components/interior/InteriorTouchLook";
import NewShopInterior from "@/components/interior/NewShopInterior";
import ShopInterior from "@/components/interior/ShopInterior";
import TavernDress from "@/components/interior/TavernDress";
import { isProtectedInteriorId } from "@/data/interiorLighting";
import { useGameStore } from "@/state/gameStore";

const INTERIOR_CAMERA: [number, number, number] = [0, 1.7, 3.5];

export default function InteriorCanvas() {
  const interiorId = useGameStore((state) => state.interiorId);
  const isProtected = isProtectedInteriorId(interiorId);
  const isAquatics = interiorId === "LB-COMMUNITY-001";
  const isTavern = interiorId === "LB-TAVERN-001";
  const isGas = interiorId === "LB-GAS-001";

  return (
    <Canvas
      camera={{ position: INTERIOR_CAMERA, fov: 70, near: 0.1, far: 100 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={[isProtected ? "#111827" : "#202938"]} />
      {isProtected ? (
        <>
          <ShopInterior />
          <InteriorTouchLook />
          {isTavern ? <TavernDress /> : null}
          {isGas ? <GasDress /> : null}
        </>
      ) : isAquatics ? (
        <>
          <AquaticsInterior />
          <InteriorTouchLook />
        </>
      ) : (
        <>
          <NewShopInterior />
          <InteriorTouchLook />
          <InteriorLights />
          <InteriorFixtures />
        </>
      )}
    </Canvas>
  );
}
