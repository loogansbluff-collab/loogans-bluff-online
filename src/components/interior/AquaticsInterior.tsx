"use client";

import { PointerLockControls, Text, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, DoubleSide, Mesh, PlaneGeometry, Vector3 } from "three";
import FluorescentPanel from "@/components/interior/fixtures/FluorescentPanel";
import WallSconce from "@/components/interior/fixtures/WallSconce";
import { exitInterior } from "@/lib/enterInterior";

const SPEED = 6;
const EYE_HEIGHT = 1.7;
const ROOM_HALF_WIDTH = 12;
const ROOM_HALF_DEPTH = 18;
const ROOM_HEIGHT = 8;
const CEILING_Y = 8.05;
const PLAYER_RADIUS = 0.45;
const POOL_MIN_X = -6.5;
const POOL_MAX_X = 6.5;
const POOL_MIN_Z = -9;
const POOL_MAX_Z = 7;
const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isPoolBlocked(x: number, z: number) {
  return (
    x > POOL_MIN_X - PLAYER_RADIUS &&
    x < POOL_MAX_X + PLAYER_RADIUS &&
    z > POOL_MIN_Z - PLAYER_RADIUS &&
    z < POOL_MAX_Z + PLAYER_RADIUS
  );
}

function AquaticsControls() {
  const { camera } = useThree();
  const pressedKeys = useRef(new Set<string>());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const movement = useRef(new Vector3());

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 14.5);
    camera.lookAt(0, EYE_HEIGHT, -6);

    const onKeyDown = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) {
        pressedKeys.current.add(event.code);
        return;
      }

      if (event.code === "KeyR") {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          (target instanceof HTMLElement && target.isContentEditable)
        ) {
          return;
        }
        event.preventDefault();
        exitInterior();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (MOVE_KEYS.has(event.code)) pressedKeys.current.delete(event.code);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      pressedKeys.current.clear();
    };
  }, [camera]);

  useFrame((_, delta) => {
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;

    if (forward.current.lengthSq() > 0) {
      forward.current.normalize();
      right.current.set(-forward.current.z, 0, forward.current.x);
      movement.current.set(0, 0, 0);

      if (pressedKeys.current.has("KeyW")) movement.current.add(forward.current);
      if (pressedKeys.current.has("KeyS")) movement.current.sub(forward.current);
      if (pressedKeys.current.has("KeyD")) movement.current.add(right.current);
      if (pressedKeys.current.has("KeyA")) movement.current.sub(right.current);

      if (movement.current.lengthSq() > 0) {
        movement.current.normalize().multiplyScalar(SPEED * delta);

        const minX = -ROOM_HALF_WIDTH + PLAYER_RADIUS;
        const maxX = ROOM_HALF_WIDTH - PLAYER_RADIUS;
        const minZ = -ROOM_HALF_DEPTH + PLAYER_RADIUS;
        const maxZ = ROOM_HALF_DEPTH - PLAYER_RADIUS;

        const nextX = clamp(camera.position.x + movement.current.x, minX, maxX);
        if (!isPoolBlocked(nextX, camera.position.z)) camera.position.x = nextX;

        const nextZ = clamp(camera.position.z + movement.current.z, minZ, maxZ);
        if (!isPoolBlocked(camera.position.x, nextZ)) camera.position.z = nextZ;
      }
    }

    camera.position.y = EYE_HEIGHT;
  });

  return <PointerLockControls />;
}

function PoolSlide() {
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(8.4, 5.4, -10.8),
        new Vector3(8.0, 4.7, -8.2),
        new Vector3(7.2, 3.5, -5.3),
        new Vector3(6.2, 2.1, -2.5),
        new Vector3(5.2, 0.75, -0.8),
      ]),
    [],
  );

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 36, 0.62, 12, false]} />
        <meshBasicMaterial color="#1f6f8b" />
      </mesh>
      <mesh position={[8.4, 5.1, -10.8]}>
        <boxGeometry args={[3.2, 0.3, 3.2]} />
        <meshBasicMaterial color="#374151" />
      </mesh>
      {[
        [8.4, 2.5, -10.8, 5.0],
        [8.0, 2.15, -8.2, 4.3],
        [7.15, 1.55, -5.3, 3.1],
      ].map(([x, y, z, height], index) => (
        <mesh key={`slide-support-${index}`} position={[x, y, z]}>
          <cylinderGeometry args={[0.18, 0.18, height, 10]} />
          <meshBasicMaterial color="#6b7280" />
        </mesh>
      ))}
    </group>
  );
}

