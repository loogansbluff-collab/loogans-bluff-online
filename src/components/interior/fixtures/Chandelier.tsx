type Props = {
  position: [number, number, number];
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

const CEILING_Y = 4.05;

export default function Chandelier({ position, emissiveColor, lightColor, intensity, distance }: Props) {
  const stemLength = Math.max(0.2, CEILING_Y - position[1] - 0.28);
  const bulbs: Array<[number, number, number]> = [
    [-0.62, -0.12, 0],
    [0.62, -0.12, 0],
    [0, -0.12, -0.62],
    [0, -0.12, 0.62],
  ];

  return (
    <group position={position}>
      <mesh position={[0, 0.28 + stemLength / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, stemLength, 10]} />
        <meshStandardMaterial color="#4a3927" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.5, 12]} />
        <meshStandardMaterial color="#6b4d2e" metalness={0.4} roughness={0.48} />
      </mesh>
      {bulbs.map(([x, y, z], index) => (
        <group key={index} position={[x, y, z]}>
          <mesh position={[-x / 2, 0.05, -z / 2]} rotation={[0, 0, z === 0 ? (x > 0 ? -0.18 : 0.18) : 0]}>
            <boxGeometry args={[Math.abs(x) > 0 ? 0.7 : 0.08, 0.08, Math.abs(z) > 0 ? 0.7 : 0.08]} />
            <meshStandardMaterial color="#5a422a" metalness={0.35} roughness={0.55} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshStandardMaterial color="#fff4d6" emissive={emissiveColor} emissiveIntensity={2.7} roughness={0.25} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, -0.32, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
