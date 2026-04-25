import { useState, useEffect } from "react";
import { WagmiProvider, useAccount, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./utils/wagmi";
import { useScan } from "./hooks/useScan";
import { useVote, VoteSignal } from "./hooks/useVote";
import {
  SCAN_TIERS,
  VOTE_FEE,
  FAUCET_URL,
  EXPLORER_URL,
} from "./utils/chain";
import "./App.css";

const queryClient = new QueryClient();

const DEMO_TOKENS = [
  { sym: "ARCD",  name: "ArcDoge",    icon: "🔶", price: "$0.412", change: 8.4,  address: "0x95Dcb61bc77806Ea1542FC9fb69a3DA4b3772e4f" as `0x${string}` },
  { sym: "ARCX",  name: "ArcX",       icon: "🔷", price: "$1.204", change: -2.1, address: "0x1111111111111111111111111111111111111111" as `0x${string}` },
  { sym: "NEON",  name: "NeonArc",    icon: "🟣", price: "$0.088", change: 14.7, address: "0x2222222222222222222222222222222222222222" as `0x${string}` },
  { sym: "FLUX",  name: "ArcFlux",    icon: "🟡", price: "$0.331", change: -5.3, address: "0x3333333333333333333333333333333333333333" as `0x${string}` },
  { sym: "NOVA",  name: "ArcNova",    icon: "🔴", price: "$2.017", change: 3.2,  address: "0x4444444444444444444444444444444444444444" as `0x${string}` },
];

// ─── WALLET BUTTON ────────────────────────────────────────────────────────────
function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span className="wallet-addr">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button className="btn-outline-sm" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn-primary-sm"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect Wallet
    </button>
  );
}

