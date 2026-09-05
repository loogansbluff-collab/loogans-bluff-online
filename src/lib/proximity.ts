import type { BuildingData, LotData, TownType } from "@/data/town";

type PropertyData = BuildingData | LotData;

export type NearestPropertyResult = {
  id: string;
  name: string;
  type: TownType;
  distance: number;
};

export function findNearestProperty(
  position: [number, number, number],
  properties: PropertyData[],
  range: number,
): NearestPropertyResult | null {
  const [playerX, , playerZ] = position;
  let nearest: NearestPropertyResult | null = null;
  let nearestDistance = range;

  for (const property of properties) {
    const [x, , z] = property.position;
    const distance = Math.hypot(playerX - x, playerZ - z);

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
