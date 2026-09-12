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
  varying vec3 vWaveNormal;
  varying float vWaveHeight;

  void main() {
    vLakePosition = position.xy;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec2 xz = worldPosition.xz;

    vec2 dirA = normalize(vec2(1.0, 0.28));
    vec2 dirB = normalize(vec2(-0.42, 1.0));
    vec2 dirC = normalize(vec2(0.72, 0.69));

    float freqA = 0.10;
    float freqB = 0.16;
    float freqC = 0.28;

    float phaseA = dot(xz, dirA) * freqA + uTime * 1.05;
    float phaseB = dot(xz, dirB) * freqB - uTime * 0.88;
    float phaseC = dot(xz, dirC) * freqC + uTime * 1.42;

    float ampA = 0.27;
    float ampB = 0.18;
    float ampC = 0.10;

    float waveA = sin(phaseA) * ampA;
    float waveB = sin(phaseB) * ampB;
    float waveC = sin(phaseC) * ampC;
    float waveHeight = waveA + waveB + waveC;

    float dHdx =
      cos(phaseA) * ampA * freqA * dirA.x +
      cos(phaseB) * ampB * freqB * dirB.x +
      cos(phaseC) * ampC * freqC * dirC.x;
    float dHdz =
      cos(phaseA) * ampA * freqA * dirA.y +
      cos(phaseB) * ampB * freqB * dirB.y +
      cos(phaseC) * ampC * freqC * dirC.y;

    worldPosition.y += waveHeight;

    vWaveHeight = waveHeight;
    vWaveNormal = normalize(vec3(-dHdx, 1.0, -dHdz));
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const LAKE_FRAGMENT_SHADER = `
  uniform float uTime;
  varying vec2 vLakePosition;
  varying vec3 vWorldPosition;
  varying vec3 vWaveNormal;
  varying float vWaveHeight;

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

    vec3 normal = normalize(vWaveNormal);
    vec3 lightDir = normalize(vec3(-0.38, 0.88, 0.30));
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);

    float diffuse = 0.58 + max(dot(normal, lightDir), 0.0) * 0.42;
    float specular = pow(max(dot(normal, halfDir), 0.0), 54.0);

    float crest = smoothstep(0.30, 0.43, vWaveHeight);
    float thinCrest = crest * (1.0 - smoothstep(0.43, 0.53, vWaveHeight));

    vec3 deepWater = vec3(0.055, 0.18, 0.25);
    vec3 lakeBlue = vec3(0.09, 0.31, 0.39);
    vec3 crestColor = vec3(0.42, 0.68, 0.72);

    float heightMix = clamp(vWaveHeight * 0.48 + 0.5, 0.0, 1.0);
    vec3 baseColor = mix(deepWater, lakeBlue, 0.36 + heightMix * 0.34);
    vec3 color = baseColor * diffuse;
    color += crestColor * thinCrest * 0.30;
    color += crestColor * specular * 0.34;

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
