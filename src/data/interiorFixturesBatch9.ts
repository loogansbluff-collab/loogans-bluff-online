import type { InteriorFixture } from "@/data/interiorFixtures";

export const BATCH9_FIXTURE_LAYOUTS: Record<string, InteriorFixture[]> = {
  "LB-GYM-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.84, 0.24, 8.4], emissiveColor: "#eef7ff", lightColor: "#f4fbff", intensity: 0.92, distance: 11 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.84, 0.24, 8.4], emissiveColor: "#eef7ff", lightColor: "#f4fbff", intensity: 0.92, distance: 11 },
  ],
  "LB-TATTOO-001": [
    { kind: "pendant", position: [-1.4, 2.58, 0], shadeRadius: 0.78, shadeHeight: 0.62, emissiveColor: "#ffb07d", lightColor: "#ffc098", intensity: 0.5, distance: 7 },
    { kind: "pendant", position: [1.4, 2.58, 0], shadeRadius: 0.78, shadeHeight: 0.62, emissiveColor: "#ffb07d", lightColor: "#ffc098", intensity: 0.5, distance: 7 },
  ],
  "LB-SPA-001": [
    { kind: "wallSconce", position: [-2.35, 2.18, -5.68], rotationY: 0, emissiveColor: "#efc59a", lightColor: "#f6d1a8", intensity: 0.28, distance: 6 },
    { kind: "pendant", position: [0, 2.55, 0.35], shadeRadius: 0.7, shadeHeight: 0.56, emissiveColor: "#ffd2a1", lightColor: "#ffdab2", intensity: 0.42, distance: 7 },
    { kind: "wallSconce", position: [2.35, 2.18, -5.68], rotationY: 0, emissiveColor: "#efc59a", lightColor: "#f6d1a8", intensity: 0.28, distance: 6 },
  ],
  "LB-TRAVEL-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.82, 0.24, 8.0], emissiveColor: "#fff4df", lightColor: "#fff8eb", intensity: 0.82, distance: 10 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.82, 0.24, 8.0], emissiveColor: "#fff4df", lightColor: "#fff8eb", intensity: 0.82, distance: 10 },
  ],
  "LB-STORAGE-001": [
    { kind: "fluorescent", position: [0, 3.72, -1.65], size: [2.6, 0.22, 0.82], emissiveColor: "#e4d7bd", lightColor: "#eadfc8", intensity: 0.48, distance: 7 },
    { kind: "fluorescent", position: [0, 3.72, 1.65], size: [2.6, 0.22, 0.82], emissiveColor: "#e4d7bd", lightColor: "#eadfc8", intensity: 0.48, distance: 7 },
  ],
  "LB-DONUTS-001": [
    { kind: "pendant", position: [-1.35, 2.6, 0.25], shadeRadius: 0.8, shadeHeight: 0.62, emissiveColor: "#ffb1c8", lightColor: "#ffc4d4", intensity: 0.58, distance: 8 },
    { kind: "pendant", position: [1.35, 2.6, 0.25], shadeRadius: 0.8, shadeHeight: 0.62, emissiveColor: "#ffd18a", lightColor: "#ffdda8", intensity: 0.58, distance: 8 },
  ],
};
