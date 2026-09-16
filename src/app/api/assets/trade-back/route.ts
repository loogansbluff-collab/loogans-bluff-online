import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { isTradableAssetId } from "@/data/tradableUsd";
import { isExpired, SESSION_COOKIE, verifyToken, type SessionTokenPayload } from "@/lib/auth";
import {
  acquireTradeBackLock,
  finalizeTradeBack,
  getPlayerByWallet,
  getTradeBackPending,
  releaseStaleUnsignedTradeBackLock,
  releaseTradeBackLock,
  setTradeBackPayoutSignature,
  type TradeBackPendingRecord,
} from "@/lib/db";
import { verifyLoogansTradeBackTransfer } from "@/lib/solanaTradeVerify";
import {
  TreasuryUnderfundedError,
  broadcastTreasuryPayout,
  getLoogansMintDecimals,
  getTreasurySigner,
  prepareTreasuryPayout,
} from "@/lib/treasuryTradeBack";

export const runtime = "nodejs";

const LOCKED_TREASURY_WALLET = "4QaA5ESqNzmCyA5wEanGxSVKxodqb7XHjwkVq5zY66ZC";
const STALE_SIGNED_PAYOUT_SECONDS = 180;

type SignatureStatus = {
  err?: unknown;
  confirmationStatus?: "processed" | "confirmed" | "finalized" | null;
};

function lookupPending(message: string) {
  return (
    message.includes("Confirmed transaction not found") ||
    message.includes("Solana RPC HTTP") ||
    message.includes("Solana RPC error") ||
    message.includes("SOLANA_RPC_URL")
  );
}

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!value) throw new Error("DATABASE_URL or POSTGRES_URL must be configured");
  return value;
}

function getRpcUrl() {
  const value = process.env.SOLANA_RPC_URL?.trim();
  if (!value) throw new Error("SOLANA_RPC_URL must be configured");
  return value;
}

async function getSignatureStatus(signature: string): Promise<SignatureStatus | null> {
  const response = await fetch(getRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getSignatureStatuses",
      params: [[signature], { searchTransactionHistory: true }],
    }),
  });
  if (!response.ok) throw new Error(`Solana RPC HTTP ${response.status}`);
  const payload = (await response.json()) as {
    result?: { value?: Array<SignatureStatus | null> };
    error?: { message?: string };
  };
  if (payload.error) throw new Error(payload.error.message ?? "Solana RPC error");
  return payload.result?.value?.[0] ?? null;
}

async function releaseStaleSignedTradeBackLock(pending: TradeBackPendingRecord) {
  const signature = pending.payoutSignature;
  if (!signature || pending.ageSeconds < STALE_SIGNED_PAYOUT_SECONDS) return false;

  const status = await getSignatureStatus(signature);
  if (status !== null) return false;

  const sql = neon(getDatabaseUrl());
  const rows = await sql`
    DELETE FROM asset_trade_back_pending
    WHERE id = ${pending.id}
      AND player_id = ${pending.playerId}
      AND asset_id = ${pending.assetId}
      AND payout_signature = ${signature}
      AND created_at <= NOW() - INTERVAL '180 seconds'
    RETURNING id
  `;
  return rows.length === 1;
}

