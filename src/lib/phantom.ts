export type PhantomPublicKey = {
  toString: () => string;
};

export type PhantomSignedMessage = {
  publicKey: PhantomPublicKey;
  signature: Uint8Array;
};

export type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: PhantomPublicKey | null;
  connect: () => Promise<{ publicKey: PhantomPublicKey }>;
  disconnect: () => Promise<void>;
  signMessage?: (message: Uint8Array, display?: "utf8" | "hex") => Promise<PhantomSignedMessage>;
  on?: (event: "connect" | "disconnect" | "accountChanged", handler: (value?: PhantomPublicKey | null) => void) => void;
  off?: (event: "connect" | "disconnect" | "accountChanged", handler: (value?: PhantomPublicKey | null) => void) => void;
};

type WalletWindow = Window & {
  phantom?: { solana?: PhantomProvider };
  solana?: PhantomProvider;
};

export function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const walletWindow = window as WalletWindow;
  const provider = walletWindow.phantom?.solana ?? walletWindow.solana;
  return provider?.isPhantom ? provider : null;
}

export function shortWallet(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary);
}
