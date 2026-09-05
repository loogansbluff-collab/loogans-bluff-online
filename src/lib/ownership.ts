import { townData } from "@/data/town";

export type OwnershipInfo = {
  propertyId: string;
  owner: string | null;
  canBuy: false;
  label: string;
  detail: string;
};

export function getOwnership(propertyId: string): OwnershipInfo {
  const isLot = townData.lots.some((lot) => lot.id === propertyId);

  return {
    propertyId,
    owner: null,
    canBuy: false,
    label: "Unowned",
    detail: isLot
      ? "For sale later through the Loogans Bluff Government."
      : "Ownership coming soon.",
  };
}
