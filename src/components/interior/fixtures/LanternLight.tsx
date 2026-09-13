type Props = {
  position: [number, number, number];
  radius: number;
  height: number;
  bodyColor: string;
  trimColor: string;
  lightColor: string;
  intensity: number;
  distance: number;
};

const CEILING_Y = 4.05;

export default function LanternLight({ position, radius, height, bodyColor, trimColor, lightColor, intensity, distance }: Props) {
  const visibleRadius = Math.max(radius, 0.5);
  const visibleHeight = Math.max(height, 0.82);
  const cordLength = Math.max(0.18, CEILING_Y - position[1] - visibleHeight / 2);

  return (
    <group position={position}>
      <mesh position={[0, visibleHeight / 2 + cordLength / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, cordLength, 10]} />
        <meshBasicMaterial color={trimColor} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[visibleRadius * 0.82, visibleRadius, visibleHeight, 24]} />
        <meshBasicMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, visibleHeight / 2 + 0.06, 0]}>
        <cylinderGeometry args={[visibleRadius * 0.62, visibleRadius * 0.62, 0.12, 24]} />
        <meshBasicMaterial color={trimColor} />
      </mesh>
      <mesh position={[0, -(visibleHeight / 2 + 0.06), 0]}>
        <cylinderGeometry args={[visibleRadius * 0.62, visibleRadius * 0.62, 0.12, 24]} />
        <meshBasicMaterial color={trimColor} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[visibleRadius * 0.34, 18, 14]} />
        <meshBasicMaterial color={lightColor} />
      </mesh>
      <pointLight position={[0, -(visibleHeight / 2 + 0.28), 0]} color={lightColor} intensity={intensity} distance={distance} castShadow={false} />
    </group>
  );
}
