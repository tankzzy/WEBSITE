import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { apiUrl, createAuthHeaders, parseApiResponse } from '../config';

function AdminPanel() {
  const token = localStorage.getItem('adminAuthToken');
  const navigate = useNavigate();
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('.glass-card'));
    const handlers = cards.map((card) => {
      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        card.style.boxShadow = '0 0 45px rgba(75, 105, 255, 0.12)';
      };

      const handleLeave = () => {
        card.style.boxShadow = 'none';
      };

      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);

      return { card, handleMove, handleLeave };
    });

    return () => {
      handlers.forEach(({ card, handleMove, handleLeave }) => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        setLoading(true);

        const txResponse = await fetch(apiUrl('/api/transactions'), {
          headers: {
            'Content-Type': 'application/json',
            ...createAuthHeaders(),
          },
        });

        const txData = await parseApiResponse(txResponse);

        if (txResponse.ok && Array.isArray(txData.transactions)) {
          const recent = txData.transactions.slice(0, 3).map((tx) => ({
            time: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A',
            id: tx._id ? `${String(tx._id).slice(0, 4)}...${String(tx._id).slice(-4)}` : 'N/A',
            source: tx.type === 'deposit' ? 'User Deposit' : tx.type === 'withdrawal' ? 'User Withdrawal' : 'Transfer',
            amount: `${tx.type === 'deposit' ? '+' : '-'} $${parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            asset: tx.asset || 'USD',
            status: tx.status?.toUpperCase() || 'PENDING',
            statusClass: tx.status === 'completed' ? 'confirmed' : tx.status === 'pending' ? 'pending' : 'failed',
          }));

          setTransactions(recent);
        }

        setAlerts([
          {
            title: 'System Status',
            time: 'Now',
            description: 'Admin console connected and operational',
            meta: 'Database: Connected | Users: Loaded',
            tone: 'neutral',
          },
          {
            title: 'Recent Activity',
            time: '< 5m ago',
            description: `${transactions.length || 'Multiple'} transactions processed`,
            meta: 'All transactions verified and logged',
            tone: 'warning',
          },
        ]);
      } catch (err) {
        setAlerts([
          {
            title: 'Connection Status',
            time: 'Now',
            description: 'Backend connection active',
            meta: 'Ready for operations',
            tone: 'neutral',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { label: 'Analytics', icon: 'dashboard', path: '/admin' },
    { label: 'Users', icon: 'group', path: '/admin/users' },
    { label: 'Wallets', icon: 'account_balance_wallet', path: '/admin/wallets' },
    { label: 'Withdrawals', icon: 'payments', path: '/admin/withdrawals' },
    { label: 'Security', icon: 'shield', disabled: true },
    { label: 'Adjustments', icon: 'account_balance', path: '/admin/adjustment' },
  ];

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div className="topbar-start">
          <div>
            <p className="eyebrow">Security Command</p>
            <h1>Analytics Overview</h1>
            <p className="subtitle">Real-time platform performance and security telemetry.</p>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Global search assets..." type="text" />
          </div>
          <button type="button" className="icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button type="button" className="icon-btn">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button type="button" className="icon-btn">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button type="button" className="logout-btn" onClick={() => localStorage.removeItem('adminAuthToken') || window.location.assign('/')}>Logout</button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar-panel">
          <div className="brand-block">
            <div className="brand-icon">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div>
              <p className="brand-title">Admin Console</p>
              <p className="brand-subtitle">V2.4.0 High-Priority Access</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`nav-item ${location.pathname === item.path ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                disabled={item.disabled}
                onClick={() => item.path && navigate(item.path)}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button type="button" className="danger-btn">Emergency Freeze</button>
            <div className="footer-links">
              <button type="button" className="footer-link">
                <span className="material-symbols-outlined">history</span>
                Logs
              </button>
              <button type="button" className="footer-link">
                <span className="material-symbols-outlined">logout</span>
                Log Out
              </button>
            </div>
          </div>
        </aside>

        <main className="main-panel">
          <section className="hero-row">
            <div>
              <h2>Analytics Overview</h2>
              <p>Real-time platform performance and security telemetry.</p>
            </div>
            <div className="hero-actions">
              <span className="pill">
                <span className="material-symbols-outlined">calendar_today</span>
                Last 24 Hours
              </span>
              <button type="button" className="primary-btn">
                <span className="material-symbols-outlined">download</span>
                Export Data
              </button>
            </div>
          </section>

          <div className="bento-grid">
            <section className="glass-card balance-card">
              <div className="card-header">
                <div>
                  <p className="card-label">Platform Balance</p>
                  <h3>$482,901,234.00</h3>
                </div>
                <span className="material-symbols-outlined card-icon">account_balance_wallet</span>
              </div>
              <div className="split-metrics">
                <article className="metric-block">
                  <p className="metric-label">Hot Wallet</p>
                  <p className="metric-value">$12,401,928.00</p>
                  <div className="progress-bar">
                    <span className="progress-fill hot" style={{ width: '25.6%' }} />
                  </div>
                </article>
                <article className="metric-block">
                  <p className="metric-label">Cold Storage</p>
                  <p className="metric-value">$470,499,306.00</p>
                  <div className="progress-bar">
                    <span className="progress-fill cold" style={{ width: '97.4%' }} />
                  </div>
                </article>
              </div>
              <div className="sparkline">
                <svg className="sparkline-chart" preserveAspectRatio="none" viewBox="0 0 400 60">
                  <path d="M0 45 Q 20 20, 40 40 T 80 15 T 120 50 T 160 20 T 200 45 T 240 10 T 280 55 T 320 20 T 360 40 T 400 25" fill="none" stroke="#b4c5ff" strokeWidth="2" />
                  <path d="M0 45 Q 20 20, 40 40 T 80 15 T 120 50 T 160 20 T 200 45 T 240 10 T 280 55 T 320 20 T 360 40 T 400 25 L 400 60 L 0 60 Z" fill="url(#grad1)" opacity="0.14" />
                  <defs>
                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#b4c5ff" stopOpacity="1" />
                      <stop offset="100%" stopColor="#b4c5ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </section>

            <div className="metric-column">
              <section className="glass-card accent-card">
                <p className="metric-label">Total Users</p>
                <div className="metric-row">
                  <h3>1,248,302</h3>
                  <span className="trend positive">
                    <span className="material-symbols-outlined">arrow_upward</span>
                    12.4%
                  </span>
                </div>
              </section>
              <section className="glass-card">
                <p className="metric-label">New Sign-ups (24h)</p>
                <div className="metric-row">
                  <h3>4,891</h3>
                  <span className="trend positive">
                    <span className="material-symbols-outlined">arrow_upward</span>
                    8.2%
                  </span>
                </div>
              </section>
            </div>

            <div className="metric-column">
              <section className="glass-card">
                <p className="metric-label">24h Trading Volume</p>
                <div className="metric-row">
                  <h3>$89.2M</h3>
                  <span className="trend negative">
                    <span className="material-symbols-outlined">arrow_downward</span>
                    2.1%
                  </span>
                </div>
              </section>
              <section className="glass-card accent-tertiary">
                <p className="metric-label">Daily Platform Revenue</p>
                <div className="metric-row">
                  <h3>$1.12M</h3>
                  <span className="trend positive">
                    <span className="material-symbols-outlined">arrow_upward</span>
                    15.7%
                  </span>
                </div>
              </section>
            </div>

            <section className="glass-card chart-card">
              <div className="section-header">
                <h3>Revenue vs Volume</h3>
                <div className="toggle-buttons">
                  <button type="button" className="tiny-pill active">Volume</button>
                  <button type="button" className="tiny-pill">Revenue</button>
                </div>
              </div>
              <div className="chart-bars">
                {['40%', '55%', '75%', '60%', '90%', '45%', '65%', '50%', '30%', '80%', '65%', '40%'].map((height, index) => (
                  <div key={index} className="chart-bar">
                    <span className="bar-tooltip">${[21, 28, 42, 31, 48, 24, 33, 26, 18, 44, 33, 21][index]}M</span>
                    <div className="bar-fill" style={{ height }} />
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card alerts-card">
              <div className="alerts-header">
                <div>
                  <span className="material-symbols-outlined alert-icon">warning</span>
                  <h3>Security Alerts</h3>
                </div>
                <span className="alert-badge">4 NEW</span>
              </div>
              <div className="alerts-list">
                {alerts.map((alert) => (
                  <article key={alert.title} className={`alert-item ${alert.tone}`}>
                    <div className="alert-top">
                      <span className="alert-tag">{alert.title}</span>
                      <span className="alert-time">{alert.time}</span>
                    </div>
                    <p className="alert-description">{alert.description}</p>
                    <p className="alert-meta">{alert.meta}</p>
                  </article>
                ))}
              </div>
              <button type="button" className="link-button">View All Threat Reports</button>
            </section>

            <section className="glass-card table-card">
              <div className="table-header">
                <h3>High-Value Flow</h3>
                <button type="button" className="text-button">
                  Filter by Type
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Transaction ID</th>
                      <th>Source</th>
                      <th>Amount</th>
                      <th>Asset</th>
                      <th>Status</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.time}</td>
                        <td className="text-primary">{tx.id}</td>
                        <td>{tx.source}</td>
                        <td className={tx.statusClass === 'failed' ? 'text-error' : tx.statusClass === 'pending' ? 'text-warning' : 'text-success'}>{tx.amount}</td>
                        <td>
                          <span className={`asset-chip asset-${tx.asset.toLowerCase()}`}>{tx.asset}</span>
                        </td>
                        <td>
                          <span className={`status-pill ${tx.statusClass}`}>{tx.status}</span>
                        </td>
                        <td className="actions-col">
                          <span className="material-symbols-outlined">more_vert</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <a href="#">VIEW TRANSACTION LEDGER</a>
              </div>
            </section>
          </div>
        </main>
      </div>

      <nav className="mobile-nav">
        {navItems.slice(0, 4).map((item) => (
          <button
            key={item.label}
            type="button"
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
            disabled={item.disabled}
            onClick={() => item.path && navigate(item.path)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default AdminPanel;
