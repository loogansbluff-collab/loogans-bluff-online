"use client";

import type { BuildingData, Vec3 } from "@/data/town";

type WallFinishProps = {
  building: BuildingData;
};

type SkinBoxProps = {
  position: Vec3;
  size: Vec3;
  color: string;
};

const SKIN_OFFSET = 0.03;
const SKIN_DEPTH = 0.035;

function SkinBox({ position, size, color }: SkinBoxProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function SouthSkin({ width, height, depth, color }: { width: number; height: number; depth: number; color: string }) {
  return <SkinBox position={[0, height / 2, -depth / 2 - SKIN_OFFSET]} size={[width, height, SKIN_DEPTH]} color={color} />;
}

function SideSkins({ width, height, depth, color }: { width: number; height: number; depth: number; color: string }) {
  return (
    <>
      <SkinBox position={[-width / 2 - SKIN_OFFSET, height / 2, 0]} size={[SKIN_DEPTH, height, depth]} color={color} />
      <SkinBox position={[width / 2 + SKIN_OFFSET, height / 2, 0]} size={[SKIN_DEPTH, height, depth]} color={color} />
    </>
  );
}

export default function WallFinish({ building }: WallFinishProps) {
  const [width, height, depth] = building.size;
  const frontZ = -depth / 2 - SKIN_OFFSET - 0.02;
  const leftX = -width / 2 - SKIN_OFFSET - 0.02;
  const rightX = width / 2 + SKIN_OFFSET + 0.02;

  if (building.id === "LB-BARBER-001") {
    const bands = Array.from({ length: Math.max(4, Math.floor(height / 0.55)) }, (_, i) => 0.45 + i * 0.55).filter((y) => y < height - 0.2);
    return (
      <group>
        <SouthSkin width={width} height={height} depth={depth} color="#ddd2b9" />
        <SideSkins width={width} height={height} depth={depth} color="#ddd2b9" />
        {bands.map((y) => (
          <group key={y}>
            <SkinBox position={[0, y, frontZ]} size={[width, 0.045, 0.025]} color="#b9ae96" />
            <SkinBox position={[leftX, y, 0]} size={[0.025, 0.045, depth]} color="#b9ae96" />
            <SkinBox position={[rightX, y, 0]} size={[0.025, 0.045, depth]} color="#b9ae96" />
          </group>
        ))}
      </group>
    );
  }

  if (building.id === "LB-LIQUOR-001") {
    const frontSlats = Array.from({ length: 12 }, (_, i) => -width / 2 + 0.3 + i * ((width - 0.6) / 11));
    const sideSlats = Array.from({ length: 9 }, (_, i) => -depth / 2 + 0.3 + i * ((depth - 0.6) / 8));
    return (
      <group>
        <SouthSkin width={width} height={height} depth={depth} color="#3d2530" />
        <SideSkins width={width} height={height} depth={depth} color="#3d2530" />
        {frontSlats.map((x) => <SkinBox key={`f-${x}`} position={[x, height / 2, frontZ]} size={[0.07, height, 0.025]} color="#26171d" />)}
        {sideSlats.flatMap((z) => [
          <SkinBox key={`l-${z}`} position={[leftX, height / 2, z]} size={[0.025, height, 0.07]} color="#26171d" />,
          <SkinBox key={`r-${z}`} position={[rightX, height / 2, z]} size={[0.025, height, 0.07]} color="#26171d" />,
        ])}
      </group>
    );
  }

  if (building.id === "LB-HARDWARE-001") {
    const boards = Array.from({ length: 7 }, (_, i) => 0.38 + i * 0.72).filter((y) => y < height - 0.1);
    return (
      <group>
        <SouthSkin width={width} height={height} depth={depth} color="#786b59" />
        <SideSkins width={width} height={height} depth={depth} color="#786b59" />
        {boards.map((y, i) => (
          <group key={y}>
            <SkinBox position={[0, y, frontZ]} size={[width, 0.055, 0.025]} color={i % 2 === 0 ? "#564d42" : "#665c4e"} />
            <SkinBox position={[leftX, y, 0]} size={[0.025, 0.055, depth]} color={i % 2 === 0 ? "#564d42" : "#665c4e"} />
            <SkinBox position={[rightX, y, 0]} size={[0.025, 0.055, depth]} color={i % 2 === 0 ? "#564d42" : "#665c4e"} />
          </group>
        ))}
      </group>
    );
  }

  if (building.id === "LB-GAS-001") {
    const panelX = [-width * 0.32, 0, width * 0.32];
    const panelZ = [-depth * 0.3, 0, depth * 0.3];
    return (
      <group>
        <SouthSkin width={width} height={height} depth={depth} color="#2b7772" />
        <SideSkins width={width} height={height} depth={depth} color="#2b7772" />
        {panelX.map((x) => <SkinBox key={x} position={[x, height / 2, frontZ]} size={[0.045, height, 0.025]} color="#1f5e5b" />)}
        {panelZ.flatMap((z) => [
          <SkinBox key={`l-${z}`} position={[leftX, height / 2, z]} size={[0.025, height, 0.045]} color="#1f5e5b" />,
          <SkinBox key={`r-${z}`} position={[rightX, height / 2, z]} size={[0.025, height, 0.045]} color="#1f5e5b" />,
        ])}
        <SkinBox position={[0, height - 0.45, frontZ]} size={[width, 0.09, 0.03]} color="#b7b7a9" />
      </group>
    );
  }

  if (building.id === "LB-TAVERN-001") {
    const rows = Array.from({ length: 8 }, (_, i) => 0.35 + i * 0.55).filter((y) => y < height - 0.15);
    const frontXs = [-width * 0.36, -width * 0.12, width * 0.12, width * 0.36];
    const sideZs = [-depth * 0.3, -depth * 0.1, depth * 0.1, depth * 0.3];
    return (
      <group>
        <SouthSkin width={width} height={height} depth={depth} color="#8b4937" />
        <SideSkins width={width} height={height} depth={depth} color="#8b4937" />
        {rows.map((y, row) => (
          <group key={y}>
            {frontXs.map((x, i) => <SkinBox key={`${row}-${i}`} position={[x + (row % 2 ? width * 0.06 : 0), y, frontZ]} size={[width * 0.16, 0.16, 0.025]} color="#653428" />)}
            {sideZs.map((z, i) => (
              <group key={`${row}-s-${i}`}>
                <SkinBox position={[leftX, y, z + (row % 2 ? depth * 0.05 : 0)]} size={[0.025, 0.16, depth * 0.14]} color="#653428" />
                <SkinBox position={[rightX, y, z + (row % 2 ? depth * 0.05 : 0)]} size={[0.025, 0.16, depth * 0.14]} color="#653428" />
              </group>
            ))}
          </group>
        ))}
      </group>
    );
  }

  if (building.id === "LB-REPAIR-001") {
    const frontStrips = Array.from({ length: 14 }, (_, i) => -width / 2 + 0.22 + i * ((width - 0.44) / 13));
    const sideStrips = Array.from({ length: 10 }, (_, i) => -depth / 2 + 0.22 + i * ((depth - 0.44) / 9));
    return (
      <group>
        <SouthSkin width={width} height={height} depth={depth} color="#77818a" />
        <SideSkins width={width} height={height} depth={depth} color="#77818a" />
        {frontStrips.map((x) => <SkinBox key={`f-${x}`} position={[x, height / 2, frontZ]} size={[0.035, height, 0.03]} color="#4f5963" />)}
        {sideStrips.flatMap((z) => [
          <SkinBox key={`l-${z}`} position={[leftX, height / 2, z]} size={[0.03, height, 0.035]} color="#4f5963" />,
          <SkinBox key={`r-${z}`} position={[rightX, height / 2, z]} size={[0.03, height, 0.035]} color="#4f5963" />,
        ])}
      </group>
    );
  }

  return null;
}
