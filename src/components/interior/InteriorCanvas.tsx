"use client";

import { Canvas } from "@react-three/fiber";
import ShopInterior from "@/components/interior/ShopInterior";

const INTERIOR_CAMERA: [number, number, number] = [0, 1.7, 3.5];

export default function InteriorCanvas() {
  return (
    <Canvas
      camera={{ position: INTERIOR_CAMERA, fov: 70, near: 0.1, far: 100 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#111827"]} />
      <ShopInterior />
    </Canvas>
  );
}
