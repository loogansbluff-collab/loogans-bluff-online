"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { PerspectiveCamera } from "three";
import { townData } from "@/data/town";
import { useGameStore } from "@/state/gameStore";
import Ground from "@/components/scene/Ground";
import Building from "@/components/scene/Building";
import Lot from "@/components/scene/Lot";
import AerialControls from "@/components/scene/AerialControls";
import StreetControls from "@/components/scene/StreetControls";

function AerialMode() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 45, 45);
    camera.lookAt(0, 0, 0);

    if (camera instanceof PerspectiveCamera) {
      camera.fov = 50;
      camera.near = 0.1;
      camera.far = 1000;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  return <AerialControls />;
}

function TownScene() {
  const mode = useGameStore((state) => state.mode);

  return (
    <>
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

      {mode === "aerial" ? <AerialMode /> : <StreetControls />}
    </>
  );
}

export default function TownCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 45, 45], fov: 50, near: 0.1, far: 1000 }}
      style={{ width: "100%", height: "100%" }}
    >
      <TownScene />
    </Canvas>
  );
}
