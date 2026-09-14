import type { InteriorFixture } from "@/data/interiorFixtures";

export const BATCH10_FIXTURE_LAYOUTS: Record<string, InteriorFixture[]> = {
  "LB-CHICKEN-001": [
    { kind: "pendant", position: [-1.4, 2.58, 0], shadeRadius: 0.82, shadeHeight: 0.62, emissiveColor: "#ffc05c", lightColor: "#ffd07a", intensity: 0.62, distance: 8 },
    { kind: "pendant", position: [1.4, 2.58, 0], shadeRadius: 0.82, shadeHeight: 0.62, emissiveColor: "#ffc05c", lightColor: "#ffd07a", intensity: 0.62, distance: 8 },
  ],
  "LB-FISH-001": [
    { kind: "pendant", position: [-1.4, 2.58, 0], shadeRadius: 0.82, shadeHeight: 0.62, emissiveColor: "#bfe8ff", lightColor: "#d3f0ff", intensity: 0.58, distance: 8 },
    { kind: "pendant", position: [1.4, 2.58, 0], shadeRadius: 0.82, shadeHeight: 0.62, emissiveColor: "#bfe8ff", lightColor: "#d3f0ff", intensity: 0.58, distance: 8 },
  ],
  "LB-COMMUNITY-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.86, 0.24, 8.4], emissiveColor: "#eef8ff", lightColor: "#f7fbff", intensity: 0.94, distance: 11 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.86, 0.24, 8.4], emissiveColor: "#eef8ff", lightColor: "#f7fbff", intensity: 0.94, distance: 11 },
    { kind: "disc", position: [0, 3.66, 0], radius: 0.66, emissiveColor: "#e8f6ff", lightColor: "#f2fbff", intensity: 0.62, distance: 8 },
  ],
};
