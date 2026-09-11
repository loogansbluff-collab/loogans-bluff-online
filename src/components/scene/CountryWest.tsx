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
  COUNTRY_WEST_DRIVEWAY_END,
  COUNTRY_WEST_DRIVEWAY_START,
  COUNTRY_WEST_DRIVEWAY_WIDTH,
  COUNTRY_WEST_ROAD_SAMPLE_COUNT,
  COUNTRY_WEST_ROAD_WIDTH,
  COUNTRY_WEST_ROADBLOCK_DEPTH,
  COUNTRY_WEST_ROADBLOCK_WIDTH,
  getCountryWestRoadCurve,
  getCountryWestRoadblockPose,
  getWestRiverCurve,
  getWestRiverWidth,
  WEST_EXIT_Z,
  WEST_FAR_TRAIL_END_X,
  WEST_FAR_TRAIL_START_X,
  WEST_FAR_TRAIL_WIDTH,
  WEST_GROUND_MIN_X,
  WEST_RIVER_BANK_WIDTH,
  WEST_RIVER_SAMPLE_COUNT,
} from "@/lib/westWorld";

type TreeSpec = {
  x: number;
  z: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

const ROAD_CLEARANCE = COUNTRY_WEST_ROAD_WIDTH / 2 + 2.75;
const DRIVEWAY_CLEARANCE = COUNTRY_WEST_DRIVEWAY_WIDTH / 2 + 2.1;
const FAR_TRAIL_CLEARANCE = WEST_FAR_TRAIL_WIDTH / 2 + 2.75;
const RIVER_TREE_CLEARANCE = 2.25;
const CLEARING_CENTER = new Vector3(-182, 0, 8);
const CLEARING_RADIUS_X = 12;
const CLEARING_RADIUS_Z = 10;
const FOREST_MIN_X = WEST_GROUND_MIN_X + 2.5;
const FOREST_MAX_X = -88;
const FOREST_MIN_Z = -195;
const FOREST_MAX_Z = 195;
const FOREST_STEP_X = 6.15;
const FOREST_STEP_Z = 6.05;

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

function distanceToDriveway(x: number, z: number) {
  const [startX, startZ] = COUNTRY_WEST_DRIVEWAY_START;
  const [endX, endZ] = COUNTRY_WEST_DRIVEWAY_END;
  const dx = endX - startX;
  const dz = endZ - startZ;
  const lengthSq = dx * dx + dz * dz;
  const t = Math.max(0, Math.min(1, ((x - startX) * dx + (z - startZ) * dz) / lengthSq));
  const closestX = startX + dx * t;
  const closestZ = startZ + dz * t;
  return Math.hypot(x - closestX, z - closestZ);
}

function distanceToFarTrail(x: number, z: number) {
  const closestX = Math.max(WEST_FAR_TRAIL_END_X, Math.min(WEST_FAR_TRAIL_START_X, x));
  return Math.hypot(x - closestX, z - WEST_EXIT_Z);
}

function isInsideClearing(x: number, z: number) {
  const nx = (x - CLEARING_CENTER.x) / CLEARING_RADIUS_X;
  const nz = (z - CLEARING_CENTER.z) / CLEARING_RADIUS_Z;
  return nx * nx + nz * nz < 1;
}

function isSafelyWestOfRiver(x: number, z: number) {
  const curve = getWestRiverCurve();
  let closestT = 0;
  let closestZDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i <= WEST_RIVER_SAMPLE_COUNT; i += 1) {
    const t = i / WEST_RIVER_SAMPLE_COUNT;
    const point = curve.getPoint(t);
    const zDistance = Math.abs(z - point.z);
    if (zDistance < closestZDistance) {
      closestZDistance = zDistance;
      closestT = t;
    }
  }

  const riverPoint = curve.getPoint(closestT);
  const westTreeLimit =
    riverPoint.x - getWestRiverWidth(closestT) / 2 - WEST_RIVER_BANK_WIDTH - RIVER_TREE_CLEARANCE;
  return x <= westTreeLimit;
}

function makeTreeSpecs() {
  const random = seededRandom(0x10_0a_6a_6e);
  const trees: TreeSpec[] = [];
  let rowIndex = 0;

  for (let baseZ = FOREST_MIN_Z; baseZ <= FOREST_MAX_Z; baseZ += FOREST_STEP_Z) {
    const rowOffset = rowIndex % 2 === 0 ? 0 : FOREST_STEP_X * 0.5;

    for (let baseX = FOREST_MIN_X + rowOffset; baseX <= FOREST_MAX_X; baseX += FOREST_STEP_X) {
      if (random() < 0.08) continue;

      const x = baseX + (random() - 0.5) * 3.1;
      const z = baseZ + (random() - 0.5) * 3.0;

      if (!isSafelyWestOfRiver(x, z)) continue;
      if (distanceToFarTrail(x, z) < FAR_TRAIL_CLEARANCE) continue;
      if (distanceToRoad(x, z) < ROAD_CLEARANCE) continue;
      if (distanceToDriveway(x, z) < DRIVEWAY_CLEARANCE) continue;
      if (isInsideClearing(x, z)) continue;

      const scaleX = 0.7 + random() * 0.62;
      const scaleY = 0.75 + random() * 0.78;
      trees.push({
        x,
        z,
        scaleX,
        scaleY,
        rotation: random() * Math.PI * 2,
      });
    }

    rowIndex += 1;
  }

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

      <mesh position={[0, 1.02, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[COUNTRY_WEST_ROADBLOCK_WIDTH, 0.9, COUNTRY_WEST_ROADBLOCK_DEPTH]} />
        <meshStandardMaterial color="#d46b2a" roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.02, -COUNTRY_WEST_ROADBLOCK_DEPTH / 2 - 0.012]} rotation={[0, Math.PI, 0]}>
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
