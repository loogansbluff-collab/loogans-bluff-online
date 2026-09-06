export const SOUTH_TREE_LOT_IDS = new Set([
  "LB-LOT-001",
  "LB-LOT-002",
  "LB-LOT-003",
  "LB-LOT-004",
  "LB-LOT-005",
  "LB-LOT-006",
  "LB-LOT-007",
  "LB-LOT-008",
]);

export function isSouthTreeLotId(id: string) {
  return SOUTH_TREE_LOT_IDS.has(id);
}
