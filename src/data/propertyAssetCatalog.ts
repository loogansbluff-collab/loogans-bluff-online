import { townData } from "@/data/town";

const CITY_HELD_IDS = new Set([
  "LB-JAIL-001",
  "LB-COPSHOP-001",
  "LB-MEDICAL-001",
  "LB-FIREHALL-001",
  "LB-TOWNHALL-001",
  "LB-COMMUNITY-001",
]);

export const PRICE_BANDS = [0.25, 0.35, 0.50, 0.75, 1.00, 1.25, 1.50, 1.80, 2.10, 2.40, 2.80, 3.20, 3.50] as const;

export type PropertyAssetCatalogItem = {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  volume: number;
  governmentPriceSol: number;
};

type BaseCatalogItem = Omit<PropertyAssetCatalogItem, "governmentPriceSol">;

const baseCatalog: BaseCatalogItem[] = townData.buildings
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

if (baseCatalog.length !== 68) {
  throw new Error(`Property Asset catalog must contain exactly 68 items; found ${baseCatalog.length}`);
}

const uniqueVolumes = Array.from(new Set(baseCatalog.map((asset) => asset.volume))).sort((a, b) => a - b);
const lastVolumeIndex = uniqueVolumes.length - 1;

const priceByVolume = new Map<number, number>(
  uniqueVolumes.map((volume, index) => {
    const bandIndex = lastVolumeIndex === 0
      ? 0
      : Math.round((index / lastVolumeIndex) * (PRICE_BANDS.length - 1));
    return [volume, PRICE_BANDS[bandIndex]];
  }),
);

export const propertyAssetCatalog: PropertyAssetCatalogItem[] = baseCatalog.map((asset) => ({
  ...asset,
  governmentPriceSol: priceByVolume.get(asset.volume) ?? PRICE_BANDS[0],
}));

if (propertyAssetCatalog.some((asset) => CITY_HELD_IDS.has(asset.id))) {
  throw new Error("Property Asset catalog contains a city-held building");
}

if (propertyAssetCatalog.some((asset) => !PRICE_BANDS.includes(asset.governmentPriceSol as (typeof PRICE_BANDS)[number]))) {
  throw new Error("Property Asset catalog contains a price outside PRICE_BANDS");
}

const priceByMold = new Map<string, number>();
for (const asset of propertyAssetCatalog) {
  const moldKey = `${asset.width}x${asset.height}x${asset.depth}`;
  const existingPrice = priceByMold.get(moldKey);
  if (existingPrice !== undefined && existingPrice !== asset.governmentPriceSol) {
    throw new Error(`Equal-size Property Asset mold split across prices: ${moldKey}`);
  }
  priceByMold.set(moldKey, asset.governmentPriceSol);
}

const sortedByVolume = [...propertyAssetCatalog].sort((a, b) => a.volume - b.volume);
for (let index = 1; index < sortedByVolume.length; index += 1) {
  if (sortedByVolume[index].governmentPriceSol < sortedByVolume[index - 1].governmentPriceSol) {
    throw new Error("Property Asset prices are not monotonic by volume");
  }
}

const smallestMold = propertyAssetCatalog.filter(
  (asset) => asset.width === 3.5 && asset.height === 3.2 && asset.depth === 4,
);
if (smallestMold.length !== 5 || smallestMold.some((asset) => asset.governmentPriceSol !== 0.25)) {
  throw new Error("Smallest 3.5x3.2x4 Property Assets must all be 0.25 SOL");
}

const largestMold = propertyAssetCatalog.filter(
  (asset) => asset.width === 5.8 && asset.height === 4.6 && asset.depth === 6.4,
);
if (largestMold.length !== 3 || largestMold.some((asset) => asset.governmentPriceSol !== 3.50)) {
  throw new Error("Largest 5.8x4.6x6.4 Property Assets must all be 3.50 SOL");
}
