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
  { id: "LB-GROCERY-001", name: "Grocery Store", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -11.8], size: [5.8, 4.6, 6.4], color: "#6b7f5a", description: "Future grocery store." },
  { id: "LB-PHARMACY-001", name: "Pharmacy", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -12.4], size: [4.5, 3.8, 5.2], color: "#6b8295", description: "Future pharmacy." },
  { id: "LB-FIREHALL-001", name: "Fire Hall", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -11.9], size: [5.6, 4.5, 6.2], color: "#8b4b42", description: "Future fire hall." },
  { id: "LB-POST-001", name: "Post Office", type: "business", status: "coming_soon", owner: null, position: [5, 0, -12.25], size: [4.8, 4.0, 5.5], color: "#766b8f", description: "Future post office." },
  { id: "LB-DENTIST-001", name: "Dentist", type: "business", status: "coming_soon", owner: null, position: [15, 0, -12.5], size: [4.2, 3.6, 5.0], color: "#7a8c8b", description: "Future dentist office." },
  { id: "LB-VET-001", name: "Veterinary Clinic", type: "business", status: "coming_soon", owner: null, position: [25, 0, -12.1], size: [5.3, 4.2, 5.8], color: "#7b765d", description: "Future veterinary clinic." },
  { id: "LB-FUNERAL-001", name: "Funeral Home", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -26.15], size: [5.7, 4.6, 6.3], color: "#58545e", description: "Future funeral home." },
  { id: "LB-LAUNDRY-001", name: "Laundromat", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -25.55], size: [4.4, 3.7, 5.1], color: "#68808f", description: "Future laundromat." },
  { id: "LB-BAKERY-001", name: "Bakery", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -25.7], size: [4.7, 3.9, 5.4], color: "#9a765f", description: "Future bakery." },
  { id: "LB-COFFEE-001", name: "Coffee Shop", type: "business", status: "coming_soon", owner: null, position: [5, 0, -25.95], size: [5.2, 4.2, 5.9], color: "#705a46", description: "Future coffee shop." },
  { id: "LB-PIZZA-001", name: "Pizza Shop", type: "business", status: "coming_soon", owner: null, position: [15, 0, -26.05], size: [5.6, 4.4, 6.1], color: "#8a5b45", description: "Future pizza shop." },
  { id: "LB-BURGER-001", name: "Burger Joint", type: "business", status: "coming_soon", owner: null, position: [25, 0, -25.5], size: [4.3, 3.6, 5.0], color: "#806447", description: "Future burger joint." },
  { id: "LB-ICECREAM-001", name: "Ice Cream Shop", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -44.4], size: [4.5, 3.7, 5.2], color: "#9b7f91", description: "Future ice cream shop." },
  { id: "LB-CHINESE-001", name: "Chinese Takeout", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -44.15], size: [5.1, 4.0, 5.7], color: "#8c5c54", description: "Future Chinese takeout." },
  { id: "LB-BUTCHER-001", name: "Butcher Shop", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -43.8], size: [5.8, 4.5, 6.4], color: "#7a4d4d", description: "Future butcher shop." },
  { id: "LB-CLOTHING-001", name: "Clothing Store", type: "business", status: "coming_soon", owner: null, position: [5, 0, -44.45], size: [4.4, 3.8, 5.1], color: "#6d6b8c", description: "Future clothing store." },
  { id: "LB-SHOE-001", name: "Shoe Store", type: "business", status: "coming_soon", owner: null, position: [15, 0, -44.3], size: [4.7, 3.9, 5.4], color: "#74685a", description: "Future shoe store." },
  { id: "LB-FURNITURE-001", name: "Furniture Store", type: "business", status: "coming_soon", owner: null, position: [25, 0, -43.9], size: [5.7, 4.6, 6.2], color: "#78664e", description: "Future furniture store." },
  { id: "LB-APPLIANCE-001", name: "Appliance Store", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -58.0], size: [5.5, 4.3, 6.0], color: "#687782", description: "Future appliance store." },
  { id: "LB-ELECTRONICS-001", name: "Electronics Store", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -57.65], size: [4.6, 3.9, 5.3], color: "#59677f", description: "Future electronics store." },
  { id: "LB-OUTDOOR-001", name: "Outdoor Store", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -58.2], size: [5.8, 4.5, 6.4], color: "#627152", description: "Future outdoor store." },
  { id: "LB-AUTOPARTS-001", name: "Auto Parts Store", type: "business", status: "coming_soon", owner: null, position: [5, 0, -57.8], size: [5.0, 4.1, 5.6], color: "#765947", description: "Future auto parts store." },
  { id: "LB-TIRE-001", name: "Tire Shop", type: "business", status: "coming_soon", owner: null, position: [15, 0, -57.5], size: [4.2, 3.6, 5.0], color: "#55575b", description: "Future tire shop." },
  { id: "LB-CARWASH-001", name: "Car Wash", type: "business", status: "coming_soon", owner: null, position: [25, 0, -58.1], size: [5.6, 4.4, 6.2], color: "#5f7f86", description: "Future car wash." },
  { id: "LB-USEDCAR-001", name: "Used Car Lot", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -75.8], size: [5.8, 4.3, 6.4], color: "#6f6458", description: "Future used car lot." },
  { id: "LB-TAXI-001", name: "Taxi Office", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -76.4], size: [4.4, 3.7, 5.2], color: "#8a7a3f", description: "Future taxi office." },
  { id: "LB-BUSDEPOT-001", name: "Bus Depot", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -75.95], size: [5.6, 4.5, 6.1], color: "#596a73", description: "Future bus depot." },
  { id: "LB-HOTEL-001", name: "Hotel", type: "business", status: "coming_soon", owner: null, position: [5, 0, -76.1], size: [5.2, 4.6, 5.8], color: "#7b657d", description: "Future hotel." },
  { id: "LB-INSURANCE-001", name: "Insurance Office", type: "business", status: "coming_soon", owner: null, position: [15, 0, -76.5], size: [4.2, 3.6, 5.0], color: "#5f7280", description: "Future insurance office." },
  { id: "LB-ACCOUNTANT-001", name: "Accountant / Tax Office", type: "business", status: "coming_soon", owner: null, position: [25, 0, -76.25], size: [4.8, 4.0, 5.5], color: "#6d6f66", description: "Future accountant and tax office." },
  { id: "LB-LAWYER-001", name: "Lawyer’s Office", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -89.65], size: [4.5, 3.8, 5.3], color: "#655b6d", description: "Future lawyer office." },
  { id: "LB-NEWSPAPER-001", name: "Newspaper Office", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -90.0], size: [5.4, 4.2, 6.0], color: "#6c6258", description: "Future newspaper office." },
  { id: "LB-RADIO-001", name: "Radio Station", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -89.75], size: [5.0, 4.4, 5.5], color: "#5b6478", description: "Future radio station." },
  { id: "LB-JEWELRY-001", name: "Jewelry Store", type: "business", status: "coming_soon", owner: null, position: [5, 0, -89.55], size: [4.3, 3.9, 5.1], color: "#826f68", description: "Future jewelry store." },
  { id: "LB-FLORIST-001", name: "Florist", type: "business", status: "coming_soon", owner: null, position: [15, 0, -89.85], size: [4.7, 3.7, 5.7], color: "#6f7f62", description: "Future florist." },
  { id: "LB-PHOTO-001", name: "Photography Studio", type: "business", status: "coming_soon", owner: null, position: [25, 0, -90.15], size: [5.7, 4.5, 6.3], color: "#695f72", description: "Future photography studio." },
  { id: "LB-PRINT-001", name: "Print & Copy Shop", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -108.3], size: [4.6, 4.0, 5.4], color: "#66717d", description: "Future print and copy shop." },
  { id: "LB-BUILDSUPPLY-001", name: "Building Supply", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -107.8], size: [5.8, 4.5, 6.4], color: "#78664d", description: "Future building supply store." },
  { id: "LB-PLUMBING-001", name: "Plumbing Supply", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -108.4], size: [4.3, 3.8, 5.2], color: "#557883", description: "Future plumbing supply store." },
  { id: "LB-ELECTRICAL-001", name: "Electrical Supply", type: "business", status: "coming_soon", owner: null, position: [5, 0, -108.1], size: [5.1, 4.2, 5.8], color: "#77704f", description: "Future electrical supply store." },
  { id: "LB-GARDEN-001", name: "Garden Center", type: "business", status: "coming_soon", owner: null, position: [15, 0, -107.95], size: [5.6, 4.4, 6.1], color: "#607653", description: "Future garden center." },
  { id: "LB-PET-001", name: "Pet Store", type: "business", status: "coming_soon", owner: null, position: [25, 0, -108.5], size: [4.2, 3.6, 5.0], color: "#766477", description: "Future pet store." },
  { id: "LB-SMOKE-001", name: "Smoke Shop", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -121.65], size: [4.5, 3.7, 5.3], color: "#5c5a61", description: "Future smoke shop parody storefront." },
  { id: "LB-ARCADE-001", name: "Arcade", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -121.95], size: [5.2, 4.3, 5.9], color: "#5e6686", description: "Future arcade." },
  { id: "LB-BOWLING-001", name: "Bowling Alley", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -122.2], size: [5.8, 4.6, 6.4], color: "#715c63", description: "Future bowling alley." },
  { id: "LB-POOL-001", name: "Pool Hall", type: "business", status: "coming_soon", owner: null, position: [5, 0, -121.55], size: [4.4, 3.9, 5.1], color: "#586f64", description: "Future pool hall." },
  { id: "LB-THEATER-001", name: "Movie Theater", type: "business", status: "coming_soon", owner: null, position: [15, 0, -122.1], size: [5.7, 4.5, 6.2], color: "#68566f", description: "Future movie theater." },
  { id: "LB-BINGO-001", name: "Bingo Hall", type: "business", status: "coming_soon", owner: null, position: [25, 0, -121.8], size: [4.8, 4.0, 5.6], color: "#7b6658", description: "Future bingo hall." },
  { id: "LB-GYM-001", name: "Gym", type: "business", status: "coming_soon", owner: null, position: [-25, 0, -139.9], size: [5.6, 4.4, 6.2], color: "#5d6974", description: "Future gym." },
  { id: "LB-TATTOO-001", name: "Tattoo Shop", type: "business", status: "coming_soon", owner: null, position: [-15, 0, -140.4], size: [4.4, 3.8, 5.2], color: "#665564", description: "Future tattoo shop." },
  { id: "LB-SPA-001", name: "Massage / Spa", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -140.1], size: [5.1, 4.1, 5.8], color: "#6b7d78", description: "Future massage and spa." },
  { id: "LB-TRAVEL-001", name: "Travel Agency", type: "business", status: "coming_soon", owner: null, position: [5, 0, -140.3], size: [4.7, 3.9, 5.4], color: "#61758a", description: "Future travel agency." },
  { id: "LB-STORAGE-001", name: "Storage Rental Office", type: "business", status: "coming_soon", owner: null, position: [15, 0, -139.8], size: [5.8, 4.6, 6.4], color: "#756954", description: "Future storage rental office." },
  { id: "LB-DONUTS-001", name: "Bluff Donuts", type: "business", status: "coming_soon", owner: null, position: [25, 0, -140.5], size: [4.3, 3.7, 5.0], color: "#8a6b72", description: "Future Bluff Donuts." },
  { id: "LB-CHICKEN-001", name: "Chicken Shack", type: "business", status: "coming_soon", owner: null, position: [-5, 0, -153.95], size: [5.2, 4.2, 5.9], color: "#8a7048", description: "Future chicken shack." },
  { id: "LB-FISH-001", name: "Fish & Chips", type: "business", status: "coming_soon", owner: null, position: [5, 0, -153.7], size: [4.6, 4.0, 5.4], color: "#587889", description: "Future fish and chips shop." },
];

