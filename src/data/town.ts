import townJson from "./town.json";
import { isSouthTreeLotId } from "@/lib/southDecor";

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
  "LB-COPSHOP-001": { name: "Loogans Bluff Police Department", type: "business", description: "The town police department, where paperwork goes to serve time." },
  "LB-JAIL-001": { name: "Loogans Bluff Bail Bonds", type: "business", description: "Fast bail, slow questions, questionable guarantees." },
  "LB-MEDICAL-001": { name: "Bluff Medical Clinic", type: "business", description: "Minor injuries, major stories, and whatever Garry did this time." },
  "LB-TOWNHALL-001": { name: "Loogans Bluff Town Hall", type: "business", description: "Permits, complaints, property business, and official-looking confusion." },
  "LB-HOME-001": { name: "Bluff Bank & Trust-ish", type: "business", description: "A respectable-looking place to make financially irresponsible decisions." },
  "LB-HOME-002": { name: "Loogans Bluff General Store", type: "business", description: "Groceries, supplies, and several things nobody remembers ordering." },
  "LB-DUMPHOUSE-001": { name: "Loogans Realty & Property Office", type: "business", description: "Prime listings, questionable foundations, no refunds on views." },
  "LB-BARN-001": { name: "Bluff Auto & Tow", type: "business", description: "Repairs, towing, and confident guesses about engine noises." },
  "LB-BARN-002": { name: "Loogans Feed & Farm Supply", type: "business", description: "Feed, fence posts, farm supplies, and dirt by the pound." },
  "LB-HOME-003": { name: "Bluff Diner", type: "business", description: "Hot coffee, hot food, and colder customer service." },
  "LB-HOME-004": { name: "Loogans Motel", type: "business", description: "Rooms by the night, towels by negotiation." },
};

const NORTH_EXPANSION_BUILDINGS: BuildingData[] = [
  { id: "LB-GROCERY-001", name: "Grocery Store", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -8.5], size: [5.4, 4.1, 5.4], color: "#6b7f5a", description: "Future grocery store." },
  { id: "LB-PHARMACY-001", name: "Pharmacy", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -8.5], size: [4.1, 3.4, 4.4], color: "#6b8295", description: "Future pharmacy." },
  { id: "LB-FIREHALL-001", name: "Fire Hall", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -8.5], size: [5.5, 4.5, 5.8], color: "#8b4b42", description: "Future fire hall." },
  { id: "LB-POST-001", name: "Post Office", type: "business", status: "coming_soon", owner: null, position: [5, 0, -8.5], size: [4.6, 3.7, 4.8], color: "#766b8f", description: "Future post office." },
  { id: "LB-DENTIST-001", name: "Dentist", type: "business", status: "coming_soon", owner: null, position: [15, 0, -8.5], size: [3.8, 3.3, 4.2], color: "#7a8c8b", description: "Future dentist office." },
  { id: "LB-VET-001", name: "Veterinary Clinic", type: "business", status: "coming_soon", owner: null, position: [25, 0, -8.5], size: [5.2, 4.0, 5.1], color: "#7b765d", description: "Future veterinary clinic." },
  { id: "LB-FUNERAL-001", name: "Funeral Home", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -29], size: [5.3, 4.2, 5.6], color: "#58545e", description: "Future funeral home." },
  { id: "LB-LAUNDRY-001", name: "Laundromat", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -29], size: [4.2, 3.5, 4.4], color: "#68808f", description: "Future laundromat." },
  { id: "LB-BAKERY-001", name: "Bakery", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -29], size: [3.9, 3.4, 4.3], color: "#9a765f", description: "Future bakery." },
  { id: "LB-COFFEE-001", name: "Coffee Shop", type: "business", status: "coming_soon", owner: null, position: [5, 0, -29], size: [4.7, 3.8, 4.8], color: "#705a46", description: "Future coffee shop." },
  { id: "LB-PIZZA-001", name: "Pizza Shop", type: "business", status: "coming_soon", owner: null, position: [15, 0, -29], size: [5.1, 3.9, 5.2], color: "#8a5b45", description: "Future pizza shop." },
  { id: "LB-BURGER-001", name: "Burger Joint", type: "business", status: "coming_soon", owner: null, position: [25, 0, -29], size: [4.4, 3.6, 4.5], color: "#806447", description: "Future burger joint." },
  { id: "LB-ICECREAM-001", name: "Ice Cream Shop", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -45], size: [4.0, 3.3, 4.2], color: "#9b7f91", description: "Future ice cream shop." },
  { id: "LB-CHINESE-001", name: "Chinese Takeout", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -45], size: [4.8, 3.7, 5.0], color: "#8c5c54", description: "Future Chinese takeout." },
  { id: "LB-BUTCHER-001", name: "Butcher Shop", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -45], size: [5.2, 4.0, 5.4], color: "#7a4d4d", description: "Future butcher shop." },
  { id: "LB-CLOTHING-001", name: "Clothing Store", type: "business", status: "coming_soon", owner: null, position: [5, 0, -45], size: [3.8, 3.4, 4.1], color: "#6d6b8c", description: "Future clothing store." },
  { id: "LB-SHOE-001", name: "Shoe Store", type: "business", status: "coming_soon", owner: null, position: [15, 0, -45], size: [4.3, 3.5, 4.5], color: "#74685a", description: "Future shoe store." },
  { id: "LB-FURNITURE-001", name: "Furniture Store", type: "business", status: "coming_soon", owner: null, position: [25, 0, -45], size: [5.5, 4.4, 5.8], color: "#78664e", description: "Future furniture store." },
  { id: "LB-APPLIANCE-001", name: "Appliance Store", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -56], size: [5.1, 4.1, 5.0], color: "#687782", description: "Future appliance store." },
  { id: "LB-ELECTRONICS-001", name: "Electronics Store", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -56], size: [4.5, 3.8, 4.6], color: "#59677f", description: "Future electronics store." },
  { id: "LB-OUTDOOR-001", name: "Outdoor Store", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -56], size: [5.4, 4.2, 5.5], color: "#627152", description: "Future outdoor store." },
  { id: "LB-AUTOPARTS-001", name: "Auto Parts Store", type: "business", status: "coming_soon", owner: null, position: [5, 0, -56], size: [4.6, 3.9, 4.8], color: "#765947", description: "Future auto parts store." },
  { id: "LB-TIRE-001", name: "Tire Shop", type: "business", status: "coming_soon", owner: null, position: [15, 0, -56], size: [3.9, 3.5, 4.2], color: "#55575b", description: "Future tire shop." },
  { id: "LB-CARWASH-001", name: "Car Wash", type: "business", status: "coming_soon", owner: null, position: [25, 0, -56], size: [5.5, 4.3, 5.8], color: "#5f7f86", description: "Future car wash." },
];

