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
  const visibleRadius = Math.max(shadeRadius, 0.7);
  const visibleHeight = Math.max(shadeHeight, 0.58);
  const cordLength = Math.max(0.18, CEILING_Y - position[1] - visibleHeight / 2);

  return (
    <group position={position}>
      <mesh position={[0, visibleHeight / 2 + cordLength / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, cordLength, 10]} />
        <meshBasicMaterial color="#2f3135" />
      </mesh>
      <mesh>
        <coneGeometry args={[visibleRadius, visibleHeight, 28, 1, true]} />
        <meshBasicMaterial color="#3f3a36" side={2} />
      </mesh>
      <mesh position={[0, -visibleHeight * 0.28, 0]}>
        <sphereGeometry args={[Math.min(0.24, visibleRadius * 0.34), 18, 14]} />
        <meshBasicMaterial color={emissiveColor} />
      </mesh>
      <pointLight position={[0, -visibleHeight * 0.58, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
