"use client";

import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { BuildingData } from "@/data/town";

type Handler = (event: ThreeEvent<PointerEvent>) => void;

type Profile = {
  wall: string;
  trim: string;
  door: string;
  sign: string;
  signColor?: string;
  awning?: string;
  feature?: "police" | "bail" | "medical" | "townhall" | "bank" | "general" | "realty" | "auto" | "feed" | "diner" | "motel";
};

const PROFILES: Record<string, Profile> = {
  "LB-COPSHOP-001": { wall: "#5d6875", trim: "#d5dde5", door: "#27323d", sign: "POLICE DEPARTMENT", feature: "police" },
  "LB-JAIL-001": { wall: "#4b4b52", trim: "#c9c9ce", door: "#242428", sign: "BAIL BONDS", signColor: "#facc15", feature: "bail" },
  "LB-MEDICAL-001": { wall: "#cfd8dc", trim: "#f8fafc", door: "#6b8796", sign: "BLUFF MEDICAL CLINIC", signColor: "#dc2626", feature: "medical" },
  "LB-TOWNHALL-001": { wall: "#8b6849", trim: "#e8dccb", door: "#4a2d1f", sign: "LOOGANS BLUFF TOWN HALL", feature: "townhall" },
  "LB-HOME-001": { wall: "#7d6a91", trim: "#e9e1f1", door: "#33263e", sign: "BLUFF BANK & TRUST-ISH", feature: "bank" },
  "LB-HOME-002": { wall: "#557995", trim: "#d9e7ef", door: "#294458", sign: "LOOGANS BLUFF GENERAL STORE", awning: "#c59a63", feature: "general" },
  "LB-DUMPHOUSE-001": { wall: "#6f706c", trim: "#c7c2b8", door: "#493d31", sign: "LOOGANS REALTY & PROPERTY", feature: "realty" },
  "LB-BARN-001": { wall: "#7b2d2d", trim: "#e4d5ca", door: "#3f4246", sign: "BLUFF AUTO & TOW", feature: "auto" },
  "LB-BARN-002": { wall: "#6f3b2f", trim: "#dbc9ad", door: "#4a3528", sign: "LOOGANS FEED & FARM SUPPLY", feature: "feed" },
  "LB-HOME-003": { wall: "#c47f25", trim: "#f8e7c3", door: "#7c4619", sign: "BLUFF DINER", awning: "#b91c1c", feature: "diner" },
  "LB-HOME-004": { wall: "#b65f62", trim: "#f6d6d7", door: "#6b2f33", sign: "LOOGANS MOTEL", signColor: "#fde68a", feature: "motel" },
};

const UNDER_CONSTRUCTION_IDS = new Set([
  "LB-GROCERY-001",
  "LB-PHARMACY-001",
  "LB-FIREHALL-001",
  "LB-POST-001",
  "LB-DENTIST-001",
  "LB-VET-001",
  "LB-FUNERAL-001",
  "LB-LAUNDRY-001",
  "LB-BAKERY-001",
  "LB-COFFEE-001",
  "LB-PIZZA-001",
  "LB-BURGER-001",
]);

// Main Street is row 0 at z ~= 32 and faces south. Each row north flips.
// The ~16-unit row spacing also correctly classifies the existing z=18 and z=2 rows.
function rowFacesNorth(z: number) {
  const rowIndex = Math.round((32 - z) / 16);
  return Math.abs(rowIndex) % 2 === 1;
}

function Window({ x, y, z, width = 1.15, bars = false }: { x: number; y: number; z: number; width?: number; bars?: boolean }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[width, 1.15, 0.08]} />
        <meshStandardMaterial color="#8fb5c7" emissive="#6b91a3" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[0.055, 1.15, 0.035]} />
        <meshStandardMaterial color="#ddd6ca" />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[width, 0.055, 0.035]} />
        <meshStandardMaterial color="#ddd6ca" />
      </mesh>
      {bars ? [-0.35, 0, 0.35].map((bx) => (
        <mesh key={bx} position={[bx * width, 0, 0.09]}>
          <boxGeometry args={[0.045, 1.15, 0.04]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>
      )) : null}
    </group>
  );
}

function SpecialFeature({ feature, width, height, frontZ }: { feature?: Profile["feature"]; width: number; height: number; frontZ: number }) {
  if (feature === "medical") {
    return (
      <group position={[width * 0.33, height * 0.72, frontZ + 0.08]}>
        <mesh><boxGeometry args={[0.24, 0.95, 0.08]} /><meshStandardMaterial color="#dc2626" /></mesh>
        <mesh><boxGeometry args={[0.95, 0.24, 0.08]} /><meshStandardMaterial color="#dc2626" /></mesh>
      </group>
    );
  }
  if (feature === "townhall" || feature === "bank") {
    return (
      <>
        {[-width * 0.34, width * 0.34].map((x) => (
          <mesh key={x} position={[x, height * 0.43, frontZ + 0.18]}>
            <cylinderGeometry args={[0.18, 0.22, height * 0.72, 12]} />
            <meshStandardMaterial color="#e7dfd2" />
          </mesh>
        ))}
      </>
    );
  }
  if (feature === "auto") {
    return (
      <mesh position={[-width * 0.16, 1.25, frontZ + 0.07]}>
        <boxGeometry args={[width * 0.52, 2.25, 0.08]} />
        <meshStandardMaterial color="#555b61" />
      </mesh>
    );
  }
  if (feature === "feed") {
    return (
      <mesh position={[-width * 0.18, 1.35, frontZ + 0.07]}>
        <boxGeometry args={[width * 0.5, 2.5, 0.08]} />
        <meshStandardMaterial color="#5b4635" />
      </mesh>
    );
  }
  if (feature === "motel") {
    return (
      <Text position={[width * 0.28, height * 0.55, frontZ + 0.12]} fontSize={0.28} color="#fde047" anchorX="center" anchorY="middle">
        VACANCY
      </Text>
    );
  }
  return null;
}

