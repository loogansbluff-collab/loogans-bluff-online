type Props = {
  position: [number, number, number];
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

const CEILING_Y = 4.05;

export default function IndustrialCage({ position, emissiveColor, lightColor, intensity, distance }: Props) {
  const cordLength = Math.max(0.2, CEILING_Y - position[1]);

  return (
    <group position={position}>
      <mesh position={[0, cordLength / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, cordLength, 10]} />
        <meshStandardMaterial color="#2f343a" roughness={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.18, 18, 12]} />
        <meshStandardMaterial color="#f5f7fa" emissive={emissiveColor} emissiveIntensity={3} roughness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.035, 8, 24]} />
        <meshStandardMaterial color="#363b42" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.03, 8, 24]} />
        <meshStandardMaterial color="#363b42" roughness={0.8} />
      </mesh>
      <pointLight position={[0, -0.2, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
