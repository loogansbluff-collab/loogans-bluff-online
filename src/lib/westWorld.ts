import { CatmullRomCurve3, Vector3 } from "three";

export const WEST_GROUND_MIN_X = -260;
export const WEST_GROUND_MAX_X = -198;
export const WEST_AERIAL_MIN_X = -112;
export const EAST_AERIAL_MAX_X = 36;
export const WEST_WALK_MIN_X = -259;
export const EAST_WALK_MAX_X = 197;
export const NORTH_SOUTH_WALK_LIMIT = 197;

export const WEST_EXIT_Z = -51;
export const WEST_APPROACH_START_X = -35.5;
export const WEST_APPROACH_END_X = -70.5;
export const WEST_APPROACH_WIDTH = 3;

export const WEST_BRIDGE_EAST_X = WEST_APPROACH_END_X;
export const WEST_BRIDGE_WEST_X = -91.5;
export const WEST_BRIDGE_WIDTH = 3.4;
export const WEST_BRIDGE_DECK_Y = 0.12;
const WEST_BRIDGE_WALK_HALF_WIDTH = WEST_BRIDGE_WIDTH / 2 - 0.42;
const WEST_BRIDGE_RAIL_BLOCK_DEPTH = 0.55;

export const WEST_FAR_TRAIL_START_X = WEST_BRIDGE_WEST_X;
export const WEST_FAR_TRAIL_END_X = -116;
export const WEST_FAR_TRAIL_WIDTH = 3;

export const WEST_RIVER_POINTS = [
  [-82, -209],
  [-79, -160],
  [-84, -112],
  [-78, -62],
  [-83, -12],
  [-79, 40],
  [-85, 92],
  [-81, 138],
  [-84, 178],
] as const;

export const WEST_RIVER_MIN_WIDTH = 9.5;
export const WEST_RIVER_MAX_WIDTH = 12;
export const WEST_RIVER_BANK_WIDTH = 2.4;
export const WEST_RIVER_SAMPLE_COUNT = 96;

const RIVER_COLLISION_PADDING = 0.7;

export function getWestRiverCurve() {
  return new CatmullRomCurve3(
    WEST_RIVER_POINTS.map(([x, z]) => new Vector3(x, 0, z)),
    false,
    "catmullrom",
    0.5,
  );
}

export function getWestRiverWidth(t: number) {
  const wave = 0.5 + 0.5 * Math.sin(t * Math.PI * 4.2 + 0.65);
  return WEST_RIVER_MIN_WIDTH + (WEST_RIVER_MAX_WIDTH - WEST_RIVER_MIN_WIDTH) * wave;
}

export function isOnWestBridgeDeck(x: number, z: number) {
  return (
    x <= WEST_BRIDGE_EAST_X + 0.35 &&
    x >= WEST_BRIDGE_WEST_X - 0.35 &&
    Math.abs(z - WEST_EXIT_Z) <= WEST_BRIDGE_WALK_HALF_WIDTH
  );
}

export function isInWestBridgeRailZone(x: number, z: number) {
  if (x > WEST_BRIDGE_EAST_X + 0.35 || x < WEST_BRIDGE_WEST_X - 0.35) return false;

  const lateralDistance = Math.abs(z - WEST_EXIT_Z);
  return (
    lateralDistance > WEST_BRIDGE_WALK_HALF_WIDTH &&
    lateralDistance < WEST_BRIDGE_WIDTH / 2 + WEST_BRIDGE_RAIL_BLOCK_DEPTH
  );
}

export function isInWestRiverChannel(x: number, z: number) {
  if (isOnWestBridgeDeck(x, z)) return false;

  const curve = getWestRiverCurve();
  let closestDistanceSq = Number.POSITIVE_INFINITY;
  let closestT = 0;

  for (let i = 0; i <= WEST_RIVER_SAMPLE_COUNT; i += 1) {
    const t = i / WEST_RIVER_SAMPLE_COUNT;
    const point = curve.getPoint(t);
    const dx = x - point.x;
    const dz = z - point.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < closestDistanceSq) {
      closestDistanceSq = distanceSq;
      closestT = t;
    }
  }

  const collisionRadius = getWestRiverWidth(closestT) / 2 + RIVER_COLLISION_PADDING;
  return closestDistanceSq < collisionRadius * collisionRadius;
}
