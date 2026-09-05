"use client";

import dynamic from "next/dynamic";
import BuildingPanel from "@/components/ui/BuildingPanel";
import TopHud from "@/components/ui/TopHud";
import ModeFade from "@/components/ui/ModeFade";

const TownCanvas = dynamic(() => import("@/components/scene/TownCanvas"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950">
      <TownCanvas />
      <TopHud />
      <BuildingPanel />
      <ModeFade />
    </main>
  );
}
