export const EAST_LAKE_CENTER_X = 105;
export const EAST_LAKE_CENTER_Z = -67;
export const EAST_LAKE_WIDTH = 120;
export const EAST_LAKE_DEPTH = 226;
export const EAST_LAKE_COLLISION_PADDING = 0.8;

export const EAST_BRIDGE_Z = -67;
export const EAST_BRIDGE_WEST_X = 46.8;
export const EAST_BRIDGE_EAST_X = 147.2;
export const EAST_BRIDGE_WIDTH = 4.2;
export const EAST_BRIDGE_WALK_HALF_WIDTH = 1.55;
export const EAST_BRIDGE_DECK_BASE_Y = 0.22;
export const EAST_BRIDGE_ARCH_HEIGHT = 6.5;
export const EAST_BRIDGE_PATH_WEST_X = 35.5;
export const EAST_BRIDGE_PATH_WIDTH = 3.4;

const EAST_BRIDGE_ENDPOINT_PADDING = 0.45;
const EAST_BRIDGE_RAIL_COLLISION_PADDING = 0.7;

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

export function isOnEastBridgeDeck(x: number, z: number) {
  return (
    x >= EAST_BRIDGE_WEST_X - EAST_BRIDGE_ENDPOINT_PADDING &&
    x <= EAST_BRIDGE_EAST_X + EAST_BRIDGE_ENDPOINT_PADDING &&
    Math.abs(z - EAST_BRIDGE_Z) <= EAST_BRIDGE_WALK_HALF_WIDTH
  );
}

export function getEastBridgeDeckHeight(x: number, z: number) {
  if (!isOnEastBridgeDeck(x, z)) return 0;

  const span = EAST_BRIDGE_EAST_X - EAST_BRIDGE_WEST_X;
  const t = Math.max(0, Math.min(1, (x - EAST_BRIDGE_WEST_X) / span));
  const arch = Math.sin(Math.PI * t);
  return EAST_BRIDGE_DECK_BASE_Y + EAST_BRIDGE_ARCH_HEIGHT * arch * arch;
}

export function isInEastBridgeRailZone(x: number, z: number) {
  if (
    x < EAST_BRIDGE_WEST_X - EAST_BRIDGE_ENDPOINT_PADDING ||
    x > EAST_BRIDGE_EAST_X + EAST_BRIDGE_ENDPOINT_PADDING
  ) {
    return false;
  }

  const sideDistance = Math.abs(z - EAST_BRIDGE_Z);
  return (
    sideDistance > EAST_BRIDGE_WALK_HALF_WIDTH &&
    sideDistance <= EAST_BRIDGE_WIDTH / 2 + EAST_BRIDGE_RAIL_COLLISION_PADDING
  );
}

export function isInEastLake(x: number, z: number) {
  if (isOnEastBridgeDeck(x, z)) return false;
  return getEastLakeField(x, z, EAST_LAKE_COLLISION_PADDING) <= 1;
}
