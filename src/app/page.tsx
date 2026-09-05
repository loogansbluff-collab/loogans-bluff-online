"use client";

import dynamic from "next/dynamic";

const TownCanvas = dynamic(() => import("@/components/scene/TownCanvas"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950">
      <TownCanvas />
    </main>
  );
}
