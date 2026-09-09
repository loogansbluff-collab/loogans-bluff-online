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

export type RoadData = {
  id: string;
  position: Vec3;
  size: Vec3;
};

export type TownData = {
  townName: string;
  groundSize: number;
  streetSpawn: Vec3;
  roads: RoadData[];
  buildings: BuildingData[];
  lots: LotData[];
};

const BUSINESS_OVERRIDES: Record<string, Pick<BuildingData, "name" | "type" | "description">> = {
  "LB-COPSHOP-001": {
    name: "Loogans Bluff Police Department",
    type: "business",
    description: "The town police department, where paperwork goes to serve time.",
  },
  "LB-JAIL-001": {
    name: "Loogans Bluff Bail Bonds",
    type: "business",
    description: "Fast bail, slow questions, questionable guarantees.",
  },
  "LB-MEDICAL-001": {
    name: "Bluff Medical Clinic",
    type: "business",
    description: "Minor injuries, major stories, and whatever Garry did this time.",
  },
  "LB-TOWNHALL-001": {
    name: "Loogans Bluff Town Hall",
    type: "business",
    description: "Permits, complaints, property business, and official-looking confusion.",
  },
  "LB-HOME-001": {
    name: "Bluff Bank & Trust-ish",
    type: "business",
    description: "A respectable-looking place to make financially irresponsible decisions.",
  },
  "LB-HOME-002": {
    name: "Loogans Bluff General Store",
    type: "business",
    description: "Groceries, supplies, and several things nobody remembers ordering.",
  },
  "LB-DUMPHOUSE-001": {
    name: "Loogans Realty & Property Office",
    type: "business",
    description: "Prime listings, questionable foundations, no refunds on views.",
  },
  "LB-BARN-001": {
    name: "Bluff Auto & Tow",
    type: "business",
    description: "Repairs, towing, and confident guesses about engine noises.",
  },
  "LB-BARN-002": {
    name: "Loogans Feed & Farm Supply",
    type: "business",
    description: "Feed, fence posts, farm supplies, and dirt by the pound.",
  },
  "LB-HOME-003": {
    name: "Bluff Diner",
    type: "business",
    description: "Hot coffee, hot food, and colder customer service.",
  },
  "LB-HOME-004": {
    name: "Loogans Motel",
    type: "business",
    description: "Rooms by the night, towels by negotiation.",
  },
};

const rawTown = townJson as TownData;

export const townData: TownData = {
  ...rawTown,
  buildings: rawTown.buildings.map((building) => {
    const override = BUSINESS_OVERRIDES[building.id];
    return override ? { ...building, ...override } : building;
  }),
};
