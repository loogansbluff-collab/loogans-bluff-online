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

export type InteriorFixture =
  | FluorescentFixture
  | CeilingDiscFixture
  | IndustrialCageFixture
  | PendantFixture
  | WallSconceFixture
  | ChandelierFixture;

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
    { kind: "chandelier", position: [0, 3.08, 0], emissiveColor: "#ffd58a", lightColor: "#ffdca3", intensity: 0.9, distance: 10 },
    { kind: "wallSconce", position: [-4.78, 2.25, -0.4], rotationY: Math.PI / 2, emissiveColor: "#ffc96f", lightColor: "#ffd8a3", intensity: 0.42, distance: 7 },
    { kind: "wallSconce", position: [4.78, 2.25, -0.4], rotationY: -Math.PI / 2, emissiveColor: "#ffc96f", lightColor: "#ffd8a3", intensity: 0.42, distance: 7 },
  ],
  "LB-LAUNDRY-001": [
    { kind: "fluorescent", position: [-1.35, 3.78, 0], size: [0.72, 0.22, 8.4], emissiveColor: "#f1fbff", lightColor: "#f4fcff", intensity: 0.95, distance: 11 },
    { kind: "fluorescent", position: [1.35, 3.78, 0], size: [0.72, 0.22, 8.4], emissiveColor: "#f1fbff", lightColor: "#f4fcff", intensity: 0.95, distance: 11 },
  ],
  "LB-BAKERY-001": [
    { kind: "pendant", position: [0, 3.18, -2.4], shadeRadius: 0.58, shadeHeight: 0.48, emissiveColor: "#ffd18a", lightColor: "#ffd7a0", intensity: 0.72, distance: 8 },
    { kind: "pendant", position: [0, 3.18, 0], shadeRadius: 0.58, shadeHeight: 0.48, emissiveColor: "#ffd18a", lightColor: "#ffd7a0", intensity: 0.72, distance: 8 },
    { kind: "pendant", position: [0, 3.18, 2.4], shadeRadius: 0.58, shadeHeight: 0.48, emissiveColor: "#ffd18a", lightColor: "#ffd7a0", intensity: 0.72, distance: 8 },
  ],
  "LB-COFFEE-001": [
    { kind: "pendant", position: [-1.25, 2.95, 0.4], shadeRadius: 0.48, shadeHeight: 0.54, emissiveColor: "#ffbd72", lightColor: "#ffc98a", intensity: 0.58, distance: 7 },
    { kind: "pendant", position: [1.25, 2.95, 0.4], shadeRadius: 0.48, shadeHeight: 0.54, emissiveColor: "#ffbd72", lightColor: "#ffc98a", intensity: 0.58, distance: 7 },
    { kind: "wallSconce", position: [-2.4, 2.25, -5.78], rotationY: 0, emissiveColor: "#f7a85d", lightColor: "#ffc17a", intensity: 0.34, distance: 6 },
    { kind: "wallSconce", position: [2.4, 2.25, -5.78], rotationY: 0, emissiveColor: "#f7a85d", lightColor: "#ffc17a", intensity: 0.34, distance: 6 },
  ],
  "LB-PIZZA-001": [
    { kind: "pendant", position: [-1.75, 3.1, 0], shadeRadius: 0.82, shadeHeight: 0.5, emissiveColor: "#ff9a43", lightColor: "#ffad59", intensity: 0.82, distance: 9 },
    { kind: "pendant", position: [1.75, 3.1, 0], shadeRadius: 0.82, shadeHeight: 0.5, emissiveColor: "#ff9a43", lightColor: "#ffad59", intensity: 0.82, distance: 9 },
  ],
  "LB-BURGER-001": [
    { kind: "disc", position: [-1.5, 3.74, -1.55], radius: 0.58, emissiveColor: "#fff2a8", lightColor: "#fff3bc", intensity: 0.7, distance: 8 },
    { kind: "disc", position: [1.5, 3.74, -1.55], radius: 0.58, emissiveColor: "#fff2a8", lightColor: "#fff3bc", intensity: 0.7, distance: 8 },
    { kind: "disc", position: [-1.5, 3.74, 1.55], radius: 0.58, emissiveColor: "#fff2a8", lightColor: "#fff3bc", intensity: 0.7, distance: 8 },
    { kind: "disc", position: [1.5, 3.74, 1.55], radius: 0.58, emissiveColor: "#fff2a8", lightColor: "#fff3bc", intensity: 0.7, distance: 8 },
  ],
};
