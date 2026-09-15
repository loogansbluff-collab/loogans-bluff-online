const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

type RpcTokenBalance = {
  mint?: string;
  owner?: string;
  uiTokenAmount?: { amount?: string; decimals?: number };
};

type ParsedTransaction = {
  meta?: {
    err?: unknown;
    preTokenBalances?: RpcTokenBalance[];
    postTokenBalances?: RpcTokenBalance[];
  };
  transaction?: {
    message?: {
      accountKeys?: Array<string | { pubkey?: string; signer?: boolean }>;
    };
  };
};

function getRpcUrl() {
  const value = process.env.SOLANA_RPC_URL?.trim();
  if (!value) throw new Error("SOLANA_RPC_URL must be configured");
  return value;
}

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(getRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!response.ok) throw new Error(`Solana RPC HTTP ${response.status}`);
  const payload = (await response.json()) as { result?: T; error?: { message?: string } };
  if (payload.error) throw new Error(payload.error.message ?? "Solana RPC error");
  if (payload.result === undefined) throw new Error("Solana RPC returned no result");
  return payload.result;
}

export async function getLatestSolanaBlockhash() {
  const result = await rpcCall<{ value?: { blockhash?: string; lastValidBlockHeight?: number } }>(
    "getLatestBlockhash",
    [{ commitment: "confirmed" }],
  );
  const blockhash = result.value?.blockhash;
  const lastValidBlockHeight = result.value?.lastValidBlockHeight;
  if (!blockhash || !Number.isInteger(lastValidBlockHeight)) {
    throw new Error("Could not get latest Solana blockhash");
  }
  return { blockhash, lastValidBlockHeight: lastValidBlockHeight as number };
}

export async function getMintTokenProgram(mint: string) {
  const result = await rpcCall<{ value?: { owner?: string } | null }>("getAccountInfo", [
    mint,
    { encoding: "base64", commitment: "confirmed" },
  ]);
  const owner = result.value?.owner;
  if (owner !== TOKEN_PROGRAM_ID && owner !== TOKEN_2022_PROGRAM_ID) {
    throw new Error("LOOGANS mint is not owned by a supported SPL token program");
  }
  return owner;
}

function sumOwnerMintBalance(
  balances: RpcTokenBalance[] | undefined,
  owner: string,
  mint: string,
  decimals: number,
) {
  return (balances ?? []).reduce((total, balance) => {
    if (balance.owner !== owner || balance.mint !== mint) return total;
    const amount = balance.uiTokenAmount?.amount;
    if (balance.uiTokenAmount?.decimals !== decimals || !amount || !/^\d+$/.test(amount)) {
      throw new Error("Ambiguous token balance data");
    }
    return total + BigInt(amount);
  }, BigInt(0));
}

function walletSignedTransaction(tx: ParsedTransaction, wallet: string) {
  return (tx.transaction?.message?.accountKeys ?? []).some((key) => {
    if (typeof key === "string") return false;
    return key.pubkey === wallet && key.signer === true;
  });
}

async function getParsedTransaction(signature: string): Promise<ParsedTransaction> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const tx = await rpcCall<ParsedTransaction | null>("getTransaction", [
      signature,
      { encoding: "jsonParsed", commitment: "confirmed", maxSupportedTransactionVersion: 0 },
    ]);
    if (tx) return tx;
    if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 700));
  }
  throw new Error("Confirmed transaction not found");
}

function assertNoUnexpectedMintDeltas(input: {
  pre: RpcTokenBalance[] | undefined;
  post: RpcTokenBalance[] | undefined;
  mint: string;
  decimals: number;
  allowedOwners: string[];
}) {
  const owners = new Set<string>();
  for (const balance of [...(input.pre ?? []), ...(input.post ?? [])]) {
    if (balance.mint !== input.mint) continue;
    if (!balance.owner) throw new Error("Ambiguous LOOGANS token owner data");
    owners.add(balance.owner);
  }

  const allowed = new Set(input.allowedOwners);
  for (const owner of owners) {
    const pre = sumOwnerMintBalance(input.pre, owner, input.mint, input.decimals);
    const post = sumOwnerMintBalance(input.post, owner, input.mint, input.decimals);
    if (post - pre !== BigInt(0) && !allowed.has(owner)) {
      throw new Error("Unexpected LOOGANS movement in payout transaction");
    }
  }
}

