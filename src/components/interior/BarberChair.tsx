type BarberChairProps = {
  position: [number, number, number];
};

export default function BarberChair({ position }: BarberChairProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.9]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      <mesh position={[0, 1.15, 0.34]}>
        <boxGeometry args={[0.9, 0.9, 0.18]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
      <mesh position={[0, 0.3, -0.55]}>
        <boxGeometry args={[0.75, 0.12, 0.5]} />
        <meshStandardMaterial color="#71717a" />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}
