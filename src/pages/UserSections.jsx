import { useEffect, useState } from "react";
import UserDashboardLayout from "../components/UserDashboardLayout";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";
import {
  apiUrl,
  createAuthHeaders,
  parseApiResponse,
} from "../config/api";

function SectionHero({ eyebrow, title, description, meta }) {
  return (
    <section className="dashboard-panel user-hero-panel">
      <div>
        <span className="auth-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {meta ? <div className="user-hero-meta">{meta}</div> : null}
    </section>
  );
}

function MetricCards({ items }) {
  return (
    <div className="user-section-grid">
      {items.map((item) => (
        <article key={item.label} className="dashboard-panel user-section-card">
          <div className="dashboard-stat-icon">
            <i className={`fa-solid ${item.icon}`} />
          </div>
          <h3>{item.label}</h3>
          <strong>{item.value}</strong>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}

function DataTable({ title, columns, rows, emptyText = "No records yet." }) {
  return (
    <section className="dashboard-panel user-table-panel">
      <div className="user-panel-head">
        <h3>{title}</h3>
      </div>
      <div className="user-table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={`${row[0]}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>{emptyText}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TimelinePanel({ title, items }) {
  return (
    <section className="dashboard-panel user-timeline-panel">
      <div className="user-panel-head">
        <h3>{title}</h3>
      </div>
      <div className="user-timeline">
        {items.map((item) => (
          <div className="user-timeline-item" key={`${item.title}-${item.time}`}>
            <div className="user-timeline-dot" />
            <div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function useProtectedCollection(path, key) {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);

      try {
        const response = await fetch(apiUrl(path), {
          headers: createAuthHeaders("authToken"),
        });
        const data = await parseApiResponse(response);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load records.");
        }

        setItems(data[key] || []);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [key, path]);

  return { items, setItems, message, loading };
}

export function InvestHistoryPage() {
  const { user } = useAuthenticatedUser();

  return (
    <UserDashboardLayout title="Invest History">
      <SectionHero
        eyebrow="Portfolio Activity"
        title="Review your investment performance"
        description="Track plan entries, projected return windows, and current portfolio allocation from a single history view."
        meta={<strong>{`$${Number(user?.totalInvest || 0).toLocaleString()} invested`}</strong>}
      />

      <MetricCards
        items={[
          {
            icon: "fa-chart-line",
            label: "Total Invested",
            value: `$${Number(user?.totalInvest || 0).toLocaleString()}`,
            description: "Combined capital committed across your investment activity.",
          },
          {
            icon: "fa-layer-group",
            label: "Active Plans",
            value: "3",
            description: "Simulated portfolio spread across three model strategies.",
          },
          {
            icon: "fa-bolt",
            label: "Best Performing",
            value: "Growth Prime",
            description: "Highest current momentum among your active investment tracks.",
          },
        ]}
      />

      <DataTable
        title="Investment History"
        columns={["Plan", "Capital", "Duration", "Status", "Projected ROI"]}
        rows={[
          ["Growth Prime", "$1,500", "30 Days", "Active", "14%"],
          ["Capital Shield", "$800", "14 Days", "Completed", "6%"],
          ["Index Momentum", "$2,100", "60 Days", "Active", "18%"],
        ]}
      />
    </UserDashboardLayout>
  );
}

export function AddFundPage() {
  const { user } = useAuthenticatedUser();
  const { items, setItems, message, loading } = useProtectedCollection(
    "/api/transactions",
    "transactions",
  );
  const [formState, setFormState] = useState({
    amount: "",
    method: "USDT",
    details: "",
  });
  const [depositMode, setDepositMode] = useState("crypto");
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const assetMeta = {
    USDT: {
      symbol: "USDT",
      network: "TRC20 Network",
      address: "TXwz8x7q2xgp9n8v2r4s9ucw6p7m1kq4z3",
      icon: "fa-dollar-sign",
      accent: "emerald",
      qrLabel: "Scan to deposit USDT",
      note: "Send only USDT on TRC20 to this wallet address.",
    },
    Bitcoin: {
      symbol: "BTC",
      network: "Native Network",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      icon: "fa-bitcoin-sign",
      accent: "amber",
      qrLabel: "Scan to deposit BTC",
      note: "Only send BTC to this address to avoid permanent loss.",
    },
    "Bank Transfer": {
      symbol: "BANK",
      network: "Domestic Settlement",
      address: "TradiLink Capital Treasury Desk",
      icon: "fa-building-columns",
      accent: "sky",
      qrLabel: "Review bank instructions",
      note: "Use the memo/reference field so finance can match your transfer quickly.",
    },
    "Perfect Money": {
      symbol: "PM",
      network: "Digital Wallet",
      address: "U47291036",
      icon: "fa-wallet",
      accent: "violet",
      qrLabel: "Use your Perfect Money wallet",
      note: "Confirm the account number carefully before submitting your deposit.",
    },
  };
  const currentAsset = assetMeta[formState.method] || assetMeta.USDT;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(currentAsset.address);
    } catch (error) {
      console.error("Failed to copy deposit address", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    try {
      const response = await fetch(apiUrl("/api/deposits"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders("authToken"),
        },
        body: JSON.stringify(formState),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create deposit request.");
      }

      setItems((prev) => [data.transaction, ...prev]);
      setFormState({ amount: "", method: "USDT", details: "" });
      setFeedbackType("profit");
      setFeedback(data.message);
    } catch (error) {
      setFeedbackType("loss");
      setFeedback(error.message);
    }
  };

  const depositRows = items
    .filter((item) => item.type === "deposit")
    .slice(0, 5)
    .map((item) => [
      item.reference,
      item.method,
      `$${Number(item.amount).toLocaleString()}`,
      item.status,
      new Date(item.createdAt).toLocaleDateString(),
    ]);

  return (
    <UserDashboardLayout title="Add Fund">
      <section className="add-fund-hero glass-panel">
        <div className="add-fund-hero-copy">
          <span className="auth-eyebrow">Wallet Funding</span>
          <h2>Add funds with a premium treasury flow</h2>
          <p>
            Securely prepare a deposit, choose your preferred settlement rail,
            and review the address details before you submit your funding request.
          </p>
        </div>
        <div className="add-fund-hero-chip">
          <span>Available balance</span>
          <strong>{`$${Number(user?.mainBalance || 0).toLocaleString()}`}</strong>
        </div>
      </section>

      <section className="add-fund-grid">
        <div className="add-fund-primary">
          <div className="add-fund-mode-switch glass-panel">
            <button
              type="button"
              className={depositMode === "crypto" ? "active" : ""}
              onClick={() => setDepositMode("crypto")}
            >
              Crypto
            </button>
            <button
              type="button"
              className={depositMode === "fiat" ? "active" : ""}
              onClick={() => {
                setDepositMode("fiat");
                setFormState((prev) => ({ ...prev, method: "Bank Transfer" }));
              }}
            >
              Fiat
            </button>
          </div>

          <section className="add-fund-glass-panel glass-panel">
            <div className="add-fund-panel-head">
              <span className="add-fund-label">Select Asset</span>
              <div className={`add-fund-asset-card ${currentAsset.accent}`}>
                <div className="add-fund-asset-badge">
                  <i className={`fa-solid ${currentAsset.icon}`} />
                </div>
                <div>
                  <strong>{formState.method}</strong>
                  <p>{`${currentAsset.symbol} · ${currentAsset.network}`}</p>
                </div>
              </div>
            </div>

            <form className="add-fund-form" onSubmit={handleSubmit}>
              <div className={`form-message ${feedbackType}`}>{feedback || " "}</div>
              <div className="form-group">
                <label className="form-label">Funding Method</label>
                <select
                  className="form-input"
                  value={formState.method}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, method: event.target.value }))
                  }
                >
                  {depositMode === "crypto" ? (
                    <>
                      <option>USDT</option>
                      <option>Bitcoin</option>
                      <option>Perfect Money</option>
                    </>
                  ) : (
                    <option>Bank Transfer</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  className="form-input"
                  type="number"
                  value={formState.amount}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group add-fund-form-span">
                <label className="form-label">Wallet / Reference</label>
                <input
                  className="form-input"
                  value={formState.details}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, details: event.target.value }))
                  }
                  placeholder="Wallet address, sender note, or bank memo"
                />
              </div>
              <div className="add-fund-address-box">
                <div>
                  <span className="add-fund-label">Deposit Address</span>
                  <p>{currentAsset.address}</p>
                </div>
                <button
                  type="button"
                  className="add-fund-copy-button"
                  onClick={handleCopyAddress}
                >
                  <i className="fa-regular fa-copy" />
                </button>
              </div>
              <div className="add-fund-note">
                <i className="fa-solid fa-circle-info" />
                <p>{currentAsset.note}</p>
              </div>
              <div className="user-form-action">
                <button type="submit" className="btn-primary">
                  Create Deposit Request
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="add-fund-sidebar">
          <section className="add-fund-qr-panel glass-panel">
            <div className="add-fund-qr-code">
              <div className="add-fund-qr-pattern" />
            </div>
            <h3>{currentAsset.qrLabel}</h3>
            <p>
              Open your wallet app, confirm the asset network, and use this visual
              reference to speed up the funding process.
            </p>
          </section>

          <section className="add-fund-history-card glass-panel">
            <div className="user-panel-head">
              <h3>Recent Deposit Activity</h3>
              <p>Latest requests across your account funding timeline.</p>
            </div>
            <div className="add-fund-activity-list">
              {depositRows.length > 0 ? (
                depositRows.slice(0, 3).map((row) => (
                  <article key={row[0]} className="add-fund-activity-item">
                    <div className="add-fund-activity-icon">
                      <i className="fa-solid fa-arrow-down-long" />
                    </div>
                    <div>
                      <strong>{`${row[1]} Deposit`}</strong>
                      <p>{row[4]}</p>
                    </div>
                    <div className="add-fund-activity-meta">
                      <strong>{row[2]}</strong>
                      <span>{row[3]}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="add-fund-empty-state">
                  {loading ? "Loading deposit requests..." : message || "No deposit requests yet."}
                </p>
              )}
            </div>
          </section>
        </div>
      </section>

      <div className="user-section-grid">
        <article className="user-section-card glass-panel">
          <div className="dashboard-stat-icon">
            <i className="fa-solid fa-wallet" />
          </div>
          <h3>Current Main Balance</h3>
          <strong>{`$${Number(user?.mainBalance || 0).toLocaleString()}`}</strong>
          <p>Available account balance before adding new funds.</p>
        </article>
        <article className="user-section-card glass-panel">
          <div className="dashboard-stat-icon">
            <i className="fa-solid fa-piggy-bank" />
          </div>
          <h3>Total Deposits</h3>
          <strong>{`$${Number(user?.totalDeposit || 0).toLocaleString()}`}</strong>
          <p>All successful deposits credited to your account wallet.</p>
        </article>
      </div>

      <section className="add-fund-guide-panel glass-panel">
        <div>
          <span className="auth-eyebrow">Funding Guide</span>
          <h3>Need a smoother large-volume deposit?</h3>
          <p>
            For larger treasury transfers, double-check the network, include your
            reference details, and contact support so your credit can be processed faster.
          </p>
        </div>
        <div className="add-fund-guide-actions">
          <button type="button" className="btn-primary">
            Read Guide
          </button>
          <button type="button" className="btn-outline">
            Contact Support
          </button>
        </div>
      </section>

      <DataTable
        title="Recent Deposit Requests"
        columns={["Reference", "Method", "Amount", "Status", "Date"]}
        rows={depositRows}
        emptyText={loading ? "Loading deposit requests..." : message || "No deposit requests yet."}
      />
    </UserDashboardLayout>
  );
}

export function FundHistoryPage() {
  const { user } = useAuthenticatedUser();

  return (
    <UserDashboardLayout title="Fund History">
      <SectionHero
        eyebrow="Deposit Archive"
        title="Monitor completed and pending deposits"
        description="Use this page to verify how much was funded, when it arrived, and whether the credit has been approved."
        meta={<strong>{`Deposits: $${Number(user?.totalDeposit || 0).toLocaleString()}`}</strong>}
      />

      <DataTable
        title="Funding Timeline"
        columns={["Reference", "Method", "Amount", "Date", "Status"]}
        rows={[
          ["TRD-DEP-001", "USDT", "$500", "2026-03-20", "Approved"],
          ["TRD-DEP-002", "Bank Transfer", "$1,000", "2026-03-28", "Pending"],
          ["TRD-DEP-003", "Bitcoin", "$350", "2026-04-01", "Approved"],
        ]}
      />
    </UserDashboardLayout>
  );
}

export function TransferPage() {
  return (
    <UserDashboardLayout title="Transfer">
      <SectionHero
        eyebrow="Internal Movement"
        title="Transfer funds between account areas"
        description="Move value from one balance group to another while keeping a clear transfer audit trail."
        meta={<strong>Protected Flow</strong>}
      />

      <div className="user-two-column">
        <section className="dashboard-panel user-form-panel">
          <div className="user-panel-head">
            <h3>Create Transfer</h3>
            <p>Select your source and destination wallet before submitting an internal transfer.</p>
          </div>
          <form className="user-form-grid">
            <div className="form-group">
              <label className="form-label">From Wallet</label>
              <select className="form-input" defaultValue="Main Balance">
                <option>Main Balance</option>
                <option>Interest Balance</option>
                <option>Referral Bonus</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">To Wallet</label>
              <select className="form-input" defaultValue="Interest Balance">
                <option>Main Balance</option>
                <option>Interest Balance</option>
                <option>Withdrawal Wallet</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input className="form-input" type="number" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Security Pin</label>
              <input className="form-input" type="password" placeholder="Enter transfer pin" />
            </div>
            <div className="user-form-action">
              <button type="button" className="btn-primary">
                Process Transfer
              </button>
            </div>
          </form>
        </section>

        <TimelinePanel
          title="Recent Transfer Activity"
          items={[
            {
              title: "Main Balance to Interest Wallet",
              description: "A scheduled internal move is waiting for confirmation.",
              time: "10 minutes ago",
            },
            {
              title: "Referral Bonus to Main Balance",
              description: "Recent referral earnings were merged into your trading balance.",
              time: "Yesterday",
            },
          ]}
        />
      </div>
    </UserDashboardLayout>
  );
}

export function TransactionPage() {
  const { user } = useAuthenticatedUser();
  const { items, message, loading } = useProtectedCollection(
    "/api/transactions",
    "transactions",
  );

  const rows = items.map((item) => [
    item.reference,
    item.type,
    `$${Number(item.amount).toLocaleString()}`,
    item.direction,
    item.status,
  ]);

  return (
    <UserDashboardLayout title="Transaction">
      <SectionHero
        eyebrow="Account Ledger"
        title="View your financial movement across the platform"
        description="Track deposits, payouts, transfers, and internal credit activity from one transaction log."
        meta={<strong>{`Payouts: $${Number(user?.totalPayout || 0).toLocaleString()}`}</strong>}
      />

      <MetricCards
        items={[
          {
            icon: "fa-money-check-dollar",
            label: "Total Payout",
            value: `$${Number(user?.totalPayout || 0).toLocaleString()}`,
            description: "All tracked outgoing payments on the account.",
          },
          {
            icon: "fa-file-invoice-dollar",
            label: "Transaction Log",
            value: `${items.length}`,
            description: "All fetched account transaction records.",
          },
        ]}
      />

      <DataTable
        title="Transaction Ledger"
        columns={["Reference", "Type", "Amount", "Direction", "Status"]}
        rows={rows}
        emptyText={loading ? "Loading transactions..." : message || "No transactions yet."}
      />
    </UserDashboardLayout>
  );
}

export function WithdrawalPage() {
  const { items, setItems } = useProtectedCollection("/api/withdrawals", "withdrawals");
  const [formState, setFormState] = useState({
    amount: "",
    method: "USDT",
    details: "",
  });
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    try {
      const response = await fetch(apiUrl("/api/withdrawals"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders("authToken"),
        },
        body: JSON.stringify(formState),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create withdrawal request.");
      }

      setItems((prev) => [data.transaction, ...prev]);
      setFormState({ amount: "", method: "USDT", details: "" });
      setFeedbackType("profit");
      setFeedback(data.message);
    } catch (error) {
      setFeedbackType("loss");
      setFeedback(error.message);
    }
  };

  return (
    <UserDashboardLayout title="Withdrawal">
      <SectionHero
        eyebrow="Payout Request"
        title="Submit a withdrawal from your account"
        description="Choose the payout route, enter your request amount, and provide the destination details for processing."
        meta={<strong>{`${items.length} requests`}</strong>}
      />

      <div className="user-two-column">
        <section className="dashboard-panel user-form-panel">
          <div className="user-panel-head">
            <h3>Withdrawal Form</h3>
            <p>Requests are reviewed manually before release to the selected payout destination.</p>
          </div>
          <form className="user-form-grid" onSubmit={handleSubmit}>
            <div className={`form-message ${feedbackType}`}>{feedback || " "}</div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                className="form-input"
                type="number"
                value={formState.amount}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Withdrawal Method</label>
              <select
                className="form-input"
                value={formState.method}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, method: event.target.value }))
                }
              >
                <option>USDT</option>
                <option>Bitcoin</option>
                <option>Bank Transfer</option>
              </select>
            </div>
            <div className="form-group user-form-span">
              <label className="form-label">Wallet / Bank Details</label>
              <input
                className="form-input"
                value={formState.details}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, details: event.target.value }))
                }
                placeholder="Destination details"
              />
            </div>
            <div className="user-form-action">
              <button type="submit" className="btn-primary">
                Submit Withdrawal
              </button>
            </div>
          </form>
        </section>

        <MetricCards
          items={[
            {
              icon: "fa-money-bill-wave",
              label: "Withdrawal Requests",
              value: `${items.length}`,
              description: "Current withdrawal requests saved for this account.",
            },
            {
              icon: "fa-building-columns",
              label: "Default Payout Method",
              value: formState.method,
              description: "Selected destination method for the next withdrawal request.",
            },
          ]}
        />
      </div>
    </UserDashboardLayout>
  );
}

