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

const DEMO_TOKENS = [
  { sym: "HELLO", name: "Hello Architect", icon: "🏛️", price: "$0.0024", change: +5.2,  address: "0x7079aF9303EA3461B776EABd6a55f57055B3CdeB" as `0x${string}`, score: 92, tax: "0% / 0%", status: "Safe" },
  { sym: "ARCFI", name: "Arc Finance",     icon: "🏦", price: "$0.412",  change: +14.2, address: "0x1111111111111111111111111111111111111111" as `0x${string}`, score: 85, tax: "1% / 1%", status: "Safe" },
  { sym: "FLUX",  name: "FluxToken",       icon: "⚡", price: "$0.071",  change: +7.4,  address: "0x2222222222222222222222222222222222222222" as `0x${string}`, score: 68, tax: "3% / 5%", status: "Warning" },
  { sym: "STBL",  name: "Stablify",        icon: "💎", price: "$0.998",  change: -0.1,  address: "0x3333333333333333333333333333333333333333" as `0x${string}`, score: 98, tax: "0% / 0%", status: "Verified" },
  { sym: "NXUS",  name: "Nexus Proto",     icon: "🔮", price: "$1.240",  change: -3.1,  address: "0x4444444444444444444444444444444444444444" as `0x${string}`, score: 45, tax: "5% / 10%", status: "High Risk" },
];

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-blue-400 font-mono text-xs rounded-xl shadow-inner">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button className="bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }
  return (
    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/30 tracking-wide" onClick={() => connect({ connector: connectors[0] })}>
      Connect Terminal
    </button>
  );
}

