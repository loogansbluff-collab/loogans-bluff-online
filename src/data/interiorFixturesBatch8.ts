import type { InteriorFixture } from "@/data/interiorFixtures";

export const BATCH8_FIXTURE_LAYOUTS: Record<string, InteriorFixture[]> = {
  "LB-SMOKE-001": [
    { kind: "pendant", position: [-1.35, 2.58, 0.25], shadeRadius: 0.78, shadeHeight: 0.62, emissiveColor: "#c47cff", lightColor: "#d69cff", intensity: 0.48, distance: 7 },
    { kind: "pendant", position: [1.35, 2.58, 0.25], shadeRadius: 0.78, shadeHeight: 0.62, emissiveColor: "#ffb15c", lightColor: "#ffc07a", intensity: 0.48, distance: 7 },
    { kind: "wallSconce", position: [-2.4, 2.2, -5.68], rotationY: 0, emissiveColor: "#a86be8", lightColor: "#c48cff", intensity: 0.24, distance: 6 },
    { kind: "wallSconce", position: [2.4, 2.2, -5.68], rotationY: 0, emissiveColor: "#d18a46", lightColor: "#e6aa68", intensity: 0.24, distance: 6 },
  ],
  "LB-ARCADE-001": [
    { kind: "fluorescent", position: [-1.25, 3.68, 0], size: [0.78, 0.24, 7.8], emissiveColor: "#ff4fd8", lightColor: "#ff79e5", intensity: 0.56, distance: 8 },
    { kind: "fluorescent", position: [1.25, 3.68, 0], size: [0.78, 0.24, 7.8], emissiveColor: "#56e6ff", lightColor: "#80efff", intensity: 0.56, distance: 8 },
    { kind: "pendant", position: [0, 2.58, 0.4], shadeRadius: 0.72, shadeHeight: 0.58, emissiveColor: "#9f7cff", lightColor: "#b79cff", intensity: 0.42, distance: 7 },
  ],
  "LB-BOWLING-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.84, 0.24, 8.2], emissiveColor: "#d7f3ff", lightColor: "#e4f8ff", intensity: 0.76, distance: 10 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.84, 0.24, 8.2], emissiveColor: "#d7f3ff", lightColor: "#e4f8ff", intensity: 0.76, distance: 10 },
    { kind: "disc", position: [0, 3.66, 0], radius: 0.62, emissiveColor: "#b9d8ff", lightColor: "#cde7ff", intensity: 0.52, distance: 8 },
  ],
  "LB-POOL-001": [
    { kind: "pendant", position: [-1.55, 2.52, 0], shadeRadius: 0.98, shadeHeight: 0.68, emissiveColor: "#ffd27a", lightColor: "#ffd99a", intensity: 0.56, distance: 8 },
    { kind: "pendant", position: [1.55, 2.52, 0], shadeRadius: 0.98, shadeHeight: 0.68, emissiveColor: "#ffd27a", lightColor: "#ffd99a", intensity: 0.56, distance: 8 },
  ],
  "LB-THEATER-001": [
    { kind: "wallSconce", position: [-2.45, 2.18, -5.68], rotationY: 0, emissiveColor: "#d9985c", lightColor: "#e6ad70", intensity: 0.22, distance: 6 },
    { kind: "wallSconce", position: [2.45, 2.18, -5.68], rotationY: 0, emissiveColor: "#d9985c", lightColor: "#e6ad70", intensity: 0.22, distance: 6 },
    { kind: "disc", position: [-1.35, 3.64, 0.7], radius: 0.56, emissiveColor: "#e6b57a", lightColor: "#efc18c", intensity: 0.32, distance: 6 },
    { kind: "disc", position: [1.35, 3.64, 0.7], radius: 0.56, emissiveColor: "#e6b57a", lightColor: "#efc18c", intensity: 0.32, distance: 6 },
  ],
  "LB-BINGO-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.84, 0.24, 8.4], emissiveColor: "#fff0d2", lightColor: "#fff4df", intensity: 0.78, distance: 10 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.84, 0.24, 8.4], emissiveColor: "#fff0d2", lightColor: "#fff4df", intensity: 0.78, distance: 10 },
  ],
};
