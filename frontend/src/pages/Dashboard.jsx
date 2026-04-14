import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import UserDashboardLayout from "../components/UserDashboardLayout";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";
import {
  apiUrl,
  createAuthHeaders,
  parseApiResponse,
} from "../config/api";

const tradeAssets = ["EURUSD", "GBPUSD", "BTCUSDT", "ETHUSDT", "AAPL", "TSLA"];
const leverageOptions = ["1x", "5x", "10x", "25x", "50x"];
const expirationOptions = ["1h", "6h", "12h", "24h", "7d"];

const quickActions = [
  { label: "Deposit", icon: "fa-circle-plus", to: "/add-fund", accent: "primary" },
  { label: "Withdraw", icon: "fa-arrow-up", to: "/withdrawal", accent: "secondary" },
  { label: "Transfer", icon: "fa-right-left", to: "/transfer", accent: "filled" },
];

const walletProviders = [
  "Trust Wallet",
  "Coinbase Wallet",
  "Blockchain.com",
  "Exodus",
  "MetaMask",
  "Ledger Live",
  "Trezor Suite",
  "Binance Web3 Wallet",
  "SafePal",
  "Phantom",
  "Atomic Wallet",
  "Other",
];

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Dashboard() {
  const { user, setUser } = useAuthenticatedUser();
  const [walletForm, setWalletForm] = useState({
    provider: walletProviders[0],
    walletLabel: "",
    walletAddress: "",
  });
  const [walletFeedback, setWalletFeedback] = useState("");
  const [walletFeedbackType, setWalletFeedbackType] = useState("");
  const [walletSubmitting, setWalletSubmitting] = useState(false);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [tradeForm, setTradeForm] = useState({
    asset: "EURUSD",
    amount: "",
    leverage: "5x",
    expiration: "24h",
  });
  const [tradeFeedback, setTradeFeedback] = useState("");
  const [tradeFeedbackType, setTradeFeedbackType] = useState("");
  const [tradeSubmitting, setTradeSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTradeData = async () => {
      try {
        const tradesResponse = await fetch(apiUrl("/api/trades"), {
          headers: createAuthHeaders("authToken"),
        });
        const tradesData = await parseApiResponse(tradesResponse);

        if (tradesResponse.ok && isMounted) {
          setTradeHistory(tradesData.trades || []);
        }
      } catch (error) {
        console.error("Failed to load trade history", error);
      }
    };

    loadTradeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalBalance = useMemo(() => {
    return (
      Number(user?.mainBalance || 0) +
      Number(user?.interestBalance || 0) +
      Number(user?.totalReferralBonus || 0)
    );
  }, [user]);

  const assetBreakdown = useMemo(
    () => [
      {
        name: "Main Wallet",
        symbol: "USD",
        amount: formatCurrency(user?.mainBalance),
        change: "+2.4%",
        accent: "btc",
        icon: "fa-wallet",
      },
      {
        name: "Interest Wallet",
        symbol: "APR",
        amount: formatCurrency(user?.interestBalance),
        change: "+4.1%",
        accent: "eth",
        icon: "fa-chart-line",
      },
    ],
    [user],
  );

  const accountStats = useMemo(
    () => [
      {
        label: "Total Deposit",
        value: formatCurrency(user?.totalDeposit),
        note: "Treasury capital secured",
      },
      {
        label: "Total Earn",
        value: formatCurrency(user?.totalEarn),
        note: "Yield and profit credited",
      },
      {
        label: "Total Invest",
        value: formatCurrency(user?.totalInvest),
        note: "Capital deployed to plans",
      },
      {
        label: "Total Payout",
        value: formatCurrency(user?.totalPayout),
        note: "Withdrawals and releases",
      },
    ],
    [user],
  );

  const handleWalletChange = (event) => {
    const { name, value } = event.target;
    setWalletForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWalletSubmit = async (event) => {
    event.preventDefault();
    setWalletSubmitting(true);
    setWalletFeedback("");

    try {
      const response = await fetch(apiUrl(`/api/users/${user?.id}/wallets`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders("authToken"),
        },
        body: JSON.stringify({
          action: "add",
          provider: walletForm.provider,
          walletLabel: walletForm.walletLabel,
          walletAddress: walletForm.walletAddress,
        }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to connect wallet.");
      }

      setUser(data.user);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      setWalletFeedbackType("profit");
      setWalletFeedback(data.message || "Wallet connected successfully.");
      setWalletForm({
        provider: walletProviders[0],
        walletLabel: "",
        walletAddress: "",
      });
    } catch (error) {
      setWalletFeedbackType("loss");
      setWalletFeedback(error.message);
    } finally {
      setWalletSubmitting(false);
    }
  };

  const handleWalletRemove = async (walletId) => {
    setWalletFeedback("");
    setWalletSubmitting(true);

    try {
      const response = await fetch(apiUrl(`/api/users/${user?.id}/wallets`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders("authToken"),
        },
        body: JSON.stringify({
          action: "remove",
          walletId,
        }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove wallet.");
      }

      setUser(data.user);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      setWalletFeedbackType("profit");
      setWalletFeedback(data.message || "Wallet removed successfully.");
    } catch (error) {
      setWalletFeedbackType("loss");
      setWalletFeedback(error.message);
    } finally {
      setWalletSubmitting(false);
    }
  };

  const handleTradeFieldChange = (event) => {
    const { name, value } = event.target;
    setTradeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceTrade = async (side) => {
    setTradeSubmitting(true);
    setTradeFeedback("");

    try {
      const response = await fetch(apiUrl("/api/trades"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders("authToken"),
        },
        body: JSON.stringify({
          ...tradeForm,
          side,
        }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to place trade.");
      }

      setTradeFeedbackType("profit");
      setTradeFeedback(data.message || "Trade placed successfully.");
      setTradeHistory((prev) => [data.trade, ...prev].slice(0, 10));
      setTradeForm((prev) => ({ ...prev, amount: "" }));
    } catch (error) {
      setTradeFeedbackType("loss");
      setTradeFeedback(error.message);
    } finally {
      setTradeSubmitting(false);
    }
  };

  return (
    <UserDashboardLayout title="Dashboard">
      <div className="dashboard-exchange-grid">
        <section className="dashboard-primary-column">
          <div className="dashboard-hero-card glass-panel">
            <div className="dashboard-hero-top">
              <div>
                <p className="dashboard-eyebrow">Total Balance</p>
                <div className="dashboard-hero-balance-row">
                  <h2>{formatCurrency(totalBalance)}</h2>
                  <span className="dashboard-positive-pill">+5.2%</span>
                </div>
                <p className="dashboard-hero-subcopy">
                  Welcome back, {user?.fullName || user?.name || "Investor"}. Your portfolio is in a strong operating position today.
                </p>
              </div>
              <div className="dashboard-range-switch">
                <button type="button">7D</button>
                <button type="button" className="active">
                  30D
                </button>
              </div>
            </div>

            <div className="dashboard-sparkline" aria-hidden="true">
              <svg viewBox="0 0 1000 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dashboardChartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00daf3" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00daf3" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 Q100,20 200,60 T400,40 T600,70 T800,20 L1000,50 L1000,100 L0,100 Z"
                  fill="url(#dashboardChartGradient)"
                />
                <path
                  d="M0,80 Q100,20 200,60 T400,40 T600,70 T800,20 L1000,50"
                  fill="none"
                  stroke="#00daf3"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <section className="dashboard-actions-panel dashboard-actions-panel-inline glass-panel">
            <div className="dashboard-section-head compact">
              <h3>Vault Terminal</h3>
            </div>
            <div className="dashboard-actions-grid dashboard-actions-grid-inline">
              {quickActions.map((action) => (
                <NavLink
                  key={action.label}
                  to={action.to}
                  className={`dashboard-action-button dashboard-action-button-inline ${action.accent}`}
                >
                  <i className={`fa-solid ${action.icon}`} />
                  <span>{action.label}</span>
                </NavLink>
              ))}
            </div>
          </section>

          <div className="dashboard-asset-grid">
            {assetBreakdown.map((asset) => (
              <article key={asset.name} className="dashboard-asset-card glass-panel">
                <div className={`dashboard-asset-icon ${asset.accent}`}>
                  <i className={`fa-solid ${asset.icon}`} />
                </div>
                <div className="dashboard-asset-copy">
                  <p>{asset.name}</p>
                  <strong>{asset.symbol}</strong>
                </div>
                <div className="dashboard-asset-metric">
                  <span>{asset.amount}</span>
                  <small>{asset.change}</small>
                </div>
              </article>
            ))}
          </div>

          <section className="dashboard-account-stats">
            <div className="dashboard-section-head">
              <h3>Account Statistics</h3>
            </div>
            <div className="dashboard-stats-grid-modern">
              {accountStats.map((item) => (
                <article key={item.label} className="dashboard-stat-modern glass-panel">
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                  <span>{item.note}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-trade-side">
              <section className="dashboard-quick-trade-hero glass-panel">
                <i className="fa-solid fa-bolt" />
                <h3>Quick Trade</h3>
                <p>Start a new trade instantly or explore investment plans.</p>
              </section>

              <section className="dashboard-trade-form-panel glass-panel">
                <div className="dashboard-section-head compact">
                  <h3>Place a Trade</h3>
                </div>

                <div className={`form-message ${tradeFeedbackType}`}>{tradeFeedback || " "}</div>

                <div className="dashboard-trade-form">
                  <div className="form-group">
                    <label className="form-label">Asset</label>
                    <select
                      className="form-input"
                      name="asset"
                      value={tradeForm.asset}
                      onChange={handleTradeFieldChange}
                    >
                      {tradeAssets.map((asset) => (
                        <option key={asset}>{asset}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount</label>
                    <input
                      className="form-input"
                      name="amount"
                      type="number"
                      placeholder="Invest Amount (0.00)"
                      value={tradeForm.amount}
                      onChange={handleTradeFieldChange}
                    />
                    <span className="dashboard-trade-hint">Min: $50, Max: $500,000</span>
                  </div>

                  <div className="dashboard-trade-grid">
                    <div className="form-group">
                      <label className="form-label">Leverage</label>
                      <select
                        className="form-input"
                        name="leverage"
                        value={tradeForm.leverage}
                        onChange={handleTradeFieldChange}
                      >
                        {leverageOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expiration</label>
                      <select
                        className="form-input"
                        name="expiration"
                        value={tradeForm.expiration}
                        onChange={handleTradeFieldChange}
                      >
                        {expirationOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="dashboard-trade-actions">
                    <button
                      type="button"
                      className="dashboard-trade-btn buy"
                      disabled={tradeSubmitting}
                      onClick={() => handlePlaceTrade("buy")}
                    >
                      <i className="fa-solid fa-arrow-trend-up" /> BUY
                    </button>
                    <button
                      type="button"
                      className="dashboard-trade-btn sell"
                      disabled={tradeSubmitting}
                      onClick={() => handlePlaceTrade("sell")}
                    >
                      <i className="fa-solid fa-arrow-trend-down" /> SELL
                    </button>
                  </div>
                </div>
              </section>

              <section className="dashboard-trade-history-panel glass-panel">
                <div className="dashboard-section-head compact">
                  <h3>Recent Trades</h3>
                </div>
                <div className="dashboard-trade-history-list">
                  {tradeHistory.length ? (
                    tradeHistory.slice(0, 4).map((trade) => (
                      <article key={trade.id} className="dashboard-trade-history-item">
                        <div>
                          <strong>{trade.asset}</strong>
                          <span>{`${trade.leverage || "1x"} · ${trade.expiration || "24h"}`}</span>
                        </div>
                        <div className="dashboard-trade-history-metric">
                          <strong>{formatCurrency(trade.amount)}</strong>
                          <span className={trade.side === "buy" ? "profit" : "loss"}>
                            {trade.side.toUpperCase()}
                          </span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="dashboard-wallet-empty-copy">No trades placed yet.</p>
                  )}
                </div>
              </section>
            </section>
          </section>

          <section className="dashboard-wallet-panel glass-panel">
            <div className="dashboard-section-head dashboard-section-head-stack">
              <h3>Connect Wallet</h3>
              <p>Link external wallets to your dashboard for payout setup and wallet tracking.</p>
            </div>

            <form className="dashboard-wallet-form" onSubmit={handleWalletSubmit}>
              <div className={`form-message ${walletFeedbackType}`}>{walletFeedback || " "}</div>
              <div className="form-group">
                <label className="form-label">Wallet Provider</label>
                <select
                  className="form-input"
                  name="provider"
                  value={walletForm.provider}
                  onChange={handleWalletChange}
                >
                  {walletProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Wallet Label</label>
                <input
                  className="form-input"
                  name="walletLabel"
                  value={walletForm.walletLabel}
                  onChange={handleWalletChange}
                  placeholder="Primary payout wallet"
                />
              </div>
              <div className="form-group user-form-span">
                <label className="form-label">Wallet Address / ID</label>
                <input
                  className="form-input"
                  name="walletAddress"
                  value={walletForm.walletAddress}
                  onChange={handleWalletChange}
                  placeholder="Paste your wallet address or wallet identifier"
                  required
                />
              </div>
              <div className="dashboard-wallet-action">
                <button
                  type="submit"
                  className="btn-primary dashboard-wallet-submit"
                  disabled={walletSubmitting}
                >
                  {walletSubmitting ? "Saving wallet..." : "Connect Wallet"}
                </button>
              </div>
            </form>

            <div className="dashboard-wallet-inline">
              {user?.linkedWallets?.length ? (
                <div className="dashboard-wallet-list">
                  {user.linkedWallets.map((wallet) => (
                    <article className="dashboard-wallet-card" key={wallet.id}>
                      <div className="dashboard-wallet-card-top">
                        <div>
                          <strong>{wallet.provider}</strong>
                          <span>{wallet.walletLabel || "Linked wallet"}</span>
                        </div>
                        <span className={`wallet-status wallet-status-${wallet.status}`}>
                          {wallet.status}
                        </span>
                      </div>
                      <p>{wallet.walletAddress}</p>
                      <div className="dashboard-wallet-card-actions">
                        <small>
                          Connected{" "}
                          {wallet.connectedAt
                            ? new Date(wallet.connectedAt).toLocaleDateString()
                            : "recently"}
                        </small>
                        <button
                          type="button"
                          className="btn-outline wallet-remove-btn dashboard-wallet-remove"
                          onClick={() => handleWalletRemove(wallet.id)}
                          disabled={walletSubmitting}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="dashboard-wallet-empty dashboard-wallet-empty-inline">
                  <i className="fa-solid fa-wallet" />
                  <p>No wallets linked yet</p>
                </div>
              )}
            </div>
          </section>
        </div>
    </UserDashboardLayout>
  );
}

export default Dashboard;
