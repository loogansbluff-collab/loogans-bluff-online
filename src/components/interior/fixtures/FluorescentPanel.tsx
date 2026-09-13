type Props = {
  position: [number, number, number];
  size: [number, number, number];
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export default function FluorescentPanel({ position, size, emissiveColor, lightColor, intensity, distance }: Props) {
  const housingHeight = Math.max(size[1], 0.18) + 0.14;

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[size[0] + 0.2, housingHeight, size[2] + 0.2]} />
        <meshBasicMaterial color="#3d4349" />
      </mesh>
      <mesh position={[0, -(housingHeight / 2 + 0.05), 0]}>
        <boxGeometry args={[size[0], 0.1, size[2]]} />
        <meshBasicMaterial color={emissiveColor} />
      </mesh>
      <pointLight position={[0, -(housingHeight / 2 + 0.32), 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
