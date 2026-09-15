import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  type Commitment,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAccountLenForMint,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import { getMintTokenProgram } from "@/lib/solanaTradeVerify";

const LOCKED_TREASURY_WALLET = "4QaA5ESqNzmCyA5wEanGxSVKxodqb7XHjwkVq5zY66ZC";
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const COMMITMENT: Commitment = "confirmed";

export class TreasuryUnderfundedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TreasuryUnderfundedError";
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be configured`);
  return value;
}

function decodeBase58(value: string) {
  let number = BigInt(0);
  for (const char of value) {
    const digit = BASE58_ALPHABET.indexOf(char);
    if (digit < 0) throw new Error("TREASURY_SECRET is not valid base58");
    number = number * BigInt(58) + BigInt(digit);
  }

  const bytes: number[] = [];
  while (number > BigInt(0)) {
    bytes.push(Number(number % BigInt(256)));
    number /= BigInt(256);
  }
  bytes.reverse();

  let leadingZeroes = 0;
  while (leadingZeroes < value.length && value[leadingZeroes] === "1") leadingZeroes += 1;
  return Uint8Array.from([...new Array(leadingZeroes).fill(0), ...bytes]);
}

function encodeBase58(bytes: Uint8Array) {
  let number = BigInt(0);
  for (const byte of bytes) number = number * BigInt(256) + BigInt(byte);

  let encoded = "";
  while (number > BigInt(0)) {
    const remainder = Number(number % BigInt(58));
    encoded = BASE58_ALPHABET[remainder] + encoded;
    number /= BigInt(58);
  }

  let leadingZeroes = 0;
  while (leadingZeroes < bytes.length && bytes[leadingZeroes] === 0) leadingZeroes += 1;
  return "1".repeat(leadingZeroes) + (encoded || (leadingZeroes ? "" : "1"));
}

function parseTreasurySecret(secret: string) {
  let bytes: Uint8Array;
  if (secret.startsWith("[")) {
    const parsed = JSON.parse(secret) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)) {
      throw new Error("TREASURY_SECRET JSON must be an array of byte values");
    }
    bytes = Uint8Array.from(parsed as number[]);
  } else {
    bytes = decodeBase58(secret);
  }

  if (bytes.length === 64) return Keypair.fromSecretKey(bytes);
  if (bytes.length === 32) return Keypair.fromSeed(bytes);
  throw new Error("TREASURY_SECRET must decode to a 32-byte seed or 64-byte secret key");
}

export function getTreasurySigner() {
  const configuredWallet = getRequiredEnv("TREASURY_WALLET");
  if (configuredWallet !== LOCKED_TREASURY_WALLET) {
    throw new Error("TREASURY_WALLET does not match the locked treasury address");
  }

  const keypair = parseTreasurySecret(getRequiredEnv("TREASURY_SECRET"));
  if (keypair.publicKey.toBase58() !== configuredWallet) {
    throw new Error("TREASURY_SECRET does not derive the configured treasury wallet");
  }

  return keypair;
}

function getConnection() {
  return new Connection(getRequiredEnv("SOLANA_RPC_URL"), COMMITMENT);
}

export type PreparedTreasuryPayout = {
  signature: string;
  rawTransaction: Uint8Array;
  blockhash: string;
  lastValidBlockHeight: number;
  decimals: number;
};

export async function prepareTreasuryPayout(input: {
  playerWallet: string;
  mint: string;
  amountRaw: string;
}): Promise<PreparedTreasuryPayout> {
  if (!/^\d+$/.test(input.amountRaw) || BigInt(input.amountRaw) <= BigInt(0)) {
    throw new Error("Invalid TRADE BACK amount");
  }

  const keypair = getTreasurySigner();
  const connection = getConnection();
  const mint = new PublicKey(input.mint);
  const player = new PublicKey(input.playerWallet);
  const tokenProgramAddress = await getMintTokenProgram(input.mint);
  const tokenProgram = new PublicKey(tokenProgramAddress);
  if (!tokenProgram.equals(TOKEN_PROGRAM_ID) && !tokenProgram.equals(TOKEN_2022_PROGRAM_ID)) {
    throw new Error("Unsupported $LOOGANS token program");
  }

  const mintInfo = await getMint(connection, mint, COMMITMENT, tokenProgram);
  const treasuryAta = getAssociatedTokenAddressSync(mint, keypair.publicKey, false, tokenProgram);
  const playerAta = getAssociatedTokenAddressSync(mint, player, false, tokenProgram);

  let treasuryRaw = BigInt(0);
  try {
    const balance = await connection.getTokenAccountBalance(treasuryAta, COMMITMENT);
    treasuryRaw = BigInt(balance.value.amount);
  } catch {
    throw new TreasuryUnderfundedError("Treasury does not have a funded $LOOGANS token account");
  }

  const expected = BigInt(input.amountRaw);
  if (treasuryRaw < expected) {
    throw new TreasuryUnderfundedError("Treasury does not have enough $LOOGANS for TRADE BACK");
  }

  const playerAtaInfo = await connection.getAccountInfo(playerAta, COMMITMENT);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(COMMITMENT);
  const transaction = new Transaction({ feePayer: keypair.publicKey, recentBlockhash: blockhash });

  if (!playerAtaInfo) {
    transaction.add(
      createAssociatedTokenAccountIdempotentInstruction(
        keypair.publicKey,
        playerAta,
        player,
        mint,
        tokenProgram,
      ),
    );
  }

  transaction.add(
    createTransferCheckedInstruction(
      treasuryAta,
      mint,
      playerAta,
      keypair.publicKey,
      expected,
      mintInfo.decimals,
      [],
      tokenProgram,
    ),
  );

  const fee = await connection.getFeeForMessage(transaction.compileMessage(), COMMITMENT);
  if (fee.value === null) throw new Error("Could not calculate treasury transaction fee");
  const accountRent = playerAtaInfo
    ? 0
    : await connection.getMinimumBalanceForRentExemption(getAccountLenForMint(mintInfo), COMMITMENT);
  const treasuryLamports = await connection.getBalance(keypair.publicKey, COMMITMENT);
  if (treasuryLamports < fee.value + accountRent) {
    throw new TreasuryUnderfundedError("Treasury does not have enough SOL for TRADE BACK fees/rent");
  }

  transaction.sign(keypair);
  const signatureBytes = transaction.signature;
  if (!signatureBytes) throw new Error("Treasury transaction could not be signed");

  return {
    signature: encodeBase58(signatureBytes),
    rawTransaction: transaction.serialize(),
    blockhash,
    lastValidBlockHeight,
    decimals: mintInfo.decimals,
  };
}

export async function broadcastTreasuryPayout(prepared: PreparedTreasuryPayout) {
  const connection = getConnection();
  const signature = await connection.sendRawTransaction(prepared.rawTransaction, {
    skipPreflight: false,
    preflightCommitment: COMMITMENT,
    maxRetries: 3,
  });
  if (signature !== prepared.signature) {
    throw new Error("RPC returned an unexpected payout signature");
  }

  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash: prepared.blockhash,
      lastValidBlockHeight: prepared.lastValidBlockHeight,
    },
    COMMITMENT,
  );
  if (confirmation.value.err) throw new Error("Treasury payout transaction failed");
  return signature;
}

export async function getLoogansMintDecimals(mintAddress: string) {
  const connection = getConnection();
  const mint = new PublicKey(mintAddress);
  const tokenProgram = new PublicKey(await getMintTokenProgram(mintAddress));
  const mintInfo = await getMint(connection, mint, COMMITMENT, tokenProgram);
  return mintInfo.decimals;
}
