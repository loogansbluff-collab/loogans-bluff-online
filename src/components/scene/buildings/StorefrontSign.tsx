"use client";

import { Text } from "@react-three/drei";

export default function StorefrontSign({
  text,
  width,
  boardColor = "#1f2937",
  textColor = "#f8fafc",
}: {
  text: string;
  width: number;
  boardColor?: string;
  textColor?: string;
}) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[width, 0.75, 0.16]} />
        <meshStandardMaterial color={boardColor} />
      </mesh>
      <Text
        position={[0, 0, -0.095]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.34}
        maxWidth={Math.max(1, width - 0.35)}
        anchorX="center"
        anchorY="middle"
        color={textColor}
      >
        {text}
      </Text>
    </group>
  );
}
