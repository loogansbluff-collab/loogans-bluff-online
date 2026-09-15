import { neon } from "@neondatabase/serverless";

export type PlayerRecord = {
  id: string;
  walletAddress: string;
  createdAt: string;
  lastLoginAt: string;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL or POSTGRES_URL must be configured");
  }
  return databaseUrl;
}

function getSql() {
  return neon(getDatabaseUrl());
}

async function ensurePlayerAssetsTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS player_assets (
      id BIGSERIAL PRIMARY KEY,
      player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      asset_id TEXT NOT NULL,
      acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source TEXT NOT NULL DEFAULT 'demo',
      UNIQUE (player_id, asset_id)
    )
  `;
}

export async function getOrCreatePlayer(walletAddress: string): Promise<PlayerRecord> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id BIGSERIAL PRIMARY KEY,
      wallet_address TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const rows = await sql`
    INSERT INTO players (wallet_address)
    VALUES (${walletAddress})
    ON CONFLICT (wallet_address)
    DO UPDATE SET last_login_at = NOW()
    RETURNING
      id::text AS id,
      wallet_address AS "walletAddress",
      created_at::text AS "createdAt",
      last_login_at::text AS "lastLoginAt"
  `;

  const player = rows[0] as PlayerRecord | undefined;
  if (!player) throw new Error("Failed to create or load player");
  return player;
}

export async function getPlayerByWallet(walletAddress: string): Promise<PlayerRecord | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id::text AS id,
      wallet_address AS "walletAddress",
      created_at::text AS "createdAt",
      last_login_at::text AS "lastLoginAt"
    FROM players
    WHERE wallet_address = ${walletAddress}
    LIMIT 1
  `;

  return (rows[0] as PlayerRecord | undefined) ?? null;
}

export async function getPlayerAssetIds(playerId: string): Promise<string[]> {
  await ensurePlayerAssetsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT asset_id AS "assetId"
    FROM player_assets
    WHERE player_id = ${playerId}
    ORDER BY acquired_at ASC, id ASC
  `;
  return rows.map((row) => String(row.assetId));
}

export async function collectPlayerAsset(playerId: string, assetId: string): Promise<string[]> {
  await ensurePlayerAssetsTable();
  const sql = getSql();
  await sql`
    INSERT INTO player_assets (player_id, asset_id, source)
    VALUES (${playerId}, ${assetId}, 'demo')
    ON CONFLICT (player_id, asset_id) DO NOTHING
  `;
  return getPlayerAssetIds(playerId);
}
