"use client";

import { townData } from "@/data/town";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";

const FRONT_CLEARANCE = 3.2;
const PLAYER_RADIUS = 0.4;

function isBlocked(x: number, z: number) {
  return townData.buildings.some((building) => {
    const [buildingX, , buildingZ] = building.position;
    const [width, , depth] = building.size;
    return Math.abs(x - buildingX) < width / 2 + PLAYER_RADIUS && Math.abs(z - buildingZ) < depth / 2 + PLAYER_RADIUS;
  });
}

function rowFacesNorth(z: number) {
  if (z < 0) {
    const phase = ((-z - 12) % 32 + 32) % 32;
    return phase < 8 || phase > 24;
  }
  const rowIndex = Math.round((32 - z) / 16);
  return Math.abs(rowIndex) % 2 === 1;
}

export function enterStreetInFront(propertyId: string) {
  if (isSouthTreeLotId(propertyId)) return false;

  const building = townData.buildings.find((item) => item.id === propertyId);
  const property = building ?? townData.lots.find((item) => item.id === propertyId);

  if (!property) return false;

  const [x, , z] = property.position;
  const [, , depth] = property.size;
  const mapLimit = townData.groundSize / 2 - 1;
  const faceNorth = building ? rowFacesNorth(z) : false;
  const direction = faceNorth ? -1 : 1;
  let spawnZ = Math.max(
    -mapLimit,
    Math.min(mapLimit, z + direction * (depth / 2 + FRONT_CLEARANCE)),
  );

  while (spawnZ > -mapLimit && spawnZ < mapLimit && isBlocked(x, spawnZ)) {
    spawnZ = Math.max(-mapLimit, Math.min(mapLimit, spawnZ + direction));
  }

  if (typeof document !== "undefined" && document.pointerLockElement) {
    document.exitPointerLock();
  }

  const state = useGameStore.getState();
  const entry: [number, number, number] = [x, townData.streetSpawn[1], spawnZ];
  state.setSelectedId(propertyId);
  state.setStreetEntry(entry);
  state.setMode("street");
  return true;
}
