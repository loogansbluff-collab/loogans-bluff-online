"use client";

import type { ThreeEvent } from "@react-three/fiber";
import type { BuildingData, Vec3 } from "@/data/town";
import StorefrontSign from "@/components/scene/buildings/StorefrontSign";

type MainStreetBuildingProps = {
  building: BuildingData;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
};

const WARM_GLASS = "#f4d27a";
const WARM_EMISSIVE = "#ffe6a0";
const SILHOUETTE_COLOR = "#1a1a1a";
const SILHOUETTE_SHOPS = new Set([
  "LB-BARBER-001",
  "LB-LIQUOR-001",
  "LB-TAVERN-001",
  "LB-REPAIR-001",
]);

function FacadeBox({ position, size, color }: { position: Vec3; size: Vec3; color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function WarmWindow({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={WARM_GLASS} emissive={WARM_EMISSIVE} emissiveIntensity={0.9} />
    </mesh>
  );
}

function WindowSilhouette({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 2.02, z]}>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.4, 0.55, 0.05]} />
        <meshStandardMaterial color={SILHOUETTE_COLOR} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color={SILHOUETTE_COLOR} />
      </mesh>
    </group>
  );
}

function BarberPole({ x, z }: { x: number; z: number }) {
  const bands = ["#dc2626", "#f8fafc", "#dc2626", "#f8fafc", "#dc2626", "#f8fafc"];

  return (
    <group position={[x, 1.55, z]}>
      {bands.map((color, index) => (
        <mesh key={`${color}-${index}`} position={[0, -0.75 + index * 0.3, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.3, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

export default function MainStreetBuilding({ building, onPointerDown, onPointerUp }: MainStreetBuildingProps) {
  const [x, , z] = building.position;
  const [width, height, depth] = building.size;
  const frontZ = -depth / 2 - 0.06;
  const backZ = depth / 2 + 0.06;
  const leftX = -width / 2 - 0.06;
  const rightX = width / 2 + 0.06;
  const roofColor = "#262626";
  const rearDoorColor = "#1f2937";
  const leftWindowX = -width * 0.27;
  const rightWindowX = width * 0.27;
  const silhouetteX = building.id === "LB-LIQUOR-001" || building.id === "LB-REPAIR-001" ? rightWindowX : leftWindowX;
  let bodyColor = building.color;
  let signText = building.name;
  let signColor = "#1f2937";
  let signTextColor = "#f8fafc";

  if (building.id === "LB-BARBER-001") {
    bodyColor = "#d6c8a9";
    signText = "BARBER";
    signColor = "#7f1d1d";
  } else if (building.id === "LB-LIQUOR-001") {
    bodyColor = "#4c1d35";
    signText = "LIQUOR";
    signColor = "#25131e";
  } else if (building.id === "LB-HARDWARE-001") {
    bodyColor = "#a16207";
    signText = "HARDWARE";
    signColor = "#78350f";
  } else if (building.id === "LB-GAS-001") {
    bodyColor = "#0f766e";
    signText = "GAS";
    signColor = "#134e4a";
  } else if (building.id === "LB-TAVERN-001") {
    bodyColor = "#783f27";
    signText = "TAVERN";
    signColor = "#422006";
    signTextColor = "#fde68a";
  } else if (building.id === "LB-REPAIR-001") {
    bodyColor = "#475569";
    signText = "BARRY'S REPAIR";
    signColor = "#1e293b";
  }

  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI, 0]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      <FacadeBox position={[0, height + 0.2, 0]} size={[width + 0.8, 0.4, depth + 0.8]} color={roofColor} />
      <FacadeBox position={[0, 1.15, frontZ]} size={[1.1, 2.3, 0.12]} color="#171717" />
      <WarmWindow position={[leftWindowX, 2.05, frontZ]} size={[1.45, 1.25, 0.12]} />
      <WarmWindow position={[rightWindowX, 2.05, frontZ]} size={[1.45, 1.25, 0.12]} />
      {SILHOUETTE_SHOPS.has(building.id) ? <WindowSilhouette x={silhouetteX} z={frontZ - 0.075} /> : null}
      <group position={[0, height - 0.68, frontZ - 0.12]}>
        <StorefrontSign text={signText} width={Math.max(2.6, width * 0.7)} boardColor={signColor} textColor={signTextColor} />
      </group>

      <WarmWindow position={[leftX, 2.0, -depth * 0.22]} size={[0.12, 1.2, 1.4]} />
      <WarmWindow position={[leftX, 2.0, depth * 0.22]} size={[0.12, 1.2, 1.4]} />
      <WarmWindow position={[rightX, 2.0, -depth * 0.22]} size={[0.12, 1.2, 1.4]} />
      <WarmWindow position={[rightX, 2.0, depth * 0.22]} size={[0.12, 1.2, 1.4]} />
      <FacadeBox position={[0, 1.1, backZ]} size={[1.1, 2.2, 0.12]} color={rearDoorColor} />
      <WarmWindow position={[-width * 0.28, 2.05, backZ]} size={[1.35, 1.15, 0.12]} />
      <WarmWindow position={[width * 0.28, 2.05, backZ]} size={[1.35, 1.15, 0.12]} />

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
      {building.id === "LB-GAS-001" && (
        <FacadeBox position={[0, height - 0.75, frontZ - 0.85]} size={[width * 0.9, 0.22, 1.7]} color="#e5e7eb" />
      )}
      {building.id === "LB-TAVERN-001" && (
        <>
          <FacadeBox position={[-width * 0.33, 1.65, frontZ - 0.09]} size={[0.18, 2.3, 0.18]} color="#422006" />
          <FacadeBox position={[width * 0.33, 1.65, frontZ - 0.09]} size={[0.18, 2.3, 0.18]} color="#422006" />
          <FacadeBox position={[width * 0.3, height + 0.65, depth * 0.18]} size={[0.7, 0.9, 0.7]} color="#422006" />
        </>
      )}
      {building.id === "LB-REPAIR-001" && (
        <>
          <FacadeBox position={[0, 1.75, frontZ - 0.08]} size={[width * 0.63, 3.15, 0.14]} color="#1f2937" />
          {[-0.8, 0, 0.8].map((offset) => (
            <FacadeBox key={offset} position={[offset, 1.75, frontZ - 0.16]} size={[0.05, 3.05, 0.05]} color="#64748b" />
          ))}
        </>
      )}
    </group>
  );
}
