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

export const WEST_FAR_TRAIL_START_X = WEST_BRIDGE_WEST_X;
export const WEST_FAR_TRAIL_END_X = -116;
export const WEST_FAR_TRAIL_WIDTH = 3;

export const COUNTRY_WEST_ROAD_POINTS = [
  [-116, -51],
  [-126, -50],
  [-138, -46],
  [-149, -39],
  [-159, -29],
  [-168, -18],
] as const;
export const COUNTRY_WEST_ROAD_WIDTH = 3.2;
export const COUNTRY_WEST_ROAD_SAMPLE_COUNT = 48;
export const COUNTRY_WEST_CLEARING_CENTER: [number, number] = [-182, 8];
export const COUNTRY_WEST_CLEARING_RADIUS = 11;

export const COUNTRY_WEST_HOUSE_CENTER: [number, number] = [-183, 7];
export const COUNTRY_WEST_HOUSE_SIZE: [number, number] = [7, 5.5];
export const COUNTRY_WEST_DRIVEWAY_START: [number, number] = [-168, -18];
export const COUNTRY_WEST_DRIVEWAY_END: [number, number] = [-181.2, 3.8];
export const COUNTRY_WEST_DRIVEWAY_WIDTH = 1.45;
const COUNTRY_WEST_HOUSE_COLLISION_PADDING = 0.45;

export const COUNTRY_WEST_ROADBLOCK_T = 0.78;
export const COUNTRY_WEST_ROADBLOCK_WIDTH = 5.2;
export const COUNTRY_WEST_ROADBLOCK_DEPTH = 0.7;
const COUNTRY_WEST_ROADBLOCK_COLLISION_PADDING = 0.55;

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
const WEST_RURAL_CORRIDOR_PADDING = 0.55;

function distanceToSegment(
  x: number,
  z: number,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
) {
  const dx = endX - startX;
  const dz = endZ - startZ;
  const lengthSq = dx * dx + dz * dz;
  if (lengthSq === 0) return Math.hypot(x - startX, z - startZ);

  const t = Math.max(0, Math.min(1, ((x - startX) * dx + (z - startZ) * dz) / lengthSq));
  const closestX = startX + dx * t;
  const closestZ = startZ + dz * t;
  return Math.hypot(x - closestX, z - closestZ);
}

export function getCountryWestRoadCurve() {
  return new CatmullRomCurve3(
    COUNTRY_WEST_ROAD_POINTS.map(([x, z]) => new Vector3(x, 0, z)),
    false,
    "catmullrom",
    0.5,
  );
}

export function getCountryWestRoadblockPose() {
  const [startX, startZ] = COUNTRY_WEST_DRIVEWAY_START;
  const [endX, endZ] = COUNTRY_WEST_DRIVEWAY_END;
  const x = startX + (endX - startX) * COUNTRY_WEST_ROADBLOCK_T;
  const z = startZ + (endZ - startZ) * COUNTRY_WEST_ROADBLOCK_T;
  const tangent = new Vector3(endX - startX, 0, endZ - startZ).normalize();
  return {
    x,
    z,
    rotationY: Math.atan2(tangent.x, tangent.z),
  };
}

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

export function isInCountryWestHouse(x: number, z: number) {
  const [houseX, houseZ] = COUNTRY_WEST_HOUSE_CENTER;
  const [width, depth] = COUNTRY_WEST_HOUSE_SIZE;
  return (
    Math.abs(x - houseX) < width / 2 + COUNTRY_WEST_HOUSE_COLLISION_PADDING &&
    Math.abs(z - houseZ) < depth / 2 + COUNTRY_WEST_HOUSE_COLLISION_PADDING
  );
}

export function isInCountryWestRoadblock(x: number, z: number) {
  const pose = getCountryWestRoadblockPose();
  const dx = x - pose.x;
  const dz = z - pose.z;
  const cos = Math.cos(pose.rotationY);
  const sin = Math.sin(pose.rotationY);
  const localX = dx * cos - dz * sin;
  const localZ = dx * sin + dz * cos;

  return (
    Math.abs(localX) < COUNTRY_WEST_ROADBLOCK_WIDTH / 2 + COUNTRY_WEST_ROADBLOCK_COLLISION_PADDING &&
    Math.abs(localZ) < COUNTRY_WEST_ROADBLOCK_DEPTH / 2 + COUNTRY_WEST_ROADBLOCK_COLLISION_PADDING
  );
}

export function isOutsideWestRuralTravelCorridor(x: number, z: number) {
  if (x > WEST_BRIDGE_WEST_X - 0.35) return false;

  const onFarTrail =
    x <= WEST_FAR_TRAIL_START_X + WEST_RURAL_CORRIDOR_PADDING &&
    x >= WEST_FAR_TRAIL_END_X - WEST_RURAL_CORRIDOR_PADDING &&
    Math.abs(z - WEST_EXIT_Z) <= WEST_FAR_TRAIL_WIDTH / 2 + WEST_RURAL_CORRIDOR_PADDING;
  if (onFarTrail) return false;

  const roadCurve = getCountryWestRoadCurve();
  let roadDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i <= COUNTRY_WEST_ROAD_SAMPLE_COUNT; i += 1) {
    const point = roadCurve.getPoint(i / COUNTRY_WEST_ROAD_SAMPLE_COUNT);
    roadDistance = Math.min(roadDistance, Math.hypot(x - point.x, z - point.z));
  }
  if (roadDistance <= COUNTRY_WEST_ROAD_WIDTH / 2 + WEST_RURAL_CORRIDOR_PADDING) return false;

  const [driveStartX, driveStartZ] = COUNTRY_WEST_DRIVEWAY_START;
  const [driveEndX, driveEndZ] = COUNTRY_WEST_DRIVEWAY_END;
  const drivewayDistance = distanceToSegment(x, z, driveStartX, driveStartZ, driveEndX, driveEndZ);
  if (drivewayDistance <= COUNTRY_WEST_DRIVEWAY_WIDTH / 2 + WEST_RURAL_CORRIDOR_PADDING) return false;

  return true;
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
  return Math.abs(z - WEST_EXIT_Z) > WEST_BRIDGE_WALK_HALF_WIDTH;
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