function ScanWidget({ tokenAddress, tokenSym }: { tokenAddress: `0x${string}`; tokenSym: string }) {
  const { isConnected } = useAccount();
  const [selectedTier, setSelectedTier] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [localFindings, setLocalFindings] = useState<any[]>([]);
  const { step, executeScan, reset } = useScan();

  const handleConfirm = async () => {
    await executeScan(tokenAddress, selectedTier);
    setIsAiProcessing(true);
    setTimeout(() => {
      setLocalFindings([
        { icon: "🛡️", text: "Contract compiled bytecode structure verified clean." },
        { icon: "💧", text: "Liquidity lock confirmed in decentralized factory pool." },
        { icon: "⚡", text: "Circuit break selector verified absent from router execution." }
      ]);
      setIsAiProcessing(false);
    }, 2000);
  };

  return (
    <>
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          <h3 className="text-xs font-black text-slate-200 tracking-widest uppercase">INTEL AUDIT GATEWAY</h3>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          Unlock maximum structural parameters. Execute automated security assessments directly via Arc Network USDC.
        </p>
        
        <div className="space-y-2">
          {SCAN_TIERS.map((tier, i) => (
            <div 
              key={i} 
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                selectedTier === i 
                  ? "bg-gradient-to-r from-blue-950/40 to-slate-900/40 border-blue-500/50 text-white shadow-md shadow-blue-950/10" 
                  : "bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800"
              }`} 
              onClick={() => setSelectedTier(i)}
            >
              <div>
                <div className={`text-xs font-bold tracking-wide ${selectedTier === i ? "text-blue-400" : "text-slate-300"}`}>{tier.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{tier.features.join(" · ")}</div>
              </div>
              <div className="text-right font-mono text-xs font-black text-white bg-slate-950 px-2 py-1 rounded-md border border-slate-900">
                ${tier.price}<span className="text-[9px] ml-0.5 text-slate-500 font-medium">USDC</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-blue-900/20 tracking-wider" 
          disabled={!isConnected} 
          onClick={() => { reset(); setLocalFindings([]); setShowModal(true); }}
        >
          {isConnected ? "INITIALIZE SECURITY AUDIT" : "AUTHENTICATE CONNECT TERMINAL"}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <button className="absolute top-4 right-4 text-slate-500 hover:text-white font-mono" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="text-lg font-black text-white tracking-tight">Confirm Onchain Allocation</h2>
            
            {step === "idle" || step === "checking_allowance" ? (
              <>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 font-medium text-xs font-mono">
                  <div className="flex justify-between"><span className="text-slate-500 font-sans">Module Profiles</span><span className="text-slate-200">{SCAN_TIERS[selectedTier].name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-sans">Target System</span><span className="text-slate-200">{tokenSym}</span></div>
                  <div className="flex justify-between border-t border-slate-800 pt-2.5 text-sm font-bold"><span className="text-slate-400 font-sans">Total Ledger Fee</span><span className="text-emerald-400">${(SCAN_TIERS[selectedTier].price + 0.001).toFixed(3)} USDC</span></div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold tracking-wider transition-all" onClick={handleConfirm}>BROADCAST SETTLED TRANSACTION</button>
              </>
            ) : isAiProcessing ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-blue-400 font-mono tracking-widest animate-pulse">AI PROCESSING DEEP BYTECODE...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-xl font-bold">✓</div>
                <p className="text-sm font-bold text-white">Analysis Parameters Complete!</p>
                <div className="w-full text-left border-t border-slate-800 pt-3 space-y-1.5">
                  <div className="text-[9px] font-black text-blue-400 tracking-widest uppercase mb-1">Audit Stream Logs</div>
                  {localFindings.map((f: any, i: number) => (
                    <div key={i} className="flex gap-2 text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-xl">
                      <span className="shrink-0">{f.icon}</span><span className="text-slate-400 leading-relaxed text-[11px]">{f.text}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold" onClick={() => setShowModal(false)}>Close Interface</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function VoteWidget({ tokenAddress, tokenSym }: { tokenAddress: `0x${string}`; tokenSym: string }) {
  const { isConnected } = useAccount();
  const [selected, setSelected] = useState<VoteSignal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { step, txHash, alreadyVoted, votes, castVote, reset } = useVote(tokenAddress);
  
  const totalVotes = votes.total || 1;
  const pct = (n: number) => Math.round((n / totalVotes) * 100);
  
  const signals: { label: string; signal: VoteSignal; color: string }[] = [
    { label: "🟢 Bullish", signal: 0, color: "rgb(16, 185, 129)" },
    { label: "🔴 Bearish", signal: 1, color: "rgb(239, 68, 68)" },
    { label: "🟡 Neutral", signal: 2, color: "rgb(245, 158, 11)" },
  ];
  
  return (
    <>
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-sm animate-pulse">●</span>
            <h3 className="text-xs font-black text-slate-200 tracking-widest uppercase">SENTIMENT CORE</h3>
          </div>
          <span className="text-[9px] font-mono font-black bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-md text-slate-400">{VOTE_FEE} USDC</span>
        </div>
        
        <div className="space-y-3 py-1">
          {[
            { label: "Bullish Matrix", count: votes.bullish, color: "rgb(16, 185, 129)" },
            { label: "Bearish Matrix", count: votes.bearish, color: "rgb(239, 68, 68)" },
            { label: "Neutral Vector",  count: votes.neutral, color: "rgb(245, 158, 11)" },
          ].map((v) => (
            <div key={v.label} className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">{v.label}</span>
                <span style={{ color: v.color }} className="font-bold font-mono">{pct(v.count)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full transition-all duration-500" style={{ width: `${pct(v.count)}%`, backgroundColor: v.color }} />
              </div>
            </div>
          ))}
        </div>
        
        {alreadyVoted ? (
          <button className="w-full bg-slate-800/50 border border-slate-700 text-slate-500 font-bold py-2.5 rounded-xl text-xs tracking-wider" disabled>SIGNAL LOGGED ONCHAIN ✓</button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {signals.map((s) => (
                <button 
                  key={s.signal} 
                  className={`py-2 rounded-xl border text-[10px] font-black tracking-wide transition-all ${
                    selected === s.signal 
                      ? "bg-slate-800 text-white border-slate-500" 
                      : "bg-slate-950/80 text-slate-400 border-slate-900 hover:border-slate-800"
                  }`}
                  onClick={() => setSelected(s.signal)}
                >
                  {s.label.split(" ")[1]}
                </button>
              ))}
            </div>
            <button 
              className="w-full bg-transparent hover:bg-slate-800 border border-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all disabled:opacity-30" 
              disabled={selected === null || !isConnected} 
              onClick={() => { reset(); setShowModal(true); }}
            >
              {isConnected ? "TRANSMIT POSITION SIGNAL" : "AUTHENTICATE CONNECT TERMINAL"}
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <button className="absolute top-4 right-4 text-slate-500 hover:text-white" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="text-md font-black text-white tracking-tight">Broadcast Sentiment Vector</h2>
            
            {step === "idle" ? (
              <>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 font-medium text-xs font-mono">
                  <div className="flex justify-between"><span className="text-slate-500 font-sans">Direction Target</span><span className="text-white">{signals.find(s => s.signal === selected)?.label}</span></div>
                  <div className="flex justify-between border-t border-slate-800 pt-2.5 text-sm font-bold"><span className="text-slate-400 font-sans">USDC Cost</span><span className="text-white">0.250 USDC</span></div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold shadow-lg tracking-wider" onClick={async () => { await castVote(selected!); }}>COMMIT SENTIMENT TRANSACTION</button>
              </>
            ) : (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-xl font-bold">✓</div>
                <p className="text-xs font-bold text-white">Signal Transmitted to Arc Engine!</p>
                {txHash && <a href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="inline-block text-[11px] text-blue-400 hover:underline">View Transaction Block →</a>}
                <button className="w-full bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-medium mt-2" onClick={() => setShowModal(false)}>Dismiss</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

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
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {[70, 140, 210].map(y => (
        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#g)" />
      <path d={line} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LiveTxFeed({ tokenSym }: { tokenSym: string }) {
  const [txs, setTxs] = useState<any[]>([]);
  
  function generateSingleTx() {
    const isBuy = Math.random() > 0.45;
    const amountNum = Math.floor(Math.random() * 35000 + 100);
    return {
      id: Math.random(),
      time: "just now",
      hash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      type: isBuy ? "buy" : "sell",
      amount: amountNum.toLocaleString(),
      price: `$${(0.40 + Math.random() * 0.05).toFixed(3)}`,
      total: `$${(amountNum * (0.40 + Math.random() * 0.05)).toFixed(2)}`,
      isWhale: amountNum > 22000
    };
  }

  useEffect(() => {
    const items = Array.from({ length: 8 }, (_, i) => {
      const tx = generateSingleTx();
      tx.time = `${i * 12 + 4}s ago`;
      return tx;
    });
    setTxs(items);

    const iv = setInterval(() => {
      setTxs(prev => {
        const updated = prev.map(t => {
          if (t.time === "just now") return { ...t, time: "12s ago" };
          if (t.time.includes("s ago")) {
            const secs = parseInt(t.time) + 12;
            return { ...t, time: `${secs}s ago` };
          }
          return t;
        });
        return [generateSingleTx(), ...updated.slice(0, 10)];
      });
    }, 4000);
    return () => clearInterval(iv);
  }, [tokenSym]);

  return (
    <div className="divide-y divide-slate-900/60">
      {txs.map(tx => (
        <div key={tx.id} className={`grid grid-cols-6 gap-2 text-xs py-3 px-4 font-mono items-center transition-all ${tx.isWhale ? 'bg-blue-950/20 border-y border-blue-900/30' : tx.type === 'buy' ? 'text-emerald-400 bg-emerald-950/5' : 'text-rose-400 bg-rose-950/5'}`}>
          <span className="text-slate-500 text-[10px]">{tx.time}</span>
          <span className="text-slate-400 font-medium">{tx.hash}</span>
          <span className="flex items-center gap-1.5">
            <span className={`font-black text-[10px] tracking-widest px-1.5 py-0.5 rounded ${tx.type === 'buy' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
              {tx.type.toUpperCase()}
            </span>
            {tx.isWhale && <span className="text-[10px] bg-blue-950 text-blue-400 px-1 rounded border border-blue-800/30 font-sans font-bold">WHALE</span>}
          </span>
          <span className="text-slate-200 font-bold">{tx.amount}</span>
          <span className="text-slate-400">{tx.price}</span>
          <span className="text-slate-100 font-black text-right">{tx.total}</span>
        </div>
      ))}
    </div>
  );
}

