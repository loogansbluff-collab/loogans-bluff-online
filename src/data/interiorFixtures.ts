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

export type InteriorFixture = FluorescentFixture | CeilingDiscFixture | IndustrialCageFixture;

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
};
