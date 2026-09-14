import { NextResponse } from "next/server";
import {
  CHALLENGE_COOKIE,
  SESSION_COOKIE,
  authCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  for (const name of [SESSION_COOKIE, CHALLENGE_COOKIE]) {
    response.cookies.set(name, "", {
      ...authCookieOptions(0),
      expires: new Date(0),
    });
  }
  return response;
}
