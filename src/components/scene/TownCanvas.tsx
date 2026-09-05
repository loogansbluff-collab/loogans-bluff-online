"use client";

import { Canvas } from "@react-three/fiber";

export default function TownCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 20, 20], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#1b2430"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[20, 30, 10]} intensity={1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#3d5a3d" />
      </mesh>

      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c4a574" />
      </mesh>
    </Canvas>
  );
}
