"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { BuildingData } from "@/data/town";
import { enterStreetInFront } from "@/lib/enterBuildingStreet";
import { useGameStore } from "@/state/gameStore";
import DoorWalkway from "@/components/scene/DoorWalkway";
import MainStreetBuilding from "@/components/scene/buildings/MainStreetBuilding";
import TownBusinessBuilding from "@/components/scene/buildings/TownBusinessBuilding";

const MAIN_STREET_IDS = new Set([
  "LB-BARBER-001",
  "LB-LIQUOR-001",
  "LB-HARDWARE-001",
  "LB-GAS-001",
  "LB-TAVERN-001",
  "LB-REPAIR-001",
]);

const TOWN_BUSINESS_IDS = new Set([
  "LB-COPSHOP-001",
  "LB-JAIL-001",
  "LB-MEDICAL-001",
  "LB-TOWNHALL-001",
  "LB-HOME-001",
  "LB-HOME-002",
  "LB-DUMPHOUSE-001",
  "LB-BARN-001",
  "LB-BARN-002",
  "LB-HOME-003",
  "LB-HOME-004",
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
  "LB-ICECREAM-001",
  "LB-CHINESE-001",
  "LB-BUTCHER-001",
  "LB-CLOTHING-001",
  "LB-SHOE-001",
  "LB-FURNITURE-001",
  "LB-APPLIANCE-001",
  "LB-ELECTRONICS-001",
  "LB-OUTDOOR-001",
  "LB-AUTOPARTS-001",
  "LB-TIRE-001",
  "LB-CARWASH-001",
  "LB-USEDCAR-001",
  "LB-TAXI-001",
  "LB-BUSDEPOT-001",
  "LB-HOTEL-001",
  "LB-INSURANCE-001",
  "LB-ACCOUNTANT-001",
  "LB-LAWYER-001",
  "LB-NEWSPAPER-001",
  "LB-RADIO-001",
  "LB-JEWELRY-001",
  "LB-FLORIST-001",
  "LB-PHOTO-001",
]);

export default function Building({ building }: { building: BuildingData }) {
  const start = useRef<[number, number] | null>(null);
  const mode = useGameStore((state) => state.mode);
  const [x, , z] = building.position;
  const [width, height, depth] = building.size;
  const isMainStreet = MAIN_STREET_IDS.has(building.id);
  const isTownBusiness = TOWN_BUSINESS_IDS.has(building.id);

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    start.current = [event.clientX, event.clientY];
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!start.current) return;
    const distance = Math.hypot(event.clientX - start.current[0], event.clientY - start.current[1]);
    start.current = null;
    if (distance <= 5 && mode === "aerial") enterStreetInFront(building.id);
  };

  return (
    <group>
      <mesh position={[x, 0.075, z]}>
        <boxGeometry args={[width + 0.6, 0.15, depth + 0.6]} />
        <meshStandardMaterial color="#262626" />
      </mesh>

      {isMainStreet ? <DoorWalkway building={building} /> : null}

      {isMainStreet ? (
        <MainStreetBuilding building={building} onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      ) : isTownBusiness ? (
        <TownBusinessBuilding building={building} onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      ) : (
        <mesh position={[x, height / 2, z]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={building.color} />
        </mesh>
      )}
    </group>
  );
}
