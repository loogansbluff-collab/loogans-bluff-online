import { NextRequest, NextResponse } from "next/server";
import { isExpired, SESSION_COOKIE, verifyToken, type SessionTokenPayload } from "@/lib/auth";
import {
  finalizeLoogansTrade,
  getAssetTradeQuoteById,
  getPlayerByWallet,
  isTradeSignatureUsed,
  playerOwnsAsset,
} from "@/lib/db";
import { verifyLoogansTradeTransfer } from "@/lib/solanaTradeVerify";

export const runtime = "nodejs";

const BARBER_ASSET_ID = "LB-BARBER-001";
const BARBER_USD_CENTS = 100;
const LOCKED_TREASURY_WALLET = "4QaA5ESqNzmCyA5wEanGxSVKxodqb7XHjwkVq5zY66ZC";
const SOLANA_SIGNATURE_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{64,128}$/;

function transactionLookupFailed(message: string) {
  return (
    message.includes("Confirmed transaction not found") ||
    message.includes("Solana RPC HTTP") ||
    message.includes("Solana RPC error") ||
    message.includes("SOLANA_RPC_URL")
  );
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifyToken<SessionTokenPayload>(sessionToken);
  if (!session || isExpired(session.exp)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { quoteId?: string; signature?: string }
    | null;
  const quoteId = body?.quoteId?.trim();
  const signature = body?.signature?.trim();
  if (!quoteId || !signature || !SOLANA_SIGNATURE_PATTERN.test(signature)) {
    return NextResponse.json({ error: "Invalid trade request" }, { status: 400 });
  }

  const loogansMint = process.env.LOOGANS_MINT?.trim();
  const treasuryWallet = process.env.TREASURY_WALLET?.trim();
  if (!loogansMint || treasuryWallet !== LOCKED_TREASURY_WALLET) {
    return NextResponse.json({ error: "TRADE_UNAVAILABLE" }, { status: 503 });
  }

  const player = await getPlayerByWallet(session.address);
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const quote = await getAssetTradeQuoteById(quoteId);
  if (
    !quote ||
    quote.playerId !== player.id ||
    quote.walletAddress !== session.address ||
    quote.assetId !== BARBER_ASSET_ID ||
    quote.usdCents !== BARBER_USD_CENTS ||
    quote.status !== "open" ||
    quote.mint !== loogansMint ||
    new Date(quote.expiresAt).getTime() <= Date.now()
  ) {
    return NextResponse.json({ error: "Quote is invalid or expired" }, { status: 400 });
  }

  if (await isTradeSignatureUsed(signature)) {
    return NextResponse.json({ error: "Transaction signature has already been used" }, { status: 409 });
  }

  if (await playerOwnsAsset(player.id, BARBER_ASSET_ID)) {
    return NextResponse.json({ error: "Barbershop is already owned" }, { status: 409 });
  }

  try {
    await verifyLoogansTradeTransfer({
      signature,
      playerWallet: session.address,
      treasuryWallet,
      mint: loogansMint,
      decimals: quote.mintDecimals,
      amountRaw: quote.loogansAmountRaw,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify Solana transaction";
    console.error("Barbershop trade verification failed", error);
    return NextResponse.json(
      { error: message },
      { status: transactionLookupFailed(message) ? 502 : 400 },
    );
  }

  try {
    const collectedAssetIds = await finalizeLoogansTrade({
      quoteId: quote.id,
      playerId: player.id,
      walletAddress: session.address,
      assetId: BARBER_ASSET_ID,
      signature,
    });

    return NextResponse.json({
      assetId: BARBER_ASSET_ID,
      collectedAssetIds,
      propertyAssetsCollected: collectedAssetIds.length,
    });
  } catch (error) {
    console.error("Barbershop trade finalization failed", error);
    return NextResponse.json(
      { error: "Trade was verified but could not be recorded. The quote remains unconsumed." },
      { status: 409 },
    );
  }
}
