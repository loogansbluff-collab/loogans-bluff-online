"use client";

import { useGameStore } from "@/state/gameStore";
import {
  getInteriorLightingPreset,
  isProtectedInteriorId,
  LIGHTING_FAMILIES,
} from "@/data/interiorLighting";

const MIN_AMBIENT_INTENSITY = 0.28;
const MIN_HEMISPHERE_INTENSITY = 0.18;

export default function InteriorLights() {
  const interiorId = useGameStore((state) => state.interiorId);

  if (!interiorId || isProtectedInteriorId(interiorId)) return null;

  const configuredPreset = getInteriorLightingPreset(interiorId);
  const preset = configuredPreset ?? LIGHTING_FAMILIES.civic;

  return (
    <>
      <ambientLight
        color={preset.ambientColor}
        intensity={Math.max(preset.ambientIntensity, MIN_AMBIENT_INTENSITY)}
      />
      <hemisphereLight
        color={preset.hemisphereSkyColor}
        groundColor={preset.hemisphereGroundColor}
        intensity={Math.max(preset.hemisphereIntensity, MIN_HEMISPHERE_INTENSITY)}
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