async function verifyAndFinalize(input: {
  pending: TradeBackPendingRecord;
  playerId: string;
  walletAddress: string;
  treasuryWallet: string;
  mint: string;
  assetId: string;
}) {
  const signature = input.pending.payoutSignature;
  if (!signature) throw new Error("TRADE BACK payout has no signature");
  const decimals = await getLoogansMintDecimals(input.mint);
  await verifyLoogansTradeBackTransfer({
    signature,
    playerWallet: input.walletAddress,
    treasuryWallet: input.treasuryWallet,
    mint: input.mint,
    decimals,
    amountRaw: input.pending.amountRaw,
  });

  const collectedAssetIds = await finalizeTradeBack({
    pendingId: input.pending.id,
    playerId: input.playerId,
    walletAddress: input.walletAddress,
    assetId: input.assetId,
    signature,
  });

  return {
    assetId: input.assetId,
    collectedAssetIds,
    payoutSignature: signature,
    amountRaw: input.pending.amountRaw,
  };
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifyToken<SessionTokenPayload>(sessionToken);
  if (!session || isExpired(session.exp)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { assetId?: string } | null;
  const assetId = body?.assetId?.trim() ?? "";
  if (!assetId || !isTradableAssetId(assetId)) {
    return NextResponse.json({ error: "TRADE BACK is not available for this asset" }, { status: 400 });
  }

  const treasuryWallet = process.env.TREASURY_WALLET?.trim();
  const loogansMint = process.env.LOOGANS_MINT?.trim();
  if (treasuryWallet !== LOCKED_TREASURY_WALLET || !loogansMint) {
    return NextResponse.json({ error: "TRADE_BACK_UNAVAILABLE" }, { status: 503 });
  }

  try {
    getTreasurySigner();
  } catch (error) {
    console.error("TRADE BACK treasury signer configuration failed", error instanceof Error ? error.message : "configuration error");
    return NextResponse.json({ error: "TRADE_BACK_UNAVAILABLE" }, { status: 503 });
  }

  const player = await getPlayerByWallet(session.address);
  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  let pending = await getTradeBackPending(player.id, assetId);

  if (pending?.payoutSignature) {
    if (pending.walletAddress !== session.address) {
      return NextResponse.json({ error: "TRADE BACK is already pending" }, { status: 409 });
    }
    if (pending.mint !== loogansMint) {
      return NextResponse.json({ error: "Pending TRADE BACK mint does not match configuration" }, { status: 409 });
    }
    try {
      const result = await verifyAndFinalize({
        pending,
        playerId: player.id,
        walletAddress: session.address,
        treasuryWallet,
        mint: loogansMint,
        assetId,
      });
      return NextResponse.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "TRADE BACK payout could not be verified";
      console.error("TRADE BACK retry verification/finalization failed", message);

      if (message.includes("Confirmed transaction not found") && pending.ageSeconds >= STALE_SIGNED_PAYOUT_SECONDS) {
        try {
          const released = await releaseStaleSignedTradeBackLock(pending);
          if (released) {
            console.warn("Released stale signed TRADE BACK payout that never landed", {
              assetId,
              pendingId: pending.id,
              ageSeconds: pending.ageSeconds,
            });
            pending = null;
          }
        } catch (recoveryError) {
          console.error(
            "TRADE BACK stale payout recovery check failed",
            recoveryError instanceof Error ? recoveryError.message : "recovery error",
          );
        }
      }

      if (pending) {
        return NextResponse.json(
          { error: lookupPending(message) ? "PAYOUT_PENDING_CONFIRMATION" : message },
          { status: lookupPending(message) ? 502 : 409 },
        );
      }
    }
  }

  if (pending) {
    const releasedId = await releaseStaleUnsignedTradeBackLock(player.id, assetId);
    if (releasedId) {
      pending = null;
    } else {
      return NextResponse.json(
        {
          error: "TRADE BACK is already pending",
          pendingId: pending.id,
          createdAt: pending.createdAt,
          ageSeconds: pending.ageSeconds,
          hasSignature: false,
        },
        { status: 409 },
      );
    }
  }

  pending = await acquireTradeBackLock({
    playerId: player.id,
    walletAddress: session.address,
    assetId,
  });
  if (!pending) {
    return NextResponse.json(
      { error: "Property Asset is not eligible for TRADE BACK" },
      { status: 409 },
    );
  }

  if (pending.mint !== loogansMint) {
    await releaseTradeBackLock(pending.id);
    return NextResponse.json({ error: "TRADE BACK mint does not match configuration" }, { status: 409 });
  }

  let prepared;
  try {
    prepared = await prepareTreasuryPayout({
      playerWallet: session.address,
      mint: loogansMint,
      amountRaw: pending.amountRaw,
    });
  } catch (error) {
    await releaseTradeBackLock(pending.id);
    if (error instanceof TreasuryUnderfundedError) {
      return NextResponse.json({ error: "TREASURY_UNDERFUNDED" }, { status: 409 });
    }
    console.error("Could not prepare TRADE BACK payout", error instanceof Error ? error.message : "prepare error");
    return NextResponse.json({ error: "TRADE_BACK_UNAVAILABLE" }, { status: 503 });
  }

  try {
    const signatureStored = await setTradeBackPayoutSignature(pending.id, prepared.signature);
    if (!signatureStored) {
      return NextResponse.json({ error: "TRADE BACK is already pending" }, { status: 409 });
    }
    pending = { ...pending, payoutSignature: prepared.signature };
  } catch (error) {
    await releaseTradeBackLock(pending.id);
    console.error("Could not lock TRADE BACK payout signature", error instanceof Error ? error.message : "lock error");
    return NextResponse.json({ error: "TRADE_BACK_UNAVAILABLE" }, { status: 503 });
  }

  try {
    await broadcastTreasuryPayout(prepared);
  } catch (error) {
    console.error("TRADE BACK payout broadcast/confirmation pending", error instanceof Error ? error.message : "broadcast error");
    return NextResponse.json({ error: "PAYOUT_PENDING_CONFIRMATION" }, { status: 502 });
  }

  try {
    const result = await verifyAndFinalize({
      pending,
      playerId: player.id,
      walletAddress: session.address,
      treasuryWallet,
      mint: loogansMint,
      assetId,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "TRADE BACK payout could not be finalized";
    console.error("TRADE BACK verification/finalization failed", message);
    return NextResponse.json(
      { error: lookupPending(message) ? "PAYOUT_PENDING_CONFIRMATION" : message },
      { status: lookupPending(message) ? 502 : 409 },
    );
  }
}
