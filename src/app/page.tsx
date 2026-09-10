"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { townData } from "@/data/town";
import { enterInterior } from "@/lib/enterInterior";
import { findNearestProperty } from "@/lib/proximity";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";
import BuildingPanel from "@/components/ui/BuildingPanel";
import TopHud from "@/components/ui/TopHud";
import ModeFade from "@/components/ui/ModeFade";
import TitleChrome from "@/components/ui/TitleChrome";
import ControlsLegend from "@/components/ui/ControlsLegend";
import ProximityPrompt from "@/components/ui/ProximityPrompt";
import TownDirectory from "@/components/ui/TownDirectory";

const TownCanvas = dynamic(() => import("@/components/scene/TownCanvas"), {
  ssr: false,
});

const InteriorCanvas = dynamic(() => import("@/components/interior/InteriorCanvas"), {
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
      if (mode !== "street" || (event.code !== "KeyE" && event.code !== "KeyF")) return;

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
        [...townData.buildings, ...townData.lots.filter((lot) => !isSouthTreeLotId(lot.id))],
        PROXIMITY_RANGE,
      );

      if (!nearest) return;

      if (event.code === "KeyF") {
        enterInterior(nearest.id);
        return;
      }

      setSelectedId(selectedId === nearest.id ? null : nearest.id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, playerPosition, selectedId, setSelectedId]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950">
      {mode === "interior" ? <InteriorCanvas /> : <TownCanvas />}
      <TitleChrome />
      <TopHud />
      {mode !== "interior" ? <TownDirectory /> : null}
      <ControlsLegend />
      <ProximityPrompt />
      {mode !== "interior" ? <BuildingPanel /> : null}
      <ModeFade />
    </main>
  );
}
