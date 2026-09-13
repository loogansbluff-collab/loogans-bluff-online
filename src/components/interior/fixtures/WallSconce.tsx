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
        <boxGeometry args={[0.58, 0.82, 0.14]} />
        <meshBasicMaterial color="#4b4038" />
      </mesh>
      <mesh position={[0, 0.02, 0.24]}>
        <boxGeometry args={[0.1, 0.1, 0.34]} />
        <meshBasicMaterial color="#6a584a" />
      </mesh>
      <mesh position={[0, 0.02, 0.44]}>
        <sphereGeometry args={[0.19, 16, 12]} />
        <meshBasicMaterial color={emissiveColor} />
      </mesh>
      <pointLight position={[0, 0, 0.52]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
