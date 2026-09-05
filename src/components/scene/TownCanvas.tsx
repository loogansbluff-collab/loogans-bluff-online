"use client";

import { Canvas } from "@react-three/fiber";
import { townData } from "@/data/town";
import Ground from "@/components/scene/Ground";
import Building from "@/components/scene/Building";
import Lot from "@/components/scene/Lot";
import AerialControls from "@/components/scene/AerialControls";

export default function TownCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 45, 45], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#1b2430"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[20, 30, 10]} intensity={1} />

      <Ground size={townData.groundSize} />
      {townData.buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
      {townData.lots.map((lot) => (
        <Lot key={lot.id} lot={lot} />
      ))}
      <AerialControls />
    </Canvas>
  );
}
