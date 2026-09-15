import { townData } from "@/data/town";

const CITY_HELD_IDS = new Set([
  "LB-JAIL-001",
  "LB-COPSHOP-001",
  "LB-MEDICAL-001",
  "LB-FIREHALL-001",
  "LB-TOWNHALL-001",
  "LB-COMMUNITY-001",
]);

export type PropertyAssetCatalogItem = {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  volume: number;
};

export const propertyAssetCatalog: PropertyAssetCatalogItem[] = townData.buildings
  .filter((building) => !CITY_HELD_IDS.has(building.id))
  .map((building) => {
    const [width, height, depth] = building.size;
    return {
      id: building.id,
      name: building.name,
      width,
      height,
      depth,
      volume: width * height * depth,
    };
  });

if (propertyAssetCatalog.length !== 68) {
  throw new Error(`Property Asset catalog must contain exactly 68 items; found ${propertyAssetCatalog.length}`);
}

if (propertyAssetCatalog.some((asset) => CITY_HELD_IDS.has(asset.id))) {
  throw new Error("Property Asset catalog contains a city-held building");
}
