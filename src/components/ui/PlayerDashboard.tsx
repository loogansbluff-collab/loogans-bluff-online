"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { propertyAssetCatalog } from "@/data/propertyAssetCatalog";
import { getPhantomProvider, shortWallet } from "@/lib/phantom";

export type DashboardPlayer = {
  id: string;
  walletAddress: string;
  createdAt: string;
  propertyAssetsCollected: number;
  propertyAssetsTotal: number;
  collectedAssetIds: string[];
};

type PlayerDashboardProps = {
  player: DashboardPlayer;
  onClose: () => void;
};

type BarberQuote = {
  quoteId: string;
  assetId: string;
  usd: string;
  mint: string;
  decimals: number;
  loogansAmountRaw: string;
  loogansAmountUi: string;
  priceUsdPerToken: string;
  priceSource: string;
  createdAt: string;
  expiresAt: string;
  expiresInSeconds: number;
  treasuryWallet: string;
  tokenProgram: string;
  recentBlockhash: string;
  lastValidBlockHeight: number;
};

type TradeResponse = {
  error?: string;
  assetId?: string;
  collectedAssetIds?: string[];
  propertyAssetsCollected?: number;
};

type TradeBackResponse = {
  error?: string;
  assetId?: string;
  collectedAssetIds?: string[];
  payoutSignature?: string;
  amountRaw?: string;
};

const BARBER_ASSET_ID = "LB-BARBER-001";

function walletErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "TRADE failed";
}