export function WithdrawalHistoryPage() {
  const { items, message, loading } = useProtectedCollection(
    "/api/withdrawals",
    "withdrawals",
  );

  const rows = items.map((item) => [
    item.reference,
    item.method,
    `$${Number(item.amount).toLocaleString()}`,
    new Date(item.createdAt).toLocaleDateString(),
    item.status,
  ]);

  return (
    <UserDashboardLayout title="Withdrawal History">
      <SectionHero
        eyebrow="Payout Archive"
        title="Review all withdrawal decisions"
        description="Track completed withdrawals, pending approval requests, and rejected payouts."
        meta={<strong>{`${items.length} records`}</strong>}
      />

      <DataTable
        title="Withdrawal Log"
        columns={["Reference", "Method", "Amount", "Requested", "Status"]}
        rows={rows}
        emptyText={loading ? "Loading withdrawals..." : message || "No withdrawals yet."}
      />
    </UserDashboardLayout>
  );
}

export function MyReferralPage() {
  const { user } = useAuthenticatedUser();
  const referralCode = user?._id
    ? `https://tradilinkcapital.com/auth/register/${user._id.slice(-8)}`
    : "https://tradilinkcapital.com/auth/register/invite";

  return (
    <UserDashboardLayout title="My Referral">
      <SectionHero
        eyebrow="Growth Network"
        title="Invite new members and track your referral reach"
        description="Share your referral link, review how your network is performing, and keep an eye on conversion momentum."
        meta={<strong>{`Bonus: $${Number(user?.totalReferralBonus || 0).toLocaleString()}`}</strong>}
      />

      <div className="user-two-column">
        <section className="dashboard-panel user-form-panel">
          <div className="user-panel-head">
            <h3>Referral Link</h3>
            <p>Share this onboarding link with new members to expand your network.</p>
          </div>
          <form className="user-form-grid">
            <div className="form-group user-form-span">
              <label className="form-label">Invite URL</label>
              <input className="form-input" value={referralCode} readOnly />
            </div>
            <div className="user-form-action">
              <button type="button" className="btn-primary">
                Copy Referral Link
              </button>
            </div>
          </form>
        </section>

        <MetricCards
          items={[
            {
              icon: "fa-user-plus",
              label: "Active Referrals",
              value: "12",
              description: "Members currently linked to your invitation path.",
            },
            {
              icon: "fa-chart-pie",
              label: "Conversion Rate",
              value: "68%",
              description: "Recent referral performance across your invitation traffic.",
            },
          ]}
        />
      </div>

      <TimelinePanel
        title="Referral Activity"
        items={[
          {
            title: "New referral registered",
            description: "A recently invited user completed signup from your referral code.",
            time: "Today",
          },
          {
            title: "Commission milestone hit",
            description: "Your referral network crossed a fresh earnings threshold.",
            time: "2 days ago",
          },
        ]}
      />
    </UserDashboardLayout>
  );
}

