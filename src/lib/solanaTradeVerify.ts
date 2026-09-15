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
  const payload = await response.json() as { result?: T; error?: { message?: string } };
  if (payload.error) throw new Error(payload.error.message ?? "Solana RPC error");
  if (payload.result === undefined) throw new Error("Solana RPC returned no result");
  return payload.result;
}

export async function getLatestSolanaBlockhash() {
  const result = await rpcCall<{ value?: { blockhash?: string; lastValidBlockHeight?: number } }>("getLatestBlockhash", [{ commitment: "confirmed" }]);
  const blockhash = result.value?.blockhash;
  const lastValidBlockHeight = result.value?.lastValidBlockHeight;
  if (!blockhash || !Number.isInteger(lastValidBlockHeight)) throw new Error("Could not get latest Solana blockhash");
  return { blockhash, lastValidBlockHeight: lastValidBlockHeight! };
}

function sumOwnerMintBalance(balances: RpcTokenBalance[] | undefined, owner: string, mint: string, decimals: number) {
  return (balances ?? []).reduce((total, balance) => {
    if (balance.owner !== owner || balance.mint !== mint) return total;
    if (balance.uiTokenAmount?.decimals !== decimals || !/^\d+$/.test(balance.uiTokenAmount?.amount ?? "")) {
      throw new Error("Ambiguous token balance data");
    }
    return total + BigInt(balance.uiTokenAmount!.amount!);
  }, BigInt(0));
}

function walletSignedTransaction(tx: ParsedTransaction, wallet: string) {
  return (tx.transaction?.message?.accountKeys ?? []).some((key) => {
    if (typeof key === "string") return false;
    return key.pubkey === wallet && key.signer === true;
  });
}

async function getParsedTransaction(signature: string): Promise<ParsedTransaction> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const tx = await rpcCall<ParsedTransaction | null>("getTransaction", [
      signature,
      { encoding: "jsonParsed", commitment: "confirmed", maxSupportedTransactionVersion: 0 },
    ]);
    if (tx) return tx;
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 650));
  }
  throw new Error("Confirmed transaction not found");
}

export async function verifyLoogansTradeTransfer(input: {
  signature: string;
  playerWallet: string;
  treasuryWallet: string;
  mint: string;
  decimals: number;
  amountRaw: string;
}) {
  if (!/^\d+$/.test(input.amountRaw) || BigInt(input.amountRaw) <= BigInt(0)) throw new Error("Invalid quoted amount");
  const tx = await getParsedTransaction(input.signature);
  if (!tx.meta || tx.meta.err) throw new Error("Solana transaction failed");
  if (!walletSignedTransaction(tx, input.playerWallet)) throw new Error("Signed-in wallet did not sign transaction");

  const prePlayer = sumOwnerMintBalance(tx.meta.preTokenBalances, input.playerWallet, input.mint, input.decimals);
  const postPlayer = sumOwnerMintBalance(tx.meta.postTokenBalances, input.playerWallet, input.mint, input.decimals);
  const preTreasury = sumOwnerMintBalance(tx.meta.preTokenBalances, input.treasuryWallet, input.mint, input.decimals);
  const postTreasury = sumOwnerMintBalance(tx.meta.postTokenBalances, input.treasuryWallet, input.mint, input.decimals);
  const expected = BigInt(input.amountRaw);

  if (prePlayer - postPlayer !== expected) throw new Error("Player LOOGANS debit does not match stored quote");
  if (postTreasury - preTreasury !== expected) throw new Error("Treasury LOOGANS credit does not match stored quote");
}
