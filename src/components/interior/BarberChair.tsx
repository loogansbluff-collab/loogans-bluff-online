type BarberChairProps = {
  position: [number, number, number];
  rotationY?: number;
};

export default function BarberChair({ position, rotationY = 0 }: BarberChairProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.9, 0.2, 1.05]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      <mesh position={[0, 1.15, 0.42]}>
        <boxGeometry args={[0.9, 0.9, 0.18]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
      <mesh position={[0, 0.3, -0.68]}>
        <boxGeometry args={[0.72, 0.12, 0.5]} />
        <meshStandardMaterial color="#71717a" />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.7, 0.14, 0.7]} />
        <meshStandardMaterial color="#52525b" />
      </mesh>
    </group>
  );
}