export function ReferralBonusPage() {
  const { user } = useAuthenticatedUser();

  return (
    <UserDashboardLayout title="Referral Bonus">
      <SectionHero
        eyebrow="Bonus Wallet"
        title="Track earned commissions from referrals"
        description="Review total referral earnings, the latest credit, and the momentum of your network bonus activity."
        meta={<strong>{`Last bonus: $${Number(user?.lastReferralBonus || 0).toLocaleString()}`}</strong>}
      />

      <MetricCards
        items={[
          {
            icon: "fa-gift",
            label: "Total Referral Bonus",
            value: `$${Number(user?.totalReferralBonus || 0).toLocaleString()}`,
            description: "Total bonus earned from referred account activity.",
          },
          {
            icon: "fa-sack-dollar",
            label: "Last Credit",
            value: `$${Number(user?.lastReferralBonus || 0).toLocaleString()}`,
            description: "Most recent referral bonus credit posted to your account.",
          },
          {
            icon: "fa-arrow-trend-up",
            label: "Bonus Velocity",
            value: "Strong",
            description: "Referral rewards are building steadily this cycle.",
          },
        ]}
      />

      <DataTable
        title="Referral Bonus Ledger"
        columns={["Source", "Level", "Amount", "Date", "Status"]}
        rows={[
          ["Direct Invite", "Level 1", "$40", "2026-03-18", "Credited"],
          ["Team Bonus", "Level 2", "$25", "2026-03-27", "Credited"],
          ["Referral Commission", "Level 1", "$35", "2026-04-01", "Credited"],
        ]}
      />
    </UserDashboardLayout>
  );
}

