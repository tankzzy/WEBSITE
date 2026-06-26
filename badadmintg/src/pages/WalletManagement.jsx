import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiUrl, createAuthHeaders, parseApiResponse } from '../config';

const sidebarItems = [
  { label: 'Analytics', icon: 'dashboard', path: '/admin' },
  { label: 'Users', icon: 'group', path: '/admin/users' },
  { label: 'Wallets', icon: 'account_balance_wallet', path: '/admin/wallets' },
  { label: 'Withdrawals', icon: 'payments', path: '/admin/withdrawals' },
  { label: 'Security', icon: 'shield', path: '/admin/security', disabled: true },
  { label: 'Adjustments', icon: 'account_balance', path: '/admin/adjustment' },
];

function normalizeTransaction(tx) {
  return {
    id: tx.id,
    status: tx.status,
    date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A',
    time: tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString() : 'N/A',
    type: tx.type === 'deposit' ? 'Deposit' : 'Withdrawal',
    amount: `$${parseFloat(tx.amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    value: tx.reference || 'Pending reference',
    destination: tx.details || tx.method || 'N/A',
    ref: tx.user?.email || tx.user?.fullName || 'Unknown user',
    risk: tx.status === 'pending' ? 'HIGH' : 'LOW',
    riskColor: tx.status === 'pending' ? 'tertiary' : 'error',
  };
}

function WalletManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [txQueue, setTxQueue] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchTransactions() {
    try {
      setLoading(true);

      const response = await fetch(apiUrl('/api/admin/transactions'), {
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load admin transactions');
      }

      const allTxs = (Array.isArray(data.transactions) ? data.transactions : [])
        .filter((tx) => tx.status === 'pending')
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
        .map(normalizeTransaction);

      setTxQueue(allTxs);

      setEvents([
        {
          title: 'Transaction Queue Updated',
          details: `${allTxs.length || 'No'} pending transactions loaded from backend`,
          tone: 'primary',
          time: 'Just now',
        },
        {
          title: 'System Status',
          details: 'Admin approval system operational and synced',
          tone: 'secondary',
          time: '1 min ago',
        },
        {
          title: 'Audit Trail Active',
          details: 'All approvals and denials are logged by transaction status',
          tone: 'error',
          time: 'Ongoing',
        },
      ]);
    } catch (err) {
      setEvents([
        {
          title: 'Connection Status',
          details: err.message || 'Unable to load admin transaction queue',
          tone: 'error',
          time: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken');

    if (!token) {
      navigate('/');
      return;
    }

    fetchTransactions();
  }, [navigate]);

  async function handleTransactionAction(id, action) {
    try {
      setActionLoading(true);

      const response = await fetch(apiUrl(`/api/admin/transactions/${id}/${action}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || `Unable to ${action} transaction`);
      }

      await fetchTransactions();
    } catch (error) {
      setEvents((prev) => [
        {
          title: 'Transaction Action Failed',
          details: error.message,
          tone: 'error',
          time: 'Now',
        },
        ...prev,
      ]);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="wallets-page">
      <aside className="wallets-sidebar">
        <div className="wallets-brand">
          <div className="wallets-brand-icon">
            <span className="material-symbols-outlined">security</span>
          </div>
          <div>
            <h1>Admin Console</h1>
            <p>V2.4.0 High-Priority Access</p>
          </div>
        </div>
        <nav className="wallets-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`wallets-nav-item ${item.active || location.pathname === item.path ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              disabled={item.disabled}
              onClick={() => item.path && navigate(item.path)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="wallets-sidebar-footer">
          <button type="button" className="wallets-sidebar-action">
            <span className="material-symbols-outlined">history</span>
            Logs
          </button>
          <button type="button" className="wallets-sidebar-action" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
          <button type="button" className="wallets-freeze-button">
            <span className="material-symbols-outlined">bolt</span>
            Emergency Freeze
          </button>
        </div>
      </aside>

      <main className="wallets-main">
        <header className="wallets-header">
          <div>
            <p className="wallets-eyebrow">Security Command</p>
            <h2>Wallet & Transaction Management</h2>
            <p>Manage pending deposits and withdrawal approvals from the admin console.</p>
          </div>
          <div className="wallets-actions">
            <span className="status-pill stable">
              <span className="status-dot" />
              ADMIN QUEUE
            </span>
            <button type="button" className="primary-button sync-button" onClick={fetchTransactions}>
              <span className="material-symbols-outlined">refresh</span>
              SYNC QUEUE
            </button>
          </div>
        </header>

        <section className="wallets-kpi-grid">
          <article className="wallets-card">
            <div className="wallets-card-header">
              <span>Pending Approval Queue</span>
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div>
              <h3>{loading ? '...' : txQueue.length} <span>items</span></h3>
              <p>Deposits and withdrawals awaiting admin decision</p>
            </div>
            <div className="wallets-card-progress">
              <div>
                <span>Queue Utilization</span>
                <strong>{Math.min(txQueue.length * 20, 100)}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill hot" style={{ width: `${Math.min(txQueue.length * 20, 100)}%` }} />
              </div>
            </div>
          </article>
          <article className="wallets-card">
            <div className="wallets-card-header">
              <span>Approval Coverage</span>
              <span className="material-symbols-outlined">fact_check</span>
            </div>
            <div>
              <h3>All <span>TX</span></h3>
              <p>Admin queue is fed by backend transaction records</p>
            </div>
            <div className="wallets-card-actions">
              <button type="button" onClick={() => navigate('/admin/withdrawals')}>OPEN APPROVALS</button>
              <button type="button" onClick={fetchTransactions}>REFRESH</button>
            </div>
          </article>
          <article className="wallets-card wallet-card-settings">
            <div className="wallets-card-header primary">
              <span>Withdrawal Governance</span>
              <span className="material-symbols-outlined">settings_suggest</span>
            </div>
            <div className="governance-list">
              <div>
                <span>Withdrawal Requests</span>
                <strong>Admin approval</strong>
              </div>
              <div>
                <span>Deposit Requests</span>
                <strong>Admin approval</strong>
              </div>
              <div>
                <span>Denied Withdrawals</span>
                <strong>Auto refund</strong>
              </div>
            </div>
            <button type="button" className="secondary-button" onClick={() => navigate('/admin/withdrawals')}>
              REVIEW QUEUE
            </button>
          </article>
        </section>

        <section className="wallets-table-section glass-panel">
          <div className="wallets-table-header">
            <div>
              <h3>Awaiting Authorisation</h3>
              <p>{loading ? 'LOADING' : `${txQueue.length} REQUIRED`}</p>
            </div>
            <div>
              <select>
                <option>All Types</option>
                <option>Withdrawal</option>
                <option>Deposit</option>
              </select>
            </div>
          </div>
          <div className="table-scroll custom-scrollbar">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Destination / TXID</th>
                  <th>Risk Score</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {txQueue.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div>{tx.date}</div>
                      <small>{tx.time}</small>
                    </td>
                    <td>
                      <span className="tx-type">
                        <span className="material-symbols-outlined">
                          {tx.type === 'Deposit' ? 'download' : 'upload'}
                        </span>
                        {tx.type}
                      </span>
                    </td>
                    <td>
                      <strong>{tx.amount}</strong>
                      <small>{tx.value}</small>
                    </td>
                    <td>
                      <div className="tx-destination">
                        <span>{tx.destination}</span>
                        <small>{tx.ref}</small>
                      </div>
                    </td>
                    <td>
                      <div className="risk-score">
                        <div className="risk-track">
                          <div className={`risk-progress ${tx.riskColor}`} />
                        </div>
                        <span>{tx.risk}</span>
                      </div>
                    </td>
                    <td className="align-right">
                      <button
                        type="button"
                        className="action-button reject"
                        disabled={actionLoading}
                        onClick={() => handleTransactionAction(tx.id, 'deny')}
                      >
                        REJECT
                      </button>
                      <button
                        type="button"
                        className="action-button approve"
                        disabled={actionLoading}
                        onClick={() => handleTransactionAction(tx.id, 'approve')}
                      >
                        APPROVE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="wallets-insights-grid">
          <article className="glass-panel audit-card">
            <div className="audit-header">
              <div>
                <h3>Security Audit Trail</h3>
                <p>Export recent wallet events to CSV.</p>
              </div>
              <button type="button" className="text-button">EXPORT CSV</button>
            </div>
            <div className="audit-list custom-scrollbar">
              {events.map((event) => (
                <div key={`${event.title}-${event.time}`} className={`audit-event ${event.tone}`}>
                  <span className="material-symbols-outlined">{event.tone === 'primary' ? 'vpn_key' : event.tone === 'secondary' ? 'check_circle' : 'report'}</span>
                  <div>
                    <p>{event.title}</p>
                    <small>{event.details}</small>
                    <small className="event-time">{event.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel network-card">
            <div className="network-header">
              <div>
                <h3>Approval Infrastructure</h3>
                <p>Pending requests are loaded directly from backend transactions.</p>
              </div>
              <div className="network-status-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="network-center">
              <span className="material-symbols-outlined network-icon">hub</span>
              <p>ADMIN TRANSACTION QUEUE</p>
              <div className="network-stats">
                <div>
                  <small>Pending Count</small>
                  <strong>{txQueue.length}</strong>
                </div>
                <div>
                  <small>Scope</small>
                  <strong>All TX</strong>
                </div>
              </div>
            </div>
            <div className="sync-progress">
              <div>
                <span>Sync Progress</span>
                <strong>{loading ? '...' : '100%'}</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill network" style={{ width: loading ? '35%' : '100%' }} />
              </div>
            </div>
          </article>
        </section>
      </main>

      <button className="wallets-fab" type="button" onClick={() => navigate('/admin/withdrawals')}>
        <span className="material-symbols-outlined">rule</span>
        <span className="fab-label">APPROVALS</span>
      </button>
    </div>
  );
}

export default WalletManagement;
