"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial, Vector3 } from "three";
import {
  getWestRiverCurve,
  getWestRiverWidth,
  WEST_APPROACH_END_X,
  WEST_APPROACH_START_X,
  WEST_APPROACH_WIDTH,
  WEST_EXIT_Z,
  WEST_GROUND_MAX_X,
  WEST_GROUND_MIN_X,
  WEST_RIVER_BANK_WIDTH,
  WEST_RIVER_SAMPLE_COUNT,
} from "@/lib/westWorld";

type StripPoint = {
  left: Vector3;
  right: Vector3;
};

function makeStripGeometry(points: StripPoint[], y: number) {
  const positions: number[] = [];
  const indices: number[] = [];

  points.forEach((point) => {
    positions.push(point.left.x, y, point.left.z);
    positions.push(point.right.x, y, point.right.z);
  });

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const WATER_VERTEX_SHADER = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const WATER_FRAGMENT_SHADER = `
  uniform float uTime;
  varying vec3 vWorldPosition;

  void main() {
    float flow = vWorldPosition.z * 0.23 - uTime * 1.25;
    float rippleA = sin(flow + vWorldPosition.x * 0.55);
    float rippleB = sin(flow * 1.7 - vWorldPosition.x * 0.34 + uTime * 0.32);
    float ripple = smoothstep(1.15, 1.82, rippleA + rippleB);

    vec3 deepWater = vec3(0.075, 0.22, 0.29);
    vec3 riverBlue = vec3(0.11, 0.34, 0.41);
    vec3 highlight = vec3(0.34, 0.58, 0.62);

    float broadVariation = 0.5 + 0.5 * sin(vWorldPosition.z * 0.045 + uTime * 0.12);
    vec3 baseColor = mix(deepWater, riverBlue, 0.42 + broadVariation * 0.12);
    vec3 color = mix(baseColor, highlight, ripple * 0.26);

    gl_FragColor = vec4(color, 0.94);
  }
`;

export default function WestWorld() {
  const waterMaterialRef = useRef<ShaderMaterial>(null);
  const extensionWidth = WEST_GROUND_MAX_X - WEST_GROUND_MIN_X;
  const extensionCenterX = (WEST_GROUND_MIN_X + WEST_GROUND_MAX_X) / 2;
  const approachLength = WEST_APPROACH_START_X - WEST_APPROACH_END_X;
  const approachCenterX = (WEST_APPROACH_START_X + WEST_APPROACH_END_X) / 2;

  const { waterGeometry, westBankGeometry, eastBankGeometry } = useMemo(() => {
    const curve = getWestRiverCurve();
    const water: StripPoint[] = [];
    const westBank: StripPoint[] = [];
    const eastBank: StripPoint[] = [];

    for (let i = 0; i <= WEST_RIVER_SAMPLE_COUNT; i += 1) {
      const t = i / WEST_RIVER_SAMPLE_COUNT;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const normal = new Vector3(-tangent.z, 0, tangent.x).normalize();
      const halfWidth = getWestRiverWidth(t) / 2;

      const waterLeft = point.clone().addScaledVector(normal, halfWidth);
      const waterRight = point.clone().addScaledVector(normal, -halfWidth);
      const westOuter = point.clone().addScaledVector(normal, halfWidth + WEST_RIVER_BANK_WIDTH);
      const eastOuter = point.clone().addScaledVector(normal, -(halfWidth + WEST_RIVER_BANK_WIDTH));

      water.push({ left: waterLeft, right: waterRight });
      westBank.push({ left: westOuter, right: waterLeft });
      eastBank.push({ left: waterRight, right: eastOuter });
    }

    return {
      waterGeometry: makeStripGeometry(water, 0.02),
      westBankGeometry: makeStripGeometry(westBank, 0.035),
      eastBankGeometry: makeStripGeometry(eastBank, 0.035),
    };
  }, []);

  useFrame((state) => {
    if (waterMaterialRef.current) {
      waterMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      <mesh position={[extensionCenterX, -0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[extensionWidth, 396]} />
        <meshStandardMaterial color="#314a35" />
      </mesh>

      <mesh position={[approachCenterX, 0.024, WEST_EXIT_Z]}>
        <boxGeometry args={[approachLength, 0.045, WEST_APPROACH_WIDTH]} />
        <meshStandardMaterial color="#4a3426" roughness={0.95} />
      </mesh>

      <mesh geometry={waterGeometry}>
        <shaderMaterial
          ref={waterMaterialRef}
          vertexShader={WATER_VERTEX_SHADER}
          fragmentShader={WATER_FRAGMENT_SHADER}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={westBankGeometry}>
        <meshStandardMaterial color="#6a5b3d" roughness={0.9} />
      </mesh>
      <mesh geometry={eastBankGeometry}>
        <meshStandardMaterial color="#6a5b3d" roughness={0.9} />
      </mesh>
    </group>
  );
}
