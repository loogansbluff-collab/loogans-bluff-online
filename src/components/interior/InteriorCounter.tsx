type InteriorCounterProps = {
  position?: [number, number, number];
};

export default function InteriorCounter({ position = [0, 0.55, 1.2] }: InteriorCounterProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={[3.2, 1.1, 0.9]} />
      <meshStandardMaterial color="#7c5a3b" />
    </mesh>
  );
}
