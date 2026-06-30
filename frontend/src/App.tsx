import { useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { wagmiConfig } from "./utils/wagmi";
import { CONTRACTS, SCAN_TIERS, VOTE_FEE, EXPLORER_URL, FAUCET_URL } from "./utils/chain";
import { useScan } from "./hooks/useScan";
import { useVote, VoteSignal } from "./hooks/useVote";
import "./App.css";

const queryClient = new QueryClient();

// ... (Keep your existing DEMO_TOKENS array here) ...

function ArcScanApp() {
  const [activeToken, setActiveToken] = useState(DEMO_TOKENS[0]);
  const [mobileTab, setMobileTab] = useState<"tokens" | "chart" | "scan">("tokens");

  return (
    <div className="app-shell">
      {/* Glossy Header */}
      <nav className="topnav">
        <div className="nav-brand">
          <div className="brand-hex">⬡</div>
          <span className="brand-name">ARC<span>SCAN</span></span>
        </div>
        <div className="nav-right">
          <button className="btn-primary-sm">Connect Terminal</button>
        </div>
      </nav>

      <div className="mobile-tabs">
        <button className={`mobile-tab-btn ${mobileTab === "tokens" ? "active" : ""}`} onClick={() => setMobileTab("tokens")}>🔥 MARKETS</button>
        <button className={`mobile-tab-btn ${mobileTab === "chart" ? "active" : ""}`} onClick={() => setMobileTab("chart")}>📈 CHART CORE</button>
        <button className={`mobile-tab-btn ${mobileTab === "scan" ? "active" : ""}`} onClick={() => setMobileTab("scan")}>⬡ INTEL TERMINAL</button>
      </div>

      <div className="app-body">
        {/* Sidebar: Keeps your Glassy Token List */}
        <aside className="sidebar" data-tab={mobileTab}>
          <div className="sidebar-section">
            <div className="sidebar-label">🔥 Hot Tokens</div>
            {DEMO_TOKENS.map((t) => (
              <div key={t.sym} className={`token-row ${activeToken.sym === t.sym ? "active" : ""}`} onClick={() => { setActiveToken(t); setMobileTab("chart"); }}>
                <span className="token-row-icon">{t.icon}</span>
                <div className="token-row-info">
                  <span className="token-row-sym">{t.sym}</span>
                  <span className="token-row-price">{t.price}</span>
                </div>
                <span className={`token-row-chg ${t.change >= 0 ? "up" : "dn"}`}>{t.change >= 0 ? "+" : ""}{t.change}%</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Glass Area */}
        <main className="main-area" data-tab={mobileTab}>
           {/* Your existing Chart and Header code goes here. 
               By using your existing classes like 'token-header', 'chart-canvas', 
               and 'tx-row', the glossy look will automatically return! */}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ArcScanApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
