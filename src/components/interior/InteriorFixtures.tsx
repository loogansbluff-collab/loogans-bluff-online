"use client";

import CeilingDisc from "@/components/interior/fixtures/CeilingDisc";
import Chandelier from "@/components/interior/fixtures/Chandelier";
import FluorescentPanel from "@/components/interior/fixtures/FluorescentPanel";
import IndustrialCage from "@/components/interior/fixtures/IndustrialCage";
import LanternLight from "@/components/interior/fixtures/LanternLight";
import PendantLight from "@/components/interior/fixtures/PendantLight";
import WallSconce from "@/components/interior/fixtures/WallSconce";
import { INTERIOR_FIXTURE_LAYOUTS } from "@/data/interiorFixtures";
import { BATCH6_FIXTURE_LAYOUTS } from "@/data/interiorFixturesBatch6";
import { BATCH7_FIXTURE_LAYOUTS } from "@/data/interiorFixturesBatch7";
import { BATCH8_FIXTURE_LAYOUTS } from "@/data/interiorFixturesBatch8";
import { isProtectedInteriorId } from "@/data/interiorLighting";
import { useGameStore } from "@/state/gameStore";

export default function InteriorFixtures() {
  const interiorId = useGameStore((state) => state.interiorId);

  if (!interiorId || isProtectedInteriorId(interiorId)) return null;

  const fixtures = INTERIOR_FIXTURE_LAYOUTS[interiorId] ?? BATCH6_FIXTURE_LAYOUTS[interiorId] ?? BATCH7_FIXTURE_LAYOUTS[interiorId] ?? BATCH8_FIXTURE_LAYOUTS[interiorId];
  if (!fixtures) return null;

  return (
    <>
      {fixtures.map((fixture, index) => {
        const key = `${interiorId}-fixture-${index}`;

        if (fixture.kind === "fluorescent") {
          return <FluorescentPanel key={key} {...fixture} />;
        }

        if (fixture.kind === "disc") {
          return <CeilingDisc key={key} {...fixture} />;
        }

        if (fixture.kind === "industrialCage") {
          return <IndustrialCage key={key} {...fixture} />;
        }

        if (fixture.kind === "pendant") {
          return <PendantLight key={key} {...fixture} />;
        }

        if (fixture.kind === "wallSconce") {
          return <WallSconce key={key} {...fixture} />;
        }

        if (fixture.kind === "lantern") {
          return <LanternLight key={key} {...fixture} />;
        }

        return <Chandelier key={key} {...fixture} />;
      })}
    </>
  );
}
