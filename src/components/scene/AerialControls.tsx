"use client";

import { MapControls } from "@react-three/drei";

export default function AerialControls() {
  return (
    <MapControls
      enableRotate={false}
      minDistance={18}
      maxDistance={90}
      target={[0, 0, 0]}
      screenSpacePanning
    />
  );
}
