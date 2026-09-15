"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlayerDashboard, { type DashboardPlayer } from "@/components/ui/PlayerDashboard";
import {
  bytesToBase64,
  getPhantomProvider,
  shortWallet,
  type PhantomPublicKey,
} from "@/lib/phantom";

type SessionResponse = {
  address: string;
};

type ChallengeResponse = {
  message: string;
};

export default function WalletChrome() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sessionAddress, setSessionAddress] = useState<string | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardPlayer, setDashboardPlayer] = useState<DashboardPlayer | null>(null);
  const connectionRequestedRef = useRef(false);

  const logoutServerSession = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setSessionAddress(null);
      setDashboardOpen(false);
      setDashboardPlayer(null);
    }
  }, []);

  const signInWithProvider = useCallback(async (publicKey: string) => {
    const provider = getPhantomProvider();
    if (!provider?.signMessage) throw new Error("This Phantom wallet cannot sign login messages");

    const challengeResponse = await fetch("/api/auth/challenge", {
      method: "POST",
      credentials: "same-origin",
    });
    if (!challengeResponse.ok) throw new Error("Could not create login challenge");
    const challenge = (await challengeResponse.json()) as ChallengeResponse;

    const signed = await provider.signMessage(new TextEncoder().encode(challenge.message), "utf8");
    const verifyResponse = await fetch("/api/auth/verify", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey,
        signature: bytesToBase64(signed.signature),
        message: challenge.message,
      }),
    });
    if (!verifyResponse.ok) {
      const payload = (await verifyResponse.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Wallet sign-in failed");
    }

    const session = (await verifyResponse.json()) as SessionResponse;
    setSessionAddress(session.address);
    return session.address;
  }, []);

  useEffect(() => {
    // Never reuse a browser-stored Loogans Bluff auth session after a reload.
    // This cleanup must happen once on initial mount only.
    void logoutServerSession();
  }, [logoutServerSession]);

  useEffect(() => {
    const provider = getPhantomProvider();
    if (!provider) return;

    const onConnect = () => {
      // A provider connect event alone is not enough to expose or authenticate a wallet.
      // connectWallet() sets walletAddress only after the fresh signed proof succeeds.
    };
    const onDisconnect = () => {
      connectionRequestedRef.current = false;
      setWalletAddress(null);
      setSessionAddress(null);
      setWalletError(null);
      setDashboardOpen(false);
      setDashboardPlayer(null);
    };
    const onAccountChanged = (publicKey?: PhantomPublicKey | null) => {
      if (!connectionRequestedRef.current) return;
      const nextAddress = publicKey?.toString() ?? null;
      if (!nextAddress || nextAddress !== walletAddress) {
        connectionRequestedRef.current = false;
        setWalletAddress(null);
        void logoutServerSession();
      }
    };

    provider.on?.("connect", onConnect);
    provider.on?.("disconnect", onDisconnect);
    provider.on?.("accountChanged", onAccountChanged);

    return () => {
      provider.off?.("connect", onConnect);
      provider.off?.("disconnect", onDisconnect);
      provider.off?.("accountChanged", onAccountChanged);
    };
  }, [logoutServerSession, walletAddress]);

  const signedIn = useMemo(
    () => Boolean(walletAddress && sessionAddress === walletAddress),
    [sessionAddress, walletAddress],
  );

  const connectWallet = async () => {
    const provider = getPhantomProvider();
    if (!provider) {
      setWalletError("Phantom wallet not found");
      return;
    }

    connectionRequestedRef.current = true;
    setWalletBusy(true);
    setWalletError(null);
    setWalletAddress(null);
    setSessionAddress(null);

    try {
      await logoutServerSession();

      try {
        await provider.disconnect();
      } catch {
        // Ignore stale-provider disconnect errors.
      }

      const connectFresh = provider.connect as (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PhantomPublicKey }>;
      const result = await connectFresh({ onlyIfTrusted: false });
      const freshAddress = result.publicKey.toString();

      // Phantom may remember trusted sites and return a public key without showing UI.
      // Require a fresh signed server challenge before we display or accept that wallet.
      const verifiedAddress = await signInWithProvider(freshAddress);
      if (verifiedAddress !== freshAddress) throw new Error("Wallet verification mismatch");

      setWalletAddress(freshAddress);
    } catch (error) {
      connectionRequestedRef.current = false;
      setWalletAddress(null);
      setSessionAddress(null);
      try {
        await provider.disconnect();
      } catch {
        // Keep the UI disconnected even if Phantom refuses the cleanup call.
      }
      setWalletError(error instanceof Error ? error.message : "Wallet connection failed");
    } finally {
      setWalletBusy(false);
    }
  };

  const openDashboard = async () => {
    if (!signedIn) return;
    setWalletBusy(true);
    setWalletError(null);
    try {
      const response = await fetch("/api/me", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not load player dashboard");
      }
      const player = (await response.json()) as DashboardPlayer;
      setDashboardPlayer(player);
      setDashboardOpen(true);
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Could not load player dashboard");
    } finally {
      setWalletBusy(false);
    }
  };

  const disconnectWallet = async () => {
    const provider = getPhantomProvider();
    setWalletBusy(true);
    setWalletError(null);
    try {
      connectionRequestedRef.current = false;
      await logoutServerSession();
      await provider?.disconnect();
      setWalletAddress(null);
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Wallet disconnect failed");
    } finally {
      setWalletBusy(false);
    }
  };

  return (
    <>
      <div className="fixed right-3 top-3 z-[70] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-1 sm:right-4 sm:top-4">
        {walletAddress && signedIn ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-slate-950/90 px-2 py-2 text-xs text-white shadow-lg backdrop-blur sm:px-3">
            <span className="hidden text-emerald-300 sm:inline">SIGNED IN</span>
            <span className="font-mono">{shortWallet(walletAddress)}</span>
            <button
              type="button"
              onClick={openDashboard}
              disabled={walletBusy}
              className="rounded bg-emerald-700 px-2 py-1 font-semibold hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
            >
              {walletBusy ? "..." : "DASHBOARD"}
            </button>
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
          <p className="max-w-72 rounded bg-red-950/90 px-2 py-1 text-right text-[11px] text-red-200 shadow">
            {walletError}
          </p>
        ) : null}
      </div>

      {dashboardOpen && dashboardPlayer ? (
        <PlayerDashboard player={dashboardPlayer} onClose={() => setDashboardOpen(false)} />
      ) : null}
    </>
  );
}
