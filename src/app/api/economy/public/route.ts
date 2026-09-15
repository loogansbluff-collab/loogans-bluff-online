import { neon } from "@neondatabase/serverless";
import { Connection, PublicKey, type Commitment } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getMint } from "@solana/spl-token";
import { getMintTokenProgram } from "@/lib/solanaTradeVerify";

export const runtime = "nodejs";

const COMMITMENT: Commitment = "confirmed";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be configured`);
  return value;
}

async function countLoogansTradeAssets() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL or POSTGRES_URL must be configured");
  const sql = neon(databaseUrl);
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM player_assets
    WHERE source = 'loogans_trade'
  `;
  return Number(rows[0]?.count ?? 0);
}

function formatRawTokenAmount(raw: string, decimals: number) {
  const padded = raw.padStart(decimals + 1, "0");
  const split = padded.length - decimals;
  const whole = padded.slice(0, split);
  const fraction = decimals > 0 ? padded.slice(split).replace(/0+$/, "") : "";
  return fraction ? `${whole}.${fraction}` : whole;
}

async function getTreasuryLoogansUi() {
  const rpcUrl = getRequiredEnv("SOLANA_RPC_URL");
  const treasury = new PublicKey(getRequiredEnv("TREASURY_WALLET"));
  const mint = new PublicKey(getRequiredEnv("LOOGANS_MINT"));
  const tokenProgramAddress = await getMintTokenProgram(mint.toBase58());
  const tokenProgram = new PublicKey(tokenProgramAddress);
  const connection = new Connection(rpcUrl, COMMITMENT);
  const mintInfo = await getMint(connection, mint, COMMITMENT, tokenProgram);
  const treasuryAta = getAssociatedTokenAddressSync(mint, treasury, false, tokenProgram);
  const balance = await connection.getTokenAccountBalance(treasuryAta, COMMITMENT);
  return formatRawTokenAmount(balance.value.amount, mintInfo.decimals);
}

export async function GET() {
  try {
    const ownedCount = await countLoogansTradeAssets();
    let treasuryLoogansUi: string | null = null;

    try {
      treasuryLoogansUi = await getTreasuryLoogansUi();
    } catch (error) {
      console.error("Failed to read public treasury balance", error);
    }

    return Response.json(
      { ownedCount, treasuryLoogansUi },
      {
        headers: {
          "Cache-Control": "public, max-age=5, s-maxage=5",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load public economy stats", error);
    return Response.json(
      { error: "Economy stats unavailable" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
