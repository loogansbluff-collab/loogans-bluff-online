"use client";

import {
  COUNTRY_WEST_DRIVEWAY_END,
  COUNTRY_WEST_DRIVEWAY_START,
  COUNTRY_WEST_DRIVEWAY_WIDTH,
  COUNTRY_WEST_HOUSE_CENTER,
  COUNTRY_WEST_HOUSE_SIZE,
} from "@/lib/westWorld";

export default function CountryWestHouse() {
  const [houseX, houseZ] = COUNTRY_WEST_HOUSE_CENTER;
  const [houseWidth, houseDepth] = COUNTRY_WEST_HOUSE_SIZE;
  const [driveStartX, driveStartZ] = COUNTRY_WEST_DRIVEWAY_START;
  const [driveEndX, driveEndZ] = COUNTRY_WEST_DRIVEWAY_END;
  const driveDx = driveEndX - driveStartX;
  const driveDz = driveEndZ - driveStartZ;
  const driveLength = Math.hypot(driveDx, driveDz);
  const driveRotation = Math.atan2(driveDx, driveDz);
  const driveCenterX = (driveStartX + driveEndX) / 2;
  const driveCenterZ = (driveStartZ + driveEndZ) / 2;

  return (
    <group>
      <mesh position={[driveCenterX, 0.03, driveCenterZ]} rotation={[0, driveRotation, 0]}>
        <boxGeometry args={[COUNTRY_WEST_DRIVEWAY_WIDTH, 0.05, driveLength]} />
        <meshStandardMaterial color="#5a4430" roughness={0.98} />
      </mesh>

      <group position={[houseX, 0, houseZ]}>
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[houseWidth, 2.9, houseDepth]} />
          <meshStandardMaterial color="#8a765d" roughness={0.96} />
        </mesh>

        <mesh position={[0, 3.3, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[5.05, 2.25, 4]} />
          <meshStandardMaterial color="#55483e" roughness={0.98} />
        </mesh>

        <mesh position={[0, 0.28, houseDepth / 2 + 0.85]}>
          <boxGeometry args={[houseWidth - 0.6, 0.22, 1.7]} />
          <meshStandardMaterial color="#66513d" roughness={0.98} />
        </mesh>

        {[-2.65, 2.65].map((x) => (
          <mesh key={x} position={[x, 1.25, houseDepth / 2 + 1.48]}>
            <boxGeometry args={[0.18, 2.5, 0.18]} />
            <meshStandardMaterial color="#5f4a37" roughness={0.98} />
          </mesh>
        ))}

        <mesh position={[0, 1.25, houseDepth / 2 + 0.03]}>
          <boxGeometry args={[1.05, 2.25, 0.12]} />
          <meshStandardMaterial color="#4c3328" roughness={0.94} />
        </mesh>

        {[-2.15, 2.15].map((x) => (
          <group key={x} position={[x, 1.62, houseDepth / 2 + 0.07]}>
            <mesh>
              <boxGeometry args={[1.25, 1.05, 0.1]} />
              <meshStandardMaterial color="#b8c2b2" emissive="#5a665c" emissiveIntensity={0.12} />
            </mesh>
            <mesh position={[0, 0, 0.07]}>
              <boxGeometry args={[0.08, 1.08, 0.05]} />
              <meshStandardMaterial color="#4e4437" />
            </mesh>
          </group>
        ))}

        <mesh position={[2.15, 4.05, -0.7]}>
          <boxGeometry args={[0.7, 2.15, 0.7]} />
          <meshStandardMaterial color="#6f5c4b" roughness={0.98} />
        </mesh>

        <mesh position={[-1.75, 0.78, houseDepth / 2 + 1.18]} rotation={[0, 0.08, 0]}>
          <boxGeometry args={[1.15, 0.12, 0.42]} />
          <meshStandardMaterial color="#725b40" roughness={0.99} />
        </mesh>
      </group>
    </group>
  );
}