export async function verifyLoogansTradeTransfer(input: {
  signature: string;
  playerWallet: string;
  treasuryWallet: string;
  mint: string;
  decimals: number;
  amountRaw: string;
}) {
  if (!/^\d+$/.test(input.amountRaw) || BigInt(input.amountRaw) <= BigInt(0)) {
    throw new Error("Invalid quoted amount");
  }

  const tx = await getParsedTransaction(input.signature);
  if (!tx.meta || tx.meta.err) throw new Error("Solana transaction failed");
  if (!walletSignedTransaction(tx, input.playerWallet)) {
    throw new Error("Signed-in wallet did not sign transaction");
  }

  const prePlayer = sumOwnerMintBalance(
    tx.meta.preTokenBalances,
    input.playerWallet,
    input.mint,
    input.decimals,
  );
  const postPlayer = sumOwnerMintBalance(
    tx.meta.postTokenBalances,
    input.playerWallet,
    input.mint,
    input.decimals,
  );
  const preTreasury = sumOwnerMintBalance(
    tx.meta.preTokenBalances,
    input.treasuryWallet,
    input.mint,
    input.decimals,
  );
  const postTreasury = sumOwnerMintBalance(
    tx.meta.postTokenBalances,
    input.treasuryWallet,
    input.mint,
    input.decimals,
  );
  const expected = BigInt(input.amountRaw);

  if (prePlayer - postPlayer !== expected) {
    throw new Error("Player LOOGANS debit does not match stored quote");
  }
  if (postTreasury - preTreasury !== expected) {
    throw new Error("Treasury LOOGANS credit does not match stored quote");
  }
}

export async function verifyLoogansTradeBackTransfer(input: {
  signature: string;
  playerWallet: string;
  treasuryWallet: string;
  mint: string;
  decimals: number;
  amountRaw: string;
}) {
  if (!/^\d+$/.test(input.amountRaw) || BigInt(input.amountRaw) <= BigInt(0)) {
    throw new Error("Invalid TRADE BACK amount");
  }

  const tx = await getParsedTransaction(input.signature);
  if (!tx.meta || tx.meta.err) throw new Error("Treasury payout transaction failed");
  if (!walletSignedTransaction(tx, input.treasuryWallet)) {
    throw new Error("Treasury wallet did not sign payout transaction");
  }

  const preTreasury = sumOwnerMintBalance(
    tx.meta.preTokenBalances,
    input.treasuryWallet,
    input.mint,
    input.decimals,
  );
  const postTreasury = sumOwnerMintBalance(
    tx.meta.postTokenBalances,
    input.treasuryWallet,
    input.mint,
    input.decimals,
  );
  const prePlayer = sumOwnerMintBalance(
    tx.meta.preTokenBalances,
    input.playerWallet,
    input.mint,
    input.decimals,
  );
  const postPlayer = sumOwnerMintBalance(
    tx.meta.postTokenBalances,
    input.playerWallet,
    input.mint,
    input.decimals,
  );
  const expected = BigInt(input.amountRaw);

  if (preTreasury - postTreasury !== expected) {
    throw new Error("Treasury LOOGANS debit does not match TRADE BACK amount");
  }
  if (postPlayer - prePlayer !== expected) {
    throw new Error("Player LOOGANS credit does not match TRADE BACK amount");
  }

  assertNoUnexpectedMintDeltas({
    pre: tx.meta.preTokenBalances,
    post: tx.meta.postTokenBalances,
    mint: input.mint,
    decimals: input.decimals,
    allowedOwners: [input.treasuryWallet, input.playerWallet],
  });
}