export default function TownBusinessBuilding({
  building,
  onPointerDown,
  onPointerUp,
}: {
  building: BuildingData;
  onPointerDown: Handler;
  onPointerUp: Handler;
}) {
  const [x, , z] = building.position;
  const [width, height, depth] = building.size;
  const profile = PROFILES[building.id] ?? {
    wall: building.color,
    trim: "#d6d3d1",
    door: "#3f3f46",
    sign: building.name,
  };
  const frontZ = depth / 2 + 0.055;
  const doorX = width > 4.5 ? width * 0.28 : width * 0.25;
  const windowX = -width * 0.22;
  const secondWindowX = width > 4.2 ? -width * 0.38 : -width * 0.2;
  const barred = profile.feature === "bail" || profile.feature === "police";
  const faceNorth = rowFacesNorth(z);
  const underConstruction = UNDER_CONSTRUCTION_IDS.has(building.id);

  return (
    <group position={[x, 0, z]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={profile.wall} />
      </mesh>

      <mesh position={[0, height + 0.09, 0]}>
        <boxGeometry args={[width + 0.28, 0.18, depth + 0.28]} />
        <meshStandardMaterial color={profile.trim} />
      </mesh>

      {profile.feature === "police" ? (
        <>
          <mesh position={[-0.42, height + 0.18, 0]}><boxGeometry args={[0.55, 0.18, 0.35]} /><meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.6} /></mesh>
          <mesh position={[0.42, height + 0.18, 0]}><boxGeometry args={[0.55, 0.18, 0.35]} /><meshStandardMaterial color="#dc2626" emissive="#b91c1c" emissiveIntensity={0.6} /></mesh>
        </>
      ) : null}

      <group rotation={[0, faceNorth ? Math.PI : 0, 0]}>
        <mesh position={[doorX, 1.15, frontZ]}>
          <boxGeometry args={[0.92, 2.3, 0.1]} />
          <meshStandardMaterial color={profile.door} />
        </mesh>
        <mesh position={[doorX + 0.28, 1.15, frontZ + 0.065]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#d6b36a" />
        </mesh>

        <Window x={windowX} y={height * 0.48} z={frontZ} width={Math.min(1.35, width * 0.3)} bars={barred} />
        {width >= 5 ? <Window x={secondWindowX} y={height * 0.48} z={frontZ} width={1.05} bars={barred} /> : null}

        <mesh position={[0, height * 0.82, frontZ + 0.04]}>
          <boxGeometry args={[Math.min(width * 0.9, 5.5), 0.72, 0.09]} />
          <meshStandardMaterial color="#252525" />
        </mesh>
        <Text
          position={[0, height * 0.82, frontZ + 0.1]}
          fontSize={Math.min(0.32, width / Math.max(profile.sign.length, 12) * 0.95)}
          maxWidth={Math.min(width * 0.82, 5.1)}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color={profile.signColor ?? "#f8fafc"}
        >
          {profile.sign}
        </Text>

        {underConstruction ? (
          <group position={[0, height * 0.34, frontZ + 0.12]}>
            <mesh>
              <boxGeometry args={[2.25, 0.72, 0.05]} />
              <meshStandardMaterial color="#f5e7c8" />
            </mesh>
            <Text
              position={[0, 0, 0.035]}
              fontSize={0.16}
              maxWidth={2.0}
              lineHeight={1.12}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              color="#1f2937"
            >
              {"UNDER CONSTRUCTION\ncheck back soon"}
            </Text>
          </group>
        ) : null}

        {profile.awning ? (
          <mesh position={[0, height * 0.63, frontZ + 0.38]} rotation={[0.18, 0, 0]}>
            <boxGeometry args={[width * 0.9, 0.12, 0.8]} />
            <meshStandardMaterial color={profile.awning} />
          </mesh>
        ) : null}

        {profile.feature === "realty" ? (
          <group position={[-width * 0.24, height * 0.42, frontZ + 0.11]}>
            {[-0.35, 0, 0.35].map((dx, index) => (
              <mesh key={dx} position={[dx, index % 2 ? -0.22 : 0.2, 0]}>
                <boxGeometry args={[0.28, 0.34, 0.035]} />
                <meshStandardMaterial color="#f5f5dc" />
              </mesh>
            ))}
          </group>
        ) : null}

        {profile.feature === "diner" ? (
          <mesh position={[-width * 0.28, 0.92, frontZ + 0.07]}>
            <boxGeometry args={[width * 0.42, 1.35, 0.08]} />
            <meshStandardMaterial color="#a8d4de" emissive="#79aebb" emissiveIntensity={0.12} />
          </mesh>
        ) : null}

        <SpecialFeature feature={profile.feature} width={width} height={height} frontZ={frontZ} />
      </group>
    </group>
  );
}