export function ProfileSettingsPage() {
  const { user } = useAuthenticatedUser();

  return (
    <UserDashboardLayout title="Profile Settings">
      <SectionHero
        eyebrow="Account Controls"
        title="Manage your profile and security preferences"
        description="Keep your personal details, payout settings, and account access preferences up to date."
        meta={<strong>{user?.status || "Active"}</strong>}
      />

      <div className="user-two-column">
        <section className="dashboard-panel user-form-panel">
          <div className="user-panel-head">
            <h3>Profile Information</h3>
            <p>Review your main contact details and prepare the account for future edits.</p>
          </div>
          <form className="user-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={user?.name || ""} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email || ""} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" value={user?.role || "user"} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <input className="form-input" value={user?.status || "active"} readOnly />
            </div>
            <div className="user-form-action">
              <button type="button" className="btn-primary">
                Profile Editing Coming Soon
              </button>
            </div>
          </form>
        </section>

        <TimelinePanel
          title="Security Checklist"
          items={[
            {
              title: "Login token active",
              description: "Your current session is authenticated and linked to this account.",
              time: "Current session",
            },
            {
              title: "Admin separation enabled",
              description: "Admin access is isolated under a dedicated login route.",
              time: "Configured",
            },
            {
              title: "Profile update flow",
              description: "Editable profile controls can be connected to the backend next.",
              time: "Next step",
            },
          ]}
        />
      </div>
    </UserDashboardLayout>
  );
}

