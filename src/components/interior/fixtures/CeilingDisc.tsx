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
        <cylinderGeometry args={[radius, radius, 0.1, 28]} />
        <meshStandardMaterial color="#e5e7eb" emissive={emissiveColor} emissiveIntensity={2.2} roughness={0.5} />
      </mesh>
      <pointLight position={[0, -0.2, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
