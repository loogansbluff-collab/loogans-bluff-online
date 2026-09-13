type Props = {
  position: [number, number, number];
  size: [number, number, number];
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export default function FluorescentPanel({ position, size, emissiveColor, lightColor, intensity, distance }: Props) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#d8dde2" emissive={emissiveColor} emissiveIntensity={2.4} roughness={0.45} />
      </mesh>
      <pointLight position={[0, -0.22, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
