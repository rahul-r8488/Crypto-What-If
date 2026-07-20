import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ── Helpers ────────────────────────────────────────────────────
const fmt = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);

const fmtAt = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, valueClass = "", icon }) {
  return (
    <div className="stat-card">
      {icon && <span className="stat-icon">{icon}</span>}
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${valueClass}`}>{value}</span>
    </div>
  );
}

// ── Tab Button ─────────────────────────────────────────────────
function TabButton({ id, label, icon, active, onClick }) {
  return (
    <button id={id} onClick={onClick} className={`tab-btn ${active ? "tab-btn--active" : ""}`}>
      <span className="tab-icon">{icon}</span>
      <span className="tab-label">{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// CALCULATOR TAB
// ─────────────────────────────────────────────────────────────
function CalculatorTab() {
  const [crypto, setCrypto] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const isProfit = result && result.profit >= 0;

  const handleCalculate = async () => {
    if (!crypto || !date || !amount) { setError("Please fill all fields."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crypto, date, amount: Number(amount) }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error || "Something went wrong.");
    } catch {
      setError("Server not reachable. Is the backend running?");
    } finally { setLoading(false); }
  };

  return (
    <div className="calc-layout">
      {/* ── Input Panel ─────── */}
      <div className="panel">
        <div className="panel-inner">
          <div className="panel-heading">
            <span className="panel-eyebrow">What-If Simulator</span>
            <h1 className="panel-title">Crypto<br />Calculator</h1>
            <p className="panel-subtitle">
              See what your investment would be worth today if you had bought any crypto on a past date.
            </p>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label" htmlFor="crypto-input">Crypto Symbol</label>
              <div className="input-wrap">
                <span className="input-icon">₿</span>
                <input
                  id="crypto-input"
                  type="text"
                  placeholder="BTC, ETH, DOGE…"
                  className="form-input"
                  value={crypto}
                  onChange={(e) => setCrypto(e.target.value.toUpperCase())}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date-input">Investment Date</label>
              <div className="input-wrap">
                <span className="input-icon">📅</span>
                <input
                  id="date-input"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={today}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount-input">Amount (₹ INR)</label>
              <div className="input-wrap">
                <span className="input-icon">₹</span>
                <input
                  id="amount-input"
                  type="number"
                  placeholder="e.g. 10000"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1" max="10000000"
                />
              </div>
            </div>
          </div>

          <button id="calculate-btn" onClick={handleCalculate} disabled={loading} className="btn-primary">
            {loading
              ? <span className="btn-loading"><span className="spinner" />Fetching prices…</span>
              : "✦ Calculate Return"}
          </button>

          {error && <p className="error-msg">⚠ {error}</p>}
        </div>
      </div>

      {/* ── Result Panel ────── */}
      <div className="panel panel--result">
        {!result ? (
          <div className="result-empty">
            <div className="result-empty-icon">🪙</div>
            <p className="result-empty-title">Awaiting your query</p>
            <p className="result-empty-desc">
              Enter a crypto symbol, a past date, and an amount to simulate what your investment would look like today.
            </p>
          </div>
        ) : (
          <div className="result-card">
            {/* Coin header */}
            <div className="result-header">
              <div className="result-coin-name">
                <span className="result-coin-symbol">{result.crypto}</span>
                <span className="result-date-label">Invested on {result.date}</span>
              </div>
              <div className="result-roi-block">
                <div className={`result-roi ${isProfit ? "text-profit" : "text-loss"}`}>
                  {result.roi}
                </div>
                <div className={`result-roi-label ${isProfit ? "text-profit" : "text-loss"}`}>
                  Return on Investment
                </div>
              </div>
            </div>

            {/* Banner */}
            <div className={`result-banner ${isProfit ? "result-banner--profit" : "result-banner--loss"}`}>
              {isProfit ? "🚀 You'd be sitting on a profit!" : "📉 This would have been a loss"}
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <StatCard icon="💸" label="Invested" value={fmt(result.invested)} />
              <StatCard
                icon="💰"
                label="Value Today"
                value={fmt(result.valueToday)}
                valueClass={isProfit ? "text-profit" : "text-loss"}
              />
              <StatCard
                icon={isProfit ? "📈" : "📉"}
                label="Profit / Loss"
                value={`${isProfit ? "+" : ""}${fmt(result.profit)}`}
                valueClass={isProfit ? "text-profit" : "text-loss"}
              />
              <StatCard icon="🪙" label="Coins Acquired" value={result.units} />
              <StatCard icon="⏮" label="Price on Date" value={fmt(result.priceThen)} />
              <StatCard icon="⏭" label="Current Price" value={fmt(result.priceNow)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HISTORY TAB
// ─────────────────────────────────────────────────────────────
function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/history?limit=${LIMIT}&skip=${page * LIMIT}`);
      const data = await res.json();
      if (res.ok) { setHistory(data.data); setTotal(data.total); }
      else setError("Failed to load history.");
    } catch { setError("Server not reachable."); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="history-layout">
      <div className="section-header">
        <div>
          <h2 className="section-title">History</h2>
          <p className="section-subtitle">All calculations — most recent first</p>
        </div>
        <button id="refresh-history-btn" className="btn-ghost" onClick={fetchHistory}>
          ↺ Refresh
        </button>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Coin</th>
                <th>Type</th>
                <th>Calculated At</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {[80, 60, 140].map((w, j) => (
                    <td key={j}><div className="skeleton-cell" style={{ width: w }} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <p className="error-msg">⚠ {error}</p>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <p>No calculations yet.</p>
        </div>
      ) : (
        <>
          <p className="history-meta">
            Showing <strong>{history.length}</strong> of <strong>{total}</strong>
          </p>
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Type</th>
                  <th>Calculated At</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row._id} className="table-row">
                    <td><span className="coin-pill">{row.crypto}</span></td>
                    <td><span className="type-badge">{row.type}</span></td>
                    <td className="text-muted">{fmtAt(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button id="prev-page-btn" className="btn-ghost"
                onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                ← Prev
              </button>
              <span className="page-info">Page {page + 1} of {totalPages}</span>
              <button id="next-page-btn" className="btn-ghost"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPARE TAB
// ─────────────────────────────────────────────────────────────
const CHART_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

function CompareTab() {
  const [coins, setCoins] = useState(["BTC", "ETH", "DOGE"]);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const updateCoin = (i, v) => {
    const u = [...coins]; u[i] = v.toUpperCase(); setCoins(u);
  };
  const addCoin = () => { if (coins.length < 3) setCoins([...coins, ""]); };
  const removeCoin = (i) => { if (coins.length > 2) setCoins(coins.filter((_, j) => j !== i)); };

  const handleCompare = async () => {
    const valid = coins.map((c) => c.trim()).filter(Boolean);
    if (valid.length < 2) { setError("Add at least 2 valid coin symbols."); return; }
    if (!date || !amount) { setError("Please fill in the date and amount."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: valid, date, amount: Number(amount) }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error || "Something went wrong.");
    } catch { setError("Server not reachable."); }
    finally { setLoading(false); }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const isP = d.profit >= 0;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-coin">{d.crypto}</p>
        <p>Invested: {fmt(d.invested)}</p>
        <p>Value Today: {fmt(d.valueToday)}</p>
        <p className={isP ? "text-profit" : "text-loss"}>
          {isP ? "+" : ""}{fmt(d.profit)}
        </p>
        <p className={isP ? "text-profit" : "text-loss"}>ROI: {d.roi}</p>
      </div>
    );
  };

  return (
    <div className="compare-layout">
      {/* ── Input Panel ─────── */}
      <div className="panel panel--compare-input">
        <div className="panel-inner">
          <div className="panel-heading">
            <span className="panel-eyebrow">Multi-Asset</span>
            <h2 className="panel-title">Coin Battle</h2>
            <p className="panel-subtitle">
              Same date, same amount — which coin would have won? Compare up to 3.
            </p>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label className="form-label">Coins (2–3)</label>
              {coins.map((coin, i) => (
                <div key={i} className="coin-input-row">
                  <div className="input-wrap" style={{ flex: 1 }}>
                    <span className="input-icon">₿</span>
                    <input
                      id={`coin-input-${i}`}
                      type="text"
                      placeholder={`Coin ${i + 1} (e.g. BTC)`}
                      className="form-input coin-input"
                      value={coin}
                      onChange={(e) => updateCoin(i, e.target.value)}
                    />
                  </div>
                  {coins.length > 2 && (
                    <button className="btn-remove" onClick={() => removeCoin(i)} title="Remove coin">✕</button>
                  )}
                </div>
              ))}
              {coins.length < 3 && (
                <button id="add-coin-btn" className="btn-ghost btn-add-coin" onClick={addCoin}>
                  + Add Coin
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="compare-date-input">Investment Date</label>
              <div className="input-wrap">
                <span className="input-icon">📅</span>
                <input
                  id="compare-date-input"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={today}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="compare-amount-input">Amount per Coin (₹)</label>
              <div className="input-wrap">
                <span className="input-icon">₹</span>
                <input
                  id="compare-amount-input"
                  type="number"
                  placeholder="e.g. 10000"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>
            </div>
          </div>

          <button id="compare-btn" onClick={handleCompare} disabled={loading} className="btn-primary">
            {loading
              ? <span className="btn-loading"><span className="spinner" />Comparing coins…</span>
              : "⚔ Start Battle"}
          </button>

          {loading && (
            <p className="loading-hint">
              Fetching prices for {coins.filter(Boolean).length} coins sequentially — ~{coins.filter(Boolean).length * 3}s to complete…
            </p>
          )}
          {error && <p className="error-msg">⚠ {error}</p>}
        </div>
      </div>

      {/* ── Results Panel ───── */}
      <div className="panel panel--compare-result">
        {!result ? (
          <div className="result-empty">
            <div className="result-empty-icon">⚔️</div>
            <p className="result-empty-title">No battle started yet</p>
            <p className="result-empty-desc">
              Add 2–3 coins, pick a date and amount, then hit "Start Battle" to see which would have won.
            </p>
          </div>
        ) : (
          <div className="compare-results">
            {/* Winner card */}
            <div className="winner-card">
              <span className="winner-trophy">🏆</span>
              <div className="winner-info">
                <span className="winner-eyebrow">Battle Winner</span>
                <span className="winner-coin">{result.winner}</span>
                <span className="winner-roi">{result.results[0]?.roi} ROI</span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-title">Current Value (₹ INR)</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.results} margin={{ top: 24, right: 16, left: 0, bottom: 4 }}>
                  <XAxis dataKey="crypto" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                  <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.06)" }} />
                  <Bar dataKey="valueToday" radius={[8, 8, 0, 0]} maxBarSize={80}>
                    {result.results.map((entry, i) => (
                      <Cell key={i}
                        fill={entry.profit >= 0 ? CHART_COLORS[i % CHART_COLORS.length] : "#f43f5e"}
                      />
                    ))}
                    <LabelList dataKey="roi" position="top"
                      style={{ fill: "#e2e8f0", fontSize: 12, fontWeight: 800 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison table */}
            <div className="compare-table-wrapper">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>#</th><th>Coin</th><th>Value Today</th><th>Profit/Loss</th><th>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row, i) => {
                    const isP = row.profit >= 0;
                    return (
                      <tr key={row.crypto} className="table-row">
                        <td className="rank-cell">{["🥇","🥈","🥉"][i]}</td>
                        <td><span className="coin-pill">{row.crypto}</span></td>
                        <td className={isP ? "text-profit" : "text-loss"}>{fmt(row.valueToday)}</td>
                        <td className={isP ? "text-profit" : "text-loss"}>
                          {isP ? "+" : ""}{fmt(row.profit)}
                        </td>
                        <td>
                          <span className={`roi-badge ${isP ? "roi-badge--profit" : "roi-badge--loss"}`}>
                            {row.roi}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {result.errors?.length > 0 && (
              <div className="partial-errors">
                {result.errors.map((e) => (
                  <p key={e.crypto} className="error-msg">⚠ {e.crypto}: {e.error}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <>
      <div className="app">
        {/* Header */}
        <header className="app-header">
          <div className="header-brand">
            <span className="brand-name">Crypto What-If</span>
          </div>

          <nav className="tab-nav" role="navigation" aria-label="Main navigation">
            <TabButton id="tab-calculator" label="Calculator" icon="🧮"
              active={activeTab === "calculator"} onClick={() => setActiveTab("calculator")} />
            <TabButton id="tab-history" label="History" icon="📜"
              active={activeTab === "history"} onClick={() => setActiveTab("history")} />
            <TabButton id="tab-compare" label="Compare" icon="⚔️"
              active={activeTab === "compare"} onClick={() => setActiveTab("compare")} />
          </nav>
        </header>

        {/* Content */}
        <main className="app-main" key={activeTab}>
          {activeTab === "calculator" && <CalculatorTab />}
          {activeTab === "history"    && <HistoryTab />}
          {activeTab === "compare"    && <CompareTab />}
        </main>
      </div>
    </>
  );
}
