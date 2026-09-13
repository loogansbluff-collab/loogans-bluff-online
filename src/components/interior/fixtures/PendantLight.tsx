type Props = {
  position: [number, number, number];
  shadeRadius: number;
  shadeHeight: number;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

const CEILING_Y = 4.05;

export default function PendantLight({
  position,
  shadeRadius,
  shadeHeight,
  emissiveColor,
  lightColor,
  intensity,
  distance,
}: Props) {
  const cordLength = Math.max(0.12, CEILING_Y - position[1] - shadeHeight / 2);

  return (
    <group position={position}>
      <mesh position={[0, shadeHeight / 2 + cordLength / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, cordLength, 8]} />
        <meshStandardMaterial color="#2f3135" roughness={0.85} />
      </mesh>
      <mesh rotation={[0, 0, 0]}>
        <coneGeometry args={[shadeRadius, shadeHeight, 24, 1, true]} />
        <meshStandardMaterial color="#343434" roughness={0.72} side={2} />
      </mesh>
      <mesh position={[0, -shadeHeight * 0.28, 0]}>
        <sphereGeometry args={[Math.min(0.18, shadeRadius * 0.42), 16, 12]} />
        <meshStandardMaterial color="#fffaf0" emissive={emissiveColor} emissiveIntensity={2.8} roughness={0.25} />
      </mesh>
      <pointLight position={[0, -shadeHeight * 0.55, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
