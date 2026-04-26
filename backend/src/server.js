// backend/src/server.js
// ArcScan Backend — Token data API + scan engine
// Node.js + Express + viem for Arc RPC calls

import express from "express";
import cors from "cors";
import { createPublicClient, http, isAddress, formatUnits } from "viem";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://arcscan-git-ssh-newmans-projects-6d3236d5.vercel.app",
    /\.vercel\.app$/
  ],
  methods: ["GET", "POST"],
}));

app.use(express.json());

// ─── ARC TESTNET CLIENT ───────────────────────────────────────────────────────
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
};

const arcClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

// ─── USDC ERC-20 ABI (minimal) ────────────────────────────────────────────────
const ERC20_ABI = [
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
];

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", network: "Arc Testnet", chainId: 5042002 });
});

// Get block number from Arc
app.get("/api/block", async (req, res) => {
  try {
    const block = await arcClient.getBlockNumber();
    res.json({ blockNumber: block.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ERC-20 token info from Arc
app.get("/api/token/:address", async (req, res) => {
  const { address } = req.params;
  if (!isAddress(address)) {
    return res.status(400).json({ error: "Invalid address" });
  }

  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      arcClient.readContract({ address, abi: ERC20_ABI, functionName: "name" }).catch(() => "Unknown"),
      arcClient.readContract({ address, abi: ERC20_ABI, functionName: "symbol" }).catch(() => "???"),
      arcClient.readContract({ address, abi: ERC20_ABI, functionName: "decimals" }).catch(() => 18),
      arcClient.readContract({ address, abi: ERC20_ABI, functionName: "totalSupply" }).catch(() => 0n),
    ]);

    res.json({
      address,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: formatUnits(BigInt(totalSupply), Number(decimals)),
      network: "Arc Testnet",
      explorer: `https://testnet.arcscan.app/address/${address}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SCAN ENGINE ──────────────────────────────────────────────────────────────
// In production: triggered by listening for ScanPurchased events from your
// ArcScan contract. Here we simulate the analysis response.

app.post("/api/scan", async (req, res) => {
  const { tokenAddress, tier, scanId } = req.body;

  if (!isAddress(tokenAddress)) {
    return res.status(400).json({ error: "Invalid token address" });
  }

  // Fetch basic on-chain data
  let tokenInfo = {};
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      arcClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: "name" }).catch(() => "Unknown"),
      arcClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: "symbol" }).catch(() => "???"),
      arcClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: "decimals" }).catch(() => 18),
      arcClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: "totalSupply" }).catch(() => 0n),
    ]);
    tokenInfo = { name, symbol, decimals: Number(decimals), totalSupply: totalSupply.toString() };
  } catch (err) {
    tokenInfo = { error: "Could not read token contract" };
  }

  // Simulate scan findings (replace with real analysis in production)
  const tierNum = Number(tier);
  const findings = generateFindings(tokenAddress, tierNum, tokenInfo);

  res.json({
    scanId,
    tokenAddress,
    tier: tierNum,
    timestamp: Date.now(),
    tokenInfo,
    findings,
    network: "Arc Testnet",
    explorerUrl: `https://testnet.arcscan.app/address/${tokenAddress}`,
  });
});

function generateFindings(address, tier, tokenInfo) {
  const base = [
    { type: "info", icon: "✅", text: `Contract at ${address.slice(0, 10)}... found on Arc Testnet` },
    { type: "info", icon: tokenInfo.name ? "✅" : "⚠️", text: tokenInfo.name ? `Token: ${tokenInfo.name} (${tokenInfo.symbol})` : "Contract ABI not verified" },
  ];

  if (tier >= 1) {
    base.push(
      { type: "warning", icon: "⚠️", text: "Holder concentration: top 10 wallets hold ~41% of supply" },
      { type: "ok", icon: "✅", text: "No honeypot patterns detected in transfer function" }
    );
  }

  if (tier >= 2) {
    base.push(
      { type: "ok", icon: "✅", text: "No bundle launch detected in genesis block" },
      { type: "warning", icon: "🔴", text: "Owner can modify sell tax — CAUTION" },
      { type: "ok", icon: "✅", text: "PDF report available at /api/scan/report" }
    );
  }

  return base;
}

// ─── ArcScan CONTRACT EVENT LISTENER ────────────────────────────────────────
// In production, use this to watch for ScanPurchased events and trigger scans:
//
// arcClient.watchContractEvent({
//   address: process.env.ARCSCAN_CONTRACT,
//   abi: ARCSCAN_ABI,
//   eventName: 'ScanPurchased',
//   onLogs: async (logs) => {
//     for (const log of logs) {
//       const { scanId, scanner, tokenAddress, tier } = log.args;
//       const result = await runScan(tokenAddress, tier);
//       // Post result hash back to contract via owner wallet
//     }
//   }
// });

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🔷 ArcScan Backend running on http://localhost:${PORT}`);
  console.log(`   Network: Arc Testnet (Chain ID: 5042002)`);
  console.log(`   RPC: https://rpc.testnet.arc.network`);
  console.log(`   Explorer: https://testnet.arcscan.app\n`);
});
