export type RiverSegment = {
  x: number;
  z: number;
  width: number;
  length: number;
  rotationY: number;
};

export const WEST_GROUND_MIN_X = -260;
export const WEST_GROUND_MAX_X = -198;
export const WEST_AERIAL_MIN_X = -112;
export const EAST_AERIAL_MAX_X = 36;
export const WEST_WALK_MIN_X = -259;
export const EAST_WALK_MAX_X = 197;
export const NORTH_SOUTH_WALK_LIMIT = 197;

export const WEST_RIVER_SEGMENTS: RiverSegment[] = [
  { x: -82, z: -168, width: 10, length: 82, rotationY: 0.06 },
  { x: -78, z: -92, width: 11.5, length: 76, rotationY: -0.08 },
  { x: -84, z: -20, width: 9.5, length: 74, rotationY: 0.09 },
  { x: -79, z: 52, width: 12, length: 74, rotationY: -0.07 },
  { x: -85, z: 132, width: 10.5, length: 92, rotationY: 0.05 },
];

const RIVER_COLLISION_PADDING = 0.65;

export function isInWestRiverChannel(x: number, z: number) {
  return WEST_RIVER_SEGMENTS.some((segment) => {
    const dx = x - segment.x;
    const dz = z - segment.z;
    const cos = Math.cos(-segment.rotationY);
    const sin = Math.sin(-segment.rotationY);
    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;

    return (
      Math.abs(localX) < segment.width / 2 + RIVER_COLLISION_PADDING &&
      Math.abs(localZ) < segment.length / 2 + RIVER_COLLISION_PADDING
    );
  });
}
