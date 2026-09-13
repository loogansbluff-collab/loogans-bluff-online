type Props = {
  position: [number, number, number];
  radius: number;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export default function CeilingDisc({ position, radius, emissiveColor, lightColor, intensity, distance }: Props) {
  const visibleRadius = Math.max(radius, 0.55);

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[visibleRadius + 0.13, visibleRadius + 0.13, 0.22, 30]} />
        <meshBasicMaterial color="#474d54" />
      </mesh>
      <mesh position={[0, -0.145, 0]}>
        <cylinderGeometry args={[visibleRadius, visibleRadius, 0.08, 30]} />
        <meshBasicMaterial color={emissiveColor} />
      </mesh>
      <pointLight position={[0, -0.38, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
