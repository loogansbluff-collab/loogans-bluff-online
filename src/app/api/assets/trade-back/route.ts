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

function lookupPending(message: string) {
  return (
    message.includes("Confirmed transaction not found") ||
    message.includes("Solana RPC HTTP") ||
    message.includes("Solana RPC error") ||
    message.includes("SOLANA_RPC_URL")
  );
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
      return NextResponse.json(
        { error: lookupPending(message) ? "PAYOUT_PENDING_CONFIRMATION" : message },
        { status: lookupPending(message) ? 502 : 409 },
      );
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
