import type { InteriorFixture } from "@/data/interiorFixtures";

export const BATCH7_FIXTURE_LAYOUTS: Record<string, InteriorFixture[]> = {
  "LB-PRINT-001": [
    { kind: "fluorescent", position: [-1.35, 3.72, 0], size: [0.84, 0.24, 8.2], emissiveColor: "#eef8ff", lightColor: "#f4fbff", intensity: 0.92, distance: 11 },
    { kind: "fluorescent", position: [1.35, 3.72, 0], size: [0.84, 0.24, 8.2], emissiveColor: "#eef8ff", lightColor: "#f4fbff", intensity: 0.92, distance: 11 },
  ],
  "LB-BUILDSUPPLY-001": [
    { kind: "industrialCage", position: [0, 3.02, -1.8], emissiveColor: "#e9f5ff", lightColor: "#edf7ff", intensity: 0.92, distance: 11, basicHousing: true },
    { kind: "industrialCage", position: [0, 3.02, 1.8], emissiveColor: "#e9f5ff", lightColor: "#edf7ff", intensity: 0.92, distance: 11, basicHousing: true },
  ],
  "LB-PLUMBING-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.84, 0.24, 8.2], emissiveColor: "#c8f2ff", lightColor: "#d8f7ff", intensity: 0.84, distance: 10 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.84, 0.24, 8.2], emissiveColor: "#c8f2ff", lightColor: "#d8f7ff", intensity: 0.84, distance: 10 },
  ],
  "LB-ELECTRICAL-001": [
    { kind: "industrialCage", position: [0, 3.0, -1.8], emissiveColor: "#fff1b8", lightColor: "#fff1b8", intensity: 0.82, distance: 10, basicHousing: true },
    { kind: "industrialCage", position: [0, 3.0, 1.8], emissiveColor: "#fff1b8", lightColor: "#fff1b8", intensity: 0.82, distance: 10, basicHousing: true },
  ],
  "LB-GARDEN-001": [
    { kind: "pendant", position: [-1.6, 2.62, 0], shadeRadius: 0.92, shadeHeight: 0.66, emissiveColor: "#fff2bd", lightColor: "#fff2bd", intensity: 0.58, distance: 8 },
    { kind: "pendant", position: [1.6, 2.62, 0], shadeRadius: 0.92, shadeHeight: 0.66, emissiveColor: "#fff2bd", lightColor: "#fff2bd", intensity: 0.58, distance: 8 },
  ],
  "LB-PET-001": [
    { kind: "fluorescent", position: [0, 3.72, -2.0], size: [3.0, 0.22, 0.82], emissiveColor: "#fff2d6", lightColor: "#fff6e6", intensity: 0.72, distance: 9 },
    { kind: "disc", position: [0, 3.66, 0], radius: 0.64, emissiveColor: "#fff0c7", lightColor: "#fff4d8", intensity: 0.58, distance: 8 },
    { kind: "fluorescent", position: [0, 3.72, 2.0], size: [3.0, 0.22, 0.82], emissiveColor: "#fff2d6", lightColor: "#fff6e6", intensity: 0.72, distance: 9 },
  ],
};