export function SupportTicketPage() {
  const { items, setItems, message, loading } = useProtectedCollection(
    "/api/support-tickets",
    "tickets",
  );
  const [formState, setFormState] = useState({
    subject: "",
    category: "Account",
    priority: "Normal",
    message: "",
  });
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    try {
      const response = await fetch(apiUrl("/api/support-tickets"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders("authToken"),
        },
        body: JSON.stringify(formState),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create support ticket.");
      }

      setItems((prev) => [data.ticket, ...prev]);
      setFormState({
        subject: "",
        category: "Account",
        priority: "Normal",
        message: "",
      });
      setFeedbackType("profit");
      setFeedback(data.message);
    } catch (error) {
      setFeedbackType("loss");
      setFeedback(error.message);
    }
  };

  const rows = items.map((item) => [
    item.ticketId,
    item.subject,
    item.category,
    item.priority,
    item.status,
  ]);

  return (
    <UserDashboardLayout title="Support Ticket">
      <SectionHero
        eyebrow="Help Desk"
        title="Open and monitor support conversations"
        description="Submit account issues, funding questions, or payout requests and keep track of ticket progress."
        meta={<strong>{`${items.length} tickets`}</strong>}
      />

      <div className="user-two-column">
        <section className="dashboard-panel user-form-panel">
          <div className="user-panel-head">
            <h3>Create Support Ticket</h3>
            <p>Send a clear summary and message so the support team can respond faster.</p>
          </div>
          <form className="user-form-grid" onSubmit={handleSubmit}>
            <div className={`form-message ${feedbackType}`}>{feedback || " "}</div>
            <div className="form-group user-form-span">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                value={formState.subject}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, subject: event.target.value }))
                }
                placeholder="Brief issue summary"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={formState.category}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, category: event.target.value }))
                }
              >
                <option>Account</option>
                <option>Deposit</option>
                <option>Withdrawal</option>
                <option>Technical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={formState.priority}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, priority: event.target.value }))
                }
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-group user-form-span">
              <label className="form-label">Message</label>
              <textarea
                className="form-input form-textarea"
                value={formState.message}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, message: event.target.value }))
                }
                placeholder="Describe the issue in detail"
                rows="5"
              />
            </div>
            <div className="user-form-action">
              <button type="submit" className="btn-primary">
                Open Ticket
              </button>
            </div>
          </form>
        </section>

        <MetricCards
          items={[
            {
              icon: "fa-headset",
              label: "Open Tickets",
              value: `${items.filter((item) => item.status !== "closed").length}`,
              description: "Tickets currently awaiting support closure.",
            },
            {
              icon: "fa-circle-check",
              label: "Resolved",
              value: `${items.filter((item) => item.status === "closed").length}`,
              description: "Tickets already closed by the support team.",
            },
          ]}
        />
      </div>

      <DataTable
        title="Ticket History"
        columns={["Ticket ID", "Subject", "Category", "Priority", "Status"]}
        rows={rows}
        emptyText={loading ? "Loading tickets..." : message || "No support tickets yet."}
      />
    </UserDashboardLayout>
  );
}
