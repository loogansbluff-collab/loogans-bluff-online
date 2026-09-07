type InteriorShelfProps = {
  position?: [number, number, number];
};

export default function InteriorShelf({ position = [-4.2, 1.15, -1.2] }: InteriorShelfProps) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.45, 2.3, 2.4]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[0.32, 0, 0]}>
        <boxGeometry args={[0.18, 2.1, 2.2]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
    </group>
  );
}
