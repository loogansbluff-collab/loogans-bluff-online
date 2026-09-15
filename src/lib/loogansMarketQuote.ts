const DEXSCREENER_LIQUIDITY_FLOOR_USD = 50;
const ORACLE_DISAGREEMENT_LIMIT = 0.2;
const FETCH_TIMEOUT_MS = 4000;

export type LoogansMarketQuote = {
  mint: string;
  decimals: number;
  priceUsdPerToken: string;
  priceSource: "dexscreener" | "geckoterminal";
  loogansAmountRaw: string;
  loogansAmountUi: string;
};

type PriceCandidate = {
  source: "dexscreener" | "geckoterminal";
  priceUsd: string;
  liquidityUsd: number;
};

let cachedMintDecimals: { mint: string; decimals: number } | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be configured`);
  return value;
}

function decimalStringToFraction(value: string): { numerator: bigint; denominator: bigint } {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) throw new Error("Invalid decimal price");
  const [whole, fraction = ""] = normalized.split(".");
  const denominator = BigInt(10) ** BigInt(fraction.length);
  const numerator = BigInt(`${whole}${fraction}`);
  if (numerator <= BigInt(0)) throw new Error("Price must be positive");
  return { numerator, denominator };
}

function ceilDiv(numerator: bigint, denominator: bigint) {
  return (numerator + denominator - BigInt(1)) / denominator;
}

function rawToUi(raw: bigint, decimals: number) {
  if (decimals === 0) return raw.toString();
  const base = BigInt(10) ** BigInt(decimals);
  const whole = raw / base;
  const fraction = (raw % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

async function fetchJson(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function getMintDecimals(mint: string) {
  if (cachedMintDecimals?.mint === mint) return cachedMintDecimals.decimals;
  const rpcUrl = getRequiredEnv("SOLANA_RPC_URL");
  const payload = await fetchJson(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenSupply",
      params: [mint, { commitment: "confirmed" }],
    }),
  }) as { result?: { value?: { decimals?: number } }; error?: unknown };
  const decimals = payload.result?.value?.decimals;
  if (!Number.isInteger(decimals) || decimals! < 0 || decimals! > 18) {
    throw new Error("Could not read LOOGANS mint decimals");
  }
  cachedMintDecimals = { mint, decimals: decimals! };
  return decimals!;
}

async function getDexscreenerPrice(mint: string): Promise<PriceCandidate | null> {
  try {
    const payload = await fetchJson(`https://api.dexscreener.com/latest/dex/tokens/${mint}`) as {
      pairs?: Array<{ priceUsd?: string; liquidity?: { usd?: number } }>;
    };
    const usable = (payload.pairs ?? [])
      .map((pair) => ({
        source: "dexscreener" as const,
        priceUsd: pair.priceUsd ?? "",
        liquidityUsd: Number(pair.liquidity?.usd ?? 0),
      }))
      .filter((pair) => pair.liquidityUsd >= DEXSCREENER_LIQUIDITY_FLOOR_USD && Number(pair.priceUsd) > 0)
      .sort((a, b) => b.liquidityUsd - a.liquidityUsd);
    return usable[0] ?? null;
  } catch {
    return null;
  }
}

async function getGeckoTerminalPrice(mint: string): Promise<PriceCandidate | null> {
  try {
    const payload = await fetchJson(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${mint}/pools?page=1`) as {
      data?: Array<{ attributes?: { base_token_price_usd?: string; reserve_in_usd?: string } }>;
    };
    const usable = (payload.data ?? [])
      .map((pool) => ({
        source: "geckoterminal" as const,
        priceUsd: pool.attributes?.base_token_price_usd ?? "",
        liquidityUsd: Number(pool.attributes?.reserve_in_usd ?? 0),
      }))
      .filter((pool) => pool.liquidityUsd >= DEXSCREENER_LIQUIDITY_FLOOR_USD && Number(pool.priceUsd) > 0)
      .sort((a, b) => b.liquidityUsd - a.liquidityUsd);
    return usable[0] ?? null;
  } catch {
    return null;
  }
}

function choosePrice(primary: PriceCandidate | null, fallback: PriceCandidate | null) {
  if (!primary && !fallback) throw new Error("No trustworthy LOOGANS market price is available");
  if (primary && fallback) {
    const a = Number(primary.priceUsd);
    const b = Number(fallback.priceUsd);
    const disagreement = Math.abs(a - b) / Math.min(a, b);
    if (!Number.isFinite(disagreement) || disagreement > ORACLE_DISAGREEMENT_LIMIT) {
      throw new Error("LOOGANS price sources disagree");
    }
  }
  return primary ?? fallback!;
}

export async function quoteLoogansForUsdCents(usdCents: number): Promise<LoogansMarketQuote> {
  if (!Number.isInteger(usdCents) || usdCents <= 0) throw new Error("Invalid USD quote amount");
  const mint = getRequiredEnv("LOOGANS_MINT");
  const [decimals, dexscreener, gecko] = await Promise.all([
    getMintDecimals(mint),
    getDexscreenerPrice(mint),
    getGeckoTerminalPrice(mint),
  ]);
  const selected = choosePrice(dexscreener, gecko);
  const { numerator: priceNumerator, denominator: priceDenominator } = decimalStringToFraction(selected.priceUsd);
  const tokenBase = BigInt(10) ** BigInt(decimals);
  const rawNumerator = BigInt(usdCents) * priceDenominator * tokenBase;
  const rawDenominator = BigInt(100) * priceNumerator;
  const raw = ceilDiv(rawNumerator, rawDenominator);
  if (raw <= BigInt(0)) throw new Error("Calculated LOOGANS amount is invalid");
  return {
    mint,
    decimals,
    priceUsdPerToken: selected.priceUsd,
    priceSource: selected.source,
    loogansAmountRaw: raw.toString(),
    loogansAmountUi: rawToUi(raw, decimals),
  };
}
