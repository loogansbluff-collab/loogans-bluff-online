type Props = {
  position: [number, number, number];
  size: [number, number, number];
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export default function FluorescentPanel({ position, size, emissiveColor, lightColor, intensity, distance }: Props) {
  const housingHeight = Math.max(size[1], 0.18) + 0.12;

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[size[0] + 0.16, housingHeight, size[2] + 0.16]} />
        <meshStandardMaterial color="#343a40" roughness={0.75} />
      </mesh>
      <mesh position={[0, -(housingHeight / 2 + 0.045), 0]}>
        <boxGeometry args={[size[0], 0.09, size[2]]} />
        <meshStandardMaterial color="#f7f8fa" emissive={emissiveColor} emissiveIntensity={2.8} roughness={0.32} />
      </mesh>
      <pointLight position={[0, -(housingHeight / 2 + 0.28), 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
