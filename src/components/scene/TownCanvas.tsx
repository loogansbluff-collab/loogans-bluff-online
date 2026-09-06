"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { PerspectiveCamera } from "three";
import { townData } from "@/data/town";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";
import Ground from "@/components/scene/Ground";
import Building from "@/components/scene/Building";
import Lot from "@/components/scene/Lot";
import Roads from "@/components/scene/Roads";
import SouthTrees from "@/components/scene/SouthTrees";
import SpawnMarker from "@/components/scene/SpawnMarker";
import AerialControls from "@/components/scene/AerialControls";
import StreetControls from "@/components/scene/StreetControls";

const AERIAL_START: [number, number, number] = [0, 42, 55];
const AERIAL_TARGET: [number, number, number] = [0, 0, 20];

function AerialMode() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...AERIAL_START);
    camera.lookAt(...AERIAL_TARGET);

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
      <Roads />
      <SouthTrees />
      <SpawnMarker />
      {townData.buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
      {townData.lots.filter((lot) => !isSouthTreeLotId(lot.id)).map((lot) => (
        <Lot key={lot.id} lot={lot} />
      ))}

      {mode === "aerial" ? <AerialMode /> : <StreetControls />}
    </>
  );
}

export default function TownCanvas() {
  return (
    <Canvas
      camera={{ position: AERIAL_START, fov: 50, near: 0.1, far: 1000 }}
      style={{ width: "100%", height: "100%" }}
    >
      <TownScene />
    </Canvas>
  );
}
