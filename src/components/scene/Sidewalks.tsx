"use client";

import { townData } from "@/data/town";

const SIDEWALK_COLOR = "#9aa3ad";
const SIDEWALK_WIDTH = 2;
const SIDEWALK_HEIGHT = 0.08;
const ROAD_HALF_WIDTH = 4;
const HALF_GROUND = townData.groundSize / 2;
const ROAD_END = HALF_GROUND - 4;
const SEGMENT_LENGTH = ROAD_END - (ROAD_HALF_WIDTH + SIDEWALK_WIDTH);
const SEGMENT_CENTER = (ROAD_END + ROAD_HALF_WIDTH + SIDEWALK_WIDTH) / 2;
const OFFSET = ROAD_HALF_WIDTH + SIDEWALK_WIDTH / 2;

const sidewalks = [
  { id: "ns-west-north", position: [-OFFSET, 0.06, -SEGMENT_CENTER] as [number, number, number], size: [SIDEWALK_WIDTH, SIDEWALK_HEIGHT, SEGMENT_LENGTH] as [number, number, number] },
  { id: "ns-west-south", position: [-OFFSET, 0.06, SEGMENT_CENTER] as [number, number, number], size: [SIDEWALK_WIDTH, SIDEWALK_HEIGHT, SEGMENT_LENGTH] as [number, number, number] },
  { id: "ns-east-north", position: [OFFSET, 0.06, -SEGMENT_CENTER] as [number, number, number], size: [SIDEWALK_WIDTH, SIDEWALK_HEIGHT, SEGMENT_LENGTH] as [number, number, number] },
  { id: "ns-east-south", position: [OFFSET, 0.06, SEGMENT_CENTER] as [number, number, number], size: [SIDEWALK_WIDTH, SIDEWALK_HEIGHT, SEGMENT_LENGTH] as [number, number, number] },
  { id: "ew-north-west", position: [-SEGMENT_CENTER, 0.06, -OFFSET] as [number, number, number], size: [SEGMENT_LENGTH, SIDEWALK_HEIGHT, SIDEWALK_WIDTH] as [number, number, number] },
  { id: "ew-north-east", position: [SEGMENT_CENTER, 0.06, -OFFSET] as [number, number, number], size: [SEGMENT_LENGTH, SIDEWALK_HEIGHT, SIDEWALK_WIDTH] as [number, number, number] },
  { id: "ew-south-west", position: [-SEGMENT_CENTER, 0.06, OFFSET] as [number, number, number], size: [SEGMENT_LENGTH, SIDEWALK_HEIGHT, SIDEWALK_WIDTH] as [number, number, number] },
  { id: "ew-south-east", position: [SEGMENT_CENTER, 0.06, OFFSET] as [number, number, number], size: [SEGMENT_LENGTH, SIDEWALK_HEIGHT, SIDEWALK_WIDTH] as [number, number, number] },
];

export default function Sidewalks() {
  return (
    <group>
      {sidewalks.map((sidewalk) => (
        <mesh key={sidewalk.id} position={sidewalk.position}>
          <boxGeometry args={sidewalk.size} />
          <meshStandardMaterial color={SIDEWALK_COLOR} />
        </mesh>
      ))}
    </group>
  );
}
