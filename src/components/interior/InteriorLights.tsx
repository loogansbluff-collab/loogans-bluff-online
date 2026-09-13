"use client";

import { useGameStore } from "@/state/gameStore";
import { getInteriorLightingPreset } from "@/data/interiorLighting";

export default function InteriorLights() {
  const interiorId = useGameStore((state) => state.interiorId);
  const preset = getInteriorLightingPreset(interiorId);

  if (!preset) return null;

  return (
    <>
      <ambientLight color={preset.ambientColor} intensity={preset.ambientIntensity} />
      <hemisphereLight
        color={preset.hemisphereSkyColor}
        groundColor={preset.hemisphereGroundColor}
        intensity={preset.hemisphereIntensity}
      />
      {preset.pointLights.map((light, index) => (
        <pointLight
          key={`${interiorId}-point-${index}`}
          position={light.position}
          color={light.color}
          intensity={light.intensity}
          distance={light.distance}
          castShadow={false}
        />
      ))}
    </>
  );
}
