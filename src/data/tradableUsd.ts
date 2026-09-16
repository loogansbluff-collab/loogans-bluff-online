export const TRADABLE_USD_CENTS = {
  "LB-BARBER-001": 100,
} as const;

export type TradableAssetId = keyof typeof TRADABLE_USD_CENTS;

export function isTradableAssetId(id: string): id is TradableAssetId {
  return Object.prototype.hasOwnProperty.call(TRADABLE_USD_CENTS, id);
}

export function usdCentsForAsset(id: string): number | null {
  return isTradableAssetId(id) ? TRADABLE_USD_CENTS[id] : null;
}
