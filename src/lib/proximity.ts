import type { BuildingData, LotData } from "@/data/town";

type PropertyData = BuildingData | LotData;

export function findNearestProperty(
  position: [number, number, number],
  properties: PropertyData[],
  range: number,
): PropertyData | null {
  const [playerX, , playerZ] = position;
  let nearest: PropertyData | null = null;
  let nearestDistance = range;

  for (const property of properties) {
    const [x, , z] = property.position;
    const distance = Math.hypot(playerX - x, playerZ - z);

    if (distance <= nearestDistance) {
      nearest = property;
      nearestDistance = distance;
    }
  }

  return nearest;
}
