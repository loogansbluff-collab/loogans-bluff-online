"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const connectionRequestedRef = useRef(false);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) {
        setSessionAddress(null);
        return;
      }
      const data = (await response.json()) as SessionResponse;
      setSessionAddress(data.address);
    } catch {
      setSessionAddress(null);
    }
  }, []);

  const logoutServerSession = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setSessionAddress(null);
    }
  }, []);

  useEffect(() => {
    void refreshSession();

    const provider = getPhantomProvider();
    if (!provider) return;

    const onConnect = (publicKey?: PhantomPublicKey | null) => {
      if (!connectionRequestedRef.current) return;
      setWalletAddress(publicKey?.toString() ?? provider.publicKey?.toString() ?? null);
      setWalletError(null);
    };
    const onDisconnect = () => {
      connectionRequestedRef.current = false;
      setWalletAddress(null);
      setWalletError(null);
    };
    const onAccountChanged = (publicKey?: PhantomPublicKey | null) => {
      if (!connectionRequestedRef.current) return;
      const nextAddress = publicKey?.toString() ?? null;
      setWalletAddress(nextAddress);
      setWalletError(null);
      if (sessionAddress && nextAddress !== sessionAddress) void logoutServerSession();
    };

    provider.on?.("connect", onConnect);
    provider.on?.("disconnect", onDisconnect);
    provider.on?.("accountChanged", onAccountChanged);

    return () => {
      provider.off?.("connect", onConnect);
      provider.off?.("disconnect", onDisconnect);
      provider.off?.("accountChanged", onAccountChanged);
    };
  }, [logoutServerSession, refreshSession, sessionAddress]);

  useEffect(() => {
    if (walletAddress && sessionAddress && walletAddress !== sessionAddress) {
      void logoutServerSession();
    }
  }, [logoutServerSession, sessionAddress, walletAddress]);

  const signedIn = useMemo(
    () => Boolean(sessionAddress && (!walletAddress || sessionAddress === walletAddress)),
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
    try {
      const result = await provider.connect();
      setWalletAddress(result.publicKey.toString());
    } catch (error) {
      connectionRequestedRef.current = false;
      setWalletError(error instanceof Error ? error.message : "Wallet connection failed");
    } finally {
      setWalletBusy(false);
    }
  };

  const signIn = async () => {
    const provider = getPhantomProvider();
    const publicKey = provider?.publicKey?.toString() ?? walletAddress;
    if (!provider || !publicKey) {
      setWalletError("Connect Phantom before signing in");
      return;
    }
    if (!provider.signMessage) {
      setWalletError("This Phantom wallet cannot sign login messages");
      return;
    }

    setWalletBusy(true);
    setWalletError(null);
    try {
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
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Wallet sign-in failed");
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

  const addressToShow = sessionAddress ?? walletAddress;

  return (
    <div className="fixed right-3 top-3 z-[70] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-1 sm:right-4 sm:top-4">
      {addressToShow ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-slate-950/90 px-2 py-2 text-xs text-white shadow-lg backdrop-blur sm:px-3">
          <span className={signedIn ? "hidden text-emerald-300 sm:inline" : "hidden text-violet-300 sm:inline"}>
            {signedIn ? "SIGNED IN" : "PHANTOM"}
          </span>
          <span className="font-mono">{shortWallet(addressToShow)}</span>
          {walletAddress && !signedIn ? (
            <button
              type="button"
              onClick={signIn}
              disabled={walletBusy}
              className="rounded bg-emerald-700 px-2 py-1 font-semibold hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
            >
              {walletBusy ? "..." : "SIGN IN"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={disconnectWallet}
            disabled={walletBusy}
            className="rounded bg-slate-700 px-2 py-1 font-semibold hover:bg-slate-600 disabled:cursor-wait disabled:opacity-60"
          >
            {walletBusy ? "..." : walletAddress ? "DISCONNECT" : "LOG OUT"}
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
  );
}
