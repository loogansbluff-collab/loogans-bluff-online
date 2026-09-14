import { NextRequest, NextResponse } from "next/server";
import {
  CHALLENGE_COOKIE,
  CHALLENGE_TTL_SECONDS,
  authCookieOptions,
  createLoginMessage,
  createNonce,
  signToken,
  type ChallengeTokenPayload,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const nonce = createNonce();
    const expiresAt = Date.now() + CHALLENGE_TTL_SECONDS * 1000;
    const origin = request.nextUrl.origin;
    const message = createLoginMessage(origin, nonce, expiresAt);
    const token = signToken<ChallengeTokenPayload>({
      nonce,
      message,
      origin,
      exp: expiresAt,
    });

    const response = NextResponse.json({ message });
    response.cookies.set(CHALLENGE_COOKIE, token, authCookieOptions(CHALLENGE_TTL_SECONDS));
    return response;
  } catch (error) {
    console.error("Failed to create auth challenge", error);
    return NextResponse.json({ error: "Authentication is not configured" }, { status: 500 });
  }
}