// ─── SCAN WIDGET ──────────────────────────────────────────────────────────────
function ScanWidget({ tokenAddress, tokenSym }: { tokenAddress: `0x${string}`; tokenSym: string }) {
  const { isConnected } = useAccount();
  const [selectedTier, setSelectedTier] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [scanFindings, setScanFindings] = useState<any[]>([]);
  const { step, error, txHash, executeScan, reset } = useScan();

  const handleConfirm = async () => {
    await executeScan(tokenAddress, selectedTier);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress, tier: selectedTier, scanId: Date.now() }),
      });
      const data = await res.json();
      setScanFindings(data.findings || []);
    } catch {
      setScanFindings([{ icon: "⚠️", text: "Backend not reachable." }]);
    }
  };

  const stepLabel: Record<string, string> = {
    idle: "",
    checking_allowance: "Checking USDC allowance...",
    approving: "Approve USDC in wallet...",
    approved: "USDC approved ✓",
    purchasing: "Confirm scan in wallet...",
    confirming: "Confirming on Arc Network...",
    done: "Scan complete! ✓",
    error: `Error: ${error}`,
  };

  return (
    <>
      <div className="widget scan-widget">
        <div className="widget-header">
          <span className="widget-icon">⬡</span>
          <span className="widget-title">DEEP SCAN</span>
        </div>
        <p className="widget-desc">
          Unlock full token intelligence. Pay USDC on Arc Network for an instant security audit.
        </p>
        <div className="tier-list">
          {SCAN_TIERS.map((tier, i) => (
            <div
              key={i}
              className={`tier-row ${selectedTier === i ? "selected" : ""}`}
              onClick={() => setSelectedTier(i)}
            >
              <div>
                <div className="tier-name">{tier.name}</div>
                <div className="tier-features">{tier.features.join(" · ")}</div>
              </div>
              <div className="tier-price">
                ${tier.price}<span>USDC</span>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn-primary w-full"
          disabled={!isConnected}
          onClick={() => { reset(); setScanFindings([]); setShowModal(true); }}
        >
          {isConnected ? "SCAN TOKEN" : "CONNECT WALLET TO SCAN"}
        </button>
        <p className="widget-note">Fees settled instantly on Arc via USDC. No hidden costs.</p>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="modal-title">Confirm Scan</h2>
            <p className="modal-sub">Payment via Arc Network USDC</p>

            {step === "idle" || step === "checking_allowance" ? (
              <>
                <div className="breakdown">
                  <div className="breakdown-row"><span>Scan Type</span><span>{SCAN_TIERS[selectedTier].name}</span></div>
                  <div className="breakdown-row"><span>Token</span><span>{tokenSym}</span></div>
                  <div className="breakdown-row"><span>Network</span><span style={{ color: "var(--arc)" }}>Arc Testnet</span></div>
                  <div className="breakdown-row"><span>Gas</span><span style={{ color: "var(--muted)" }}>~0.001 USDC</span></div>
                  <div className="breakdown-row total">
                    <span>Total</span>
                    <span>${(SCAN_TIERS[selectedTier].price + 0.001).toFixed(3)} USDC</span>
                  </div>
                </div>
                <button className="btn-primary w-full" onClick={handleConfirm}>CONFIRM & PAY</button>
                <button className="btn-ghost w-full" onClick={() => setShowModal(false)}>Cancel</button>
              </>
            ) : step === "done" ? (
              <div className="modal-success">
                <div className="success-icon">✓</div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>Scan purchased onchain!</p>
                {txHash && (
                  <a href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">
                    View on ArcScan Explorer →
                  </a>
                )}
                {scanFindings.length > 0 && (
                  <div style={{ width: "100%", marginTop: 16, textAlign: "left" }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--arc)", marginBottom: 10, fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                      ⬡ SCAN FINDINGS — {SCAN_TIERS[selectedTier].name.toUpperCase()}
                    </div>
                    {scanFindings.map((f: any, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 8, padding: "6px 8px", background: "var(--dark)", border: "1px solid var(--border)" }}>
                        <span style={{ flexShrink: 0 }}>{f.icon}</span>
                        <span style={{ color: "var(--text)", lineHeight: 1.5 }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn-primary w-full" style={{ marginTop: 12 }} onClick={() => setShowModal(false)}>Close</button>
              </div>
            ) : (
              <div className="modal-processing">
                {step !== "error" && <div className="spinner" />}
                <p className={step === "error" ? "error-text" : "step-text"}>{stepLabel[step]}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── VOTE WIDGET ──────────────────────────────────────────────────────────────
function VoteWidget({ tokenAddress, tokenSym }: { tokenAddress: `0x${string}`; tokenSym: string }) {
  const { isConnected } = useAccount();
  const [selected, setSelected] = useState<VoteSignal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { step, error, txHash, alreadyVoted, votes, castVote, reset } = useVote(tokenAddress);

  const totalVotes = votes.total || 1;
  const pct = (n: number) => Math.round((n / totalVotes) * 100);

  const signals: { label: string; signal: VoteSignal; color: string }[] = [
    { label: "🟢 Bullish — Price will rise", signal: 0, color: "var(--green)" },
    { label: "🔴 Bearish — Price will fall", signal: 1, color: "var(--red)" },
    { label: "🟡 Neutral — Unsure",          signal: 2, color: "var(--gold)" },
  ];

  return (
    <>
      <div className="widget vote-widget">
        <div className="widget-header">
          <span className="widget-title">◎ COMMUNITY VOTE</span>
          <span className="vote-cost">{VOTE_FEE} USDC / vote</span>
        </div>
        <p className="widget-desc">Cast your onchain signal. Recorded via Arc USDC.</p>
        <div className="vote-bars">
          {[
            { label: "🟢 Bullish", count: votes.bullish, color: "var(--green)" },
            { label: "🔴 Bearish", count: votes.bearish, color: "var(--red)" },
            { label: "🟡 Neutral", count: votes.neutral, color: "var(--gold)" },
          ].map((v) => (
            <div key={v.label} className="vote-bar-row">
              <span className="vote-bar-label">{v.label}</span>
              <div className="vote-bar-track">
                <div className="vote-bar-fill" style={{ width: `${pct(v.count)}%`, background: v.color }} />
              </div>
              <span className="vote-bar-pct" style={{ color: v.color }}>{pct(v.count)}%</span>
            </div>
          ))}
        </div>
        <p className="vote-total">{votes.total} votes cast</p>
        {alreadyVoted ? (
          <button className="btn-primary w-full" disabled>ALREADY VOTED ✓</button>
        ) : (
          <>
            <div className="vote-options">
              {signals.map((s) => (
                <div key={s.signal} className={`vote-option ${selected === s.signal ? "selected" : ""}`} onClick={() => setSelected(s.signal)}>
                  <div className="vote-radio" style={selected === s.signal ? { borderColor: s.color, background: s.color } : {}} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-outline w-full"
              disabled={selected === null || !isConnected}
              onClick={() => { reset(); setShowModal(true); }}
            >
              {isConnected ? `CAST VOTE · ${VOTE_FEE} USDC` : "CONNECT WALLET TO VOTE"}
            </button>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="modal-title">Cast Your Vote</h2>
            <p className="modal-sub">Onchain vote · Arc Network USDC</p>
            {step === "idle" ? (
              <>
                <div className="breakdown">
                  <div className="breakdown-row"><span>Token</span><span>{tokenSym}</span></div>
                  <div className="breakdown-row"><span>Signal</span><span style={{ color: "var(--green)" }}>{signals.find(s => s.signal === selected)?.label}</span></div>
                  <div className="breakdown-row"><span>Network</span><span style={{ color: "var(--arc)" }}>Arc Testnet</span></div>
                  <div className="breakdown-row total"><span>Total</span><span>0.251 USDC</span></div>
                </div>
                <button className="btn-primary w-full" onClick={() => castVote(selected!)}>CAST VOTE ONCHAIN</button>
                <button className="btn-ghost w-full" onClick={() => setShowModal(false)}>Cancel</button>
              </>
            ) : step === "done" ? (
              <div className="modal-success">
                <div className="success-icon">✓</div>
                <p style={{ fontWeight: 700 }}>Vote recorded onchain!</p>
                {txHash && (
                  <a href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">View on ArcScan Explorer →</a>
                )}
                <button className="btn-primary w-full" onClick={() => setShowModal(false)}>Close</button>
              </div>
            ) : (
              <div className="modal-processing">
                {step !== "error" && <div className="spinner" />}
                <p className={step === "error" ? "error-text" : "step-text"}>
                  {step === "approving" && "Approve USDC in wallet..."}
                  {step === "voting" && "Confirm vote in wallet..."}
                  {step === "confirming" && "Recording vote on Arc Network..."}
                  {step === "error" && `Error: ${error}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── CHART SVG ────────────────────────────────────────────────────────────────
function ChartSVG() {
  const [points, setPoints] = useState(generatePoints());
  function generatePoints() {
    const pts: [number, number][] = [];
    let y = 140;
    for (let x = 0; x <= 800; x += 16) {
      y += (Math.random() - 0.46) * 18;
      y = Math.max(30, Math.min(250, y));
      pts.push([x, y]);
    }
    return pts;
  }
  useEffect(() => {
    const iv = setInterval(() => setPoints(generatePoints()), 4000);
    return () => clearInterval(iv);
  }, []);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = line + " L800,280 L0,280 Z";
  return (
    <svg viewBox="0 0 800 280" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00E5C3" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00E5C3" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[70, 140, 210].map(y => (
        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(0,229,195,0.06)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#g)" />
      <path d={line} fill="none" stroke="#00E5C3" strokeWidth="2" />
    </svg>
  );
}

// ─── LIVE TX FEED ─────────────────────────────────────────────────────────────
function LiveTxFeed({ tokenSym }: { tokenSym: string }) {
  const [txs, setTxs] = useState(generateTxs(8));
  function generateTxs(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: Math.random(),
      time: i === 0 ? "just now" : `${i * 15}s ago`,
      hash: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
      type: Math.random() > 0.45 ? "buy" : "sell",
      amount: Math.floor(Math.random() * 40000 + 500).toLocaleString(),
      price: `$${(0.40 + Math.random() * 0.02).toFixed(3)}`,
      total: `$${(Math.random() * 15000 + 200).toFixed(2)}`,
    }));
  }
  useEffect(() => {
    const iv = setInterval(() => {
      setTxs(prev => [generateTxs(1)[0], ...prev.slice(0, 14)]);
    }, 3000);
    return () => clearInterval(iv);
  }, [tokenSym]);
  return (
    <div>
      {txs.map(tx => (
        <div key={tx.id} className={`tx-row ${tx.type}`}>
          <span className="tx-time">{tx.time}</span>
          <span className="tx-hash">{tx.hash}</span>
          <span className={`tx-type ${tx.type}`}>{tx.type.toUpperCase()}</span>
          <span>{tx.amount}</span>
          <span>{tx.price}</span>
          <span>{tx.total}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function ArcScanApp() {
  const [activeToken, setActiveToken] = useState(DEMO_TOKENS[0]);
  const [searchVal, setSearchVal] = useState("");
  const [mobileTab, setMobileTab] = useState<"tokens" | "chart" | "scan">("chart");

  return (
    <div className="app-shell">
      {/* NAV */}
      <nav className="topnav">
        <div className="nav-brand">
          <div className="brand-hex">⬡</div>
          <span className="brand-name">ARC<span>SCAN</span></span>
        </div>
        <div className="nav-search">
          <span>⌕</span>
          <input
            placeholder="Search token or contract address..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <div className="nav-right">
          <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="faucet-link">
            Get Testnet USDC →
          </a>
          <WalletButton />
        </div>
      </nav>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...DEMO_TOKENS, ...DEMO_TOKENS].map((t, i) => (
            <span key={i} className="ticker-item">
              <span className="t-sym">{t.sym}</span>
              <span className="t-price">{t.price}</span>
              <span className={`t-chg ${t.change >= 0 ? "up" : "dn"}`}>
                {t.change >= 0 ? "+" : ""}{t.change}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* MOBILE TABS */}
      <div className="mobile-tabs">
        <button className={`mobile-tab-btn ${mobileTab === "tokens" ? "active" : ""}`} onClick={() => setMobileTab("tokens")}>
          🔥 TOKENS
        </button>
        <button className={`mobile-tab-btn ${mobileTab === "chart" ? "active" : ""}`} onClick={() => setMobileTab("chart")}>
          📈 CHART
        </button>
        <button className={`mobile-tab-btn ${mobileTab === "scan" ? "active" : ""}`} onClick={() => setMobileTab("scan")}>
          ⬡ SCAN & VOTE
        </button>
      </div>

      {/* BODY */}
      <div className="app-body">
        {/* SIDEBAR */}
        <aside className="sidebar" data-hidden={mobileTab !== "tokens" ? "true" : "false"}>
          <div className="sidebar-section">
            <div className="sidebar-label">🔥 Hot Tokens</div>
            {DEMO_TOKENS.map((t) => (
              <div
                key={t.sym}
                className={`token-row ${activeToken.sym === t.sym ? "active" : ""}`}
                onClick={() => { setActiveToken(t); setMobileTab("chart"); }}
              >
                <span className="token-row-icon">{t.icon}</span>
                <div className="token-row-info">
                  <span className="token-row-sym">{t.sym}</span>
                  <span className="token-row-price">{t.price}</span>
                </div>
                <span className={`token-row-chg ${t.change >= 0 ? "up" : "dn"}`}>
                  {t.change >= 0 ? "+" : ""}{t.change}%
                </span>
              </div>
            ))}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Network</div>
            <div className="chain-row active">
              <span className="chain-dot" />
              Arc Testnet
              <span className="chain-id">5042002</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-area" data-hidden={mobileTab !== "chart" ? "true" : "false"}>
          <div className="token-header">
            <div className="token-top-row">
              <div className="token-logo">{activeToken.icon}</div>
              <div>
                <h1 className="token-name">{activeToken.name}</h1>
                <div className="token-sym">{activeToken.sym} / USDC · Arc Testnet</div>
                <div className="token-addr">
                  <span>{activeToken.address.slice(0, 10)}...{activeToken.address.slice(-8)}</span>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(activeToken.address)}>COPY</button>
                  <a href={`${EXPLORER_URL}/address/${activeToken.address}`} target="_blank" rel="noopener noreferrer" className="explorer-link">Explorer ↗</a>
                </div>
              </div>
              <div className="token-price-block">
                <div className="token-price">{activeToken.price}</div>
                <div className={`price-chg ${activeToken.change >= 0 ? "up" : "dn"}`}>
                  {activeToken.change >= 0 ? "▲ +" : "▼ "}{activeToken.change}%
                </div>
              </div>
            </div>
            <div className="stats-bar">
              {[
                { label: "Market Cap", val: "$82.4M" },
                { label: "24h Volume", val: "$4.1M" },
                { label: "Liquidity",  val: "$2.8M", color: "var(--green)" },
                { label: "Holders",    val: "8,441" },
                { label: "24h Txns",   val: "312/188" },
              ].map((s) => (
                <div key={s.label} className="stat-cell">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-val" style={s.color ? { color: s.color } : {}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-area">
            <div className="chart-controls">
              {["1m", "5m", "1H", "4H", "1D", "1W"].map((t) => (
                <button key={t} className={`time-btn ${t === "1H" ? "active" : ""}`}>{t}</button>
              ))}
            </div>
            <div className="chart-canvas"><ChartSVG /></div>
          </div>

          <div className="tx-table-wrap">
            <div className="tx-header-row">
              <span>TIME</span><span>TX HASH</span><span>TYPE</span>
              <span>AMOUNT</span><span>PRICE</span><span>TOTAL</span>
            </div>
            <LiveTxFeed tokenSym={activeToken.sym} />
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="right-panel" data-hidden={mobileTab !== "scan" ? "true" : "false"}>
          <ScanWidget tokenAddress={activeToken.address} tokenSym={activeToken.sym} />
          <VoteWidget tokenAddress={activeToken.address} tokenSym={activeToken.sym} />
          <div className="widget trust-widget">
            <div className="trust-title">◈ TRUST SCORE</div>
            <div className="trust-score-circle">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="var(--dim)" strokeWidth="5" />
                <circle cx="40" cy="40" r="35" fill="none" stroke="var(--green)" strokeWidth="5"
                  strokeDasharray="220" strokeDashoffset="55" strokeLinecap="round" transform="rotate(-90 40 40)" />
              </svg>
              <span className="trust-num">75</span>
            </div>
            <div className="trust-items">
              {[
                ["Contract Verified", "✓ YES",  "ok"],
                ["Liquidity Locked",  "✓ 180d", "ok"],
                ["Mint Function",     "✓ NONE", "ok"],
                ["Renounced",         "⚠ NO",   "warn"],
                ["Honeypot",          "✓ SAFE", "ok"],
                ["Tax (Buy/Sell)",    "2% / 3%","warn"],
              ].map(([k, v, cls]) => (
                <div key={k} className="trust-row">
                  <span className="trust-key">{k}</span>
                  <span className={`trust-val ${cls}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
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
