import type { InteriorFixture } from "@/data/interiorFixtures";

export const BATCH6_FIXTURE_LAYOUTS: Record<string, InteriorFixture[]> = {
  "LB-LAWYER-001": [
    { kind: "pendant", position: [-1.25, 2.62, 0], shadeRadius: 0.72, shadeHeight: 0.58, emissiveColor: "#ffd8a8", lightColor: "#ffd8a8", intensity: 0.5, distance: 7 },
    { kind: "pendant", position: [1.25, 2.62, 0], shadeRadius: 0.72, shadeHeight: 0.58, emissiveColor: "#ffd8a8", lightColor: "#ffd8a8", intensity: 0.5, distance: 7 },
    { kind: "wallSconce", position: [-2.3, 2.18, -5.68], rotationY: 0, emissiveColor: "#e6b778", lightColor: "#efc990", intensity: 0.24, distance: 6 },
    { kind: "wallSconce", position: [2.3, 2.18, -5.68], rotationY: 0, emissiveColor: "#e6b778", lightColor: "#efc990", intensity: 0.24, distance: 6 },
  ],
  "LB-NEWSPAPER-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.82, 0.24, 8.0], emissiveColor: "#f4ead6", lightColor: "#f7eedc", intensity: 0.72, distance: 10 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.82, 0.24, 8.0], emissiveColor: "#f4ead6", lightColor: "#f7eedc", intensity: 0.72, distance: 10 },
  ],
  "LB-RADIO-001": [
    { kind: "industrialCage", position: [-1.45, 2.88, 0], emissiveColor: "#80bfff", lightColor: "#80bfff", intensity: 0.72, distance: 9, basicHousing: true },
    { kind: "industrialCage", position: [1.45, 2.88, 0], emissiveColor: "#a8d6ff", lightColor: "#80bfff", intensity: 0.72, distance: 9, basicHousing: true },
  ],
  "LB-JEWELRY-001": [
    { kind: "disc", position: [0, 3.66, 0], radius: 0.64, emissiveColor: "#ffffff", lightColor: "#ffffff", intensity: 0.7, distance: 8 },
    { kind: "pendant", position: [-1.7, 2.68, -0.2], shadeRadius: 0.7, shadeHeight: 0.58, emissiveColor: "#e6f3ff", lightColor: "#eaf6ff", intensity: 0.44, distance: 6 },
    { kind: "pendant", position: [1.7, 2.68, -0.2], shadeRadius: 0.7, shadeHeight: 0.58, emissiveColor: "#e6f3ff", lightColor: "#eaf6ff", intensity: 0.44, distance: 6 },
  ],
  "LB-FLORIST-001": [
    { kind: "pendant", position: [-1.3, 2.62, 0.4], shadeRadius: 0.72, shadeHeight: 0.58, emissiveColor: "#ffd69b", lightColor: "#ffdca8", intensity: 0.56, distance: 7 },
    { kind: "pendant", position: [1.3, 2.62, 0.4], shadeRadius: 0.72, shadeHeight: 0.58, emissiveColor: "#ffd69b", lightColor: "#ffdca8", intensity: 0.56, distance: 7 },
    { kind: "wallSconce", position: [-2.4, 2.2, -5.68], rotationY: 0, emissiveColor: "#e8c58b", lightColor: "#f0d39f", intensity: 0.3, distance: 6 },
    { kind: "wallSconce", position: [2.4, 2.2, -5.68], rotationY: 0, emissiveColor: "#e8c58b", lightColor: "#f0d39f", intensity: 0.3, distance: 6 },
  ],
  "LB-PHOTO-001": [
    { kind: "pendant", position: [-1.6, 2.64, 0], shadeRadius: 0.82, shadeHeight: 0.62, emissiveColor: "#dcecff", lightColor: "#dcecff", intensity: 0.54, distance: 7 },
    { kind: "pendant", position: [1.6, 2.64, 0], shadeRadius: 0.82, shadeHeight: 0.62, emissiveColor: "#dcecff", lightColor: "#dcecff", intensity: 0.54, distance: 7 },
  ],
};
