import type { BuildingData, LotData, TownType } from "@/data/town";

type PropertyData = BuildingData | LotData;

export type NearestPropertyResult = {
  id: string;
  name: string;
  type: TownType;
  distance: number;
};

function getPropertyDistance(playerX: number, playerZ: number, property: PropertyData) {
  const [x, , z] = property.position;

  if (property.id !== "LB-COMMUNITY-001") {
    return Math.hypot(playerX - x, playerZ - z);
  }

  const [width, , depth] = property.size;
  const dx = Math.max(Math.abs(playerX - x) - width / 2, 0);
  const dz = Math.max(Math.abs(playerZ - z) - depth / 2, 0);
  return Math.hypot(dx, dz);
}

export function findNearestProperty(
  position: [number, number, number],
  properties: PropertyData[],
  range: number,
): NearestPropertyResult | null {
  const [playerX, , playerZ] = position;
  let nearest: NearestPropertyResult | null = null;
  let nearestDistance = range;

  for (const property of properties) {
    const distance = getPropertyDistance(playerX, playerZ, property);

    if (distance <= nearestDistance) {
      nearest = {
        id: property.id,
        name: property.name,
        type: property.type,
        distance,
      };
      nearestDistance = distance;
    }
  }

  return nearest;
}
