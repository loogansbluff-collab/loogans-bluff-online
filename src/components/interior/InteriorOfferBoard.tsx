"use client";

import { Text } from "@react-three/drei";
import { useEffect, useState } from "react";

const BARBER_ASSET_ID = "LB-BARBER-001";

type PlayerResponse = {
  collectedAssetIds?: string[];
};

export default function InteriorOfferBoard() {
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    let active = true;

    const loadOwnership = async () => {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!response.ok) {
          if (active) setOwned(false);
          return;
        }

        const player = (await response.json()) as PlayerResponse;
        if (active) setOwned(player.collectedAssetIds?.includes(BARBER_ASSET_ID) ?? false);
      } catch {
        if (active) setOwned(false);
      }
    };

    void loadOwnership();
    return () => {
      active = false;
    };
  }, []);

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
      <Text
        position={[0, -0.55, 0.09]}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        color={owned ? "#b45309" : "#15803d"}
      >
        {owned ? "TRADE BACK" : "TRADE"}
      </Text>
    </group>
  );
}
