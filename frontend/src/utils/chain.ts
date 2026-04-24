import { defineChain } from "viem";

// ─── ARC TESTNET CHAIN DEFINITION ────────────────────────────────────────────
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"],
    },
    public: {
      http: [
        "https://rpc.testnet.arc.network",
        "https://rpc.drpc.testnet.arc.network",
        "https://rpc.quicknode.testnet.arc.network",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan Explorer",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

// ─── CONTRACT ADDRESSES ───────────────────────────────────────────────────────
export const CONTRACTS = {
  // USDC ERC-20 interface on Arc Testnet (6 decimals)
  USDC: "0x3600000000000000000000000000000000000000" as `0x${string}`,
  // EURC on Arc Testnet (6 decimals)
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`,
  // Your deployed ArcScan contract — hardcoded so build always works
  ARCSCAN: "0x95Dcb61bc77806Ea1542FC9fb69a3DA4b3772e4f" as `0x${string}`,
} as const;

// ─── SCAN TIERS ───────────────────────────────────────────────────────────────
export const SCAN_TIERS = [
  {
    id: 0,
    name: "Basic Scan",
    price: 0.5,
    priceRaw: 500_000n,
    features: ["Contract audit", "Liquidity check", "Honeypot test"],
  },
  {
    id: 1,
    name: "Pro Scan",
    price: 1.5,
    priceRaw: 1_500_000n,
    features: ["Everything in Basic", "Holder analysis", "Rug pull score"],
  },
  {
    id: 2,
    name: "Deep Scan",
    price: 3.0,
    priceRaw: 3_000_000n,
    features: ["Everything in Pro", "Dev wallet trace", "Bundle detection", "PDF report"],
  },
] as const;

export const VOTE_FEE = 0.25;
export const VOTE_FEE_RAW = 250_000n;

// ─── URLS ─────────────────────────────────────────────────────────────────────
export const FAUCET_URL  = "https://faucet.circle.com";
export const EXPLORER_URL = "https://testnet.arcscan.app";
