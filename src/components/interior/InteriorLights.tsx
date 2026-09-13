"use client";

import { Color } from "three";
import { useGameStore } from "@/state/gameStore";
import {
  getInteriorLightingPreset,
  isProtectedInteriorId,
  LIGHTING_FAMILIES,
} from "@/data/interiorLighting";

const MIN_AMBIENT_INTENSITY = 0.55;
const MIN_HEMISPHERE_INTENSITY = 0.35;
const MIN_AMBIENT_LUMINANCE = 0.52;
const MIN_HEMISPHERE_LUMINANCE = 0.46;
const MIN_POINT_DISTANCE = 16;
const POINT_INTENSITY_MULTIPLIER = 1.6;

function readableLightColor(value: string, minimumLuminance: number) {
  const color = new Color(value);
  const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;

  if (luminance >= minimumLuminance) return value;

  const white = new Color("#ffffff");
  const blend = Math.min(1, (minimumLuminance - luminance) / Math.max(0.001, 1 - luminance));
  color.lerp(white, blend);
  return `#${color.getHexString()}`;
}

export default function InteriorLights() {
  const interiorId = useGameStore((state) => state.interiorId);

  if (!interiorId || isProtectedInteriorId(interiorId)) return null;

  const configuredPreset = getInteriorLightingPreset(interiorId);
  const preset = configuredPreset ?? LIGHTING_FAMILIES.civic;
  const ambientColor = readableLightColor(preset.ambientColor, MIN_AMBIENT_LUMINANCE);
  const hemisphereSkyColor = readableLightColor(
    preset.hemisphereSkyColor,
    MIN_HEMISPHERE_LUMINANCE,
  );
  const hemisphereGroundColor = readableLightColor(
    preset.hemisphereGroundColor,
    MIN_HEMISPHERE_LUMINANCE,
  );

  return (
    <>
      <ambientLight
        color={ambientColor}
        intensity={Math.max(preset.ambientIntensity, MIN_AMBIENT_INTENSITY)}
      />
      <hemisphereLight
        color={hemisphereSkyColor}
        groundColor={hemisphereGroundColor}
        intensity={Math.max(preset.hemisphereIntensity, MIN_HEMISPHERE_INTENSITY)}
      />
      {preset.pointLights.map((light, index) => (
        <pointLight
          key={`${interiorId}-point-${index}`}
          position={light.position}
          color={light.color}
          intensity={light.intensity * POINT_INTENSITY_MULTIPLIER}
          distance={Math.max(light.distance, MIN_POINT_DISTANCE)}
          castShadow={false}
        />
      ))}
    </>
  );
}
