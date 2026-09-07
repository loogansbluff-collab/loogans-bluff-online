import { Text } from "@react-three/drei";

type InteriorSignProps = {
  text: string;
  position: [number, number, number];
};

export default function InteriorSign({ text, position }: InteriorSignProps) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[3.6, 0.9, 0.14]} />
        <meshStandardMaterial color="#7f1d1d" />
      </mesh>
      <Text position={[0, 0, 0.09]} fontSize={0.42} anchorX="center" anchorY="middle" color="#f8fafc">
        {text}
      </Text>
    </group>
  );
}
