"use client";

import { Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { CanvasTexture, RepeatWrapping, type Group, type MeshStandardMaterial } from "three";
import type { BuildingData, Vec3 } from "@/data/town";
import StorefrontSign from "@/components/scene/buildings/StorefrontSign";
import WallFinish from "@/components/scene/buildings/WallFinish";

type MainStreetBuildingProps = {
  building: BuildingData;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
};

const LIGHT_BRIGHT = "#ffe9a8";
const LIGHT_MEDIUM = "#f4d27a";
const LIGHT_DIM = "#c4a056";
const FRONT_DOOR_SOUTH_OFFSET = 0.06;

function FacadeBox({ position, size, color }: { position: Vec3; size: Vec3; color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function WarmWindow({
  position,
  size,
  color,
  intensity,
}: {
  position: Vec3;
  size: Vec3;
  color: string;
  intensity: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
    </mesh>
  );
}

function PulsingNeonSign({ x, z }: { x: number; z: number }) {
  const glowRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const pulse = (Math.sin(clock.elapsedTime * Math.PI * 2) + 1) / 2;
    glowRef.current.emissiveIntensity = 0.35 + pulse * 3.65;
  });

  return (
    <group position={[x, 2.05, z - 0.2]}>
      <mesh>
        <boxGeometry args={[1.45, 1.25, 0.035]} />
        <meshStandardMaterial color="#130817" emissive="#210628" emissiveIntensity={0.18} />
      </mesh>
      <Text
        position={[0, 0, -0.035]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.29}
        maxWidth={1.18}
        lineHeight={1.08}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        WINE & SPIRITS
        <meshStandardMaterial
          ref={glowRef}
          color="#ff4fd8"
          emissive="#ff1493"
          emissiveIntensity={2.1}
          toneMapped={false}
        />
      </Text>
    </group>
  );
}

function HardwareJokeSign({ x, z }: { x: number; z: number }) {
  const textGlowRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!textGlowRef.current) return;
    const slowPulse = (Math.sin(clock.elapsedTime * Math.PI * 2.2) + 1) / 2;
    const flicker = Math.sin(clock.elapsedTime * 22) > 0.9 ? 0.35 : 1;
    textGlowRef.current.emissiveIntensity = (0.25 + slowPulse * 1.9) * flicker;
  });

  return (
    <group position={[x, 1.98, z - 0.22]}>
      <mesh>
        <boxGeometry args={[1.54, 1.34, 0.05]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <Text
        position={[0, 0, -0.04]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.135}
        maxWidth={1.2}
        lineHeight={1.08}
        letterSpacing={0.002}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {"We sell all kinds\nof tools, one bag\nat a time!"}
        <meshStandardMaterial
          ref={textGlowRef}
          color="#990000"
          emissive="#990000"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </Text>
    </group>
  );
}

function PawnHeartSign({ x, z }: { x: number; z: number }) {
  const heartRef = useRef<Group>(null);
  const heartGlowRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const pulse = (Math.sin(clock.elapsedTime * Math.PI * 2.4) + 1) / 2;

    if (heartRef.current) {
      const scale = 0.9 + pulse * 0.16;
      heartRef.current.scale.setScalar(scale);
    }

    if (heartGlowRef.current) {
      heartGlowRef.current.emissiveIntensity = 0.75 + pulse * 2.75;
    }
  });

  return (
    <group position={[x, 2.05, z - 0.2]}>
      <mesh>
        <boxGeometry args={[1.45, 1.25, 0.05]} />
        <meshStandardMaterial color="#0f172a" emissive="#083344" emissiveIntensity={0.22} />
      </mesh>

      <group ref={heartRef} position={[0, 0.28, -0.045]}>
        <Text rotation={[0, Math.PI, 0]} fontSize={0.42} anchorX="center" anchorY="middle">
          ♥
          <meshStandardMaterial
            ref={heartGlowRef}
            color="#8A1538"
            emissive="#8A1538"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </Text>
      </group>

      <Text
        position={[0, -0.03, -0.045]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.16}
        maxWidth={1.16}
        lineHeight={1.05}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        NEED CASH?
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={1.15} toneMapped={false} />
      </Text>

      <Text
        position={[0, -0.34, -0.045]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.105}
        maxWidth={1.16}
        lineHeight={1.08}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {"BRING SOMETHING\nYOU’LL MISS."}
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.8} toneMapped={false} />
      </Text>
    </group>
  );
}

