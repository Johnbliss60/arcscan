```markdown
# ⬡ ArcScan

[![Live Demo](https://img.shields.io/badge/Live_Demo-arcscan--inky.vercel.app-00E5C3?style=for-the-badge)](https://arcscan-inky.vercel.app)
[![Arc Network](https://img.shields.io/badge/Network-Arc_Testnet-blue?style=for-the-badge)](https://testnet.arcscan.app)
[![USDC](https://img.shields.io/badge/Settlement-USDC-2775CA?style=for-the-badge)]()

**Token Intelligence & Security Terminal for the Arc Network**

ArcScan is a next-generation token scanner and community sentiment dApp built natively on the Arc Network. It allows users to execute deep-scan security audits and cast on-chain sentiment votes for any token, with all fees settled seamlessly in USDC.

---

## ✨ Key Features

- **🛡️ Deep Security Audits:** Automated smart contract scanning to detect honeypots, mint functions, and liquidity risks (Gemini AI integration currently in progress).
- **🗳️ On-Chain Sentiment Voting:** Community-driven Bullish/Bearish/Neutral signals recorded directly on the Arc blockchain.
- **💳 Native USDC Settlement:** All platform features and gating mechanics are paid for using Circle's USDC on the Arc Testnet.
- **📈 Real-Time Analytics:** Live transaction feeds and token metric visualization.

---

## 🏗️ Architecture & Tech Stack

```text
arcscan/
├── contracts/          ← Solidity (Foundry) — ArcScan payment + Voting logic
├── frontend/           ← React + Vite + wagmi/viem — The dApp UI (Deployed on Vercel)
└── backend/            ← Node/Express — AI Scan Engine API (Deployed on Railway)

```
 * **Frontend:** React, TypeScript, Vite, Wagmi, TanStack Query
 * **Backend:** Node.js, Express, @google/genai (Gemini 2.5 Flash)
 * **Smart Contracts:** Solidity, Foundry toolkit
 * **Network:** Arc Testnet (EVM)
## 🚀 Quick Start (Local Development)
### 1. Prerequisites
 * Node.js (v18+)
 * Foundry installed
 * Web3 Wallet (e.g., MetaMask) configured for Arc Testnet
 * Testnet USDC from the Circle Faucet
### 2. Arc Testnet Wallet Setup
| Field | Value |
|---|---|
| **Network Name** | Arc Testnet |
| **RPC URL** | https://rpc.testnet.arc.network |
| **Chain ID** | 5042002 |
| **Currency Symbol** | USDC |
| **Explorer** | https://testnet.arcscan.app |
### 3. Deploy Smart Contracts
```bash
cd contracts
cp .env.example .env        # Fill in your PRIVATE_KEY
source .env

forge install
forge build
forge test
forge create src/ArcScan.sol:ArcScan --rpc-url $ARC_TESTNET_RPC_URL --private-key $PRIVATE_KEY --broadcast

```
*Note: Copy your deployed address into your frontend environment variables.*
### 4. Run the AI Backend
```bash
cd backend
cp .env.example .env        # Add GEMINI_API_KEY for the AI analysis engine
npm install
npm run dev                 # Starts API on http://localhost:8080

```
### 5. Run the Frontend
```bash
cd frontend
cp .env.example .env        
npm install
npm run dev                 # Starts UI on http://localhost:5173

```
## 📍 Key Addresses (Arc Testnet)
| Asset / Contract | Address |
|---|---|
| **ArcScan Protocol (Live)** | 0x95Dcb61bc77806Ea1542FC9fb69a3DA4b3772e4f |
| **USDC (ERC-20)** | 0x3600000000000000000000000000000000000000 |
| **EURC (ERC-20)** | 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a |
## 🛣️ Roadmap
 * [x] Vercel Frontend Deployment
 * [x] Railway Node.js Backend Deployment
 * [x] USDC Smart Contract Integration
 * [ ] Gemini AI Bytecode Analysis Engine (In Progress)
 * [ ] Real-time WebSockets / TradingView Charting (In Progress)
 * [ ] Mainnet Launch
*Built for the Arc Network Ecosystem.*
```

```
