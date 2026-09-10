"use client";

import { Text } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  InstancedMesh,
  Matrix4,
  Object3D,
  Vector3,
} from "three";
import CountryWestHouse from "@/components/scene/CountryWestHouse";
import {
  COUNTRY_WEST_ROAD_SAMPLE_COUNT,
  COUNTRY_WEST_ROAD_WIDTH,
  COUNTRY_WEST_ROADBLOCK_DEPTH,
  COUNTRY_WEST_ROADBLOCK_WIDTH,
  getCountryWestRoadCurve,
  getCountryWestRoadblockPose,
} from "@/lib/westWorld";

type TreeSpec = {
  x: number;
  z: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

type ForestPocket = {
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  count: number;
};

const FOREST_POCKETS: ForestPocket[] = [
  { centerX: -126, centerZ: -59, radiusX: 13, radiusZ: 10, count: 18 },
  { centerX: -143, centerZ: -47, radiusX: 17, radiusZ: 13, count: 26 },
  { centerX: -157, centerZ: -27, radiusX: 18, radiusZ: 16, count: 30 },
  { centerX: -142, centerZ: -14, radiusX: 17, radiusZ: 13, count: 22 },
  { centerX: -166, centerZ: -4, radiusX: 12, radiusZ: 12, count: 18 },
];

const ROAD_CLEARANCE = COUNTRY_WEST_ROAD_WIDTH / 2 + 2.25;
const CLEARING_CENTER = new Vector3(-182, 0, 8);
const CLEARING_RADIUS_X = 12;
const CLEARING_RADIUS_Z = 10;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function distanceToRoad(x: number, z: number) {
  const curve = getCountryWestRoadCurve();
  let closest = Number.POSITIVE_INFINITY;

  for (let i = 0; i <= COUNTRY_WEST_ROAD_SAMPLE_COUNT; i += 1) {
    const point = curve.getPoint(i / COUNTRY_WEST_ROAD_SAMPLE_COUNT);
    const distance = Math.hypot(x - point.x, z - point.z);
    if (distance < closest) closest = distance;
  }

  return closest;
}

function isInsideClearing(x: number, z: number) {
  const nx = (x - CLEARING_CENTER.x) / CLEARING_RADIUS_X;
  const nz = (z - CLEARING_CENTER.z) / CLEARING_RADIUS_Z;
  return nx * nx + nz * nz < 1;
}

function makeTreeSpecs() {
  const random = seededRandom(0x10_0a_6a_6e);
  const trees: TreeSpec[] = [];

  FOREST_POCKETS.forEach((pocket, pocketIndex) => {
    let placed = 0;
    let attempts = 0;

    while (placed < pocket.count && attempts < pocket.count * 20) {
      attempts += 1;
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random());
      const clusterPull = random() < 0.58 ? 0.62 : 1;
      const x = pocket.centerX + Math.cos(angle) * pocket.radiusX * radius * clusterPull + (random() - 0.5) * 2.8;
      const z = pocket.centerZ + Math.sin(angle) * pocket.radiusZ * radius * clusterPull + (random() - 0.5) * 2.8;

      if (distanceToRoad(x, z) < ROAD_CLEARANCE) continue;
      if (isInsideClearing(x, z)) continue;

      const nearExisting = trees.some((tree) => Math.hypot(tree.x - x, tree.z - z) < 1.35);
      if (nearExisting && random() > 0.22) continue;

      const scaleX = 0.72 + random() * 0.58;
      const scaleY = 0.76 + random() * 0.72;
      trees.push({
        x,
        z,
        scaleX,
        scaleY,
        rotation: random() * Math.PI * 2 + pocketIndex * 0.17,
      });
      placed += 1;
    }
  });

  return trees;
}

