"use client";

import dynamic from "next/dynamic";
import BuildingPanel from "@/components/ui/BuildingPanel";
import TopHud from "@/components/ui/TopHud";
import ModeFade from "@/components/ui/ModeFade";
import TitleChrome from "@/components/ui/TitleChrome";
import ControlsLegend from "@/components/ui/ControlsLegend";
import ProximityPrompt from "@/components/ui/ProximityPrompt";

const TownCanvas = dynamic(() => import("@/components/scene/TownCanvas"), {
  ssr: false,
});

export default function HomePage() {
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
