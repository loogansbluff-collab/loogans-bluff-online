export type Vec3 = [number, number, number];

export type FluorescentFixture = {
  kind: "fluorescent";
  position: Vec3;
  size: Vec3;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export type CeilingDiscFixture = {
  kind: "disc";
  position: Vec3;
  radius: number;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export type IndustrialCageFixture = {
  kind: "industrialCage";
  position: Vec3;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
  basicHousing?: boolean;
};

export type PendantFixture = {
  kind: "pendant";
  position: Vec3;
  shadeRadius: number;
  shadeHeight: number;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export type WallSconceFixture = {
  kind: "wallSconce";
  position: Vec3;
  rotationY: number;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export type ChandelierFixture = {
  kind: "chandelier";
  position: Vec3;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export type LanternFixture = {
  kind: "lantern";
  position: Vec3;
  radius: number;
  height: number;
  bodyColor: string;
  trimColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export type InteriorFixture =
  | FluorescentFixture
  | CeilingDiscFixture
  | IndustrialCageFixture
  | PendantFixture
  | WallSconceFixture
  | ChandelierFixture
  | LanternFixture;

export const INTERIOR_FIXTURE_LAYOUTS: Record<string, InteriorFixture[]> = {
  "LB-MEDICAL-001": [
    { kind: "fluorescent", position: [-1.65, 3.78, -1.7], size: [3.0, 0.22, 1.3], emissiveColor: "#f5fbff", lightColor: "#ffffff", intensity: 0.72, distance: 9 },
    { kind: "fluorescent", position: [1.65, 3.78, -1.7], size: [3.0, 0.22, 1.3], emissiveColor: "#f5fbff", lightColor: "#ffffff", intensity: 0.72, distance: 9 },
    { kind: "fluorescent", position: [-1.65, 3.78, 1.7], size: [3.0, 0.22, 1.3], emissiveColor: "#f5fbff", lightColor: "#ffffff", intensity: 0.72, distance: 9 },
    { kind: "fluorescent", position: [1.65, 3.78, 1.7], size: [3.0, 0.22, 1.3], emissiveColor: "#f5fbff", lightColor: "#ffffff", intensity: 0.72, distance: 9 },
  ],
  "LB-PHARMACY-001": [
    { kind: "fluorescent", position: [-1.45, 3.76, 0], size: [0.7, 0.22, 8.2], emissiveColor: "#e8fbff", lightColor: "#e8fbff", intensity: 0.9, distance: 11 },
    { kind: "fluorescent", position: [1.45, 3.76, 0], size: [0.7, 0.22, 8.2], emissiveColor: "#e8fbff", lightColor: "#e8fbff", intensity: 0.9, distance: 11 },
  ],
  "LB-DENTIST-001": [
    { kind: "disc", position: [0, 3.74, 0], radius: 0.48, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.52, distance: 8 },
    { kind: "disc", position: [-1.75, 3.74, -1.7], radius: 0.36, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.5, distance: 8 },
    { kind: "disc", position: [1.75, 3.74, -1.7], radius: 0.36, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.5, distance: 8 },
    { kind: "disc", position: [-1.75, 3.74, 1.7], radius: 0.36, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.5, distance: 8 },
    { kind: "disc", position: [1.75, 3.74, 1.7], radius: 0.36, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.5, distance: 8 },
  ],
  "LB-VET-001": [
    { kind: "disc", position: [0, 3.72, -2.4], radius: 0.5, emissiveColor: "#ffe9c8", lightColor: "#ffe9c8", intensity: 0.62, distance: 9 },
    { kind: "disc", position: [0, 3.72, 0], radius: 0.5, emissiveColor: "#ffe9c8", lightColor: "#ffe9c8", intensity: 0.62, distance: 9 },
    { kind: "disc", position: [0, 3.72, 2.4], radius: 0.5, emissiveColor: "#ffe9c8", lightColor: "#ffe9c8", intensity: 0.62, distance: 9 },
  ],
  "LB-FIREHALL-001": [
    { kind: "industrialCage", position: [-1.8, 3.0, 0], emissiveColor: "#eef6ff", lightColor: "#eef6ff", intensity: 1.15, distance: 12 },
    { kind: "industrialCage", position: [1.8, 3.0, 0], emissiveColor: "#eef6ff", lightColor: "#eef6ff", intensity: 1.15, distance: 12 },
  ],
  "LB-POST-001": [
    { kind: "fluorescent", position: [-1.65, 3.78, 0], size: [2.7, 0.22, 1.2], emissiveColor: "#fff4dc", lightColor: "#fff4dc", intensity: 0.72, distance: 9 },
    { kind: "fluorescent", position: [1.65, 3.78, 0], size: [2.7, 0.22, 1.2], emissiveColor: "#fff4dc", lightColor: "#fff4dc", intensity: 0.72, distance: 9 },
  ],
  "LB-FUNERAL-001": [
    { kind: "chandelier", position: [0, 2.62, 0], emissiveColor: "#ffd58a", lightColor: "#ffdca3", intensity: 0.9, distance: 10 },
    { kind: "wallSconce", position: [-4.72, 2.2, -0.4], rotationY: Math.PI / 2, emissiveColor: "#ffc96f", lightColor: "#ffd8a3", intensity: 0.42, distance: 7 },
    { kind: "wallSconce", position: [4.72, 2.2, -0.4], rotationY: -Math.PI / 2, emissiveColor: "#ffc96f", lightColor: "#ffd8a3", intensity: 0.42, distance: 7 },
  ],
  "LB-LAUNDRY-001": [
    { kind: "fluorescent", position: [-1.35, 3.72, 0], size: [0.82, 0.24, 8.4], emissiveColor: "#f1fbff", lightColor: "#f4fcff", intensity: 0.95, distance: 11 },
    { kind: "fluorescent", position: [1.35, 3.72, 0], size: [0.82, 0.24, 8.4], emissiveColor: "#f1fbff", lightColor: "#f4fcff", intensity: 0.95, distance: 11 },
  ],
  "LB-BAKERY-001": [
    { kind: "pendant", position: [0, 2.7, -2.4], shadeRadius: 0.72, shadeHeight: 0.62, emissiveColor: "#ffd18a", lightColor: "#ffd7a0", intensity: 0.72, distance: 8 },
    { kind: "pendant", position: [0, 2.7, 0], shadeRadius: 0.72, shadeHeight: 0.62, emissiveColor: "#ffd18a", lightColor: "#ffd7a0", intensity: 0.72, distance: 8 },
    { kind: "pendant", position: [0, 2.7, 2.4], shadeRadius: 0.72, shadeHeight: 0.62, emissiveColor: "#ffd18a", lightColor: "#ffd7a0", intensity: 0.72, distance: 8 },
  ],
  "LB-COFFEE-001": [
    { kind: "pendant", position: [-1.25, 2.5, 0.4], shadeRadius: 0.76, shadeHeight: 0.66, emissiveColor: "#ffbd72", lightColor: "#ffc98a", intensity: 0.58, distance: 7 },
    { kind: "pendant", position: [1.25, 2.5, 0.4], shadeRadius: 0.76, shadeHeight: 0.66, emissiveColor: "#ffbd72", lightColor: "#ffc98a", intensity: 0.58, distance: 7 },
    { kind: "wallSconce", position: [-2.4, 2.2, -5.68], rotationY: 0, emissiveColor: "#f7a85d", lightColor: "#ffc17a", intensity: 0.34, distance: 6 },
    { kind: "wallSconce", position: [2.4, 2.2, -5.68], rotationY: 0, emissiveColor: "#f7a85d", lightColor: "#ffc17a", intensity: 0.34, distance: 6 },
  ],
  "LB-PIZZA-001": [
    { kind: "pendant", position: [-1.75, 2.62, 0], shadeRadius: 1.0, shadeHeight: 0.68, emissiveColor: "#ff9a43", lightColor: "#ffad59", intensity: 0.82, distance: 9 },
    { kind: "pendant", position: [1.75, 2.62, 0], shadeRadius: 1.0, shadeHeight: 0.68, emissiveColor: "#ff9a43", lightColor: "#ffad59", intensity: 0.82, distance: 9 },
  ],
  "LB-BURGER-001": [
    { kind: "disc", position: [-1.5, 3.68, -1.55], radius: 0.72, emissiveColor: "#fff2a8", lightColor: "#fff3bc", intensity: 0.7, distance: 8 },
    { kind: "disc", position: [1.5, 3.68, -1.55], radius: 0.72, emissiveColor: "#fff2a8", lightColor: "#fff3bc", intensity: 0.7, distance: 8 },
    { kind: "disc", position: [-1.5, 3.68, 1.55], radius: 0.72, emissiveColor: "#fff2a8", lightColor: "#fff3bc", intensity: 0.7, distance: 8 },
    { kind: "disc", position: [1.5, 3.68, 1.55], radius: 0.72, emissiveColor: "#fff2a8", lightColor: "#fff3bc", intensity: 0.7, distance: 8 },
  ],
  "LB-ICECREAM-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.82, 0.24, 8.2], emissiveColor: "#ffb6d9", lightColor: "#ffd0e7", intensity: 0.92, distance: 11 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.82, 0.24, 8.2], emissiveColor: "#aeefff", lightColor: "#c9f6ff", intensity: 0.92, distance: 11 },
  ],
  "LB-CHINESE-001": [
    { kind: "lantern", position: [-1.45, 2.58, 0], radius: 0.56, height: 0.92, bodyColor: "#b91c1c", trimColor: "#d4a017", lightColor: "#ffd27a", intensity: 0.72, distance: 8 },
    { kind: "lantern", position: [1.45, 2.58, 0], radius: 0.56, height: 0.92, bodyColor: "#b91c1c", trimColor: "#d4a017", lightColor: "#ffd27a", intensity: 0.72, distance: 8 },
  ],
  "LB-BUTCHER-001": [
    { kind: "fluorescent", position: [-1.35, 3.72, 0], size: [0.82, 0.24, 8.2], emissiveColor: "#eef8ff", lightColor: "#f4fbff", intensity: 0.95, distance: 11 },
    { kind: "fluorescent", position: [1.35, 3.72, 0], size: [0.82, 0.24, 8.2], emissiveColor: "#eef8ff", lightColor: "#f4fbff", intensity: 0.95, distance: 11 },
  ],
  "LB-CLOTHING-001": [
    { kind: "disc", position: [0, 3.68, -2.2], radius: 0.62, emissiveColor: "#fff5df", lightColor: "#fff7e8", intensity: 0.62, distance: 8 },
    { kind: "disc", position: [0, 3.68, 0], radius: 0.62, emissiveColor: "#fff5df", lightColor: "#fff7e8", intensity: 0.62, distance: 8 },
    { kind: "disc", position: [0, 3.68, 2.2], radius: 0.62, emissiveColor: "#fff5df", lightColor: "#fff7e8", intensity: 0.62, distance: 8 },
  ],
  "LB-SHOE-001": [
    { kind: "fluorescent", position: [0, 3.72, -2.0], size: [2.8, 0.22, 0.78], emissiveColor: "#fff7eb", lightColor: "#fff8ef", intensity: 0.66, distance: 8 },
    { kind: "disc", position: [0, 3.68, 0], radius: 0.62, emissiveColor: "#fff3db", lightColor: "#fff7ea", intensity: 0.58, distance: 8 },
    { kind: "fluorescent", position: [0, 3.72, 2.0], size: [2.8, 0.22, 0.78], emissiveColor: "#fff7eb", lightColor: "#fff8ef", intensity: 0.66, distance: 8 },
  ],
  "LB-FURNITURE-001": [
    { kind: "pendant", position: [-1.65, 2.64, 0], shadeRadius: 0.95, shadeHeight: 0.66, emissiveColor: "#f5cf9a", lightColor: "#f6d8aa", intensity: 0.55, distance: 7 },
    { kind: "pendant", position: [1.65, 2.64, 0], shadeRadius: 0.95, shadeHeight: 0.66, emissiveColor: "#f5cf9a", lightColor: "#f6d8aa", intensity: 0.55, distance: 7 },
  ],
  "LB-APPLIANCE-001": [
    { kind: "fluorescent", position: [-1.35, 3.72, 0], size: [0.86, 0.24, 8.4], emissiveColor: "#f1f8ff", lightColor: "#f7fbff", intensity: 1.0, distance: 11 },
    { kind: "fluorescent", position: [1.35, 3.72, 0], size: [0.86, 0.24, 8.4], emissiveColor: "#f1f8ff", lightColor: "#f7fbff", intensity: 1.0, distance: 11 },
  ],
  "LB-ELECTRONICS-001": [
    { kind: "fluorescent", position: [0, 3.72, -2.15], size: [3.0, 0.22, 0.8], emissiveColor: "#c9f6ff", lightColor: "#d9f9ff", intensity: 0.68, distance: 8 },
    { kind: "disc", position: [0, 3.68, 0], radius: 0.62, emissiveColor: "#d7f7ff", lightColor: "#e7fbff", intensity: 0.58, distance: 8 },
    { kind: "fluorescent", position: [0, 3.72, 2.15], size: [3.0, 0.22, 0.8], emissiveColor: "#c9f6ff", lightColor: "#d9f9ff", intensity: 0.68, distance: 8 },
  ],
  "LB-OUTDOOR-001": [
    { kind: "pendant", position: [-1.65, 2.62, 0], shadeRadius: 0.92, shadeHeight: 0.68, emissiveColor: "#d7a45d", lightColor: "#e6bd7c", intensity: 0.58, distance: 8 },
    { kind: "pendant", position: [1.65, 2.62, 0], shadeRadius: 0.92, shadeHeight: 0.68, emissiveColor: "#d7a45d", lightColor: "#e6bd7c", intensity: 0.58, distance: 8 },
  ],
  "LB-AUTOPARTS-001": [
    { kind: "industrialCage", position: [0, 3.02, -1.8], emissiveColor: "#eef6ff", lightColor: "#f3f8ff", intensity: 1.0, distance: 11, basicHousing: true },
    { kind: "industrialCage", position: [0, 3.02, 1.8], emissiveColor: "#eef6ff", lightColor: "#f3f8ff", intensity: 1.0, distance: 11, basicHousing: true },
  ],
  "LB-TIRE-001": [
    { kind: "industrialCage", position: [0, 2.98, -1.8], emissiveColor: "#cfd4d8", lightColor: "#d8dde2", intensity: 0.64, distance: 9, basicHousing: true },
    { kind: "industrialCage", position: [0, 2.98, 1.8], emissiveColor: "#cfd4d8", lightColor: "#d8dde2", intensity: 0.64, distance: 9, basicHousing: true },
  ],
  "LB-CARWASH-001": [
    { kind: "fluorescent", position: [-1.3, 3.72, 0], size: [0.84, 0.24, 8.4], emissiveColor: "#bfefff", lightColor: "#d8f7ff", intensity: 0.96, distance: 11 },
    { kind: "fluorescent", position: [1.3, 3.72, 0], size: [0.84, 0.24, 8.4], emissiveColor: "#bfefff", lightColor: "#d8f7ff", intensity: 0.96, distance: 11 },
  ],
};
