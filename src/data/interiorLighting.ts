export type LightingFamilyName =
  | "clinical"
  | "civic"
  | "office"
  | "retail"
  | "restaurant"
  | "entertainment"
  | "industrial"
  | "hospitality"
  | "display";

export type LightPoint = {
  position: [number, number, number];
  color: string;
  intensity: number;
  distance: number;
};

export type InteriorLightingPreset = {
  family: LightingFamilyName;
  ambientColor: string;
  ambientIntensity: number;
  hemisphereSkyColor: string;
  hemisphereGroundColor: string;
  hemisphereIntensity: number;
  pointLights: LightPoint[];
};

export const PROTECTED_INTERIOR_IDS = new Set<string>([
  "LB-BARBER-001",
  "LB-LIQUOR-001",
  "LB-HARDWARE-001",
  "LB-REPAIR-001",
  "LB-TAVERN-001",
  "LB-GAS-001",
]);

export function isProtectedInteriorId(id: string | null) {
  return Boolean(id && PROTECTED_INTERIOR_IDS.has(id));
}

export const LIGHTING_FAMILIES: Record<LightingFamilyName, InteriorLightingPreset> = {
  clinical: { family: "clinical", ambientColor: "#f7fbff", ambientIntensity: 0.9, hemisphereSkyColor: "#eaf5ff", hemisphereGroundColor: "#cfd8df", hemisphereIntensity: 0.35, pointLights: [{ position: [0, 3.2, 0], color: "#ffffff", intensity: 0.95, distance: 11 }] },
  civic: { family: "civic", ambientColor: "#e8edf2", ambientIntensity: 0.68, hemisphereSkyColor: "#dde7ef", hemisphereGroundColor: "#c8cdd2", hemisphereIntensity: 0.3, pointLights: [{ position: [0, 3.1, 0], color: "#f5f7fa", intensity: 0.8, distance: 11 }] },
  office: { family: "office", ambientColor: "#e8e2d8", ambientIntensity: 0.55, hemisphereSkyColor: "#eee7dc", hemisphereGroundColor: "#c9c0b4", hemisphereIntensity: 0.25, pointLights: [{ position: [0, 3.0, 0], color: "#fff0d6", intensity: 0.75, distance: 10 }] },
  retail: { family: "retail", ambientColor: "#edf2f5", ambientIntensity: 0.7, hemisphereSkyColor: "#e7f0f5", hemisphereGroundColor: "#d4d8da", hemisphereIntensity: 0.3, pointLights: [{ position: [0, 3.2, 0], color: "#fff6e8", intensity: 0.85, distance: 11 }] },
  restaurant: { family: "restaurant", ambientColor: "#4d3627", ambientIntensity: 0.45, hemisphereSkyColor: "#6b4e3d", hemisphereGroundColor: "#2f251f", hemisphereIntensity: 0.18, pointLights: [{ position: [0, 2.8, 0], color: "#ffc47a", intensity: 0.9, distance: 9 }] },
  entertainment: { family: "entertainment", ambientColor: "#262236", ambientIntensity: 0.24, hemisphereSkyColor: "#302c45", hemisphereGroundColor: "#17131f", hemisphereIntensity: 0.14, pointLights: [{ position: [0, 2.8, 0], color: "#8ad8ff", intensity: 0.85, distance: 9 }] },
  industrial: { family: "industrial", ambientColor: "#dce4e8", ambientIntensity: 0.62, hemisphereSkyColor: "#dce8ed", hemisphereGroundColor: "#aeb7ba", hemisphereIntensity: 0.25, pointLights: [{ position: [0, 3.3, 0], color: "#eef7ff", intensity: 0.9, distance: 12 }] },
  hospitality: { family: "hospitality", ambientColor: "#49382e", ambientIntensity: 0.32, hemisphereSkyColor: "#5a4638", hemisphereGroundColor: "#2d241f", hemisphereIntensity: 0.17, pointLights: [{ position: [0, 2.8, 0], color: "#ffd0a0", intensity: 0.72, distance: 9 }] },
  display: { family: "display", ambientColor: "#dfe7ef", ambientIntensity: 0.5, hemisphereSkyColor: "#e5eef8", hemisphereGroundColor: "#bec7d0", hemisphereIntensity: 0.22, pointLights: [{ position: [0, 3.0, 0], color: "#ffffff", intensity: 0.82, distance: 10 }] },
};

