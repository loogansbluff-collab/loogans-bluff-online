type Props = {
  position: [number, number, number];
  emissiveColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

const CEILING_Y = 4.05;

export default function Chandelier({ position, emissiveColor, lightColor, intensity, distance }: Props) {
  const stemLength = Math.max(0.3, CEILING_Y - position[1] - 0.34);
  const arm = 0.9;
  const bulbs: Array<[number, number, number]> = [
    [-arm, -0.18, 0],
    [arm, -0.18, 0],
    [0, -0.18, -arm],
    [0, -0.18, arm],
  ];

  return (
    <group position={position}>
      <mesh position={[0, 0.34 + stemLength / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, stemLength, 12]} />
        <meshBasicMaterial color="#5a432c" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.13, 0.13, 0.62, 14]} />
        <meshBasicMaterial color="#755633" />
      </mesh>
      {bulbs.map(([x, y, z], index) => (
        <group key={index} position={[x, y, z]}>
          <mesh position={[-x / 2, 0.07, -z / 2]}>
            <boxGeometry args={[Math.abs(x) > 0 ? 0.96 : 0.1, 0.1, Math.abs(z) > 0 ? 0.96 : 0.1]} />
            <meshBasicMaterial color="#6b4d2e" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.2, 18, 14]} />
            <meshBasicMaterial color={emissiveColor} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, -0.42, 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
