"use client";

import { Text } from "@react-three/drei";

export default function InteriorOfferBoard() {
  return (
    <group position={[0, 1.9, -5.84]}>
      <mesh>
        <boxGeometry args={[6.2, 2.2, 0.14]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <Text position={[0, 0.55, 0.09]} fontSize={0.3} anchorX="center" anchorY="middle" color="#111827">
        OWN BARBERSHOP
      </Text>
      <Text position={[0, 0, 0.09]} fontSize={0.24} anchorX="center" anchorY="middle" color="#111827">
        $1.00 USD worth of $LOOGANS
      </Text>
      <Text position={[0, -0.55, 0.09]} fontSize={0.2} anchorX="center" anchorY="middle" color="#15803d">
        BUY/SELL THIS ASSET FROM YOUR LB ACCOUNT
      </Text>
    </group>
  );
}
