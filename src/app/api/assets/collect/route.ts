import { NextRequest, NextResponse } from "next/server";
import { propertyAssetCatalog } from "@/data/propertyAssetCatalog";
import { isExpired, SESSION_COOKIE, verifyToken, type SessionTokenPayload } from "@/lib/auth";
import { collectPlayerAsset, getPlayerByWallet } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    const session = verifyToken<SessionTokenPayload>(sessionToken);
    if (!session || isExpired(session.exp)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as { assetId?: string } | null;
    const assetId = body?.assetId;
    if (!assetId || !propertyAssetCatalog.some((asset) => asset.id === assetId)) {
      return NextResponse.json({ error: "Invalid Property Asset" }, { status: 400 });
    }

    const player = await getPlayerByWallet(session.address);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const collectedAssetIds = await collectPlayerAsset(player.id, assetId);
    return NextResponse.json({
      assetId,
      collectedAssetIds,
      propertyAssetsCollected: collectedAssetIds.length,
      propertyAssetsTotal: propertyAssetCatalog.length,
    });
  } catch (error) {
    console.error("Failed to demo collect Property Asset", error);
    return NextResponse.json({ error: "Could not collect Property Asset" }, { status: 500 });
  }
}