const NORTH_EXPANSION_ROADS: RoadData[] = [
  { id: "LB-ALLEY-002", position: [0, 0.025, -3.5], size: [58, 0.03, 1.6] },
  { id: "LB-ROAD-EW-003", position: [0, 0.02, -19], size: [66, 0.04, 3] },
  { id: "LB-ALLEY-003", position: [0, 0.025, -36.5], size: [58, 0.03, 1.6] },
  { id: "LB-ROAD-EW-004", position: [0, 0.02, -51], size: [66, 0.04, 3] },
  { id: "LB-ROAD-NS-NORTH-001", position: [0, 0.02, -50.5], size: [3, 0.04, 23] },
  { id: "LB-ROAD-OUTER-W-NORTH-001", position: [-34, 0.02, -50.5], size: [3, 0.04, 23] },
  { id: "LB-ROAD-OUTER-E-NORTH-001", position: [34, 0.02, -50.5], size: [3, 0.04, 23] },
];

const OUTER_RING_ROADS: RoadData[] = [
  { id: "LB-ROAD-OUTER-W-001", position: [-34, 0.02, 0], size: [3, 0.04, 78] },
  { id: "LB-ROAD-OUTER-E-001", position: [34, 0.02, 0], size: [3, 0.04, 78] },
  { id: "LB-ROAD-OUTER-N-001", position: [0, 0.02, -62], size: [68, 0.04, 3] },
];

const rawTown = townJson as TownData;

export const townData: TownData = {
  ...rawTown,
  roads: [...rawTown.roads, ...NORTH_EXPANSION_ROADS, ...OUTER_RING_ROADS],
  buildings: [
    ...rawTown.buildings.map((building) => {
      const override = BUSINESS_OVERRIDES[building.id];
      return override ? { ...building, ...override } : building;
    }),
    ...NORTH_EXPANSION_BUILDINGS,
  ],
  lots: rawTown.lots.filter((lot) => isSouthTreeLotId(lot.id)),
};