function WaterSurface() {
  const geometryRef = useRef<PlaneGeometry | null>(null);

  useFrame(({ clock }) => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const positions = geometry.attributes.position;
    const time = clock.elapsedTime;

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const z = positions.getY(index);
      const wave =
        Math.sin(x * 0.85 + time * 1.35) * 0.035 +
        Math.cos(z * 0.72 - time * 1.05) * 0.025 +
        Math.sin((x + z) * 1.15 + time * 0.7) * 0.015;
      positions.setZ(index, wave);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh position={[0, 0.055, -1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry ref={geometryRef} args={[12.6, 15.6, 32, 40]} />
      <meshBasicMaterial
        color="#55d7e8"
        transparent
        opacity={0.76}
        toneMapped={false}
        side={DoubleSide}
      />
    </mesh>
  );
}

function YellowWaterPatches() {
  const patchRefs = useRef<(Mesh | null)[]>([]);
  const patches = useMemo(
    () => [
      { baseX: -3.6, baseZ: -6.85, scaleX: 0.9, scaleZ: 1.6, baseRot: 0.18, phase: 0.1, speed: 0.62, xAmp: 0.16, zAmp: 0.18, baseOpacity: 0.14 },
      { baseX: -1.55, baseZ: -5.3, scaleX: 1.1, scaleZ: 1.9, baseRot: -0.14, phase: 1.3, speed: 0.54, xAmp: 0.2, zAmp: 0.15, baseOpacity: 0.16 },
      { baseX: 1.15, baseZ: -7.0, scaleX: 1.0, scaleZ: 1.8, baseRot: 0.09, phase: 2.2, speed: 0.58, xAmp: 0.14, zAmp: 0.18, baseOpacity: 0.15 },
      { baseX: 3.45, baseZ: -4.95, scaleX: 1.2, scaleZ: 2.05, baseRot: -0.08, phase: 0.8, speed: 0.49, xAmp: 0.18, zAmp: 0.2, baseOpacity: 0.14 },
      { baseX: -2.4, baseZ: -2.8, scaleX: 1.25, scaleZ: 2.1, baseRot: 0.04, phase: 2.9, speed: 0.52, xAmp: 0.16, zAmp: 0.18, baseOpacity: 0.13 },
      { baseX: 2.0, baseZ: -1.45, scaleX: 1.35, scaleZ: 2.25, baseRot: -0.11, phase: 1.9, speed: 0.56, xAmp: 0.18, zAmp: 0.16, baseOpacity: 0.12 },
    ],
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    patches.forEach((patch, index) => {
      const mesh = patchRefs.current[index];
      if (!mesh) return;

      mesh.position.x = patch.baseX + Math.sin(time * patch.speed + patch.phase) * patch.xAmp;
      mesh.position.z = patch.baseZ + Math.cos(time * patch.speed * 0.82 + patch.phase) * patch.zAmp;
      mesh.rotation.z = patch.baseRot + Math.sin(time * patch.speed * 0.7 + patch.phase) * 0.12;

      const material = mesh.material as { opacity?: number };
      if (typeof material.opacity === "number") {
        material.opacity = patch.baseOpacity + (Math.sin(time * patch.speed * 1.35 + patch.phase) + 1) * 0.035;
      }
    });
  });

  return (
    <>
      {patches.map((patch, index) => (
        <mesh
          key={`yellow-water-patch-${index}`}
          ref={(node) => {
            patchRefs.current[index] = node;
          }}
          position={[patch.baseX, 0.11, patch.baseZ]}
          rotation={[-Math.PI / 2, 0, patch.baseRot]}
          scale={[patch.scaleX, patch.scaleZ, 1]}
          renderOrder={2}
        >
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color="#e5d238" transparent opacity={patch.baseOpacity} depthWrite={false} toneMapped={false} side={DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function PoolsideIdiots() {
  const texture = useTexture("/poolsidetrans.png");
  const image = texture.image as HTMLImageElement | undefined;
  const aspect = image?.width && image?.height ? image.width / image.height : 1.82;
  const height = 5.6;

  return (
    <mesh position={[0, height / 2 + 0.02, -9.42]}>
      <planeGeometry args={[height * aspect, height]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.04} toneMapped={false} side={DoubleSide} />
    </mesh>
  );
}

function AquaticsLights() {
  const ceilingFixtures = [
    [-7.2, 7.72, -10.5],
    [7.2, 7.72, -10.5],
    [-7.2, 7.72, 0],
    [7.2, 7.72, 0],
    [-7.2, 7.72, 10.5],
    [7.2, 7.72, 10.5],
  ] as [number, number, number][];

  return (
    <>
      <ambientLight color="#d9f3ff" intensity={0.48} />
      <hemisphereLight args={["#e8f8ff", "#66717a", 0.34]} />
      {ceilingFixtures.map((position, index) => (
        <FluorescentPanel
          key={`aquatics-ceiling-${index}`}
          position={position}
          size={[3.8, 0.24, 1.0]}
          emissiveColor="#e9f8ff"
          lightColor="#f4fbff"
          intensity={0.95}
          distance={14}
        />
      ))}
      <WallSconce position={[-11.68, 2.4, -7]} rotationY={Math.PI / 2} emissiveColor="#59d8ff" lightColor="#7ce3ff" intensity={0.46} distance={8} />
      <WallSconce position={[-11.68, 2.4, 7]} rotationY={Math.PI / 2} emissiveColor="#8b7cff" lightColor="#a99cff" intensity={0.42} distance={8} />
      <WallSconce position={[11.68, 2.4, -7]} rotationY={-Math.PI / 2} emissiveColor="#59d8ff" lightColor="#7ce3ff" intensity={0.46} distance={8} />
      <WallSconce position={[11.68, 2.4, 7]} rotationY={-Math.PI / 2} emissiveColor="#ff7fbf" lightColor="#ff9dca" intensity={0.4} distance={8} />
    </>
  );
}

export default function AquaticsInterior() {
  return (
    <>
      <AquaticsControls />
      <AquaticsLights />

      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[24, 0.24, 36]} />
        <meshStandardMaterial color="#b7b9bb" roughness={0.9} />
      </mesh>

      <mesh position={[0, -0.22, -1]}>
        <boxGeometry args={[13.2, 0.34, 16.2]} />
        <meshStandardMaterial color="#166b7a" emissive="#0d4350" emissiveIntensity={0.45} roughness={0.55} />
      </mesh>
      <WaterSurface />
      <YellowWaterPatches />

      <mesh position={[0, 0.08, 7.25]}><boxGeometry args={[13.8, 0.16, 0.5]} /><meshBasicMaterial color="#d9dde0" /></mesh>
      <mesh position={[0, 0.08, -9.25]}><boxGeometry args={[13.8, 0.16, 0.5]} /><meshBasicMaterial color="#d9dde0" /></mesh>
      <mesh position={[-6.75, 0.08, -1]}><boxGeometry args={[0.5, 0.16, 16.0]} /><meshBasicMaterial color="#d9dde0" /></mesh>
      <mesh position={[6.75, 0.08, -1]}><boxGeometry args={[0.5, 0.16, 16.0]} /><meshBasicMaterial color="#d9dde0" /></mesh>

      <PoolSlide />
      <PoolsideIdiots />

      <mesh position={[0, ROOM_HEIGHT / 2, -17.95]}><boxGeometry args={[24, ROOM_HEIGHT, 0.1]} /><meshStandardMaterial color="#d5dde2" roughness={0.9} /></mesh>
      <mesh position={[-11.95, ROOM_HEIGHT / 2, 0]}><boxGeometry args={[0.1, ROOM_HEIGHT, 36]} /><meshStandardMaterial color="#cbd6dc" roughness={0.9} /></mesh>
      <mesh position={[11.95, ROOM_HEIGHT / 2, 0]}><boxGeometry args={[0.1, ROOM_HEIGHT, 36]} /><meshStandardMaterial color="#cbd6dc" roughness={0.9} /></mesh>
      <mesh position={[-6.6, ROOM_HEIGHT / 2, 17.95]}><boxGeometry args={[10.8, ROOM_HEIGHT, 0.1]} /><meshStandardMaterial color="#d5dde2" roughness={0.9} /></mesh>
      <mesh position={[6.6, ROOM_HEIGHT / 2, 17.95]}><boxGeometry args={[10.8, ROOM_HEIGHT, 0.1]} /><meshStandardMaterial color="#d5dde2" roughness={0.9} /></mesh>
      <mesh position={[0, 6.65, 17.95]}><boxGeometry args={[2.4, 2.7, 0.1]} /><meshStandardMaterial color="#d5dde2" roughness={0.9} /></mesh>
      <mesh position={[0, CEILING_Y, 0]}><boxGeometry args={[24, 0.1, 36]} /><meshStandardMaterial color="#e7edf0" roughness={1} /></mesh>

      <Text position={[0, 5.6, -17.82]} fontSize={0.72} color="#12354a" anchorX="center" anchorY="middle">
        BLUFF AQUATICS — NO RUNNING
      </Text>
    </>
  );
}
