# ArcScan — Token Intelligence Platform on Arc Network

DEXTools-style token scanner & community voting dApp.  
Users pay USDC to deep-scan tokens and vote — all settled on Arc Network.

---

## Project Structure

```
arcscan/
├── contracts/          ← Solidity (Foundry) — ArcScan + Voting contracts
├── frontend/           ← React + Vite + wagmi/viem — The dApp UI
├── backend/            ← Node/Express — Token data API + scan engine
└── README.md
```

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- [Foundry](https://getfoundry.sh/) installed
- MetaMask with Arc Testnet added
- Testnet USDC from https://faucet.circle.com

### 2. Arc Testnet MetaMask Setup
| Field | Value |
|---|---|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.testnet.arc.network |
| Chain ID | 5042002 |
| Currency Symbol | USDC |
| Explorer | https://testnet.arcscan.app |

### 3. Deploy Contracts
```bash
cd contracts
cp .env.example .env        # fill in your PRIVATE_KEY
source .env
forge install
forge build
forge test
forge create src/ArcScan.sol:ArcScan --rpc-url $ARC_TESTNET_RPC_URL --private-key $PRIVATE_KEY --broadcast
# → copy deployed address into frontend/.env as VITE_ARCSCAN_ADDRESS
```

### 4. Run Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev                 # starts on http://localhost:3001
```

### 5. Run Frontend
```bash
cd frontend
cp .env.example .env        # fill in contract address from step 3
npm install
npm run dev                 # starts on http://localhost:5173
```

---

## Key Addresses (Arc Testnet)
| Contract | Address |
|---|---|
| USDC (ERC-20) | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |
