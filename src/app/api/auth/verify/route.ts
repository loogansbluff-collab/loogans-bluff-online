import { NextRequest, NextResponse } from "next/server";
import {
  CHALLENGE_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  authCookieOptions,
  isExpired,
  signToken,
  verifyToken,
  verifyWalletSignature,
  type ChallengeTokenPayload,
  type SessionTokenPayload,
} from "@/lib/auth";
import { getOrCreatePlayer } from "@/lib/db";

export const runtime = "nodejs";

type VerifyBody = {
  publicKey?: string;
  signature?: string;
  message?: string;
};

function clearChallenge(response: NextResponse) {
  response.cookies.set(CHALLENGE_COOKIE, "", {
    ...authCookieOptions(0),
    expires: new Date(0),
  });
}

export async function POST(request: NextRequest) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { publicKey, signature, message } = body;
  if (!publicKey || !signature || !message) {
    return NextResponse.json({ error: "Missing wallet signature data" }, { status: 400 });
  }

  try {
    const challengeToken = request.cookies.get(CHALLENGE_COOKIE)?.value;
    const challenge = verifyToken<ChallengeTokenPayload>(challengeToken);

    if (
      !challenge ||
      isExpired(challenge.exp) ||
      challenge.origin !== request.nextUrl.origin ||
      challenge.message !== message
    ) {
      const response = NextResponse.json({ error: "Login challenge is invalid or expired" }, { status: 401 });
      clearChallenge(response);
      return response;
    }

    if (!verifyWalletSignature(publicKey, signature, message)) {
      const response = NextResponse.json({ error: "Wallet signature is invalid" }, { status: 401 });
      clearChallenge(response);
      return response;
    }

    const player = await getOrCreatePlayer(publicKey);
    const now = Date.now();
    const session = signToken<SessionTokenPayload>({
      address: publicKey,
      iat: now,
      exp: now + SESSION_TTL_SECONDS * 1000,
    });

    const response = NextResponse.json({ address: publicKey, player });
    clearChallenge(response);
    response.cookies.set(SESSION_COOKIE, session, authCookieOptions(SESSION_TTL_SECONDS));
    return response;
  } catch (error) {
    console.error("Failed to verify wallet login", error);
    const response = NextResponse.json({ error: "Authentication or player storage is not configured" }, { status: 500 });
    clearChallenge(response);
    return response;
  }
}
