"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  InstancedMesh,
  Matrix4,
  Object3D,
  Vector3,
} from "three";
import {
  COUNTRY_WEST_ROAD_SAMPLE_COUNT,
  COUNTRY_WEST_ROAD_WIDTH,
  getCountryWestRoadCurve,
} from "@/lib/westWorld";

type TreeSpec = {
  x: number;
  z: number;
  scale: number;
  rotation: number;
};

const TREE_SPECS: TreeSpec[] = [
  { x: -121, z: -59, scale: 1.0, rotation: 0.2 },
  { x: -125, z: -61, scale: 1.15, rotation: 1.1 },
  { x: -129, z: -59, scale: 0.9, rotation: 2.0 },
  { x: -133, z: -57, scale: 1.2, rotation: 0.5 },
  { x: -137, z: -55, scale: 1.05, rotation: 1.7 },
  { x: -142, z: -53, scale: 1.18, rotation: 2.6 },
  { x: -147, z: -49, scale: 0.95, rotation: 0.8 },
  { x: -152, z: -45, scale: 1.12, rotation: 1.9 },
  { x: -157, z: -40, scale: 1.24, rotation: 2.9 },
  { x: -162, z: -35, scale: 1.02, rotation: 0.3 },
  { x: -166, z: -30, scale: 1.2, rotation: 1.5 },
  { x: -120, z: -43, scale: 0.92, rotation: 2.4 },
  { x: -124, z: -40, scale: 1.1, rotation: 0.7 },
  { x: -128, z: -38, scale: 1.22, rotation: 1.8 },
  { x: -133, z: -35, scale: 0.98, rotation: 2.8 },
  { x: -138, z: -31, scale: 1.14, rotation: 0.4 },
  { x: -143, z: -27, scale: 1.05, rotation: 1.3 },
  { x: -148, z: -23, scale: 1.2, rotation: 2.2 },
  { x: -153, z: -18, scale: 0.94, rotation: 0.9 },
  { x: -158, z: -13, scale: 1.16, rotation: 1.6 },
  { x: -163, z: -8, scale: 1.05, rotation: 2.7 },
  { x: -118, z: -66, scale: 1.08, rotation: 0.1 },
  { x: -123, z: -69, scale: 0.96, rotation: 1.2 },
  { x: -129, z: -67, scale: 1.18, rotation: 2.1 },
  { x: -135, z: -65, scale: 1.04, rotation: 0.6 },
  { x: -141, z: -62, scale: 1.23, rotation: 1.8 },
  { x: -147, z: -58, scale: 1.0, rotation: 2.8 },
  { x: -153, z: -54, scale: 1.12, rotation: 0.9 },
  { x: -159, z: -49, scale: 0.92, rotation: 1.7 },
  { x: -165, z: -43, scale: 1.18, rotation: 2.5 },
  { x: -171, z: -35, scale: 1.05, rotation: 0.5 },
  { x: -116, z: -36, scale: 1.14, rotation: 2.0 },
  { x: -121, z: -31, scale: 0.96, rotation: 0.8 },
  { x: -126, z: -27, scale: 1.2, rotation: 1.9 },
  { x: -132, z: -22, scale: 1.08, rotation: 2.9 },
  { x: -138, z: -17, scale: 0.94, rotation: 0.2 },
  { x: -144, z: -12, scale: 1.16, rotation: 1.4 },
  { x: -150, z: -7, scale: 1.02, rotation: 2.3 },
  { x: -156, z: -3, scale: 1.19, rotation: 0.6 },
  { x: -162, z: 2, scale: 0.98, rotation: 1.7 },
  { x: -168, z: 6, scale: 1.12, rotation: 2.6 },
  { x: -171, z: -49, scale: 1.22, rotation: 0.9 },
  { x: -174, z: -42, scale: 1.0, rotation: 2.1 },
  { x: -172, z: 4, scale: 1.18, rotation: 1.1 },
];

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

export default function CountryWest() {
  const trunkRef = useRef<InstancedMesh>(null);
  const crownRef = useRef<InstancedMesh>(null);
  const roadGeometry = useMemo(() => makeRoadGeometry(), []);

  useLayoutEffect(() => {
    const trunk = trunkRef.current;
    const crown = crownRef.current;
    if (!trunk || !crown) return;

    const dummy = new Object3D();
    const trunkMatrix = new Matrix4();
    const crownMatrix = new Matrix4();

    TREE_SPECS.forEach((tree, index) => {
      const height = 2.25 * tree.scale;
      const trunkHeight = 1.25 * tree.scale;

      dummy.position.set(tree.x, trunkHeight / 2, tree.z);
      dummy.rotation.set(0, tree.rotation, 0);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.updateMatrix();
      trunkMatrix.copy(dummy.matrix);
      trunk.setMatrixAt(index, trunkMatrix);

      dummy.position.set(tree.x, trunkHeight + height * 0.43, tree.z);
      dummy.rotation.set(0, tree.rotation, 0);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.updateMatrix();
      crownMatrix.copy(dummy.matrix);
      crown.setMatrixAt(index, crownMatrix);
    });

    trunk.instanceMatrix.needsUpdate = true;
    crown.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <mesh geometry={roadGeometry}>
        <meshStandardMaterial color="#4a3426" roughness={0.97} />
      </mesh>

      <instancedMesh ref={trunkRef} args={[undefined, undefined, TREE_SPECS.length]}>
        <cylinderGeometry args={[0.18, 0.26, 1.25, 6]} />
        <meshStandardMaterial color="#5b3a24" roughness={0.95} />
      </instancedMesh>

      <instancedMesh ref={crownRef} args={[undefined, undefined, TREE_SPECS.length]}>
        <coneGeometry args={[1.05, 2.25, 7]} />
        <meshStandardMaterial color="#2f6b3b" roughness={0.95} />
      </instancedMesh>
    </group>
  );
}
