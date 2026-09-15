import { neon } from "@neondatabase/serverless";

export type PlayerRecord = {
  id: string;
  walletAddress: string;
  createdAt: string;
  lastLoginAt: string;
};

export type AssetTradeQuoteRecord = {
  id: string;
  playerId: string;
  walletAddress: string;
  assetId: string;
  usdCents: number;
  mint: string;
  mintDecimals: number;
  loogansAmountRaw: string;
  priceUsdPerToken: string;
  priceSource: string;
  status: string;
  usedSignature: string | null;
  createdAt: string;
  expiresAt: string;
};

export type TradeBackPendingRecord = {
  id: string;
  playerId: string;
  walletAddress: string;
  assetId: string;
  tradeInLedgerId: string;
  quoteId: string;
  amountRaw: string;
  mint: string;
  payoutSignature: string | null;
  createdAt: string;
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

async function ensureAssetTradeQuotesTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS asset_trade_quotes (
      id TEXT PRIMARY KEY,
      player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      wallet_address TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      usd_cents INTEGER NOT NULL,
      mint TEXT NOT NULL,
      mint_decimals SMALLINT NOT NULL,
      loogans_amount_raw NUMERIC(40, 0) NOT NULL,
      price_usd_per_token TEXT NOT NULL,
      price_source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      used_signature TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`ALTER TABLE asset_trade_quotes ADD COLUMN IF NOT EXISTS used_signature TEXT`;
  await sql`
    CREATE INDEX IF NOT EXISTS asset_trade_quotes_player_asset_created_idx
    ON asset_trade_quotes (player_id, asset_id, created_at DESC)
  `;
}

async function ensureAssetTradeLedgerTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS asset_trade_ledger (
      id BIGSERIAL PRIMARY KEY,
      player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      wallet_address TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      quote_id TEXT NOT NULL REFERENCES asset_trade_quotes(id),
      amount_raw NUMERIC(40, 0) NOT NULL,
      mint TEXT NOT NULL,
      tx_signature TEXT NOT NULL UNIQUE,
      direction TEXT NOT NULL,
      status TEXT NOT NULL,
      related_trade_id BIGINT REFERENCES asset_trade_ledger(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE asset_trade_ledger DROP CONSTRAINT IF EXISTS asset_trade_ledger_quote_id_key`;
  await sql`ALTER TABLE asset_trade_ledger ADD COLUMN IF NOT EXISTS related_trade_id BIGINT REFERENCES asset_trade_ledger(id)`;
  await sql`
    CREATE INDEX IF NOT EXISTS asset_trade_ledger_player_asset_direction_idx
    ON asset_trade_ledger (player_id, asset_id, direction, created_at DESC)
  `;
}

async function ensureTradeBackPendingTable() {
  await ensureAssetTradeQuotesTable();
  await ensureAssetTradeLedgerTable();
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS asset_trade_back_pending (
      id BIGSERIAL PRIMARY KEY,
      player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      wallet_address TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      trade_in_ledger_id BIGINT NOT NULL REFERENCES asset_trade_ledger(id),
      quote_id TEXT NOT NULL REFERENCES asset_trade_quotes(id),
      amount_raw NUMERIC(40, 0) NOT NULL,
      mint TEXT NOT NULL,
      payout_signature TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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

export async function playerOwnsAsset(playerId: string, assetId: string): Promise<boolean> {
  await ensurePlayerAssetsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT 1 AS owned
    FROM player_assets
    WHERE player_id = ${playerId} AND asset_id = ${assetId}
    LIMIT 1
  `;
  return rows.length > 0;
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

export async function createAssetTradeQuote(input: {
  id: string;
  playerId: string;
  walletAddress: string;
  assetId: string;
  usdCents: number;
  mint: string;
  mintDecimals: number;
  loogansAmountRaw: string;
  priceUsdPerToken: string;
  priceSource: string;
  expiresAt: Date;
}): Promise<AssetTradeQuoteRecord> {
  await ensureAssetTradeQuotesTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO asset_trade_quotes (
      id,
      player_id,
      wallet_address,
      asset_id,
      usd_cents,
      mint,
      mint_decimals,
      loogans_amount_raw,
      price_usd_per_token,
      price_source,
      expires_at
    )
    VALUES (
      ${input.id},
      ${input.playerId},
      ${input.walletAddress},
      ${input.assetId},
      ${input.usdCents},
      ${input.mint},
      ${input.mintDecimals},
      ${input.loogansAmountRaw},
      ${input.priceUsdPerToken},
      ${input.priceSource},
      ${input.expiresAt.toISOString()}
    )
    RETURNING
      id,
      player_id::text AS "playerId",
      wallet_address AS "walletAddress",
      asset_id AS "assetId",
      usd_cents AS "usdCents",
      mint,
      mint_decimals AS "mintDecimals",
      loogans_amount_raw::text AS "loogansAmountRaw",
      price_usd_per_token AS "priceUsdPerToken",
      price_source AS "priceSource",
      status,
      used_signature AS "usedSignature",
      created_at::text AS "createdAt",
      expires_at::text AS "expiresAt"
  `;

  const quote = rows[0] as AssetTradeQuoteRecord | undefined;
  if (!quote) throw new Error("Failed to create asset trade quote");
  return quote;
}

export async function getAssetTradeQuoteById(id: string): Promise<AssetTradeQuoteRecord | null> {
  await ensureAssetTradeQuotesTable();
  const sql = getSql();
  const rows = await sql`
    SELECT
      id,
      player_id::text AS "playerId",
      wallet_address AS "walletAddress",
      asset_id AS "assetId",
      usd_cents AS "usdCents",
      mint,
      mint_decimals AS "mintDecimals",
      loogans_amount_raw::text AS "loogansAmountRaw",
      price_usd_per_token AS "priceUsdPerToken",
      price_source AS "priceSource",
      status,
      used_signature AS "usedSignature",
      created_at::text AS "createdAt",
      expires_at::text AS "expiresAt"
    FROM asset_trade_quotes
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as AssetTradeQuoteRecord | undefined) ?? null;
}

export async function isTradeSignatureUsed(signature: string): Promise<boolean> {
  await ensureAssetTradeQuotesTable();
  await ensureAssetTradeLedgerTable();
  const sql = getSql();
  const rows = await sql`
    SELECT 1 AS used
    FROM asset_trade_ledger
    WHERE tx_signature = ${signature}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function finalizeLoogansTrade(input: {
  quoteId: string;
  playerId: string;
  walletAddress: string;
  assetId: string;
  signature: string;
}): Promise<string[]> {
  await ensurePlayerAssetsTable();
  await ensureAssetTradeQuotesTable();
  await ensureAssetTradeLedgerTable();
  const sql = getSql();

  const rows = await sql`
    WITH consumed_quote AS (
      UPDATE asset_trade_quotes
      SET status = 'used', used_signature = ${input.signature}
      WHERE id = ${input.quoteId}
        AND player_id = ${input.playerId}
        AND wallet_address = ${input.walletAddress}
        AND asset_id = ${input.assetId}
        AND status = 'open'
        AND expires_at > NOW()
      RETURNING id, player_id, wallet_address, asset_id, loogans_amount_raw, mint
    ), ledger_write AS (
      INSERT INTO asset_trade_ledger (
        player_id,
        wallet_address,
        asset_id,
        quote_id,
        amount_raw,
        mint,
        tx_signature,
        direction,
        status
      )
      SELECT
        player_id,
        wallet_address,
        asset_id,
        id,
        loogans_amount_raw,
        mint,
        ${input.signature},
        'trade_in',
        'confirmed'
      FROM consumed_quote
      RETURNING id
    ), asset_write AS (
      INSERT INTO player_assets (player_id, asset_id, source)
      SELECT player_id, asset_id, 'loogans_trade'
      FROM consumed_quote
      RETURNING asset_id
    )
    SELECT
      (SELECT COUNT(*)::int FROM consumed_quote) AS consumed,
      (SELECT COUNT(*)::int FROM ledger_write) AS ledger,
      (SELECT COUNT(*)::int FROM asset_write) AS asset
  `;

  const result = rows[0] as { consumed?: number; ledger?: number; asset?: number } | undefined;
  if (!result || result.consumed !== 1 || result.ledger !== 1 || result.asset !== 1) {
    throw new Error("Trade could not be finalized atomically");
  }

  return getPlayerAssetIds(input.playerId);
}

function pendingFromRow(row: Record<string, unknown>): TradeBackPendingRecord {
  return {
    id: String(row.id),
    playerId: String(row.playerId),
    walletAddress: String(row.walletAddress),
    assetId: String(row.assetId),
    tradeInLedgerId: String(row.tradeInLedgerId),
    quoteId: String(row.quoteId),
    amountRaw: String(row.amountRaw),
    mint: String(row.mint),
    payoutSignature: row.payoutSignature ? String(row.payoutSignature) : null,
    createdAt: String(row.createdAt),
  };
}

export async function getTradeBackPending(playerId: string, assetId: string): Promise<TradeBackPendingRecord | null> {
  await ensureTradeBackPendingTable();
  const sql = getSql();
  const rows = await sql`
    SELECT
      id::text AS id,
      player_id::text AS "playerId",
      wallet_address AS "walletAddress",
      asset_id AS "assetId",
      trade_in_ledger_id::text AS "tradeInLedgerId",
      quote_id AS "quoteId",
      amount_raw::text AS "amountRaw",
      mint,
      payout_signature AS "payoutSignature",
      created_at::text AS "createdAt"
    FROM asset_trade_back_pending
    WHERE player_id = ${playerId} AND asset_id = ${assetId}
    LIMIT 1
  `;
  return rows[0] ? pendingFromRow(rows[0] as Record<string, unknown>) : null;
}

export async function acquireTradeBackLock(input: {
  playerId: string;
  walletAddress: string;
  assetId: string;
}): Promise<TradeBackPendingRecord | null> {
  await ensurePlayerAssetsTable();
  await ensureTradeBackPendingTable();
  const sql = getSql();
  const rows = await sql`
    WITH eligible AS (
      SELECT
        l.id AS trade_in_ledger_id,
        l.quote_id,
        l.amount_raw,
        l.mint
      FROM player_assets pa
      JOIN asset_trade_ledger l
        ON l.player_id = pa.player_id
       AND l.asset_id = pa.asset_id
       AND l.direction = 'trade_in'
       AND l.status = 'confirmed'
      WHERE pa.player_id = ${input.playerId}
        AND pa.asset_id = ${input.assetId}
        AND pa.source = 'loogans_trade'
        AND l.wallet_address = ${input.walletAddress}
        AND NOT EXISTS (
          SELECT 1
          FROM asset_trade_ledger back
          WHERE back.direction = 'trade_back'
            AND back.status = 'confirmed'
            AND back.related_trade_id = l.id
        )
      ORDER BY l.created_at DESC, l.id DESC
      LIMIT 1
    ), locked AS (
      INSERT INTO asset_trade_back_pending (
        player_id,
        wallet_address,
        asset_id,
        trade_in_ledger_id,
        quote_id,
        amount_raw,
        mint
      )
      SELECT
        ${input.playerId},
        ${input.walletAddress},
        ${input.assetId},
        trade_in_ledger_id,
        quote_id,
        amount_raw,
        mint
      FROM eligible
      ON CONFLICT (player_id, asset_id) DO NOTHING
      RETURNING
        id,
        player_id,
        wallet_address,
        asset_id,
        trade_in_ledger_id,
        quote_id,
        amount_raw,
        mint,
        payout_signature,
        created_at
    )
    SELECT
      id::text AS id,
      player_id::text AS "playerId",
      wallet_address AS "walletAddress",
      asset_id AS "assetId",
      trade_in_ledger_id::text AS "tradeInLedgerId",
      quote_id AS "quoteId",
      amount_raw::text AS "amountRaw",
      mint,
      payout_signature AS "payoutSignature",
      created_at::text AS "createdAt"
    FROM locked
  `;
  return rows[0] ? pendingFromRow(rows[0] as Record<string, unknown>) : null;
}

export async function setTradeBackPayoutSignature(pendingId: string, signature: string): Promise<boolean> {
  await ensureTradeBackPendingTable();
  const sql = getSql();
  const rows = await sql`
    UPDATE asset_trade_back_pending
    SET payout_signature = ${signature}
    WHERE id = ${pendingId} AND payout_signature IS NULL
    RETURNING id
  `;
  return rows.length === 1;
}

export async function releaseTradeBackLock(pendingId: string): Promise<void> {
  await ensureTradeBackPendingTable();
  const sql = getSql();
  await sql`
    DELETE FROM asset_trade_back_pending
    WHERE id = ${pendingId} AND payout_signature IS NULL
  `;
}

export async function finalizeTradeBack(input: {
  pendingId: string;
  playerId: string;
  walletAddress: string;
  assetId: string;
  signature: string;
}): Promise<string[]> {
  await ensurePlayerAssetsTable();
  await ensureTradeBackPendingTable();
  const sql = getSql();
  const rows = await sql`
    WITH pending AS (
      SELECT *
      FROM asset_trade_back_pending
      WHERE id = ${input.pendingId}
        AND player_id = ${input.playerId}
        AND wallet_address = ${input.walletAddress}
        AND asset_id = ${input.assetId}
        AND payout_signature = ${input.signature}
    ), asset_delete AS (
      DELETE FROM player_assets pa
      USING pending p
      WHERE pa.player_id = p.player_id
        AND pa.asset_id = p.asset_id
        AND pa.source = 'loogans_trade'
      RETURNING pa.player_id, pa.asset_id
    ), ledger_write AS (
      INSERT INTO asset_trade_ledger (
        player_id,
        wallet_address,
        asset_id,
        quote_id,
        amount_raw,
        mint,
        tx_signature,
        direction,
        status,
        related_trade_id
      )
      SELECT
        p.player_id,
        p.wallet_address,
        p.asset_id,
        p.quote_id,
        p.amount_raw,
        p.mint,
        p.payout_signature,
        'trade_back',
        'confirmed',
        p.trade_in_ledger_id
      FROM pending p
      WHERE EXISTS (SELECT 1 FROM asset_delete)
      RETURNING id
    ), pending_delete AS (
      DELETE FROM asset_trade_back_pending p
      WHERE p.id = ${input.pendingId}
        AND EXISTS (SELECT 1 FROM ledger_write)
      RETURNING p.id
    )
    SELECT
      (SELECT COUNT(*)::int FROM pending) AS pending_count,
      (SELECT COUNT(*)::int FROM asset_delete) AS asset_count,
      (SELECT COUNT(*)::int FROM ledger_write) AS ledger_count,
      (SELECT COUNT(*)::int FROM pending_delete) AS lock_count
  `;

  const result = rows[0] as {
    pending_count?: number;
    asset_count?: number;
    ledger_count?: number;
    lock_count?: number;
  } | undefined;
  if (
    !result ||
    result.pending_count !== 1 ||
    result.asset_count !== 1 ||
    result.ledger_count !== 1 ||
    result.lock_count !== 1
  ) {
    throw new Error("TRADE BACK could not be finalized atomically");
  }

  return getPlayerAssetIds(input.playerId);
}
