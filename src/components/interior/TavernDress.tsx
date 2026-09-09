"use client";

import { Text } from "@react-three/drei";

function WallStool({
  x,
  z,
  tilt = 0,
}: {
  x: number;
  z: number;
  tilt?: number;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, 0, tilt]}>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.16, 16]} />
        <meshStandardMaterial color="#4a2d1c" />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.7, 10]} />
        <meshStandardMaterial color="#2f241f" />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.032, 8, 20]} />
        <meshStandardMaterial color="#3b3029" />
      </mesh>
    </group>
  );
}

function WallTable({
  side,
  z,
  tilt = 0,
}: {
  side: -1 | 1;
  z: number;
  tilt?: number;
}) {
  const x = side * 4.45;
  const stoolX = side * 3.72;

  return (
    <>
      <group position={[x, 0, z]} rotation={[0, 0, tilt]}>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[0.82, 0.14, 2.25]} />
          <meshStandardMaterial color="#50311f" />
        </mesh>
        <mesh position={[0, 0.5, -0.78]}>
          <boxGeometry args={[0.13, 0.98, 0.13]} />
          <meshStandardMaterial color="#34261f" />
        </mesh>
        <mesh position={[0, 0.5, 0.78]}>
          <boxGeometry args={[0.13, 0.98, 0.13]} />
          <meshStandardMaterial color="#34261f" />
        </mesh>
      </group>
      <WallStool x={stoolX} z={z - 0.62} tilt={side * -0.035} />
      <WallStool x={stoolX} z={z + 0.62} tilt={side * 0.045} />
    </>
  );
}

function Bottle({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  return (
    <group position={[x, y, -5.42]}>
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

function BackBottleShelf({ side }: { side: -1 | 1 }) {
  const x = side * 4.05;
  const bottleXs = side < 0 ? [-4.45, -4.05, -3.65] : [3.65, 4.05, 4.45];
  const colors = ["#6b3f1d", "#355e3b", "#8a5a2b"];

  return (
    <>
      <mesh position={[x, 1.25, -5.48]}>
        <boxGeometry args={[1.35, 0.14, 0.36]} />
        <meshStandardMaterial color="#4b3022" />
      </mesh>
      <mesh position={[x, 2.05, -5.48]}>
        <boxGeometry args={[1.35, 0.14, 0.36]} />
        <meshStandardMaterial color="#4b3022" />
      </mesh>
      {bottleXs.map((bottleX, index) => (
        <Bottle
          key={`${side}-${bottleX}-low`}
          x={bottleX}
          y={1.3}
          color={colors[index]}
        />
      ))}
      {bottleXs.map((bottleX, index) => (
        <Bottle
          key={`${side}-${bottleX}-high`}
          x={bottleX}
          y={2.1}
          color={colors[(index + 1) % colors.length]}
        />
      ))}
    </>
  );
}

function Chandelier({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 3.7, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
        <meshStandardMaterial color="#2b211b" />
      </mesh>
      <mesh position={[0, 3.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.055, 10, 28]} />
        <meshStandardMaterial color="#3b2b21" />
      </mesh>
      {[-0.38, 0, 0.38].map((x) => (
        <mesh key={x} position={[x, 3.26, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color="#f6d59a"
            emissive="#d79a52"
            emissiveIntensity={0.65}
          />
        </mesh>
      ))}
      <pointLight
        position={[0, 3.18, 0]}
        intensity={0.48}
        distance={8}
        color="#d9a066"
      />
    </group>
  );
}

export default function TavernDress() {
  return (
    <>
      <group position={[0, 2.2, -5.82]}>
        <mesh>
          <boxGeometry args={[6.6, 3.2, 0.14]} />
          <meshStandardMaterial color="#3a241a" />
        </mesh>
        <Text
          position={[0, 0.92, 0.09]}
          fontSize={0.36}
          maxWidth={5.9}
          lineHeight={1.2}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#f8fafc"
        >
          {"ALGOHOLICS WELCOME\nNO VOMITING ALLOWED"}
        </Text>
        <Text
          position={[0, -0.08, 0.09]}
          fontSize={0.24}
          maxWidth={5.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#f8fafc"
        >
          0.1 SOL worth of $LOOGANS
        </Text>
        <Text
          position={[0, -0.5, 0.09]}
          fontSize={0.22}
          maxWidth={5.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#f8fafc"
        >
          Connect Phantom wallet to:
        </Text>
        <Text
          position={[0, -0.98, 0.09]}
          fontSize={0.36}
          maxWidth={5.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#22c55e"
        >
          $Buy a Round
        </Text>
        <Text
          position={[0, -1.38, 0.09]}
          fontSize={0.36}
          maxWidth={5.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#ef4444"
        >
          Refund
        </Text>
      </group>

      <BackBottleShelf side={-1} />
      <BackBottleShelf side={1} />

      <WallTable side={-1} z={-2.55} tilt={-0.018} />
      <WallTable side={-1} z={0.35} tilt={0.015} />
      <WallTable side={1} z={-2.55} tilt={0.02} />
      <WallTable side={1} z={0.35} tilt={-0.014} />

      <Chandelier z={1.25} />
      <Chandelier z={-1.15} />
      <Chandelier z={-3.45} />
    </>
  );
}
