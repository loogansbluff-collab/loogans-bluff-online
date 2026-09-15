import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isExpired, SESSION_COOKIE, verifyToken, type SessionTokenPayload } from "@/lib/auth";
import { createAssetTradeQuote, getPlayerByWallet } from "@/lib/db";
import { quoteLoogansForUsdCents } from "@/lib/loogansMarketQuote";
import { getLatestSolanaBlockhash, getMintTokenProgram } from "@/lib/solanaTradeVerify";

export const runtime = "nodejs";

const BARBER_ASSET_ID = "LB-BARBER-001";
const BARBER_USD_CENTS = 100;
const QUOTE_TTL_MS = 60_000;
const LOCKED_TREASURY_WALLET = "4QaA5ESqNzmCyA5wEanGxSVKxodqb7XHjwkVq5zY66ZC";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    const session = verifyToken<SessionTokenPayload>(sessionToken);
    if (!session || isExpired(session.exp)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as { assetId?: string } | null;
    if (body?.assetId !== BARBER_ASSET_ID) {
      return NextResponse.json({ error: "Trade quote is only available for the Barbershop test" }, { status: 400 });
    }

    const player = await getPlayerByWallet(session.address);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const treasuryWallet = process.env.TREASURY_WALLET?.trim();
    if (treasuryWallet !== LOCKED_TREASURY_WALLET) {
      return NextResponse.json(
        { error: "TRADE_UNAVAILABLE", message: "Treasury configuration is unavailable." },
        { status: 503 },
      );
    }

    const marketQuote = await quoteLoogansForUsdCents(BARBER_USD_CENTS);
    const [tokenProgram, blockhashInfo] = await Promise.all([
      getMintTokenProgram(marketQuote.mint),
      getLatestSolanaBlockhash(),
    ]);
    const expiresAt = new Date(Date.now() + QUOTE_TTL_MS);
    const quote = await createAssetTradeQuote({
      id: randomUUID(),
      playerId: player.id,
      walletAddress: session.address,
      assetId: BARBER_ASSET_ID,
      usdCents: BARBER_USD_CENTS,
      mint: marketQuote.mint,
      mintDecimals: marketQuote.decimals,
      loogansAmountRaw: marketQuote.loogansAmountRaw,
      priceUsdPerToken: marketQuote.priceUsdPerToken,
      priceSource: marketQuote.priceSource,
      expiresAt,
    });

    return NextResponse.json({
      quoteId: quote.id,
      assetId: quote.assetId,
      usd: (quote.usdCents / 100).toFixed(2),
      mint: quote.mint,
      decimals: quote.mintDecimals,
      loogansAmountRaw: quote.loogansAmountRaw,
      loogansAmountUi: marketQuote.loogansAmountUi,
      priceUsdPerToken: quote.priceUsdPerToken,
      priceSource: quote.priceSource,
      createdAt: quote.createdAt,
      expiresAt: quote.expiresAt,
      expiresInSeconds: 60,
      treasuryWallet,
      tokenProgram,
      recentBlockhash: blockhashInfo.blockhash,
      lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
    });
  } catch (error) {
    console.error("Failed to create Barbershop trade quote", error);
    return NextResponse.json(
      { error: "TRADE_UNAVAILABLE", message: "A trustworthy live $LOOGANS quote is not available right now." },
      { status: 503 },
    );
  }
}
