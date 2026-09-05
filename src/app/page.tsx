"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { townData } from "@/data/town";
import { findNearestProperty } from "@/lib/proximity";
import { useGameStore } from "@/state/gameStore";
import BuildingPanel from "@/components/ui/BuildingPanel";
import TopHud from "@/components/ui/TopHud";
import ModeFade from "@/components/ui/ModeFade";
import TitleChrome from "@/components/ui/TitleChrome";
import ControlsLegend from "@/components/ui/ControlsLegend";
import ProximityPrompt from "@/components/ui/ProximityPrompt";

const TownCanvas = dynamic(() => import("@/components/scene/TownCanvas"), {
  ssr: false,
});

const PROXIMITY_RANGE = 4.5;

export default function HomePage() {
  const mode = useGameStore((state) => state.mode);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const selectedId = useGameStore((state) => state.selectedId);
  const setSelectedId = useGameStore((state) => state.setSelectedId);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || mode !== "street") return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const nearest = findNearestProperty(
        playerPosition,
        [...townData.buildings, ...townData.lots],
        PROXIMITY_RANGE,
      );

      if (!nearest) return;
      setSelectedId(selectedId === nearest.id ? null : nearest.id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, playerPosition, selectedId, setSelectedId]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950">
      <TownCanvas />
      <TitleChrome />
      <TopHud />
      <ControlsLegend />
      <ProximityPrompt />
      <BuildingPanel />
      <ModeFade />
    </main>
  );
}