type PresetTweak = {
  ambientColor?: string;
  ambientIntensity?: number;
  accent?: string;
  variation?: number;
  secondAccent?: string;
};

function preset(family: LightingFamilyName, tweak: PresetTweak = {}): InteriorLightingPreset {
  const base = LIGHTING_FAMILIES[family];
  const variation = tweak.variation ?? 0;
  const xPositions = [-2.5, 0, 2.5];
  const zPositions = [-2.3, 0.2, 2.1];
  const pointLights: LightPoint[] = [
    {
      position: [xPositions[variation % 3], family === "industrial" ? 3.35 : 3.0, zPositions[variation % 3]],
      color: tweak.accent ?? base.pointLights[0].color,
      intensity: base.pointLights[0].intensity + (variation % 4) * 0.06,
      distance: base.pointLights[0].distance,
    },
  ];
  if (tweak.secondAccent) {
    pointLights.push({ position: [-xPositions[variation % 3], 2.65, -zPositions[variation % 3]], color: tweak.secondAccent, intensity: 0.62, distance: 8 });
  }
  return {
    ...base,
    ambientColor: tweak.ambientColor ?? base.ambientColor,
    ambientIntensity: tweak.ambientIntensity ?? base.ambientIntensity,
    pointLights,
  };
}

export const INTERIOR_LIGHTING_PRESETS: Record<string, InteriorLightingPreset> = {
  "LB-COPSHOP-001": preset("civic", { variation: 1, accent: "#e8f2ff" }),
  "LB-JAIL-001": preset("office", { variation: 2, ambientColor: "#d8d2c4", ambientIntensity: 0.46, accent: "#e9dfc8" }),
  "LB-MEDICAL-001": preset("clinical", { variation: 0, ambientColor: "#fbfdff", ambientIntensity: 1.02, accent: "#ffffff" }),
  "LB-TOWNHALL-001": preset("civic", { variation: 2, accent: "#fff0d0" }),
  "LB-HOME-001": preset("office", { variation: 0, ambientColor: "#e7ebef", accent: "#eef6ff" }),
  "LB-HOME-002": preset("retail", { variation: 1, accent: "#fff0cf" }),
  "LB-DUMPHOUSE-001": preset("office", { variation: 2, accent: "#ffd9a8" }),
  "LB-BARN-001": preset("industrial", { variation: 0, accent: "#e8f4ff" }),
  "LB-BARN-002": preset("industrial", { variation: 1, ambientColor: "#d8d0bd", accent: "#f0dfb5" }),
  "LB-HOME-003": preset("restaurant", { variation: 2, accent: "#ffc078", secondAccent: "#fff0c7" }),
  "LB-HOME-004": preset("hospitality", { variation: 0, accent: "#ffc58e" }),
  "LB-GROCERY-001": preset("retail", { variation: 0, ambientIntensity: 0.82, accent: "#f4fbff" }),
  "LB-PHARMACY-001": preset("clinical", { variation: 1, ambientColor: "#eefcff", ambientIntensity: 0.98, accent: "#dff7ff" }),
  "LB-FIREHALL-001": preset("industrial", { variation: 2, ambientIntensity: 0.74, accent: "#ffffff" }),
  "LB-POST-001": preset("civic", { variation: 0, accent: "#fff5df" }),
  "LB-DENTIST-001": preset("clinical", { variation: 2, ambientColor: "#fffdf7", ambientIntensity: 0.94, accent: "#fff7e8" }),
  "LB-VET-001": preset("clinical", { variation: 1, ambientColor: "#fff7e8", ambientIntensity: 0.88, accent: "#ffe3b8" }),
  "LB-FUNERAL-001": preset("hospitality", { variation: 2, ambientColor: "#3a332f", ambientIntensity: 0.27, accent: "#d6b48a" }),
  "LB-LAUNDRY-001": preset("retail", { variation: 0, ambientColor: "#e6f2f5", ambientIntensity: 0.78, accent: "#e8fbff" }),
  "LB-BAKERY-001": preset("restaurant", { variation: 1, ambientIntensity: 0.54, accent: "#ffd08a" }),
  "LB-COFFEE-001": preset("restaurant", { variation: 2, ambientColor: "#4a3022", ambientIntensity: 0.33, accent: "#ffb36b", secondAccent: "#ffd7a8" }),
  "LB-PIZZA-001": preset("restaurant", { variation: 0, accent: "#ff9a62" }),
  "LB-BURGER-001": preset("restaurant", { variation: 1, ambientIntensity: 0.58, accent: "#ffe0ad" }),
  "LB-ICECREAM-001": preset("retail", { variation: 2, ambientColor: "#f4efff", ambientIntensity: 0.82, accent: "#dff5ff", secondAccent: "#ffd6ef" }),
  "LB-CHINESE-001": preset("restaurant", { variation: 0, accent: "#ffb24a", secondAccent: "#ff6f55" }),
  "LB-BUTCHER-001": preset("clinical", { variation: 1, ambientColor: "#eef5f7", ambientIntensity: 0.84, accent: "#e7fbff" }),
  "LB-CLOTHING-001": preset("retail", { variation: 2, ambientColor: "#f4eee7", accent: "#fff0dc" }),
  "LB-SHOE-001": preset("retail", { variation: 0, accent: "#fff6e8" }),
  "LB-FURNITURE-001": preset("display", { variation: 1, ambientColor: "#e5d7c6", ambientIntensity: 0.46, accent: "#ffdcb5" }),
  "LB-APPLIANCE-001": preset("retail", { variation: 2, ambientColor: "#e8eff5", accent: "#eff8ff" }),
  "LB-ELECTRONICS-001": preset("display", { variation: 0, ambientColor: "#d9e6f4", ambientIntensity: 0.42, accent: "#bfe1ff", secondAccent: "#d9c7ff" }),
  "LB-OUTDOOR-001": preset("display", { variation: 1, ambientColor: "#d9dfcf", accent: "#ffe2aa" }),
  "LB-AUTOPARTS-001": preset("industrial", { variation: 2, accent: "#e9f5ff" }),
  "LB-TIRE-001": preset("industrial", { variation: 0, ambientIntensity: 0.52, accent: "#dfe8ed" }),
  "LB-CARWASH-001": preset("industrial", { variation: 1, ambientColor: "#d9f1f5", accent: "#bfefff" }),
  "LB-USEDCAR-001": preset("office", { variation: 2, ambientIntensity: 0.64, accent: "#f8f2df" }),
  "LB-TAXI-001": preset("office", { variation: 0, ambientColor: "#d8cfbd", ambientIntensity: 0.48, accent: "#ffd88a" }),
  "LB-BUSDEPOT-001": preset("civic", { variation: 1, ambientColor: "#dce4e7", accent: "#edf4f6" }),
  "LB-HOTEL-001": preset("retail", { variation: 2, ambientIntensity: 0.76, accent: "#fff7d6" }),
  "LB-INSURANCE-001": preset("office", { variation: 0, accent: "#f2eee7" }),
  "LB-ACCOUNTANT-001": preset("office", { variation: 1, ambientColor: "#e0e4e8", accent: "#eef5fb" }),
  "LB-LAWYER-001": preset("office", { variation: 2, ambientColor: "#d8cab9", ambientIntensity: 0.44, accent: "#ffd8a8" }),
  "LB-NEWSPAPER-001": preset("office", { variation: 0, ambientIntensity: 0.64, accent: "#f2ead8" }),
  "LB-RADIO-001": preset("entertainment", { variation: 1, ambientColor: "#263143", ambientIntensity: 0.28, accent: "#80bfff", secondAccent: "#a88bff" }),
  "LB-JEWELRY-001": preset("display", { variation: 2, ambientColor: "#dfe8ff", ambientIntensity: 0.42, accent: "#ffffff", secondAccent: "#d8e8ff" }),
  "LB-FLORIST-001": preset("hospitality", { variation: 0, ambientColor: "#4c4434", ambientIntensity: 0.38, accent: "#ffd69b" }),
  "LB-PHOTO-001": preset("entertainment", { variation: 1, ambientColor: "#2b2b32", ambientIntensity: 0.3, accent: "#dcecff", secondAccent: "#ffe5cf" }),
  "LB-PRINT-001": preset("retail", { variation: 2, ambientColor: "#e5edf2", ambientIntensity: 0.78, accent: "#f4fbff" }),
  "LB-BUILDSUPPLY-001": preset("industrial", { variation: 0, ambientIntensity: 0.72, accent: "#edf7ff" }),
  "LB-PLUMBING-001": preset("industrial", { variation: 1, ambientColor: "#d2e5e8", accent: "#c8f2ff" }),
  "LB-ELECTRICAL-001": preset("industrial", { variation: 2, ambientColor: "#e1dfc9", accent: "#fff1b8" }),
  "LB-GARDEN-001": preset("display", { variation: 0, ambientColor: "#dbe8ce", ambientIntensity: 0.62, accent: "#fff2bd" }),
  "LB-PET-001": preset("retail", { variation: 1, ambientColor: "#eee8db", accent: "#fff0c7" }),
  "LB-SMOKE-001": preset("entertainment", { variation: 2, ambientColor: "#35263b", ambientIntensity: 0.2, accent: "#d27cff", secondAccent: "#ffad62" }),
  "LB-ARCADE-001": preset("entertainment", { variation: 0, ambientColor: "#2b1840", ambientIntensity: 0.2, accent: "#ff3bd4", secondAccent: "#28d7ff" }),
  "LB-BOWLING-001": preset("entertainment", { variation: 1, ambientColor: "#2c3040", ambientIntensity: 0.38, accent: "#71d7ff", secondAccent: "#ff70be" }),
  "LB-POOL-001": preset("entertainment", { variation: 2, ambientColor: "#24352e", ambientIntensity: 0.2, accent: "#ffd27a" }),
  "LB-THEATER-001": preset("entertainment", { variation: 0, ambientColor: "#211827", ambientIntensity: 0.11, accent: "#ff9b5f", secondAccent: "#d9485f" }),
  "LB-BINGO-001": preset("civic", { variation: 1, ambientColor: "#e5dfd2", accent: "#fff0d0" }),
  "LB-GYM-001": preset("entertainment", { variation: 2, ambientColor: "#dfeafa", ambientIntensity: 0.78, accent: "#d6ebff" }),
  "LB-TATTOO-001": preset("entertainment", { variation: 0, ambientColor: "#30262b", ambientIntensity: 0.24, accent: "#ffb07d" }),
  "LB-SPA-001": preset("hospitality", { variation: 1, ambientColor: "#3d3530", ambientIntensity: 0.23, accent: "#ffd2a1" }),
  "LB-TRAVEL-001": preset("office", { variation: 2, ambientColor: "#e6e1d6", accent: "#fff0cc" }),
  "LB-STORAGE-001": preset("office", { variation: 0, ambientIntensity: 0.6, accent: "#f5e6c8" }),
  "LB-DONUTS-001": preset("restaurant", { variation: 1, ambientColor: "#5a3b42", ambientIntensity: 0.5, accent: "#ffb1c8", secondAccent: "#ffd18a" }),
  "LB-CHICKEN-001": preset("restaurant", { variation: 2, accent: "#ffc05c" }),
  "LB-FISH-001": preset("restaurant", { variation: 0, ambientColor: "#3b4d55", ambientIntensity: 0.5, accent: "#bfe8ff" }),
  "LB-COMMUNITY-001": preset("civic", { variation: 1, ambientIntensity: 0.76, accent: "#fff6e3" }),
};

export function getInteriorLightingPreset(id: string | null) {
  if (!id || isProtectedInteriorId(id)) return null;
  return INTERIOR_LIGHTING_PRESETS[id] ?? null;
}
