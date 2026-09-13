type Props = {
  position: [number, number, number];
  rotationY: number;
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

export default function WallSconce({
  position,
  rotationY,
  emissiveColor,
  lightColor,
  intensity,
  distance,
}: Props) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[0.5, 0.72, 0.12]} />
        <meshStandardMaterial color="#3b342f" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.02, 0.12]}>
        <boxGeometry args={[0.3, 0.44, 0.1]} />
        <meshStandardMaterial color="#fff3d8" emissive={emissiveColor} emissiveIntensity={2.4} roughness={0.32} />
      </mesh>
      <pointLight position={[0, 0, 0.42]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
