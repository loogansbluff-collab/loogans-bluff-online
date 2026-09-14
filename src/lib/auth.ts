import {
  createHmac,
  createPublicKey,
  randomBytes,
  timingSafeEqual,
  verify as verifyEd25519,
} from "node:crypto";

export const CHALLENGE_COOKIE = "lb_auth_challenge";
export const SESSION_COOKIE = "lb_session";
export const CHALLENGE_TTL_SECONDS = 5 * 60;
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export type ChallengeTokenPayload = {
  nonce: string;
  message: string;
  origin: string;
  exp: number;
};

export type SessionTokenPayload = {
  address: string;
  iat: number;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SESSION_SECRET ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must be set to a random value of at least 32 characters");
  }
  return secret;
}

function signEncodedPayload(encodedPayload: string) {
  return createHmac("sha256", getAuthSecret()).update(encodedPayload).digest("base64url");
}

export function signToken<T extends object>(payload: T) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signEncodedPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyToken<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [encodedPayload, suppliedSignature, extra] = token.split(".");
  if (!encodedPayload || !suppliedSignature || extra) return null;

  const expectedSignature = signEncodedPayload(encodedPayload);
  const supplied = Buffer.from(suppliedSignature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function createNonce() {
  return randomBytes(24).toString("base64url");
}

export function createLoginMessage(origin: string, nonce: string, expiresAtMs: number) {
  return [
    "Loogans Bluff Online login",
    "",
    `Origin: ${origin}`,
    "Purpose: Authenticate this wallet to Loogans Bluff Online.",
    `Nonce: ${nonce}`,
    `Expires: ${new Date(expiresAtMs).toISOString()}`,
    "",
    "Signing this message does not send a transaction or spend SOL.",
  ].join("\n");
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_INDEX = new Map(Array.from(BASE58_ALPHABET, (char, index) => [char, index]));

function decodeBase58(value: string) {
  if (!value) throw new Error("Invalid public key");

  const bytes: number[] = [];
  for (const char of value) {
    const digit = BASE58_INDEX.get(char);
    if (digit === undefined) throw new Error("Invalid public key");

    let carry = digit;
    for (let index = 0; index < bytes.length; index += 1) {
      carry += bytes[index] * 58;
      bytes[index] = carry & 0xff;
      carry = Math.floor(carry / 256);
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry = Math.floor(carry / 256);
    }
  }

  let leadingZeros = 0;
  while (leadingZeros < value.length && value[leadingZeros] === "1") leadingZeros += 1;

  bytes.reverse();
  return Buffer.concat([Buffer.alloc(leadingZeros), Buffer.from(bytes)]);
}

export function verifyWalletSignature(publicKey: string, signatureBase64: string, message: string) {
  let publicKeyBytes: Buffer;
  let signatureBytes: Buffer;

  try {
    publicKeyBytes = decodeBase58(publicKey);
    signatureBytes = Buffer.from(signatureBase64, "base64");
  } catch {
    return false;
  }

  if (publicKeyBytes.length !== 32 || signatureBytes.length !== 64) return false;

  try {
    const ed25519SpkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
    const key = createPublicKey({
      key: Buffer.concat([ed25519SpkiPrefix, publicKeyBytes]),
      format: "der",
      type: "spki",
    });
    return verifyEd25519(null, Buffer.from(message, "utf8"), key, signatureBytes);
  } catch {
    return false;
  }
}

export function isExpired(exp: number) {
  return !Number.isFinite(exp) || Date.now() >= exp;
}

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