const NORTH_EXPANSION_ROADS: RoadData[] = [
  { id: "LB-ALLEY-002", position: [0, 0.025, -3.5], size: [58, 0.03, 1.6] },
  { id: "LB-ROAD-EW-003", position: [0, 0.02, -19], size: [66, 0.04, 3] },
  { id: "LB-ALLEY-003", position: [0, 0.025, -36.5], size: [58, 0.03, 1.6] },
  { id: "LB-ROAD-EW-004", position: [0, 0.02, -51], size: [66, 0.04, 3] },
  { id: "LB-ALLEY-004", position: [0, 0.025, -68.5], size: [58, 0.03, 1.6] },
  { id: "LB-ROAD-EW-005", position: [0, 0.02, -83], size: [66, 0.04, 3] },
  { id: "LB-ALLEY-005", position: [0, 0.025, -100.5], size: [58, 0.03, 1.6] },
  { id: "LB-ROAD-EW-006", position: [0, 0.02, -115], size: [66, 0.04, 3] },
  { id: "LB-ALLEY-006", position: [0, 0.025, -132.5], size: [58, 0.03, 1.6] },
  { id: "LB-ROAD-EW-007", position: [0, 0.02, -147], size: [66, 0.04, 3] },
  { id: "LB-ROAD-NS-NORTH-001", position: [0, 0.02, -99.5], size: [3, 0.04, 121] },
  { id: "LB-ROAD-OUTER-W-NORTH-001", position: [-34, 0.02, -99.5], size: [3, 0.04, 121] },
  { id: "LB-ROAD-OUTER-E-NORTH-001", position: [34, 0.02, -99.5], size: [3, 0.04, 121] },
];

const OUTER_RING_ROADS: RoadData[] = [
  { id: "LB-ROAD-OUTER-W-001", position: [-34, 0.02, 0], size: [3, 0.04, 78] },
  { id: "LB-ROAD-OUTER-E-001", position: [34, 0.02, 0], size: [3, 0.04, 78] },
  { id: "LB-ROAD-OUTER-N-001", position: [0, 0.02, -160], size: [68, 0.04, 3] },
];

const rawTown = townJson as TownData;

export const townData: TownData = {
  ...rawTown,
  groundSize: 330,
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
