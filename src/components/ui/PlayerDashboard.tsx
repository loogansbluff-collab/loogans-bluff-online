"use client";

import { useEffect, useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { propertyAssetCatalog } from "@/data/propertyAssetCatalog";
import { isTradableAssetId, usdCentsForAsset } from "@/data/tradableUsd";
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

type AssetQuote = {
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

function walletErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "TRADE failed";
}

function usdLabel(cents: number) {
  return `$${(cents / 100).toFixed(2)} USD`;
}

export default function PlayerDashboard({ player, onClose }: PlayerDashboardProps) {
  const [collectedAssetIds, setCollectedAssetIds] = useState(() => new Set(player.collectedAssetIds));
  const [activeQuote, setActiveQuote] = useState<AssetQuote | null>(null);
  const [quoteLoadingAssetId, setQuoteLoadingAssetId] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [tradingAssetId, setTradingAssetId] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeBackAssetId, setTradeBackAssetId] = useState<string | null>(null);
  const [tradeBackError, setTradeBackError] = useState<string | null>(null);

  const tradableAssets = propertyAssetCatalog.filter((asset) => isTradableAssetId(asset.id));
  const ownedTradableCount = tradableAssets.filter((asset) => collectedAssetIds.has(asset.id)).length;

  useEffect(() => {
    if (!activeQuote) {
      setSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((new Date(activeQuote.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(seconds);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(timer);
  }, [activeQuote]);

  const getTradeQuote = async (assetId: string) => {
    if (
      !isTradableAssetId(assetId) ||
      quoteLoadingAssetId ||
      tradingAssetId ||
      tradeBackAssetId ||
      collectedAssetIds.has(assetId)
    ) {
      return;
    }
    setQuoteLoadingAssetId(assetId);
    setQuoteError(null);
    setTradeError(null);
    setTradeBackError(null);
    setActiveQuote(null);
    try {
      const response = await fetch("/api/assets/quote", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      const payload = (await response.json().catch(() => null)) as (AssetQuote & { error?: string; message?: string }) | null;
      if (!response.ok || !payload?.quoteId || payload.assetId !== assetId) {
        throw new Error(payload?.message ?? payload?.error ?? "TRADE UNAVAILABLE");
      }
      setActiveQuote(payload);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "TRADE UNAVAILABLE");
    } finally {
      setQuoteLoadingAssetId(null);
    }
  };

  const tradeAsset = async (assetId: string) => {
    if (
      !isTradableAssetId(assetId) ||
      tradingAssetId ||
      tradeBackAssetId ||
      !activeQuote ||
      activeQuote.assetId !== assetId ||
      secondsLeft <= 0 ||
      collectedAssetIds.has(assetId)
    ) {
      return;
    }

    setTradingAssetId(assetId);
    setTradeError(null);
    setTradeBackError(null);

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
      const mint = new PublicKey(activeQuote.mint);
      const treasury = new PublicKey(activeQuote.treasuryWallet);
      const tokenProgram = new PublicKey(activeQuote.tokenProgram);
      if (!tokenProgram.equals(TOKEN_PROGRAM_ID) && !tokenProgram.equals(TOKEN_2022_PROGRAM_ID)) {
        throw new Error("Unsupported $LOOGANS token program");
      }

      const sourceAta = getAssociatedTokenAddressSync(mint, payer, false, tokenProgram);
      const treasuryAta = getAssociatedTokenAddressSync(mint, treasury, false, tokenProgram);
      const amountRaw = BigInt(activeQuote.loogansAmountRaw);
      if (amountRaw <= BigInt(0)) throw new Error("Invalid quoted $LOOGANS amount");

      const transaction = new Transaction({
        feePayer: payer,
        recentBlockhash: activeQuote.recentBlockhash,
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
          activeQuote.decimals,
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
        body: JSON.stringify({ quoteId: activeQuote.quoteId, signature: sent.signature }),
      });
      const payload = (await response.json().catch(() => null)) as TradeResponse | null;
      if (!response.ok || !payload?.collectedAssetIds || payload.assetId !== assetId) {
        throw new Error(payload?.error ?? "TRADE payment could not be verified");
      }

      setCollectedAssetIds(new Set(payload.collectedAssetIds));
      setActiveQuote(null);
      setQuoteError(null);
      setTradeError(null);
    } catch (error) {
      setTradeError(walletErrorMessage(error));
    } finally {
      setTradingAssetId(null);
    }
  };

  const tradeBackAsset = async (assetId: string) => {
    if (!isTradableAssetId(assetId) || tradeBackAssetId || !collectedAssetIds.has(assetId)) return;
    setTradeBackAssetId(assetId);
    setTradeBackError(null);
    setTradeError(null);
    try {
      const response = await fetch("/api/assets/trade-back", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      const payload = (await response.json().catch(() => null)) as TradeBackResponse | null;
      if (!response.ok || !payload?.collectedAssetIds || payload.assetId !== assetId) {
        throw new Error(payload?.error ?? "TRADE BACK failed");
      }
      setCollectedAssetIds(new Set(payload.collectedAssetIds));
      if (activeQuote?.assetId === assetId) setActiveQuote(null);
      setQuoteError(null);
      setTradeBackError(null);
    } catch (error) {
      setTradeBackError(error instanceof Error ? error.message : "TRADE BACK failed");
    } finally {
      setTradeBackAssetId(null);
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
              <p className="text-2xl font-bold text-emerald-300">{ownedTradableCount} / {tradableAssets.length}</p>
              <p className="text-xs uppercase tracking-wider text-slate-400">owned</p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/55">
            {tradableAssets.map((asset) => {
              const collected = collectedAssetIds.has(asset.id);
              const usdCents = usdCentsForAsset(asset.id);
              const quoteForAsset = activeQuote?.assetId === asset.id ? activeQuote : null;
              const quoteLive = Boolean(quoteForAsset && secondsLeft > 0);
              return (
                <div key={asset.id} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0">
                  <span aria-hidden="true" className={collected ? "text-xl text-emerald-300" : "text-xl text-slate-500"}>{collected ? "✅" : "□"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{asset.name}</p>
                    <p className="truncate text-xs text-slate-400">{asset.id}</p>
                    {!collected && quoteLive && quoteForAsset ? (
                      <div className="mt-1 text-xs">
                        <p className="font-semibold text-amber-300">{quoteForAsset.loogansAmountUi} $LOOGANS</p>
                        <p className="text-slate-400">{usdLabel(usdCents ?? 0)} quote · {secondsLeft}s left</p>
                        <p className="font-mono text-[10px] text-slate-500">Quote {quoteForAsset.quoteId}</p>
                      </div>
                    ) : null}
                    {!collected && quoteError && (quoteLoadingAssetId === asset.id || !activeQuote) ? (
                      <p className="mt-1 text-xs font-semibold text-red-300">{quoteError}</p>
                    ) : null}
                    {!collected && tradeError && (tradingAssetId === asset.id || !activeQuote || activeQuote.assetId === asset.id) ? (
                      <p className="mt-1 text-xs font-semibold text-red-300">{tradeError}</p>
                    ) : null}
                    {collected && tradeBackError ? (
                      <p className="mt-1 text-xs font-semibold text-red-300">{tradeBackError}</p>
                    ) : null}
                  </div>
                  <div className="hidden text-right text-xs text-slate-400 sm:block">
                    <p>{asset.width} × {asset.height} × {asset.depth}</p>
                    <p>Volume {asset.volume.toFixed(1)}</p>
                    {usdCents !== null ? (
                      <p className="font-semibold text-amber-300">{usdLabel(usdCents)} in $LOOGANS</p>
                    ) : null}
                  </div>
                  {collected ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">OWNED</span>
                      <button
                        type="button"
                        onClick={() => void tradeBackAsset(asset.id)}
                        disabled={tradeBackAssetId !== null}
                        className="rounded bg-amber-700 px-2 py-1 text-xs font-semibold hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60"
                      >
                        {tradeBackAssetId === asset.id ? "TRADING BACK..." : "TRADE BACK"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => void getTradeQuote(asset.id)}
                        disabled={quoteLoadingAssetId !== null || tradingAssetId !== null || tradeBackAssetId !== null}
                        className="rounded bg-amber-600 px-2 py-1 text-xs font-semibold hover:bg-amber-500 disabled:cursor-wait disabled:opacity-60"
                      >
                        {quoteLoadingAssetId === asset.id ? "QUOTING..." : quoteLive ? "REFRESH QUOTE" : "GET QUOTE"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void tradeAsset(asset.id)}
                        disabled={!quoteLive || tradingAssetId !== null || tradeBackAssetId !== null}
                        className="rounded bg-emerald-700 px-2 py-1 text-xs font-semibold hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {tradingAssetId === asset.id ? "TRADING..." : "TRADE"}
                      </button>
                    </div>
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