function makeRoadGeometry() {
  const curve = getCountryWestRoadCurve();
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= COUNTRY_WEST_ROAD_SAMPLE_COUNT; i += 1) {
    const t = i / COUNTRY_WEST_ROAD_SAMPLE_COUNT;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const normal = new Vector3(-tangent.z, 0, tangent.x).normalize();
    const left = point.clone().addScaledVector(normal, COUNTRY_WEST_ROAD_WIDTH / 2);
    const right = point.clone().addScaledVector(normal, -COUNTRY_WEST_ROAD_WIDTH / 2);

    positions.push(left.x, 0.027, left.z, right.x, 0.027, right.z);

    if (i < COUNTRY_WEST_ROAD_SAMPLE_COUNT) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function CountryWestRoadblock() {
  const pose = useMemo(() => getCountryWestRoadblockPose(), []);
  const postOffset = COUNTRY_WEST_ROADBLOCK_WIDTH / 2 - 0.45;

  return (
    <group position={[pose.x, 0, pose.z]} rotation={[0, pose.rotationY, 0]}>
      <mesh position={[-postOffset, 0.72, 0]} rotation={[0, 0, -0.035]}>
        <boxGeometry args={[0.18, 1.44, 0.18]} />
        <meshStandardMaterial color="#5b3a24" roughness={0.95} />
      </mesh>
      <mesh position={[postOffset, 0.72, 0]} rotation={[0, 0, 0.045]}>
        <boxGeometry args={[0.18, 1.44, 0.18]} />
        <meshStandardMaterial color="#5b3a24" roughness={0.95} />
      </mesh>

      <mesh position={[0, 1.02, 0]} rotation={[0, 0, -0.025]}>
        <boxGeometry args={[COUNTRY_WEST_ROADBLOCK_WIDTH, 0.9, COUNTRY_WEST_ROADBLOCK_DEPTH]} />
        <meshStandardMaterial color="#d46b2a" roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.02, -COUNTRY_WEST_ROADBLOCK_DEPTH / 2 - 0.012]} rotation={[0, Math.PI, -0.025]}>
        <Text
          fontSize={0.28}
          maxWidth={4.35}
          lineHeight={1.12}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#fff3d1"
          outlineWidth={0.012}
          outlineColor="#4a2416"
        >
          {"ROAD BLOCK:\nRural homes and properties\ncoming soon."}
        </Text>
      </mesh>
    </group>
  );
}

export default function CountryWest() {
  const trunkRef = useRef<InstancedMesh>(null);
  const crownRef = useRef<InstancedMesh>(null);
  const roadGeometry = useMemo(() => makeRoadGeometry(), []);
  const treeSpecs = useMemo(() => makeTreeSpecs(), []);

  useLayoutEffect(() => {
    const trunk = trunkRef.current;
    const crown = crownRef.current;
    if (!trunk || !crown) return;

    const dummy = new Object3D();
    const trunkMatrix = new Matrix4();
    const crownMatrix = new Matrix4();

    treeSpecs.forEach((tree, index) => {
      const trunkHeight = 1.25 * tree.scaleY;
      const crownHeight = 2.25 * tree.scaleY;

      dummy.position.set(tree.x, trunkHeight / 2, tree.z);
      dummy.rotation.set(0, tree.rotation, 0);
      dummy.scale.set(tree.scaleX, tree.scaleY, tree.scaleX);
      dummy.updateMatrix();
      trunkMatrix.copy(dummy.matrix);
      trunk.setMatrixAt(index, trunkMatrix);

      dummy.position.set(tree.x, trunkHeight + crownHeight * 0.43, tree.z);
      dummy.rotation.set(0, tree.rotation, 0);
      dummy.scale.set(tree.scaleX, tree.scaleY, tree.scaleX);
      dummy.updateMatrix();
      crownMatrix.copy(dummy.matrix);
      crown.setMatrixAt(index, crownMatrix);
    });

    trunk.instanceMatrix.needsUpdate = true;
    crown.instanceMatrix.needsUpdate = true;
  }, [treeSpecs]);

  return (
    <group>
      <mesh geometry={roadGeometry}>
        <meshStandardMaterial color="#4a3426" roughness={0.97} />
      </mesh>

      <instancedMesh ref={trunkRef} args={[undefined, undefined, treeSpecs.length]}>
        <cylinderGeometry args={[0.18, 0.26, 1.25, 6]} />
        <meshStandardMaterial color="#5b3a24" roughness={0.95} />
      </instancedMesh>

      <instancedMesh ref={crownRef} args={[undefined, undefined, treeSpecs.length]}>
        <coneGeometry args={[1.05, 2.25, 7]} />
        <meshStandardMaterial color="#2f6b3b" roughness={0.95} />
      </instancedMesh>

      <CountryWestRoadblock />
      <CountryWestHouse />
    </group>
  );
}
