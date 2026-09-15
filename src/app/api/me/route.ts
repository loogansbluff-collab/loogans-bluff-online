import { NextRequest, NextResponse } from "next/server";
import { isExpired, SESSION_COOKIE, verifyToken, type SessionTokenPayload } from "@/lib/auth";
import { getPlayerAssetIds, getPlayerByWallet } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    const session = verifyToken<SessionTokenPayload>(sessionToken);

    if (!session || isExpired(session.exp)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = await getPlayerByWallet(session.address);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const collectedAssetIds = await getPlayerAssetIds(player.id);

    return NextResponse.json({
      id: player.id,
      walletAddress: player.walletAddress,
      createdAt: player.createdAt,
      propertyAssetsCollected: collectedAssetIds.length,
      propertyAssetsTotal: 68,
      collectedAssetIds,
    });
  } catch (error) {
    console.error("Failed to load player dashboard", error);
    return NextResponse.json({ error: "Player dashboard unavailable" }, { status: 500 });
  }
}
