import { Text } from "@react-three/drei";

export default function InteriorOfferBoard() {
  return (
    <group position={[0, 2.65, -5.84]}>
      <mesh>
        <boxGeometry args={[5.6, 2.5, 0.14]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <Text position={[0, 0.68, 0.09]} fontSize={0.24} anchorX="center" anchorY="middle" color="#111827">
        0.1 SOL worth of $LOOGANS
      </Text>
      <Text position={[0, 0.18, 0.09]} fontSize={0.22} anchorX="center" anchorY="middle" color="#111827">
        Connect Phantom wallet to:
      </Text>
      <Text position={[0, -0.32, 0.09]} fontSize={0.26} anchorX="center" anchorY="middle" color="#15803d">
        $Buy Scalp
      </Text>
      <Text position={[0, -0.84, 0.09]} fontSize={0.26} anchorX="center" anchorY="middle" color="#b91c1c">
        Refund
      </Text>
    </group>
  );
}
