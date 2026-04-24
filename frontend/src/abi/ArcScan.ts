export const ARCSCAN_ABI = [
  // ─── SCAN ───────────────────────────────────────────────────────────────
  {
    "type": "function",
    "name": "purchaseScan",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "tokenAddress", "type": "address" },
      { "name": "tier", "type": "uint8" }
    ],
    "outputs": [{ "name": "scanId", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "getScan",
    "stateMutability": "view",
    "inputs": [{ "name": "scanId", "type": "uint256" }],
    "outputs": [{
      "name": "",
      "type": "tuple",
      "components": [
        { "name": "scanner", "type": "address" },
        { "name": "tokenAddress", "type": "address" },
        { "name": "tier", "type": "uint8" },
        { "name": "feePaid", "type": "uint256" },
        { "name": "timestamp", "type": "uint256" },
        { "name": "resultHash", "type": "bytes32" }
      ]
    }]
  },
  {
    "type": "function",
    "name": "scanCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "tierFee",
    "stateMutability": "view",
    "inputs": [{ "name": "tier", "type": "uint8" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "basicScanFee",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "proScanFee",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "deepScanFee",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  // ─── VOTE ───────────────────────────────────────────────────────────────
  {
    "type": "function",
    "name": "castVote",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "tokenAddress", "type": "address" },
      { "name": "signal", "type": "uint8" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "getVotes",
    "stateMutability": "view",
    "inputs": [{ "name": "tokenAddress", "type": "address" }],
    "outputs": [
      { "name": "bullish", "type": "uint256" },
      { "name": "bearish", "type": "uint256" },
      { "name": "neutral", "type": "uint256" },
      { "name": "total", "type": "uint256" }
    ]
  },
  {
    "type": "function",
    "name": "hasVoted",
    "stateMutability": "view",
    "inputs": [
      { "name": "voter", "type": "address" },
      { "name": "tokenAddress", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "voteFee",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  // ─── FEES ───────────────────────────────────────────────────────────────
  {
    "type": "function",
    "name": "totalFeesCollected",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "withdrawFees",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "to", "type": "address" }],
    "outputs": []
  },
  // ─── EVENTS ─────────────────────────────────────────────────────────────
  {
    "type": "event",
    "name": "ScanPurchased",
    "inputs": [
      { "name": "scanId", "type": "uint256", "indexed": true },
      { "name": "scanner", "type": "address", "indexed": true },
      { "name": "tokenAddress", "type": "address", "indexed": true },
      { "name": "tier", "type": "uint8", "indexed": false },
      { "name": "feePaid", "type": "uint256", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "VoteCast",
    "inputs": [
      { "name": "voter", "type": "address", "indexed": true },
      { "name": "tokenAddress", "type": "address", "indexed": true },
      { "name": "signal", "type": "uint8", "indexed": false },
      { "name": "feePaid", "type": "uint256", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ]
  }
] as const;

export const USDC_ABI = [
  {
    "type": "function",
    "name": "approve",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "allowance",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "balanceOf",
    "stateMutability": "view",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "decimals",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }]
  }
] as const;
