import { useState, useEffect, useRef, useCallback } from "react";

const FINNHUB_KEY = "demo";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes flash { 0%,100% { background: transparent; } 50% { background: rgba(255,107,107,0.15); } }

  body { background: #0a0a0f; }

  .app { min-height:100vh; background:#0a0a0f; color:#e8e8e8; font-family:'DM Sans',sans-serif; padding-bottom:60px; }

  .header { background:linear-gradient(160deg,#0f1a2e,#0a0a0f); padding:32px 24px 28px; border-bottom:1px solid #1a1a2a; }
  .header-top { display:flex; align-items:center; justify-content:space-between; max-width:900px; margin:0 auto; }
  .logo { font-size:11px; letter-spacing:4px; text-transform:uppercase; color:#45aaf2; font-family:'JetBrains Mono',monospace; }
  .title { font-size:clamp(22px,4vw,36px); font-weight:700; margin:8px 0 4px; color:#fff; }
  .subtitle { color:#555; font-size:13px; font-style:italic; }
  .live-dot { width:8px; height:8px; border-radius:50%; background:#26de81; animation:pulse 2s infinite; display:inline-block; margin-right:6px; }

  .main { max-width:900px; margin:0 auto; padding:24px 20px 0; }

  .search-bar { display:flex; gap:10px; margin-bottom:24px; }
  .search-input { flex:1; background:#15151f; border:1px solid #2a2a3a; border-radius:10px; padding:12px 16px; color:#e8e8e8; font-size:15px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
  .search-input:focus { border-color:#45aaf2; }
  .search-input::placeholder { color:#444; }
  .add-btn { background:linear-gradient(135deg,#45aaf2,#6c5ce7); border:none; border-radius:10px; padding:12px 20px; color:#fff; font-size:14px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:transform 0.15s; white-space:nowrap; }
  .add-btn:hover { transform:scale(1.03); }
  .add-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

  .section-label { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#444; font-family:'JetBrains Mono',monospace; margin-bottom:12px; }

  .watchlist { display:flex; flex-direction:column; gap:10px; margin-bottom:32px; }

  .asset-card { background:#15151f; border:1px solid #1e1e2e; border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:16px; animation:fadeUp 0.3s ease both; transition:border-color 0.2s; position:relative; overflow:hidden; }
  .asset-card:hover { border-color:#2a2a3a; }
  .asset-card.alerting { animation:flash 1s ease 3; border-color:#FF6B6B44; }

  .asset-left { flex:1; min-width:0; }
  .asset-symbol { font-size:16px; font-weight:700; color:#fff; font-family:'JetBrains Mono',monospace; }
  .asset-name { font-size:12px; color:#555; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  .asset-price { text-align:right; min-width:90px; }
  .price-value { font-size:18px; font-weight:600; font-family:'JetBrains Mono',monospace; color:#fff; }
  .price-change { font-size:12px; margin-top:2px; font-family:'JetBrains Mono',monospace; }
  .price-change.up { color:#26de81; }
  .price-change.down { color:#FF6B6B; }

  .alert-section { display:flex; align-items:center; gap:8px; padding:0 12px; border-left:1px solid #1e1e2e; border-right:1px solid #1e1e2e; }
  .alert-label { font-size:11px; color:#444; text-transform:uppercase; letter-spacing:1px; font-family:'JetBrains Mono',monospace; }
  .alert-input { background:#0a0a0f; border:1px solid #2a2a3a; border-radius:8px; padding:6px 10px; color:#e8e8e8; font-size:13px; width:70px; text-align:center; font-family:'JetBrains Mono',monospace; outline:none; }
  .alert-input:focus { border-color:#45aaf2; }
  .alert-badge { font-size:11px; padding:3px 8px; border-radius:50px; background:#FF6B6B18; color:#FF6B6B; border:1px solid #FF6B6B33; font-family:'JetBrains Mono',monospace; white-space:nowrap; }
  .alert-badge.ok { background:#26de8118; color:#26de81; border-color:#26de8133; }

  .remove-btn { background:transparent; border:none; color:#333; font-size:18px; cursor:pointer; padding:4px 8px; transition:color 0.2s; flex-shrink:0; }
  .remove-btn:hover { color:#FF6B6B; }

  .loading-dot { display:inline-block; animation:pulse 1s infinite; color:#45aaf2; font-family:'JetBrains Mono',monospace; }

  .empty-state { text-align:center; padding:48px 24px; color:#333; }
  .empty-icon { font-size:32px; margin-bottom:12px; }
  .empty-text { font-size:14px; color:#444; font-style:italic; }

  .quick-add { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:24px; }
  .quick-btn { background:transparent; border:1px solid #2a2a3a; border-radius:50px; padding:6px 14px; color:#666; font-size:12px; cursor:pointer; transition:all 0.2s; font-family:'JetBrains Mono',monospace; }
  .quick-btn:hover { border-color:#45aaf2; color:#45aaf2; }

  .alert-log { background:#15151f; border:1px solid #1e1e2e; border-radius:14px; padding:16px 18px; }
  .alert-log-title { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#444; font-family:'JetBrains Mono',monospace; margin-bottom:12px; }
  .log-item { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #1a1a2a; font-size:13px; }
  .log-item:last-child { border-bottom:none; }
  .log-symbol { color:#FF6B6B; font-family:'JetBrains Mono',monospace; font-weight:600; }
  .log-msg { color:#888; }
  .log-time { color:#444; font-size:11px; font-family:'JetBrains Mono',monospace; }

  .refresh-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .refresh-btn { background:transparent; border:1px solid #2a2a3a; border-radius:8px; padding:6px 14px; color:#666; font-size:12px; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .refresh-btn:hover { border-color:#45aaf2; color:#45aaf2; }
  .last-updated { font-size:11px; color:#333; font-family:'JetBrains Mono',monospace; }
`;

const QUICK_SYMBOLS = [
  { symbol:"AAPL", name:"Apple" },
  { symbol:"TSLA", name:"Tesla" },
  { symbol:"SPY", name:"S&P 500 ETF" },
  { symbol:"BTC-USD", name:"Bitcoin" },
  { symbol:"GLD", name:"Gold ETF" },
  { symbol:"MSFT", name:"Microsoft" },
  { symbol:"NVDA", name:"NVIDIA" },
  { symbol:"QQQ", name:"Nasdaq ETF" },
];

interface Asset {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  alertPct: number;
  loading: boolean;
  alerting: boolean;
}

interface LogEntry {
  symbol: string;
  msg: string;
  time: string;
}

async function fetchQuote(symbol: string): Promise<{price:number,change:number,changePct:number} | null> {
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (!data.c || data.c === 0) return null;
    return {
      price: data.c,
      change: data.d,
      changePct: data.dp,
    };
  } catch {
    return null;
  }
}

export default function StockTracker() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((symbol: string, msg: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString();
    setLogs(l => [{ symbol, msg, time }, ...l].slice(0, 20));
  }, []);

  const refreshPrices = useCallback(async (currentAssets: Asset[]) => {
    if (currentAssets.length === 0) return;
    const updated = await Promise.all(
      currentAssets.map(async (a) => {
        const quote = await fetchQuote(a.symbol);
        if (!quote) return a;
        const wasAlerting = a.alerting;
        const isAlerting = quote.changePct <= -Math.abs(a.alertPct);
        if (isAlerting && !wasAlerting) {
          addLog(a.symbol, `Down ${quote.changePct.toFixed(2)}% — alert threshold hit!`);
          if (Notification.permission === "granted") {
            new Notification(`${a.symbol} Alert`, {
              body: `Down ${quote.changePct.toFixed(2)}% — below your ${a.alertPct}% threshold`,
            });
          }
        }
        return { ...a, price: quote.price, change: quote.change, changePct: quote.changePct, alerting: isAlerting, loading: false };
      })
    );
    setAssets(updated);
    setLastUpdated(new Date().toLocaleTimeString());
  }, [addLog]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setAssets(current => { refreshPrices(current); return current; });
    }, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [refreshPrices]);

  async function addAsset(sym?: string) {
    const symbol = (sym || input).toUpperCase().trim();
    if (!symbol) return;
    if (assets.find(a => a.symbol === symbol)) { setInput(""); return; }
    setAdding(true);
    const newAsset: Asset = { symbol, name: symbol, price: null, change: null, changePct: null, alertPct: 5, loading: true, alerting: false };
    setAssets(prev => [...prev, newAsset]);
    setInput("");
    const quote = await fetchQuote(symbol);
    setAssets(prev => prev.map(a => a.symbol === symbol
      ? { ...a, price: quote?.price ?? null, change: quote?.change ?? null, changePct: quote?.changePct ?? null, loading: false }
      : a
    ));
    setLastUpdated(new Date().toLocaleTimeString());
    setAdding(false);
  }

  function removeAsset(symbol: string) {
    setAssets(prev => prev.filter(a => a.symbol !== symbol));
  }

  function updateAlert(symbol: string, val: string) {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setAssets(prev => prev.map(a => a.symbol === symbol ? { ...a, alertPct: Math.abs(num) } : a));
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <div>
              <div className="logo">✦ Market Alert Tracker</div>
              <h1 className="title">Stock & Asset Monitor</h1>
              <p className="subtitle">
                <span className="live-dot" />
                Live prices · Custom drop alerts · US stocks, ETFs, crypto & commodities
              </p>
            </div>
          </div>
        </div>

        <div className="main">
          {/* Search */}
          <div className="search-bar">
            <input
              className="search-input"
              placeholder="Enter ticker symbol e.g. AAPL, BTC-USD, GLD..."
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && addAsset()}
            />
            <button className="add-btn" onClick={() => addAsset()} disabled={adding || !input.trim()}>
              {adding ? "Adding..." : "+ Add"}
            </button>
          </div>

          {/* Quick add */}
          <div className="section-label">Quick add</div>
          <div className="quick-add">
            {QUICK_SYMBOLS.map(q => (
              <button key={q.symbol} className="quick-btn" onClick={() => addAsset(q.symbol)}>
                {q.symbol}
              </button>
            ))}
          </div>

          {/* Watchlist */}
          {assets.length > 0 && (
            <div className="refresh-bar">
              <div className="section-label" style={{ margin:0 }}>Watchlist</div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                {lastUpdated && <span className="last-updated">Updated {lastUpdated}</span>}
                <button className="refresh-btn" onClick={() => refreshPrices(assets)}>Refresh</button>
              </div>
            </div>
          )}

          <div className="watchlist">
            {assets.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📈</div>
                <div className="empty-text">Add a ticker above to start tracking</div>
              </div>
            )}
            {assets.map((a, i) => (
              <div key={a.symbol} className={`asset-card ${a.alerting ? "alerting" : ""}`} style={{ animationDelay:`${i*60}ms` }}>
                <div className="asset-left">
                  <div className="asset-symbol">{a.symbol}</div>
                  <div className="asset-name">{a.name}</div>
                </div>

                <div className="alert-section">
                  <div>
                    <div className="alert-label">Alert if drops</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                      <input
                        className="alert-input"
                        type="number"
                        min="0.1"
                        max="99"
                        step="0.5"
                        value={a.alertPct}
                        onChange={e => updateAlert(a.symbol, e.target.value)}
                      />
                      <span style={{ color:"#555", fontSize:13 }}>%</span>
                    </div>
                  </div>
                </div>

                <div className="asset-price">
                  {a.loading ? (
                    <div className="loading-dot">...</div>
                  ) : a.price ? (
                    <>
                      <div className="price-value">${a.price.toFixed(2)}</div>
                      <div className={`price-change ${(a.changePct ?? 0) >= 0 ? "up" : "down"}`}>
                        {(a.changePct ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(a.changePct ?? 0).toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div style={{ color:"#444", fontSize:13 }}>No data</div>
                  )}
                </div>

                <div>
                  {a.alerting ? (
                    <div className="alert-badge">ALERT</div>
                  ) : (
                    <div className="alert-badge ok">OK</div>
                  )}
                </div>

                <button className="remove-btn" onClick={() => removeAsset(a.symbol)}>×</button>
              </div>
            ))}
          </div>

          {/* Alert log */}
          {logs.length > 0 && (
            <div className="alert-log">
              <div className="alert-log-title">Alert log</div>
              {logs.map((l, i) => (
                <div key={i} className="log-item">
                  <span className="log-symbol">{l.symbol}</span>
                  <span className="log-msg">{l.msg}</span>
                  <span className="log-time">{l.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
