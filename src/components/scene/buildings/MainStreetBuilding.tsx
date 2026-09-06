"use client";

import type { ThreeEvent } from "@react-three/fiber";
import type { BuildingData, Vec3 } from "@/data/town";
import StorefrontSign from "@/components/scene/buildings/StorefrontSign";

type MainStreetBuildingProps = {
  building: BuildingData;
  isSelected: boolean;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
};

function FacadeBox({
  position,
  size,
  color,
}: {
  position: Vec3;
  size: Vec3;
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
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

export default function MainStreetBuilding({
  building,
  isSelected,
  onPointerDown,
  onPointerUp,
}: MainStreetBuildingProps) {
  const [x, , z] = building.position;
  const [width, height, depth] = building.size;
  const frontZ = -depth / 2 - 0.06;
  const roofColor = "#262626";
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
    <group position={[x, 0, z]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={isSelected ? "#facc15" : "#000000"}
          emissiveIntensity={isSelected ? 0.55 : 0}
        />
      </mesh>

      <FacadeBox position={[0, height + 0.12, 0]} size={[width + 0.3, 0.24, depth + 0.3]} color={roofColor} />
      <FacadeBox position={[0, 1.15, frontZ]} size={[1.1, 2.3, 0.12]} color="#171717" />
      <FacadeBox position={[-width * 0.27, 2.05, frontZ]} size={[1.45, 1.25, 0.12]} color="#334155" />
      <FacadeBox position={[width * 0.27, 2.05, frontZ]} size={[1.45, 1.25, 0.12]} color="#334155" />
      <group position={[0, height - 0.68, frontZ - 0.12]}>
        <StorefrontSign
          text={signText}
          width={Math.max(2.6, width * 0.7)}
          boardColor={signColor}
          textColor={signTextColor}
        />
      </group>

      {building.id === "LB-BARBER-001" && (
        <>
          <FacadeBox position={[0, height - 1.45, frontZ - 0.24]} size={[width * 0.78, 0.22, 0.62]} color="#b91c1c" />
          <BarberPole x={width / 2 - 0.42} z={frontZ - 0.2} />
        </>
      )}

      {building.id === "LB-LIQUOR-001" && (
        <>
          {[-width * 0.27, width * 0.27].flatMap((windowX) =>
            [-0.42, 0, 0.42].map((offset) => (
              <FacadeBox
                key={`${windowX}-${offset}`}
                position={[windowX + offset, 2.05, frontZ - 0.08]}
                size={[0.07, 1.35, 0.07]}
                color="#111827"
              />
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
        </>
      )}

      {building.id === "LB-REPAIR-001" && (
        <>
          <FacadeBox position={[0, 1.75, frontZ - 0.08]} size={[width * 0.63, 3.15, 0.14]} color="#1f2937" />
          {[-0.8, 0, 0.8].map((offset) => (
            <FacadeBox
              key={offset}
              position={[offset, 1.75, frontZ - 0.16]}
              size={[0.05, 3.05, 0.05]}
              color="#64748b"
            />
          ))}
        </>
      )}
    </group>
  );
}
