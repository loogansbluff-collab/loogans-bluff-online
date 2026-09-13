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
    { kind: "fluorescent", position: [-2.3, 7.82, -2.4], size: [2.9, 0.08, 1.25], emissiveColor: "#f5fbff", lightColor: "#ffffff", intensity: 0.72, distance: 9 },
    { kind: "fluorescent", position: [2.3, 7.82, -2.4], size: [2.9, 0.08, 1.25], emissiveColor: "#f5fbff", lightColor: "#ffffff", intensity: 0.72, distance: 9 },
    { kind: "fluorescent", position: [-2.3, 7.82, 2.1], size: [2.9, 0.08, 1.25], emissiveColor: "#f5fbff", lightColor: "#ffffff", intensity: 0.72, distance: 9 },
    { kind: "fluorescent", position: [2.3, 7.82, 2.1], size: [2.9, 0.08, 1.25], emissiveColor: "#f5fbff", lightColor: "#ffffff", intensity: 0.72, distance: 9 },
  ],
  "LB-PHARMACY-001": [
    { kind: "fluorescent", position: [-1.8, 7.82, 0], size: [0.55, 0.08, 7.4], emissiveColor: "#e8fbff", lightColor: "#e8fbff", intensity: 0.9, distance: 11 },
    { kind: "fluorescent", position: [1.8, 7.82, 0], size: [0.55, 0.08, 7.4], emissiveColor: "#e8fbff", lightColor: "#e8fbff", intensity: 0.9, distance: 11 },
  ],
  "LB-DENTIST-001": [
    { kind: "disc", position: [0, 7.82, 0], radius: 0.42, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.52, distance: 8 },
    { kind: "disc", position: [-2.7, 7.82, -2.6], radius: 0.34, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.5, distance: 8 },
    { kind: "disc", position: [2.7, 7.82, -2.6], radius: 0.34, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.5, distance: 8 },
    { kind: "disc", position: [-2.7, 7.82, 2.5], radius: 0.34, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.5, distance: 8 },
    { kind: "disc", position: [2.7, 7.82, 2.5], radius: 0.34, emissiveColor: "#fff8ee", lightColor: "#fff8ee", intensity: 0.5, distance: 8 },
  ],
  "LB-VET-001": [
    { kind: "disc", position: [0, 7.82, -2.7], radius: 0.5, emissiveColor: "#ffe9c8", lightColor: "#ffe9c8", intensity: 0.62, distance: 9 },
    { kind: "disc", position: [-2.7, 7.82, 2.2], radius: 0.5, emissiveColor: "#ffe9c8", lightColor: "#ffe9c8", intensity: 0.62, distance: 9 },
    { kind: "disc", position: [2.7, 7.82, 2.2], radius: 0.5, emissiveColor: "#ffe9c8", lightColor: "#ffe9c8", intensity: 0.62, distance: 9 },
  ],
  "LB-FIREHALL-001": [
    { kind: "industrialCage", position: [-2.3, 3.1, -0.6], emissiveColor: "#eef6ff", lightColor: "#eef6ff", intensity: 1.15, distance: 12 },
    { kind: "industrialCage", position: [2.3, 3.1, 0.8], emissiveColor: "#eef6ff", lightColor: "#eef6ff", intensity: 1.15, distance: 12 },
  ],
  "LB-POST-001": [
    { kind: "fluorescent", position: [-2.2, 7.82, 0], size: [2.5, 0.08, 1.1], emissiveColor: "#fff4dc", lightColor: "#fff4dc", intensity: 0.72, distance: 9 },
    { kind: "fluorescent", position: [2.2, 7.82, 0], size: [2.5, 0.08, 1.1], emissiveColor: "#fff4dc", lightColor: "#fff4dc", intensity: 0.72, distance: 9 },
  ],
};
