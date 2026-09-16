export const TRADABLE_USD_CENTS = {
  "LB-ACCOUNTANT-001": 400,
  "LB-APPLIANCE-001": 550,
  "LB-ARCADE-001": 550,
  "LB-AUTOPARTS-001": 400,
  "LB-BAKERY-001": 350,
  "LB-BARBER-001": 100,
  "LB-BARN-001": 450,
  "LB-BINGO-001": 400,
  "LB-BOWLING-001": 700,
  "LB-BUILDSUPPLY-001": 700,
  "LB-BURGER-001": 150,
  "LB-BUSDEPOT-001": 600,
  "LB-BUTCHER-001": 700,
  "LB-CARWASH-001": 600,
  "LB-CHICKEN-001": 500,
  "LB-CHINESE-001": 450,
  "LB-CLOTHING-001": 200,
  "LB-COFFEE-001": 500,
  "LB-DENTIST-001": 150,
  "LB-DONUTS-001": 150,
  "LB-HOME-001": 100,
  "LB-HOME-003": 100,
  "LB-REPAIR-001": 500,
} as const;

export type TradableAssetId = keyof typeof TRADABLE_USD_CENTS;

export function isTradableAssetId(id: string): id is TradableAssetId {
  return Object.prototype.hasOwnProperty.call(TRADABLE_USD_CENTS, id);
}

export function usdCentsForAsset(id: string): number | null {
  return isTradableAssetId(id) ? TRADABLE_USD_CENTS[id] : null;
}
