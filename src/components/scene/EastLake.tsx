"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ShaderMaterial } from "three";
import {
  EAST_LAKE_CENTER_X,
  EAST_LAKE_CENTER_Z,
  EAST_LAKE_DEPTH,
  EAST_LAKE_WIDTH,
} from "@/lib/eastLake";

const LAKE_VERTEX_SHADER = `
  uniform float uTime;
  varying vec2 vLakePosition;
  varying vec3 vWorldPosition;

  void main() {
    vLakePosition = position.xy;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    float waveA = sin(worldPosition.x * 0.20 + worldPosition.z * 0.16 + uTime * 0.72);
    float waveB = sin(worldPosition.x * -0.14 + worldPosition.z * 0.27 - uTime * 0.58);
    float waveC = sin((worldPosition.x + worldPosition.z) * 0.11 + uTime * 0.39);
    worldPosition.y += (waveA * 0.035 + waveB * 0.024 + waveC * 0.018);

    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const LAKE_FRAGMENT_SHADER = `
  uniform float uTime;
  varying vec2 vLakePosition;
  varying vec3 vWorldPosition;

  float ellipseField(vec2 p, vec2 center, vec2 radius) {
    vec2 q = (p - center) / radius;
    return dot(q, q);
  }

  float lakeField(vec2 p) {
    float d1 = ellipseField(p, vec2(-8.0, -5.0), vec2(50.0, 92.0));
    float d2 = ellipseField(p, vec2(18.0, -48.0), vec2(40.0, 55.0));
    float d3 = ellipseField(p, vec2(12.0, 52.0), vec2(42.0, 54.0));
    float d4 = ellipseField(p, vec2(-18.0, 28.0), vec2(34.0, 50.0));
    return min(min(d1, d2), min(d3, d4));
  }

  void main() {
    if (lakeField(vLakePosition) > 1.0) discard;

    float rippleA = sin(vWorldPosition.x * 0.31 + vWorldPosition.z * 0.19 + uTime * 0.82);
    float rippleB = sin(vWorldPosition.x * -0.23 + vWorldPosition.z * 0.36 - uTime * 0.67);
    float rippleC = sin(vWorldPosition.x * 0.12 - vWorldPosition.z * 0.29 + uTime * 0.47);
    float ripple = smoothstep(1.15, 2.35, rippleA + rippleB + rippleC * 0.55);

    float broadVariation = 0.5 + 0.5 * sin((vWorldPosition.x + vWorldPosition.z) * 0.035 + uTime * 0.10);
    vec3 deepWater = vec3(0.065, 0.20, 0.27);
    vec3 lakeBlue = vec3(0.10, 0.33, 0.40);
    vec3 highlight = vec3(0.31, 0.57, 0.61);
    vec3 baseColor = mix(deepWater, lakeBlue, 0.48 + broadVariation * 0.14);
    vec3 color = mix(baseColor, highlight, ripple * 0.24);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const SHORE_VERTEX_SHADER = `
  varying vec2 vLakePosition;

  void main() {
    vLakePosition = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHORE_FRAGMENT_SHADER = `
  varying vec2 vLakePosition;

  float ellipseField(vec2 p, vec2 center, vec2 radius) {
    vec2 q = (p - center) / radius;
    return dot(q, q);
  }

  float lakeField(vec2 p) {
    float d1 = ellipseField(p, vec2(-8.0, -5.0), vec2(50.0, 92.0));
    float d2 = ellipseField(p, vec2(18.0, -48.0), vec2(40.0, 55.0));
    float d3 = ellipseField(p, vec2(12.0, 52.0), vec2(42.0, 54.0));
    float d4 = ellipseField(p, vec2(-18.0, 28.0), vec2(34.0, 50.0));
    return min(min(d1, d2), min(d3, d4));
  }

  void main() {
    float field = lakeField(vLakePosition);
    if (field > 1.10 || field < 0.94) discard;
    gl_FragColor = vec4(0.38, 0.33, 0.23, 1.0);
  }
`;

export default function EastLake() {
  const waterMaterialRef = useRef<ShaderMaterial>(null);

  useFrame((state) => {
    if (waterMaterialRef.current) {
      waterMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[EAST_LAKE_CENTER_X, 0, EAST_LAKE_CENTER_Z]}>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[EAST_LAKE_WIDTH, EAST_LAKE_DEPTH, 48, 72]} />
        <shaderMaterial vertexShader={SHORE_VERTEX_SHADER} fragmentShader={SHORE_FRAGMENT_SHADER} />
      </mesh>

      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[EAST_LAKE_WIDTH, EAST_LAKE_DEPTH, 48, 72]} />
        <shaderMaterial
          ref={waterMaterialRef}
          vertexShader={LAKE_VERTEX_SHADER}
          fragmentShader={LAKE_FRAGMENT_SHADER}
          uniforms={{ uTime: { value: 0 } }}
        />
      </mesh>
    </group>
  );
}
