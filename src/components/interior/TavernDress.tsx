"use client";

import { Text } from "@react-three/drei";

function TavernStool({ x, tilt = 0 }: { x: number; tilt?: number }) {
  return (
    <group position={[x, 0, -2.45]} rotation={[0, 0, tilt]}>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.34, 0.38, 0.18, 16]} />
        <meshStandardMaterial color="#4a2d1c" />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.72, 10]} />
        <meshStandardMaterial color="#2f241f" />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.035, 8, 20]} />
        <meshStandardMaterial color="#3b3029" />
      </mesh>
    </group>
  );
}

function Bottle({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <group position={[x, y, -5.32]}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.38, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.18, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default function TavernDress() {
  const bottles = [
    [-2.55, 1.18, "#6b3f1d"],
    [-2.2, 1.18, "#355e3b"],
    [-1.85, 1.18, "#8a5a2b"],
    [-1.45, 1.18, "#3d5a40"],
    [-1.05, 1.18, "#7a3e20"],
    [1.05, 1.18, "#355e3b"],
    [1.45, 1.18, "#8a5a2b"],
    [1.85, 1.18, "#6b3f1d"],
    [2.2, 1.18, "#3d5a40"],
    [2.55, 1.18, "#7a3e20"],
    [-2.4, 1.92, "#8a5a2b"],
    [-1.95, 1.92, "#355e3b"],
    [-1.5, 1.92, "#6b3f1d"],
    [1.5, 1.92, "#7a3e20"],
    [1.95, 1.92, "#3d5a40"],
    [2.4, 1.92, "#8a5a2b"],
  ] as const;

  return (
    <>
      <pointLight position={[0, 3.4, -1.4]} intensity={0.8} distance={15} color="#d9a066" />

      <group position={[0, 2.2, -5.82]}>
        <mesh>
          <boxGeometry args={[6.6, 3.2, 0.14]} />
          <meshStandardMaterial color="#3a241a" />
        </mesh>
        <Text position={[0, 0.92, 0.09]} fontSize={0.36} maxWidth={5.9} lineHeight={1.2} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          {"ALGOHOLICS WELCOME\nNO VOMITING ALLOWED"}
        </Text>
        <Text position={[0, -0.08, 0.09]} fontSize={0.24} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          0.1 SOL worth of $LOOGANS
        </Text>
        <Text position={[0, -0.5, 0.09]} fontSize={0.22} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#f8fafc">
          Connect Phantom wallet to:
        </Text>
        <Text position={[0, -0.98, 0.09]} fontSize={0.36} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#22c55e">
          $Buy a Round
        </Text>
        <Text position={[0, -1.38, 0.09]} fontSize={0.36} maxWidth={5.9} textAlign="center" anchorX="center" anchorY="middle" color="#ef4444">
          Refund
        </Text>
      </group>

      <group position={[0, 0, -3.55]}>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[7.8, 1.12, 0.72]} />
          <meshStandardMaterial color="#5a351f" />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <boxGeometry args={[8.1, 0.16, 0.92]} />
          <meshStandardMaterial color="#3f271a" />
        </mesh>
        <mesh position={[-3.55, 0.48, 0]}>
          <boxGeometry args={[0.22, 0.96, 0.58]} />
          <meshStandardMaterial color="#34261f" />
        </mesh>
        <mesh position={[3.55, 0.48, 0]}>
          <boxGeometry args={[0.22, 0.96, 0.58]} />
          <meshStandardMaterial color="#34261f" />
        </mesh>
      </group>

      <TavernStool x={-3.0} tilt={-0.05} />
      <TavernStool x={-1.45} tilt={0.04} />
      <TavernStool x={1.45} tilt={-0.04} />
      <TavernStool x={3.0} tilt={0.07} />

      <group position={[0, 0, -5.42]}>
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[6.3, 0.16, 0.42]} />
          <meshStandardMaterial color="#4b3022" />
        </mesh>
        <mesh position={[0, 1.66, 0]}>
          <boxGeometry args={[6.3, 0.16, 0.42]} />
          <meshStandardMaterial color="#4b3022" />
        </mesh>
        <mesh position={[-3.0, 1.3, 0]}>
          <boxGeometry args={[0.14, 1.5, 0.38]} />
          <meshStandardMaterial color="#39251d" />
        </mesh>
        <mesh position={[3.0, 1.3, 0]}>
          <boxGeometry args={[0.14, 1.5, 0.38]} />
          <meshStandardMaterial color="#39251d" />
        </mesh>
      </group>

      {bottles.map(([x, y, color], index) => (
        <Bottle key={`${x}-${y}-${index}`} x={x} y={y} color={color} />
      ))}
    </>
  );
}
