"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { townData } from "@/data/town";
import { enterInterior } from "@/lib/enterInterior";
import { findNearestProperty } from "@/lib/proximity";
import { isSouthTreeLotId } from "@/lib/southDecor";
import { useGameStore } from "@/state/gameStore";
import BuildingPanel from "@/components/ui/BuildingPanel";
import TopHud from "@/components/ui/TopHud";
import ModeFade from "@/components/ui/ModeFade";
import TitleChrome from "@/components/ui/TitleChrome";
import ControlsLegend from "@/components/ui/ControlsLegend";
import MobileControls from "@/components/ui/MobileControls";
import ProximityPrompt from "@/components/ui/ProximityPrompt";
import TownDirectory from "@/components/ui/TownDirectory";
import LegalLinks from "@/components/ui/LegalLinks";

const TownCanvas = dynamic(() => import("@/components/scene/TownCanvas"), {
  ssr: false,
});

const InteriorCanvas = dynamic(() => import("@/components/interior/InteriorCanvas"), {
  ssr: false,
});

const PROXIMITY_RANGE = 4.5;

type PhantomPublicKey = {
  toString: () => string;
};

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: PhantomPublicKey | null;
  connect: () => Promise<{ publicKey: PhantomPublicKey }>;
  disconnect: () => Promise<void>;
  on?: (event: "connect" | "disconnect" | "accountChanged", handler: (value?: PhantomPublicKey | null) => void) => void;
  off?: (event: "connect" | "disconnect" | "accountChanged", handler: (value?: PhantomPublicKey | null) => void) => void;
};

type WalletWindow = Window & {
  phantom?: { solana?: PhantomProvider };
  solana?: PhantomProvider;
};

function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const walletWindow = window as WalletWindow;
  const provider = walletWindow.phantom?.solana ?? walletWindow.solana;
  return provider?.isPhantom ? provider : null;
}

function shortWallet(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function HomePage() {
  const mode = useGameStore((state) => state.mode);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const selectedId = useGameStore((state) => state.selectedId);
  const setSelectedId = useGameStore((state) => state.setSelectedId);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    const provider = getPhantomProvider();
    if (!provider) return;

    const syncWallet = () => {
      setWalletAddress(provider.publicKey?.toString() ?? null);
    };
    const onConnect = (publicKey?: PhantomPublicKey | null) => {
      setWalletAddress(publicKey?.toString() ?? provider.publicKey?.toString() ?? null);
      setWalletError(null);
    };
    const onDisconnect = () => {
      setWalletAddress(null);
      setWalletError(null);
    };
    const onAccountChanged = (publicKey?: PhantomPublicKey | null) => {
      setWalletAddress(publicKey?.toString() ?? null);
      setWalletError(null);
    };

    syncWallet();
    provider.on?.("connect", onConnect);
    provider.on?.("disconnect", onDisconnect);
    provider.on?.("accountChanged", onAccountChanged);

    return () => {
      provider.off?.("connect", onConnect);
      provider.off?.("disconnect", onDisconnect);
      provider.off?.("accountChanged", onAccountChanged);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (mode !== "street" || (event.code !== "KeyE" && event.code !== "KeyF")) return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const nearest = findNearestProperty(
        playerPosition,
        [...townData.buildings, ...townData.lots.filter((lot) => !isSouthTreeLotId(lot.id))],
        PROXIMITY_RANGE,
      );

      if (!nearest) return;

      if (event.code === "KeyF") {
        enterInterior(nearest.id);
        return;
      }

      setSelectedId(selectedId === nearest.id ? null : nearest.id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, playerPosition, selectedId, setSelectedId]);

  const connectWallet = async () => {
    const provider = getPhantomProvider();
    if (!provider) {
      setWalletError("Phantom wallet not found");
      return;
    }

    setWalletBusy(true);
    setWalletError(null);
    try {
      const result = await provider.connect();
      setWalletAddress(result.publicKey.toString());
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Wallet connection failed");
    } finally {
      setWalletBusy(false);
    }
  };

  const disconnectWallet = async () => {
    const provider = getPhantomProvider();
    setWalletBusy(true);
    setWalletError(null);
    try {
      await provider?.disconnect();
      setWalletAddress(null);
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Wallet disconnect failed");
    } finally {
      setWalletBusy(false);
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950">
      {mode === "interior" ? <InteriorCanvas /> : <TownCanvas />}
      <TitleChrome />
      <div className="fixed right-3 top-3 z-[70] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-1 sm:right-4 sm:top-4">
        {walletAddress ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-slate-950/90 px-2 py-2 text-xs text-white shadow-lg backdrop-blur sm:px-3">
            <span className="hidden text-emerald-300 sm:inline">PHANTOM</span>
            <span className="font-mono">{shortWallet(walletAddress)}</span>
            <button
              type="button"
              onClick={disconnectWallet}
              disabled={walletBusy}
              className="rounded bg-slate-700 px-2 py-1 font-semibold hover:bg-slate-600 disabled:cursor-wait disabled:opacity-60"
            >
              {walletBusy ? "..." : "DISCONNECT"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            disabled={walletBusy}
            className="rounded-lg border border-violet-400/40 bg-slate-950/90 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
          >
            {walletBusy ? "CONNECTING..." : "CONNECT PHANTOM"}
          </button>
        )}
        {walletError ? (
          <p className="max-w-64 rounded bg-red-950/90 px-2 py-1 text-right text-[11px] text-red-200 shadow">
            {walletError}
          </p>
        ) : null}
      </div>
      <TopHud />
      {mode !== "interior" ? <TownDirectory /> : null}
      <ControlsLegend />
      <MobileControls />
      <ProximityPrompt />
      {mode !== "interior" ? <BuildingPanel /> : null}
      <LegalLinks />
      <ModeFade />
    </main>
  );
}
