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
  varying vec2 vUvStatic;
  varying vec3 vWorldPosition;
  varying vec3 vWaveNormal;
  varying float vCrestSignal;

  void main() {
    // UVs are immutable and completely independent from mesh rotation/displacement.
    vUvStatic = uv;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec2 xz = worldPosition.xz;

    vec2 dirA = normalize(vec2(1.0, 0.34));
    vec2 dirB = normalize(vec2(-0.46, 1.0));
    vec2 dirC = normalize(vec2(0.72, 0.69));

    float freqA = 0.024;
    float freqB = 0.032;
    float freqC = 0.046;

    float phaseA = dot(xz, dirA) * freqA + uTime * 0.52;
    float phaseB = dot(xz, dirB) * freqB - uTime * 0.44;
    float phaseC = dot(xz, dirC) * freqC + uTime * 0.61;

    float ampA = 0.070;
    float ampB = 0.045;
    float ampC = 0.025;

    float sineA = sin(phaseA);
    float sineB = sin(phaseB);
    float sineC = sin(phaseC);

    float waveHeight = sineA * ampA + sineB * ampB + sineC * ampC;

    float dHdx =
      cos(phaseA) * ampA * freqA * dirA.x +
      cos(phaseB) * ampB * freqB * dirB.x +
      cos(phaseC) * ampC * freqC * dirC.x;
    float dHdz =
      cos(phaseA) * ampA * freqA * dirA.y +
      cos(phaseB) * ampB * freqB * dirB.y +
      cos(phaseC) * ampC * freqC * dirC.y;

    // Vertical movement only. Never alter horizontal lake bounds or UVs.
    worldPosition.y += waveHeight;

    vWaveNormal = normalize(vec3(-dHdx, 1.0, -dHdz));
    vCrestSignal = clamp((sineA * 0.52 + sineB * 0.31 + sineC * 0.17) * 0.5 + 0.5, 0.0, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const LAKE_FRAGMENT_SHADER = `
  varying vec2 vUvStatic;
  varying vec3 vWorldPosition;
  varying vec3 vWaveNormal;
  varying float vCrestSignal;

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
    // Derive the lake mask ONLY from static UVs, converted back to lake-local units.
    vec2 lakeLocal = vec2(
      (vUvStatic.x - 0.5) * ${EAST_LAKE_WIDTH.toFixed(1)},
      (vUvStatic.y - 0.5) * ${EAST_LAKE_DEPTH.toFixed(1)}
    );
    if (lakeField(lakeLocal) > 1.0) discard;

    vec3 normal = normalize(vWaveNormal);
    vec3 lightDir = normalize(vec3(-0.38, 0.88, 0.30));
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);

    vec3 baseColor = vec3(0.085, 0.285, 0.355);
    vec3 crestColor = vec3(0.38, 0.64, 0.69);

    float specular = pow(max(dot(normal, halfDir), 0.0), 72.0) * 0.20;
    float crestPeak = smoothstep(0.82, 0.95, vCrestSignal);
    float thinCrest = pow(crestPeak, 7.0) * 0.24;

    vec3 color = baseColor;
    color += crestColor * thinCrest;
    color += crestColor * specular;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const SHORE_VERTEX_SHADER = `
  varying vec2 vUvStatic;

  void main() {
    vUvStatic = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHORE_FRAGMENT_SHADER = `
  varying vec2 vUvStatic;

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
    vec2 lakeLocal = vec2(
      (vUvStatic.x - 0.5) * ${EAST_LAKE_WIDTH.toFixed(1)},
      (vUvStatic.y - 0.5) * ${EAST_LAKE_DEPTH.toFixed(1)}
    );
    float field = lakeField(lakeLocal);
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
        <planeGeometry args={[EAST_LAKE_WIDTH, EAST_LAKE_DEPTH, 96, 96]} />
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
