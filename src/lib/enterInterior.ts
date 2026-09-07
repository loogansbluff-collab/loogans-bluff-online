"use client";

import { enterStreetInFront } from "@/lib/enterBuildingStreet";
import { useGameStore } from "@/state/gameStore";

export const INTERIOR_SHOP_IDS = new Set<string>([
  "LB-BARBER-001",
  "LB-LIQUOR-001",
  "LB-HARDWARE-001",
  "LB-GAS-001",
  "LB-TAVERN-001",
  "LB-REPAIR-001",
]);

export function isInteriorShopId(id: string) {
  return INTERIOR_SHOP_IDS.has(id);
}

export function enterInterior(id: string) {
  const state = useGameStore.getState();
  if (state.mode !== "street" || !isInteriorShopId(id)) return false;

  if (typeof document !== "undefined" && document.pointerLockElement) {
    document.exitPointerLock();
  }

  state.setSelectedId(null);
  state.setInteriorId(id);
  state.setMode("interior");
  return true;
}

export function exitInterior() {
  const state = useGameStore.getState();
  const interiorId = state.interiorId;
  if (state.mode !== "interior" || !interiorId || !isInteriorShopId(interiorId)) return false;

  state.setInteriorId(null);
  return enterStreetInFront(interiorId);
}