function TavernJokeSign({ x, z }: { x: number; z: number }) {
  const textGlowRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!textGlowRef.current) return;
    const slowPulse = (Math.sin(clock.elapsedTime * Math.PI * 0.9) + 1) / 2;
    const softFlicker = Math.sin(clock.elapsedTime * 4.2) > 0.72 ? 0.62 : 1;
    textGlowRef.current.emissiveIntensity = (0.55 + slowPulse * 1.15) * softFlicker;
  });

  return (
    <group position={[x, 2.05, z - 0.21]}>
      <mesh>
        <boxGeometry args={[1.45, 1.25, 0.05]} />
        <meshStandardMaterial color="#21170b" emissive="#3b2607" emissiveIntensity={0.18} />
      </mesh>
      <Text
        position={[0, 0, -0.045]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.125}
        maxWidth={1.18}
        lineHeight={1.22}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {"ALGOHOLICS WELCOME\nNO VOMITING ALLOWED"}
        <meshStandardMaterial
          ref={textGlowRef}
          color="#f6c453"
          emissive="#d99818"
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </Text>
    </group>
  );
}

function GasWindowSign({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 2.05, z - 0.2]}>
      <mesh>
        <boxGeometry args={[1.34, 0.88, 0.045]} />
        <meshStandardMaterial color="#ded5bd" roughness={0.92} />
      </mesh>
      <Text
        position={[0, 0.18, -0.04]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.09}
        maxWidth={1.18}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        Skeeter&apos;s Gas &amp; CO
        <meshStandardMaterial color="#29241f" />
      </Text>
      <Text
        position={[0, -0.18, -0.04]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.105}
        maxWidth={1.18}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        WE Pump...Sometimes!
        <meshStandardMaterial color="#29241f" />
      </Text>
    </group>
  );
}

function HalfCurtain({ x, z, color = "#e8dcc2" }: { x: number; z: number; color?: string }) {
  return <FacadeBox position={[x - 0.34, 2.05, z - 0.075]} size={[0.62, 1.08, 0.05]} color={color} />;
}

function SideDrape({ x, z, side = "left", color = "#6b4a3c" }: { x: number; z: number; side?: "left" | "right"; color?: string }) {
  const offset = side === "left" ? -0.57 : 0.57;
  return <FacadeBox position={[x + offset, 2.05, z - 0.075]} size={[0.2, 1.08, 0.05]} color={color} />;
}

function Blinds({ x, z }: { x: number; z: number }) {
  return (
    <group>
      {[-0.42, -0.14, 0.14, 0.42].map((offset) => (
        <FacadeBox key={offset} position={[x, 2.05 + offset, z - 0.075]} size={[1.22, 0.07, 0.05]} color="#d9d4c6" />
      ))}
    </group>
  );
}

function LowerCurtain({ x, z, color }: { x: number; z: number; color: string }) {
  return <FacadeBox position={[x, 1.78, z - 0.075]} size={[1.22, 0.5, 0.05]} color={color} />;
}