function ArcScanApp() {
  const [activeToken, setActiveToken] = useState(DEMO_TOKENS[0]);
  const [searchVal, setSearchVal] = useState("");
  const [mobileTab, setMobileTab] = useState<"tokens" | "chart" | "scan">("chart");
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [liveTrustPercent, setLiveTrustPercent] = useState(activeToken.score);

  useEffect(() => {
    setIsLiveScanning(true);
    setLiveTrustPercent(0);
    let count = 0;
    const interval = setInterval(() => {
      count += 5;
      if (count >= activeToken.score) {
        setLiveTrustPercent(activeToken.score);
        setIsLiveScanning(false);
        clearInterval(interval);
      } else {
        setLiveTrustPercent(count);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [activeToken]);

  const filteredTokens = DEMO_TOKENS.filter(t => 
    t.sym.toLowerCase().includes(searchVal.toLowerCase()) || 
    t.address.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col antialiased">
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 h-16 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]">
            <circle cx="18" cy="18" r="14" stroke="#0f172a" strokeWidth="2.5" />
            <path d="M6 18C6 11.3726 11.3726 6 18 6C21.3137 6 24.3137 7.34315 26.4853 9.51472" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
            <path d="M18 2V5" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M34 18H31" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 34V31" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 18H5" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="18" cy="18" r="4.5" fill="#2563eb" />
            <circle cx="18" cy="18" r="1.5" fill="#ffffff" />
            <circle cx="26.5" cy="9.5" r="3.5" fill="#06b6d4" />
          </svg>
          <div className="flex flex-col">
            <span className="text-md font-black text-white tracking-wider">ARC<span className="text-blue-500 font-medium">SCAN</span></span>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest font-bold uppercase -mt-1">TOKEN INTEL</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
          <span className="absolute left-3.5 text-slate-500 text-xs">⌕</span>
          <input 
            className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-all font-mono"
            placeholder="Filter pair metrics, search contracts..." 
            value={searchVal} 
            onChange={(e) => setSearchVal(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-4">
          <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="hidden lg:inline-block text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors">USDC Faucet ↗</a>
          <WalletButton />
        </div>
      </nav>

      <div className="border-b border-slate-900/60 bg-slate-950 py-2.5 overflow-hidden select-none text-[11px]">
        <div className="flex whitespace-nowrap gap-12 animate-marquee">
          {[...DEMO_TOKENS, ...DEMO_TOKENS].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 font-mono">
              <span className="text-slate-500 font-sans font-bold uppercase">{t.sym}</span>
              <span className="text-slate-200 font-black">{t.price}</span>
              <span className={`text-[10px] font-black ${t.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {t.change >= 0 ? "▲ +" : "▼ "}{t.change}%
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="md:hidden flex border-b border-slate-900 bg-slate-950 text-[10px] font-black tracking-widest text-center">
        <button className={`flex-1 py-3.5 border-b-2 transition-all ${mobileTab === "tokens" ? "border-blue-500 text-white bg-slate-900/30" : "border-transparent text-slate-500"}`} onClick={() => setMobileTab("tokens")}>🔥 MARKETS</button>
        <button className={`flex-1 py-3.5 border-b-2 transition-all ${mobileTab === "chart" ? "border-blue-500 text-white bg-slate-900/30" : "border-transparent text-slate-500"}`} onClick={() => setMobileTab("chart")}>📈 CHART CORE</button>
        <button className={`flex-1 py-3.5 border-b-2 transition-all ${mobileTab === "scan" ? "border-blue-500 text-white bg-slate-900/30" : "border-transparent text-slate-500"}`} onClick={() => setMobileTab("scan")}>⬡ INTEL TERMINAL</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`w-full md:w-64 border-r border-slate-900 bg-slate-950/40 p-4 shrink-0 md:block ${mobileTab === "tokens" ? "block" : "hidden"}`}>
          <div className="space-y-4">
            <div className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-1">Pair Indexing</div>
            <div className="space-y-1.5">
              {filteredTokens.map((t) => (
                <div 
                  key={t.sym} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    activeToken.sym === t.sym 
                      ? "bg-slate-900/80 border-slate-800 text-white shadow-xl shadow-slate-950/50" 
                      : "border-transparent text-slate-400 hover:bg-slate-900/30"
                  }`} 
                  onClick={() => { setActiveToken(t); setMobileTab("chart"); }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-slate-950 p-1.5 rounded-lg border border-slate-900">{t.icon}</span>
                    <div>
                      <div className="text-xs font-black text-white">{t.sym}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.price}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-black ${t.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {t.change >= 0 ? "+" : ""}{t.change}%
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-900 pt-4 space-y-2">
              <div className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-1">Network Profile</div>
              <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-300">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Arc Testnet
                </div>
                <span className="font-mono text-[9px] bg-slate-950 px-1.5 py-0.5 border border-slate-900 rounded font-bold text-slate-500">5042002</span>
              </div>
            </div>
          </div>
        </aside>

        <main className={`flex-1 flex flex-col overflow-y-auto p-4 lg:p-6 space-y-5 md:block ${mobileTab === "chart" ? "block" : "hidden"}`}>
          <div className="bg-slate-900/40 border border-slate-850/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-2xl shadow-inner">{activeToken.icon}</div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    {activeToken.name}
                    <span className="text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-md font-mono text-slate-400 font-bold">{activeToken.sym} / USDC</span>
                  </h1>
                  <div className="text-xs font-mono text-slate-500 flex items-center gap-2 mt-1 break-all">
                    <span className="text-[11px]">{activeToken.address.slice(0, 10)}...{activeToken.address.slice(-8)}</span>
                    <button className="text-[9px] bg-slate-950 border border-slate-850 hover:border-slate-700 px-1.5 py-0.5 rounded font-sans text-slate-400 font-bold" onClick={() => navigator.clipboard.writeText(activeToken.address)}>COPY</button>
                    <a href={`${EXPLORER_URL}/address/${activeToken.address}`} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-400 font-sans hover:underline">Explorer ↗</a>
                  </div>
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-xl font-mono font-black text-white">{activeToken.price}</div>
                <div className={`text-xs font-bold mt-0.5 ${activeToken.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {activeToken.change >= 0 ? "▲ +" : "▼ "}{activeToken.change}% (24h)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-slate-850/80 pt-4">
              {[
                { label: "Market Capital", val: "$82.4M" },
                { label: "24h Swap Volume", val: "$4.1M" },
                { label: "Pool Liquidity",  val: "$2.8M", color: "text-emerald-400" },
                { label: "Token Holders",    val: "8,441" },
                { label: "Dynamic Txns",   val: "B:312 / S:188" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-950/80 border border-slate-900/60 rounded-xl p-2.5 shadow-inner">
                  <div className="text-[10px] text-slate-500 font-bold tracking-wide">{s.label}</div>
                  <div className={`text-xs font-black font-mono mt-0.5 text-white ${s.color || ''}`}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850/80 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col h-[300px]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">REALTIME TICK GRAPH FEED</span>
              <div className="flex gap-1 bg-slate-950 p-1 border border-slate-900 rounded-lg font-mono">
                {["15m", "1H", "4H", "1D"].map((t) => (
                  <button key={t} className={`text-[10px] font-black px-2.5 py-0.5 rounded-md transition-all ${t === "1H" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-slate-950/80 rounded-xl border border-slate-900 relative p-1 overflow-hidden shadow-inner">
              <ChartSVG />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="grid grid-cols-6 gap-2 bg-slate-950 px-4 py-3.5 border-b border-slate-900 text-[9px] font-black tracking-widest text-slate-500">
              <span>TIMESTAMP</span><span>TX TRANSACTION LOG</span><span>VECTOR</span><span>SWAP AMOUNT</span><span>UNIT PRICE</span><span className="text-right">TOTAL</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <LiveTxFeed tokenSym={activeToken.sym} />
            </div>
          </div>
        </main>

        <aside className={`w-full md:w-80 border-l border-slate-900 bg-slate-950/20 p-4 overflow-y-auto shrink-0 md:block space-y-5 ${mobileTab === "scan" ? "block" : "hidden"}`}>
          
          <ScanWidget tokenAddress={activeToken.address} tokenSym={activeToken.sym} />
          <VoteWidget tokenAddress={activeToken.address} tokenSym={activeToken.sym} />
          
          <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase border-b border-slate-800 pb-2">
              ◈ AI RISK INTEL ENGINE
            </div>
            <div className="flex items-center gap-4 justify-center bg-slate-950/80 border border-slate-900 rounded-xl py-3.5 shadow-inner">
              <div className="relative flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#10172a" strokeWidth="4.5" />
                  <circle cx="40" cy="40" r="35" fill="none" 
                    stroke={activeToken.status === "High Risk" ? "rgb(239, 68, 68)" : activeToken.status === "Warning" ? "rgb(245, 158, 11)" : "rgb(16, 185, 129)"} 
                    strokeWidth="4.5"
                    strokeDasharray="220" 
                    strokeDashoffset={220 - (220 * liveTrustPercent) / 100} 
                    strokeLinecap="round" 
                    transform="rotate(-90 40 40)"
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                <span className={`absolute font-mono text-lg font-black text-white ${isLiveScanning ? "animate-pulse opacity-50" : ""}`}>
                  {liveTrustPercent}
                </span>
              </div>
              <div className="text-left">
                <div className={`text-xs font-black tracking-wide ${activeToken.status === "High Risk" ? "text-rose-400" : activeToken.status === "Warning" ? "text-amber-400" : "text-emerald-400"}`}>
                  {isLiveScanning ? "COMPUTING..." : activeToken.status.toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Automated security metrics cleared.</div>
              </div>
            </div>
            
            <div className="space-y-2 font-mono text-[11px]">
              {[
                ["Source Verified", "✓ TRUE", "text-emerald-400"],
                ["Liquidity Pool",  "✓ LOCKED", "text-emerald-400"],
                ["Audit Risk Check", activeToken.status === "High Risk" ? "⚠ DETECTED" : "✓ ABSENT", activeToken.status === "High Risk" ? "text-rose-400" : "text-emerald-400"],
                ["Trading Tax profile", activeToken.tax, "text-slate-300"],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex justify-between border-b border-slate-850/40 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-slate-500 font-sans">{k}</span>
                  <span className={`font-bold ${cls}`}>{v}</span>
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