export default function PlayerDashboard({ player, onClose }: PlayerDashboardProps) {
  const [collectedAssetIds, setCollectedAssetIds] = useState(() => new Set(player.collectedAssetIds));
  const [collectingAssetId, setCollectingAssetId] = useState<string | null>(null);
  const [collectError, setCollectError] = useState<string | null>(null);
  const [barberQuote, setBarberQuote] = useState<BarberQuote | null>(null);
  const [barberQuoteLoading, setBarberQuoteLoading] = useState(false);
  const [barberQuoteError, setBarberQuoteError] = useState<string | null>(null);
  const [barberSecondsLeft, setBarberSecondsLeft] = useState(0);
  const [barberTrading, setBarberTrading] = useState(false);
  const [barberTradeError, setBarberTradeError] = useState<string | null>(null);
  const [barberTradeBackLoading, setBarberTradeBackLoading] = useState(false);
  const [barberTradeBackError, setBarberTradeBackError] = useState<string | null>(null);
  const collectedCount = collectedAssetIds.size;

  const collectedIdsArray = useMemo(() => Array.from(collectedAssetIds), [collectedAssetIds]);

  useEffect(() => {
    if (!barberQuote) {
      setBarberSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((new Date(barberQuote.expiresAt).getTime() - Date.now()) / 1000));
      setBarberSecondsLeft(seconds);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(timer);
  }, [barberQuote]);

  const collectDemo = async (assetId: string) => {
    if (collectedAssetIds.has(assetId) || collectingAssetId) return;
    setCollectingAssetId(assetId);
    setCollectError(null);
    try {
      const response = await fetch("/api/assets/collect", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; collectedAssetIds?: string[] } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Could not collect Property Asset");
      setCollectedAssetIds(new Set(payload?.collectedAssetIds ?? [...collectedIdsArray, assetId]));
    } catch (error) {
      setCollectError(error instanceof Error ? error.message : "Could not collect Property Asset");
    } finally {
      setCollectingAssetId(null);
    }
  };

  const getBarberQuote = async () => {
    if (barberQuoteLoading || barberTrading || barberTradeBackLoading || collectedAssetIds.has(BARBER_ASSET_ID)) return;
    setBarberQuoteLoading(true);
    setBarberQuoteError(null);
    setBarberTradeError(null);
    setBarberTradeBackError(null);
    setBarberQuote(null);
    try {
      const response = await fetch("/api/assets/quote", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: BARBER_ASSET_ID }),
      });
      const payload = (await response.json().catch(() => null)) as (BarberQuote & { error?: string; message?: string }) | null;
      if (!response.ok || !payload?.quoteId) {
        throw new Error(payload?.message ?? payload?.error ?? "TRADE UNAVAILABLE");
      }
      setBarberQuote(payload);
    } catch (error) {
      setBarberQuoteError(error instanceof Error ? error.message : "TRADE UNAVAILABLE");
    } finally {
      setBarberQuoteLoading(false);
    }
  };

  const tradeBarbershop = async () => {
    if (
      barberTrading ||
      barberTradeBackLoading ||
      !barberQuote ||
      barberSecondsLeft <= 0 ||
      collectedAssetIds.has(BARBER_ASSET_ID)
    ) {
      return;
    }

    setBarberTrading(true);
    setBarberTradeError(null);
    setBarberTradeBackError(null);

    try {
      const provider = getPhantomProvider();
      if (!provider?.signAndSendTransaction) {
        throw new Error("Phantom transaction signing is unavailable");
      }

      const connected = provider.publicKey ?? (await provider.connect()).publicKey;
      if (connected.toString() !== player.walletAddress) {
        throw new Error("Connected Phantom wallet does not match the signed-in player");
      }

      const payer = new PublicKey(player.walletAddress);
      const mint = new PublicKey(barberQuote.mint);
      const treasury = new PublicKey(barberQuote.treasuryWallet);
      const tokenProgram = new PublicKey(barberQuote.tokenProgram);
      if (!tokenProgram.equals(TOKEN_PROGRAM_ID) && !tokenProgram.equals(TOKEN_2022_PROGRAM_ID)) {
        throw new Error("Unsupported $LOOGANS token program");
      }

      const sourceAta = getAssociatedTokenAddressSync(mint, payer, false, tokenProgram);
      const treasuryAta = getAssociatedTokenAddressSync(mint, treasury, false, tokenProgram);
      const amountRaw = BigInt(barberQuote.loogansAmountRaw);
      if (amountRaw <= BigInt(0)) throw new Error("Invalid quoted $LOOGANS amount");

      const transaction = new Transaction({
        feePayer: payer,
        recentBlockhash: barberQuote.recentBlockhash,
      });
      transaction.add(
        createAssociatedTokenAccountIdempotentInstruction(
          payer,
          treasuryAta,
          treasury,
          mint,
          tokenProgram,
        ),
      );
      transaction.add(
        createTransferCheckedInstruction(
          sourceAta,
          mint,
          treasuryAta,
          payer,
          amountRaw,
          barberQuote.decimals,
          [],
          tokenProgram,
        ),
      );

      const sent = await provider.signAndSendTransaction(transaction);
      if (!sent?.signature) throw new Error("Phantom did not return a transaction signature");

      const response = await fetch("/api/assets/trade", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: barberQuote.quoteId, signature: sent.signature }),
      });
      const payload = (await response.json().catch(() => null)) as TradeResponse | null;
      if (!response.ok || !payload?.collectedAssetIds) {
        throw new Error(payload?.error ?? "TRADE payment could not be verified");
      }

      setCollectedAssetIds(new Set(payload.collectedAssetIds));
      setBarberQuote(null);
      setBarberQuoteError(null);
      setBarberTradeError(null);
    } catch (error) {
      setBarberTradeError(walletErrorMessage(error));
    } finally {
      setBarberTrading(false);
    }
  };

  const tradeBackBarbershop = async () => {
    if (barberTradeBackLoading || !collectedAssetIds.has(BARBER_ASSET_ID)) return;
    setBarberTradeBackLoading(true);
    setBarberTradeBackError(null);
    setBarberTradeError(null);
    try {
      const response = await fetch("/api/assets/trade-back", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: BARBER_ASSET_ID }),
      });
      const payload = (await response.json().catch(() => null)) as TradeBackResponse | null;
      if (!response.ok || !payload?.collectedAssetIds) {
        throw new Error(payload?.error ?? "TRADE BACK failed");
      }
      setCollectedAssetIds(new Set(payload.collectedAssetIds));
      setBarberQuote(null);
      setBarberQuoteError(null);
      setBarberTradeBackError(null);
    } catch (error) {
      setBarberTradeBackError(error instanceof Error ? error.message : "TRADE BACK failed");
    } finally {
      setBarberTradeBackLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <section className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-emerald-400/30 bg-slate-950/95 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Player Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold">Player #{player.id}</h2>
            <p className="mt-1 font-mono text-sm text-slate-300">{shortWallet(player.walletAddress)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700">CLOSE</button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Property Assets</h3>
              <p className="mt-1 text-sm text-slate-300">Collectible assets tied to shared town locations.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-300">{collectedCount} / {propertyAssetCatalog.length}</p>
              <p className="text-xs uppercase tracking-wider text-slate-400">collected</p>
            </div>
          </div>

          {collectError ? <p className="mb-3 rounded bg-red-950/80 px-3 py-2 text-sm text-red-200">{collectError}</p> : null}

          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/55">
            {propertyAssetCatalog.map((asset) => {
              const collected = collectedAssetIds.has(asset.id);
              const isBarber = asset.id === BARBER_ASSET_ID;
              const barberQuoteLive = Boolean(barberQuote && barberSecondsLeft > 0);
              return (
                <div key={asset.id} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                  <span aria-hidden="true" className={collected ? "text-xl text-emerald-300" : "text-xl text-slate-500"}>{collected ? "✅" : "□"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{asset.name}</p>
                    <p className="truncate text-xs text-slate-400">{asset.id}</p>
                    {isBarber && !collected && barberQuoteLive && barberQuote ? (
                      <div className="mt-1 text-xs">
                        <p className="font-semibold text-amber-300">{barberQuote.loogansAmountUi} $LOOGANS</p>
                        <p className="text-slate-400">$1.00 USD quote · {barberSecondsLeft}s left</p>
                        <p className="font-mono text-[10px] text-slate-500">Quote {barberQuote.quoteId}</p>
                      </div>
                    ) : null}
                    {isBarber && !collected && barberQuoteError ? (
                      <p className="mt-1 text-xs font-semibold text-red-300">{barberQuoteError}</p>
                    ) : null}
                    {isBarber && !collected && barberTradeError ? (
                      <p className="mt-1 text-xs font-semibold text-red-300">{barberTradeError}</p>
                    ) : null}
                    {isBarber && collected && barberTradeBackError ? (
                      <p className="mt-1 text-xs font-semibold text-red-300">{barberTradeBackError}</p>
                    ) : null}
                  </div>
                  <div className="hidden text-right text-xs text-slate-400 sm:block">
                    <p>{asset.width} × {asset.height} × {asset.depth}</p>
                    <p>Volume {asset.volume.toFixed(1)}</p>
                    {isBarber ? (
                      <p className="font-semibold text-amber-300">$1.00 USD in $LOOGANS</p>
                    ) : (
                      <p className="font-semibold text-amber-300">{asset.governmentPriceSol.toFixed(2)} SOL</p>
                    )}
                  </div>
                  {collected ? (
                    isBarber ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">OWNED</span>
                        <button
                          type="button"
                          onClick={() => void tradeBackBarbershop()}
                          disabled={barberTradeBackLoading}
                          className="rounded bg-amber-700 px-2 py-1 text-xs font-semibold hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60"
                        >
                          {barberTradeBackLoading ? "TRADING BACK..." : "TRADE BACK"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Collected</span>
                    )
                  ) : isBarber ? (
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => void getBarberQuote()}
                        disabled={barberQuoteLoading || barberTrading || barberTradeBackLoading}
                        className="rounded bg-amber-600 px-2 py-1 text-xs font-semibold hover:bg-amber-500 disabled:cursor-wait disabled:opacity-60"
                      >
                        {barberQuoteLoading ? "QUOTING..." : barberQuoteLive ? "REFRESH QUOTE" : "GET QUOTE"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void tradeBarbershop()}
                        disabled={!barberQuoteLive || barberTrading || barberTradeBackLoading}
                        className="rounded bg-emerald-700 px-2 py-1 text-xs font-semibold hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {barberTrading ? "TRADING..." : "TRADE"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void collectDemo(asset.id)}
                      disabled={collectingAssetId !== null}
                      className="rounded bg-slate-700 px-2 py-1 text-xs font-semibold hover:bg-slate-600 disabled:cursor-wait disabled:opacity-60"
                    >
                      {collectingAssetId === asset.id ? "COLLECTING..." : "Collect (demo)"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <button type="button" onClick={onClose} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold hover:bg-emerald-600">BACK TO TOWN</button>
          </div>
        </div>
      </section>
    </div>
  );
}
