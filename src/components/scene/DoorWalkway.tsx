import type { BuildingData } from "@/data/town";
import { townData } from "@/data/town";

const WALKWAY_COLOR = "#8b8d86";
const WALKWAY_WIDTH = 1.2;
const WALKWAY_HEIGHT = 0.04;

export default function DoorWalkway({ building }: { building: BuildingData }) {
  const frontRoad = townData.roads.find((road) => road.id === "LB-ROAD-EW-001");
  if (!frontRoad) return null;

  const [buildingX, , buildingZ] = building.position;
  const [, , buildingDepth] = building.size;
  const [, roadY, roadZ] = frontRoad.position;
  const [, , roadDepth] = frontRoad.size;

  const buildingSouthFace = buildingZ + buildingDepth / 2;
  const roadNorthEdge = roadZ - roadDepth / 2;
  const walkwayDepth = roadNorthEdge - buildingSouthFace;

  if (walkwayDepth <= 0) return null;

  return (
    <mesh position={[buildingX, roadY + WALKWAY_HEIGHT / 2, buildingSouthFace + walkwayDepth / 2]}>
      <boxGeometry args={[WALKWAY_WIDTH, WALKWAY_HEIGHT, walkwayDepth]} />
      <meshStandardMaterial color={WALKWAY_COLOR} />
    </mesh>
  );
}
