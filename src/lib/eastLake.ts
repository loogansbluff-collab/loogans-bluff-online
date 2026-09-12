export const EAST_LAKE_CENTER_X = 105;
export const EAST_LAKE_CENTER_Z = -67;
export const EAST_LAKE_WIDTH = 120;
export const EAST_LAKE_DEPTH = 226;
export const EAST_LAKE_COLLISION_PADDING = 0.8;

type Ellipse = {
  x: number;
  z: number;
  radiusX: number;
  radiusZ: number;
};

export const EAST_LAKE_ELLIPSES: Ellipse[] = [
  { x: -8, z: -5, radiusX: 50, radiusZ: 92 },
  { x: 18, z: -48, radiusX: 40, radiusZ: 55 },
  { x: 12, z: 52, radiusX: 42, radiusZ: 54 },
  { x: -18, z: 28, radiusX: 34, radiusZ: 50 },
];

function ellipseField(localX: number, localZ: number, ellipse: Ellipse, padding = 0) {
  const nx = (localX - ellipse.x) / (ellipse.radiusX + padding);
  const nz = (localZ - ellipse.z) / (ellipse.radiusZ + padding);
  return nx * nx + nz * nz;
}

export function getEastLakeField(x: number, z: number, padding = 0) {
  const localX = x - EAST_LAKE_CENTER_X;
  const localZ = z - EAST_LAKE_CENTER_Z;
  let field = Number.POSITIVE_INFINITY;

  EAST_LAKE_ELLIPSES.forEach((ellipse) => {
    field = Math.min(field, ellipseField(localX, localZ, ellipse, padding));
  });

  return field;
}

export function isInEastLake(x: number, z: number) {
  return getEastLakeField(x, z, EAST_LAKE_COLLISION_PADDING) <= 1;
}
