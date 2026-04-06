import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import UserDashboardLayout from "../components/UserDashboardLayout";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";

const marketTrends = [
  { name: "Bitcoin", symbol: "BTC", price: "$67,432.10", change: "+1.2%", direction: "up", accent: "btc", icon: "fa-bitcoin-sign" },
  { name: "Ethereum", symbol: "ETH", price: "$2,642.55", change: "+3.8%", direction: "up", accent: "eth", icon: "fa-diamond" },
  { name: "Solana", symbol: "SOL", price: "$164.20", change: "-0.5%", direction: "down", accent: "sol", icon: "fa-sun" },
  { name: "Cardano", symbol: "ADA", price: "$0.3421", change: "+0.8%", direction: "up", accent: "ada", icon: "fa-circle-nodes" },
];

const quickActions = [
  { label: "Deposit", icon: "fa-circle-plus", to: "/add-fund", accent: "primary" },
  { label: "Withdraw", icon: "fa-arrow-up", to: "/withdrawal", accent: "secondary" },
  { label: "Transfer", icon: "fa-right-left", to: "/transfer", accent: "filled" },
];

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Dashboard() {
  const { user } = useAuthenticatedUser();

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

  const recentActivity = useMemo(
    () => [
      {
        title: "Account funded",
        meta: "Primary wallet credit",
        amount: `+${formatCurrency(user?.totalDeposit)}`,
        detail: "Treasury confirmation received",
        icon: "fa-arrow-down",
        accent: "primary",
      },
      {
        title: "Investment performance",
        meta: "Current profit cycle",
        amount: `+${formatCurrency(user?.totalEarn)}`,
        detail: "Yield distributed to the account",
        icon: "fa-chart-column",
        accent: "tertiary",
      },
      {
        title: "Referral bonus",
        meta: "Network reward",
        amount: `+${formatCurrency(user?.lastReferralBonus)}`,
        detail: "Latest bonus ledger update",
        icon: "fa-gift",
        accent: "gold",
      },
    ],
    [user],
  );

  const referralLink = useMemo(() => {
    if (user?._id) {
      return `https://tradilinkcapital.com/auth/register/${user._id.slice(-8)}`;
    }

    if (user?.fullName) {
      return `https://tradilinkcapital.com/auth/register/${user.fullName
        .toLowerCase()
        .replace(/\s+/g, "")}`;
    }

    return "https://tradilinkcapital.com/auth/register/invite";
  }, [user]);

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch (error) {
      console.error("Failed to copy referral link", error);
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

          <section className="dashboard-activity-panel glass-panel">
            <div className="dashboard-section-head">
              <h3>Recent Activity</h3>
              <NavLink to="/transaction">View All</NavLink>
            </div>

            <div className="dashboard-activity-list">
              {recentActivity.map((item) => (
                <article key={item.title} className="dashboard-activity-item">
                  <div className={`dashboard-activity-icon ${item.accent}`}>
                    <i className={`fa-solid ${item.icon}`} />
                  </div>
                  <div className="dashboard-activity-copy">
                    <strong>{item.title}</strong>
                    <span>{item.meta}</span>
                  </div>
                  <div className="dashboard-activity-metric">
                    <strong>{item.amount}</strong>
                    <span>{item.detail}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

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
        </section>

        <aside className="dashboard-secondary-column">
          <section className="dashboard-actions-panel glass-panel">
            <div className="dashboard-section-head compact">
              <h3>Vault Terminal</h3>
            </div>
            <div className="dashboard-actions-grid">
              {quickActions.map((action) => (
                <NavLink
                  key={action.label}
                  to={action.to}
                  className={`dashboard-action-button ${action.accent}`}
                >
                  <i className={`fa-solid ${action.icon}`} />
                  <span>{action.label}</span>
                </NavLink>
              ))}
            </div>
          </section>

          <section className="dashboard-market-panel glass-panel">
            <div className="dashboard-section-head compact">
              <h3>Market Trends</h3>
            </div>
            <div className="dashboard-market-list">
              {marketTrends.map((item) => (
                <article key={item.symbol} className="dashboard-market-item">
                  <div className="dashboard-market-left">
                    <div className={`dashboard-market-badge ${item.accent}`}>
                      <i className={`fa-solid ${item.icon}`} />
                    </div>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.symbol}</span>
                    </div>
                  </div>
                  <div className="dashboard-market-right">
                    <strong>{item.price}</strong>
                    <span className={item.direction === "up" ? "profit" : "loss"}>
                      <i
                        className={`fa-solid ${
                          item.direction === "up" ? "fa-arrow-trend-up" : "fa-arrow-trend-down"
                        }`}
                      />{" "}
                      {item.change}
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <NavLink to="/invest-history" className="dashboard-market-cta">
              Explore Portfolio
            </NavLink>
          </section>

          <section className="dashboard-promo-card">
            <div className="dashboard-promo-overlay" />
            <div className="dashboard-promo-content">
              <span>New Feature</span>
              <h4>Kinetic Yield tier now active for premium account growth.</h4>
              <p>
                Use your current balances, referral performance, and treasury inflows to keep momentum compounding.
              </p>
              <NavLink to="/add-fund">Learn More</NavLink>
            </div>
          </section>

          <section className="dashboard-referral-modern glass-panel">
            <div className="dashboard-section-head compact">
              <h3>Referral Link</h3>
            </div>
            <div className="dashboard-referral-box modern">
              <input readOnly value={referralLink} />
              <button
                type="button"
                aria-label="Copy referral link"
                onClick={handleCopyReferral}
              >
                <i className="fa-regular fa-copy" />
              </button>
            </div>
          </section>
        </aside>
      </div>
    </UserDashboardLayout>
  );
}

export default Dashboard;
