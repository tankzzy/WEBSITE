import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiUrl, createAuthHeaders, parseApiResponse } from '../config';

function WithdrawalManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getTotals = () => {
    const totals = {
      totalCount: transactions.length,
      depositCount: 0,
      withdrawalCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      rejectedAmount: 0,
    };

    transactions.forEach((item) => {
      if (item.type === 'deposit') {
        totals.depositCount += 1;
      }
      if (item.type === 'withdrawal') {
        totals.withdrawalCount += 1;
      }
      if (item.status === 'pending') {
        totals.pendingCount += 1;
        totals.pendingAmount += Number(item.amount || 0);
      }
      if (item.status === 'approved') {
        totals.approvedCount += 1;
        totals.approvedAmount += Number(item.amount || 0);
      }
      if (item.status === 'rejected') {
        totals.rejectedCount += 1;
        totals.rejectedAmount += Number(item.amount || 0);
      }
    });

    return totals;
  };

  async function fetchTransactions() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(apiUrl('/api/admin/transactions'), {
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load transaction requests');
      }

      if (!Array.isArray(data.transactions)) {
        throw new Error('Unexpected transaction data from backend');
      }

      setTransactions(data.transactions);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to connect to backend');
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

  async function approveTransaction(id) {
    setActionLoading(true);
    setActionError('');
    setActionMessage('');

    try {
      const response = await fetch(apiUrl(`/api/admin/transactions/${id}/approve`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to approve transaction');
      }

      setTransactions((prev) =>
        prev.map((item) => (item.id === data.transaction.id ? data.transaction : item)),
      );
      setActionMessage(data.message || 'Transaction approved successfully');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function denyTransaction(id) {
    setActionLoading(true);
    setActionError('');
    setActionMessage('');

    try {
      const response = await fetch(apiUrl(`/api/admin/transactions/${id}/deny`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to deny transaction');
      }

      setTransactions((prev) =>
        prev.map((item) => (item.id === data.transaction.id ? data.transaction : item)),
      );
      setActionMessage(data.message || 'Transaction denied successfully');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const totals = getTotals();

  return (
    <div className="wallets-page">
      <aside className="wallets-sidebar">
        <div className="wallets-brand">
          <div className="wallets-brand-icon">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <h1>Admin Console</h1>
            <p>V2.4.0 High-Priority Access</p>
          </div>
        </div>
        <nav className="wallets-nav">
          {/* Keep navigation consistent with other admin pages */}
          <button
            type="button"
            className={`wallets-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Analytics</span>
          </button>
          <button
            type="button"
            className={`wallets-nav-item ${location.pathname === '/admin/users' ? 'active' : ''}`}
            onClick={() => navigate('/admin/users')}
          >
            <span className="material-symbols-outlined">group</span>
            <span>Users</span>
          </button>
          <button
            type="button"
            className={`wallets-nav-item ${location.pathname === '/admin/wallets' ? 'active' : ''}`}
            onClick={() => navigate('/admin/wallets')}
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>Wallets</span>
          </button>
          <button
            type="button"
            className={`wallets-nav-item ${location.pathname === '/admin/withdrawals' ? 'active' : ''}`}
            onClick={() => navigate('/admin/withdrawals')}
          >
            <span className="material-symbols-outlined">payments</span>
            <span>Withdrawals</span>
          </button>
          <button
            type="button"
            className={`wallets-nav-item ${location.pathname === '/admin/adjustment' ? 'active' : ''}`}
            onClick={() => navigate('/admin/adjustment')}
          >
            <span className="material-symbols-outlined">account_balance</span>
            <span>Adjustments</span>
          </button>
        </nav>
        <div className="wallets-sidebar-footer">
          <button type="button" className="wallets-sidebar-action" onClick={() => navigate('/') }>
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>

      <main className="wallets-main">
        <header className="wallets-header">
          <div>
            <p className="wallets-eyebrow">Security Command</p>
            <h2>Transaction Approvals</h2>
            <p>Review and approve pending user deposits and withdrawal requests.</p>
          </div>
          <div className="wallets-actions">
            <span className="status-pill stable">
              <span className="status-dot" />
              ADMIN VIEW
            </span>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}
        {actionMessage && <div className="success-banner">{actionMessage}</div>}
        {actionError && <div className="error-banner">{actionError}</div>}

        <section className="wallets-insights-grid">
          <div className="wallets-summary-card glass-panel">
            <h3>Transaction Totals</h3>
            <div className="wallets-summary-grid">
              <div>
                <p>Total Requests</p>
                <strong>{totals.totalCount}</strong>
              </div>
              <div>
                <p>Deposits</p>
                <strong>{totals.depositCount}</strong>
              </div>
              <div>
                <p>Withdrawals</p>
                <strong>{totals.withdrawalCount}</strong>
              </div>
              <div>
                <p>Pending</p>
                <strong>{totals.pendingCount} (${totals.pendingAmount.toLocaleString()})</strong>
              </div>
              <div>
                <p>Approved</p>
                <strong>{totals.approvedCount} (${totals.approvedAmount.toLocaleString()})</strong>
              </div>
              <div>
                <p>Rejected</p>
                <strong>{totals.rejectedCount} (${totals.rejectedAmount.toLocaleString()})</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="wallets-table-section glass-panel">
          <div className="wallets-table-header">
            <div>
              <h3>Transaction Requests</h3>
              <p>{loading ? 'Loading transaction requests...' : `${transactions.length} requests loaded`}</p>
            </div>
            <div>
              <button
                type="button"
                className="secondary-button"
                onClick={fetchTransactions}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="table-scroll custom-scrollbar">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className={transaction.status === 'pending' ? 'pending-row' : ''}>
                    <td>
                      <div>
                        <strong>{transaction.user?.fullName || 'Unknown'}</strong>
                        <span>{transaction.user?.email || 'No email'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${transaction.type === 'deposit' ? 'approved' : 'pending'}`}>
                        {transaction.type || 'transaction'}
                      </span>
                    </td>
                    <td>${Number(transaction.amount || 0).toLocaleString()}</td>
                    <td>{transaction.method || 'N/A'}</td>
                    <td>
                      <span className={`status-pill ${transaction.status}`}>{transaction.status}</span>
                    </td>
                    <td>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'}</td>
                    <td className="actions-cell">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-button approve"
                          disabled={transaction.status !== 'pending' || actionLoading}
                          onClick={() => approveTransaction(transaction.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="action-button reject"
                          disabled={transaction.status !== 'pending' || actionLoading}
                          onClick={() => denyTransaction(transaction.id)}
                        >
                          Deny
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default WithdrawalManagement;
