export const TRADABLE_USD_CENTS = {
  "LB-ACCOUNTANT-001": 400,
  "LB-APPLIANCE-001": 550,
  "LB-ARCADE-001": 550,
  "LB-AUTOPARTS-001": 400,
  "LB-BAKERY-001": 350,
  "LB-BARBER-001": 100,
  "LB-BARN-001": 450,
  "LB-BINGO-001": 400,
  "LB-HOME-001": 100,
} as const;

export type TradableAssetId = keyof typeof TRADABLE_USD_CENTS;

export function isTradableAssetId(id: string): id is TradableAssetId {
  return Object.prototype.hasOwnProperty.call(TRADABLE_USD_CENTS, id);
}

export function usdCentsForAsset(id: string): number | null {
  return isTradableAssetId(id) ? TRADABLE_USD_CENTS[id] : null;
}
