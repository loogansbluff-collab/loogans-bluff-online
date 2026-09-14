import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  isExpired,
  verifyToken,
  type SessionTokenPayload,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = verifyToken<SessionTokenPayload>(token);
    if (!session || isExpired(session.exp) || !session.address) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    return NextResponse.json({ address: session.address });
  } catch (error) {
    console.error("Failed to read auth session", error);
    return NextResponse.json({ error: "Authentication is not configured" }, { status: 500 });
  }
}
