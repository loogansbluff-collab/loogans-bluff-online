type Props = {
  position: [number, number, number];
  radius: number;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export default function CeilingDisc({ position, radius, emissiveColor, lightColor, intensity, distance }: Props) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[radius + 0.1, radius + 0.1, 0.18, 28]} />
        <meshStandardMaterial color="#3f454b" roughness={0.78} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[radius, radius, 0.07, 28]} />
        <meshStandardMaterial color="#f8f8f6" emissive={emissiveColor} emissiveIntensity={2.6} roughness={0.36} />
      </mesh>
      <pointLight position={[0, -0.32, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
