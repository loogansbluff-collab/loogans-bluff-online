import townJson from "./town.json";

export type TownType = "business" | "government" | "home" | "barn" | "lot";
export type TownStatus = "coming_soon" | "for_sale_coming_soon";
export type Vec3 = [number, number, number];

export type BuildingData = {
  id: string;
  name: string;
  type: Exclude<TownType, "lot">;
  status: "coming_soon";
  owner: null;
  position: Vec3;
  size: Vec3;
  color: string;
  description: string;
};

export type LotData = {
  id: string;
  name: string;
  type: "lot";
  status: "for_sale_coming_soon";
  owner: null;
  position: Vec3;
  size: Vec3;
  color: string;
};

export type TownData = {
  townName: string;
  groundSize: number;
  streetSpawn: Vec3;
  buildings: BuildingData[];
  lots: LotData[];
};

export const townData = townJson as TownData;