function BarberPole({ x, z }: { x: number; z: number }) {
  const poleRef = useRef<Group>(null);
  const stripeTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 126;
    canvas.height = 252;
    const context = canvas.getContext("2d");

    if (!context) return null;

    const stripeWidth = 14;
    const stripePeriod = stripeWidth * 3;
    const colors = ["#1d4ed8", "#f8fafc", "#dc2626"];
    const image = context.createImageData(canvas.width, canvas.height);

    for (let py = 0; py < canvas.height; py += 1) {
      for (let px = 0; px < canvas.width; px += 1) {
        const phase = (px + py) % stripePeriod;
        const stripeIndex = Math.floor(phase / stripeWidth);
        const color = colors[stripeIndex];
        const red = Number.parseInt(color.slice(1, 3), 16);
        const green = Number.parseInt(color.slice(3, 5), 16);
        const blue = Number.parseInt(color.slice(5, 7), 16);
        const offset = (py * canvas.width + px) * 4;

        image.data[offset] = red;
        image.data[offset + 1] = green;
        image.data[offset + 2] = blue;
        image.data[offset + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((_, delta) => {
    if (poleRef.current) {
      poleRef.current.rotation.y += delta * ((Math.PI * 2) / 2.5);
    }
  });

  if (!stripeTexture) return null;

  return (
    <group ref={poleRef} position={[x, 1.55, z]}>
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 1.8, 32]} />
        <meshStandardMaterial map={stripeTexture} />
      </mesh>
      <mesh position={[0, 0.98, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.22, 18, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.98, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.22, 18, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  );
}

export default function MainStreetBuilding({ building, onPointerDown, onPointerUp }: MainStreetBuildingProps) {
  const [x, , z] = building.position;
  const [width, height, depth] = building.size;
  const frontZ = -depth / 2 - 0.06;
  const frontDoorZ = frontZ - FRONT_DOOR_SOUTH_OFFSET;
  const backZ = depth / 2 + 0.06;
  const leftX = -width / 2 - 0.06;
  const rightX = width / 2 + 0.06;
  const roofColor = "#262626";
  const rearDoorColor = "#1f2937";
  const leftWindowX = -width * 0.27;
  const rightWindowX = width * 0.27;
  const isGas = building.id === "LB-GAS-001";
  const isPawnshop = building.id === "LB-REPAIR-001";
  const isTavern = building.id === "LB-TAVERN-001";
  let bodyColor = building.color;
  let signText = building.name;
  let signColor = "#1f2937";
  let signTextColor = "#f8fafc";
  let leftLightColor = LIGHT_MEDIUM;
  let rightLightColor = LIGHT_MEDIUM;
  let leftIntensity = 0.7;
  let rightIntensity = 0.7;

  if (building.id === "LB-BARBER-001") {
    bodyColor = "#d6c8a9";
    signText = "BARBER";
    signColor = "#7f1d1d";
    leftLightColor = LIGHT_BRIGHT;
    rightLightColor = LIGHT_BRIGHT;
    leftIntensity = 1.1;
    rightIntensity = 0.7;
  } else if (building.id === "LB-LIQUOR-001") {
    bodyColor = "#4c1d35";
    signText = "LIQUOR";
    signColor = "#25131e";
    leftLightColor = LIGHT_DIM;
    rightLightColor = LIGHT_DIM;
    leftIntensity = 0.3;
    rightIntensity = 0.3;
  } else if (building.id === "LB-HARDWARE-001") {
    bodyColor = "#a16207";
    signText = "HARDWARE";
    signColor = "#78350f";
    leftLightColor = LIGHT_BRIGHT;
    rightLightColor = LIGHT_MEDIUM;
    leftIntensity = 1.1;
    rightIntensity = 0.7;
  } else if (isGas) {
    bodyColor = "#0f766e";
    signText = "Skeeter's Gas & CO";
    signColor = "#134e4a";
    leftLightColor = LIGHT_BRIGHT;
    rightLightColor = LIGHT_DIM;
    leftIntensity = 1.1;
    rightIntensity = 0.3;
  } else if (isTavern) {
    bodyColor = "#783f27";
    signText = "TAVERN";
    signColor = "#422006";
    signTextColor = "#fde68a";
    leftLightColor = LIGHT_BRIGHT;
    rightLightColor = LIGHT_MEDIUM;
    leftIntensity = 1.1;
    rightIntensity = 0.7;
  } else if (isPawnshop) {
    bodyColor = "#475569";
    signText = "Bluff Pawnshop";
    signColor = "#1e293b";
    leftLightColor = LIGHT_MEDIUM;
    rightLightColor = LIGHT_DIM;
    leftIntensity = 0.7;
    rightIntensity = 0.3;
  }

  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI, 0]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      <WallFinish building={building} />

      <FacadeBox position={[0, height + 0.2, 0]} size={[width + 0.8, 0.4, depth + 0.8]} color={roofColor} />
      <FacadeBox position={[0, 1.15, frontDoorZ]} size={[1.1, 2.3, 0.12]} color="#171717" />
      {!isTavern ? (
        <WarmWindow position={[leftWindowX, 2.05, frontZ]} size={[1.45, 1.25, 0.12]} color={leftLightColor} intensity={leftIntensity} />
      ) : null}
      {!isPawnshop ? (
        <WarmWindow position={[rightWindowX, 2.05, frontZ]} size={[1.45, 1.25, 0.12]} color={rightLightColor} intensity={rightIntensity} />
      ) : null}

      {building.id === "LB-BARBER-001" ? <HalfCurtain x={leftWindowX} z={frontZ} /> : null}
      {building.id === "LB-LIQUOR-001" ? <SideDrape x={rightWindowX} z={frontZ} side="right" /> : null}
      {building.id === "LB-LIQUOR-001" ? <PulsingNeonSign x={leftWindowX} z={frontZ} /> : null}
      {building.id === "LB-HARDWARE-001" ? <Blinds x={leftWindowX} z={frontZ} /> : null}
      {building.id === "LB-HARDWARE-001" ? <HardwareJokeSign x={rightWindowX} z={frontZ} /> : null}
      {isGas ? <GasWindowSign x={rightWindowX} z={frontZ} /> : null}
      {isGas ? <Blinds x={leftWindowX} z={frontZ} /> : null}
      {isTavern ? <TavernJokeSign x={leftWindowX} z={frontZ} /> : null}
      {isTavern ? <LowerCurtain x={rightWindowX} z={frontZ} color="#4a1726" /> : null}
      {isPawnshop ? <PawnHeartSign x={rightWindowX} z={frontZ} /> : null}

      {!isGas ? (
        <group position={[0, height - 0.68, frontZ - 0.12]}>
          <StorefrontSign text={signText} width={Math.max(2.6, width * 0.7)} boardColor={signColor} textColor={signTextColor} />
        </group>
      ) : null}

      <WarmWindow position={[leftX, 2.0, -depth * 0.22]} size={[0.12, 1.2, 1.4]} color={LIGHT_MEDIUM} intensity={0.7} />
      <WarmWindow position={[leftX, 2.0, depth * 0.22]} size={[0.12, 1.2, 1.4]} color={LIGHT_DIM} intensity={0.3} />
      <WarmWindow position={[rightX, 2.0, -depth * 0.22]} size={[0.12, 1.2, 1.4]} color={LIGHT_MEDIUM} intensity={0.7} />
      <WarmWindow position={[rightX, 2.0, depth * 0.22]} size={[0.12, 1.2, 1.4]} color={LIGHT_DIM} intensity={0.3} />
      <FacadeBox position={[0, 1.1, backZ]} size={[1.1, 2.2, 0.12]} color={rearDoorColor} />
      <WarmWindow position={[-width * 0.28, 2.05, backZ]} size={[1.35, 1.15, 0.12]} color={LIGHT_MEDIUM} intensity={0.7} />
      <WarmWindow position={[width * 0.28, 2.05, backZ]} size={[1.35, 1.15, 0.12]} color={LIGHT_DIM} intensity={0.3} />

      {building.id === "LB-BARBER-001" && (
        <>
          <FacadeBox position={[0, height - 1.45, frontZ - 0.24]} size={[width * 0.78, 0.22, 0.62]} color="#b91c1c" />
          <BarberPole x={width / 2 - 0.42} z={frontZ - 0.2} />
        </>
      )}
      {building.id === "LB-LIQUOR-001" && (
        <>
          {[leftWindowX, rightWindowX].flatMap((windowX) =>
            [-0.42, 0, 0.42].map((offset) => (
              <FacadeBox key={`${windowX}-${offset}`} position={[windowX + offset, 2.05, frontZ - 0.08]} size={[0.07, 1.35, 0.07]} color="#111827" />
            )),
          )}
        </>
      )}
      {building.id === "LB-HARDWARE-001" && (
        <FacadeBox position={[0, height - 1.35, frontZ - 0.34]} size={[width * 0.86, 0.28, 0.85]} color="#713f12" />
      )}
      {isGas && (
        <>
          <FacadeBox position={[0, height - 0.75, frontZ - 0.35]} size={[width * 0.9, 0.22, 0.62]} color="#e5e7eb" />
          <group position={[0, height - 0.75, frontZ - 0.7]}>
            <StorefrontSign text={signText} width={Math.max(3.8, width * 0.78)} boardColor={signColor} textColor={signTextColor} />
          </group>
        </>
      )}
      {isTavern && (
        <>
          <FacadeBox position={[-width * 0.33, 1.65, frontZ - 0.09]} size={[0.18, 2.3, 0.18]} color="#422006" />
          <FacadeBox position={[width * 0.33, 1.65, frontZ - 0.09]} size={[0.18, 2.3, 0.18]} color="#422006" />
          <FacadeBox position={[width * 0.3, height + 0.65, depth * 0.18]} size={[0.7, 0.9, 0.7]} color="#422006" />
        </>
      )}
    </group>
  );
}