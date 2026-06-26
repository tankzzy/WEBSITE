import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiUrl, createAuthHeaders, parseApiResponse } from '../config';

const sidebarItems = [
  { label: 'Analytics', icon: 'dashboard', path: '/admin' },
  { label: 'Users', icon: 'group', path: '/admin/users' },
  { label: 'Wallets', icon: 'account_balance_wallet', path: '/admin/wallets' },
  { label: 'Withdrawals', icon: 'payments', path: '/admin/withdrawals' },
  { label: 'Security', icon: 'shield', disabled: true },
  { label: 'Adjustments', icon: 'account_balance', path: '/admin/adjustment' },
];

function getStatusTone(status) {
  switch (String(status).toLowerCase()) {
    case 'active':
      return 'verified';
    case 'pending':
      return 'pending';
    case 'suspended':
      return 'rejected';
    case 'rejected':
      return 'rejected';
    default:
      return 'neutral';
  }
}

function calculateRiskValue(status) {
  switch (String(status).toLowerCase()) {
    case 'active':
      return 18;
    case 'pending':
      return 58;
    case 'suspended':
      return 95;
    case 'rejected':
      return 95;
    default:
      return 42;
  }
}

function normalizeUser(user) {
  return {
    id: user.id || user._id || `${user.email}-${Math.random()}`,
    name: user.fullName || user.email || 'Unknown User',
    email: user.email || 'No email',
    role: user.role || 'user',
    status: user.status || 'UNKNOWN',
    statusTone: getStatusTone(user.status),
    node: user.lastLoginIp || 'N/A',
    platform: user.role || 'Unknown',
    balance:
      typeof user.mainBalance === 'number'
        ? `$${user.mainBalance.toLocaleString()}`
        : user.mainBalance || '$0.00',
    mainBalance: typeof user.mainBalance === 'number' ? user.mainBalance : 0,
    interestBalance: typeof user.interestBalance === 'number' ? user.interestBalance : 0,
    tier: user.role === 'admin' ? 'Administrator' : 'Retail',
    actions: ['edit', 'lock_reset', 'block'],
    risk:
      user.risk ||
      (String(user.status).toLowerCase() === 'suspended'
        ? 'CRITICAL (0.98)'
        : 'MINIMAL (0.12)'),
    riskValue: user.riskValue || calculateRiskValue(user.status),
  };
}

const activityLog = [
  {
    tone: 'secondary',
    summary: 'Admin j.doe updated KYC status for Adrian Zetterberg',
    detail: '2 mins ago • Ref: #SEC-9921-A',
  },
  {
    tone: 'error',
    summary: 'Automated System FLAGGED User #892 for multiple TOR exit nodes',
    detail: '14 mins ago • Ref: #AUTO-RISK-01',
  },
  {
    tone: 'tertiary',
    summary: 'Password reset request issued for Marcus Thorne',
    detail: '1h 04m ago • IP: 182.1.22.4',
  },
];

function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken');

    if (!token) {
      navigate('/');
      return;
    }

    async function fetchUsers() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(apiUrl('/api/admin/users'), {
          headers: {
            'Content-Type': 'application/json',
            ...createAuthHeaders(),
          },
        });

        const data = await parseApiResponse(response);

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load user list');
        }

        if (!Array.isArray(data.users)) {
          throw new Error('Backend returned unexpected user data');
        }

        setUsers(data.users.map(normalizeUser));
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to connect to backend.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [navigate]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: 'user',
    status: 'active',
    mainBalance: 0,
    interestBalance: 0,
  });
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const totalUsers = users.length;
  const pendingCount = users.filter((user) => user.statusTone === 'pending').length;
  const flaggedCount = users.filter((user) => user.statusTone === 'rejected').length;

  async function refreshUsers() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/admin/users'), {
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to refresh user list');
      }

      setUsers(data.users.map(normalizeUser));
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenEdit(user) {
    setSelectedUser(user);
    setEditForm({
      fullName: user.name,
      email: user.email,
      role: user.role === 'Administrator' ? 'admin' : user.platform?.toLowerCase() || user.role || 'user',
      status: user.status || 'active',
      mainBalance: user.mainBalance || 0,
      interestBalance: user.interestBalance || 0,
    });
    setActionError('');
    setActionMessage('');
    setEditModalOpen(true);
  }

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setActionError('');
  };

  function handleEditFormChange(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name.includes('Balance') ? Number(value) : value,
    }));
  }

  async function patchUser(userId, updates) {
    const response = await fetch(apiUrl(`/api/admin/users/${userId}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(),
      },
      body: JSON.stringify(updates),
    });
    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user.');
    }

    return data;
  }

  async function handleSubmitEdit(event) {
    event.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    setActionError('');
    setActionMessage('');

    try {
      const updates = {
        fullName: editForm.fullName,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
        mainBalance: editForm.mainBalance,
        interestBalance: editForm.interestBalance,
      };

      const data = await patchUser(selectedUser.id, updates);
      setActionMessage(data.message || 'User updated successfully.');
      await refreshUsers();
      closeEditModal();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBan(user) {
    setActionLoading(true);
    setActionError('');
    setActionMessage('');

    try {
      const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
      const data = await patchUser(user.id, { status: newStatus });
      setActionMessage(`Account ${newStatus === 'suspended' ? 'banned' : 'unbanned'} successfully.`);
      await refreshUsers();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm('Delete this user account? This action cannot be undone.');
    if (!confirmed) return;

    setActionLoading(true);
    setActionError('');
    setActionMessage('');

    try {
      const response = await fetch(apiUrl(`/api/admin/users/${user.id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });
      const data = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user.');
      }
      setActionMessage(data.message || 'User deleted successfully.');
      await refreshUsers();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="users-page">
      <aside className="users-sidebar">
        <div className="users-brand">
          <h1>Admin Console</h1>
          <p>V2.4.0 High-Priority Access</p>
        </div>

        <nav className="users-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`users-nav-item ${location.pathname === item.path ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              disabled={item.disabled}
              onClick={() => item.path && navigate(item.path)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="users-sidebar-footer">
          <button type="button" className="users-sidebar-action">
            <span className="material-symbols-outlined">history</span>
            Logs
          </button>
          <button type="button" className="users-sidebar-action" onClick={() => navigate('/') }>
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
          <button type="button" className="users-freeze-button">
            <span className="material-symbols-outlined">lock</span>
            Emergency Freeze
          </button>
        </div>
      </aside>

      <main className="users-main">
        <header className="users-header">
          <div>
            <p className="users-eyebrow">Security Command</p>
            <h2>User Management</h2>
            <p>Operational oversight of {totalUsers} active accounts.</p>
          </div>
          <div className="users-actions">
            <button type="button" className="secondary-button">
              <span className="material-symbols-outlined">download</span>
              Export Data
            </button>
            <button type="button" className="primary-button">
              <span className="material-symbols-outlined">person_add</span>
              Provision User
            </button>
          </div>
        </header>

        <section className="users-kpi-grid">
          <article className="kpi-card">
            <div>
              <p>Total Users</p>
              <strong>{totalUsers}</strong>
            </div>
            <span className="material-symbols-outlined">group</span>
            <p className="kpi-note">
              <span className="material-symbols-outlined">trending_up</span> Live admin user count
            </p>
          </article>
          <article className="kpi-card">
            <div>
              <p>Pending KYC</p>
              <strong>{pendingCount}</strong>
            </div>
            <span className="material-symbols-outlined">pending_actions</span>
            <p className="kpi-note">Queued for review</p>
          </article>
          <article className="kpi-card">
            <div>
              <p>Active Sessions</p>
              <strong>{Math.max(0, totalUsers - flaggedCount)}</strong>
            </div>
            <span className="material-symbols-outlined">bolt</span>
            <p className="kpi-note">Live accounts monitored</p>
          </article>
          <article className="kpi-card">
            <div>
              <p>Banned/Flagged</p>
              <strong>{flaggedCount}</strong>
            </div>
            <span className="material-symbols-outlined">gpp_maybe</span>
            <p className="kpi-note warning">
              <span className="material-symbols-outlined">warning</span> Risk events detected
            </p>
          </article>
        </section>

        <section className="users-filter-bar">
          <div className="search-field">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Filter by Name, Email, Wallet address..." type="text" disabled />
          </div>
          <div className="select-group">
            <label>
              KYC Status
              <select disabled>
                <option>All Users</option>
                <option>Verified</option>
                <option>Pending</option>
                <option>Unverified</option>
                <option>Rejected</option>
              </select>
            </label>
          </div>
          <div className="select-group">
            <label>
              Activity
              <select disabled>
                <option>Last 24h</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                  <option>{'Inactive > 90d'}</option>
              </select>
            </label>
          </div>
          <button type="button" className="icon-button small" aria-label="Filter" disabled>
            <span className="material-symbols-outlined">tune</span>
          </button>
        </section>

        <section className="users-table-card">
          {loading && <div className="loading-banner">Loading user data...</div>}
          {error && <div className="error-banner">{error}</div>}
          <div className="table-scroll custom-scrollbar">
            <table>
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>KYC Status</th>
                  <th>Access Node</th>
                  <th>Balance</th>
                  <th>Risk Level</th>
                  <th className="text-right">Operations</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.statusTone === 'rejected' ? 'danger-row' : ''}>
                    <td>
                      <div className="user-profile">
                        <div className="avatar">{user.name?.charAt(0) || 'U'}</div>
                        <div>
                          <div>{user.name}</div>
                          <div>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${user.statusTone}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div>{user.node}</div>
                      <div>{user.platform}</div>
                    </td>
                    <td>
                      <div>{user.balance}</div>
                      <div>{user.tier}</div>
                    </td>
                    <td>
                      <div className="risk-bar">
                        <span style={{ width: `${user.riskValue}%` }} />
                      </div>
                      <div>{user.risk}</div>
                    </td>
                    <td className="actions-cell">
                      <div className="row-actions">
                        {(user.actions || []).map((icon) => (
                          <button key={icon} type="button" className="icon-row-button">
                            <span className="material-symbols-outlined">{icon}</span>
                          </button>
                        ))}
                        <button type="button" className="ban-button" onClick={() => handleOpenEdit(user)}>
                          EDIT
                        </button>
                        <button type="button" className="secondary-button" onClick={() => handleBan(user)}>
                          {user.status === 'suspended' ? 'UNBAN' : 'BAN'}
                        </button>
                        <button type="button" className="danger-button" onClick={() => handleDelete(user)}>
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <div>
              Showing <strong>1-{users.length || 0}</strong> of <strong>{users.length || 0}</strong> users
            </div>
            <div className="pagination">
              <button type="button" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="pages">
                <button type="button" className="page active">1</button>
                <button type="button" className="page">2</button>
                <button type="button" className="page">3</button>
                <span>...</span>
                <button type="button" className="page">285</button>
              </div>
              <button type="button">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {editModalOpen && selectedUser && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card admin-edit-modal">
              <div className="modal-copy">
                <h3>Edit User Account</h3>
                <p>Update user status, balance, email, or role and push the changes to the backend.</p>
              </div>
              <form className="modal-form" onSubmit={handleSubmitEdit}>
                <label>
                  Full name
                  <input
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditFormChange}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    required
                  />
                </label>
                <label>
                  Role
                  <select name="role" value={editForm.role} onChange={handleEditFormChange}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label>
                  Status
                  <select name="status" value={editForm.status} onChange={handleEditFormChange}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </label>
                <label>
                  Main balance
                  <input
                    type="number"
                    name="mainBalance"
                    value={editForm.mainBalance}
                    onChange={handleEditFormChange}
                    min="0"
                  />
                </label>
                <label>
                  Interest balance
                  <input
                    type="number"
                    name="interestBalance"
                    value={editForm.interestBalance}
                    onChange={handleEditFormChange}
                    min="0"
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" className="modal-secondary-button" onClick={closeEditModal} disabled={actionLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="modal-primary-button" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                {actionError && <div className="error-banner">{actionError}</div>}
              </form>
            </div>
          </div>
        )}

        {actionMessage && <div className="success-banner">{actionMessage}</div>}
        {actionError && <div className="error-banner">{actionError}</div>}

        <section className="users-log-grid">
          <div className="audit-card">
            <div className="audit-card-header">
              <h3>Administrative Audit Trail</h3>
            </div>
            <div className="audit-list">
              {activityLog.map((item, index) => (
                <div key={index} className={`audit-item ${item.tone}`}>
                  <div className="audit-dot" />
                  <div>
                    <p>{item.summary}</p>
                    <small>{item.detail}</small>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="secondary-button full-width">VIEW FULL SYSTEM LOGS</button>
          </div>
          <div className="compliance-card">
            <div>
              <h3>Security Compliance</h3>
              <p>Current system compliance level is 98%. Two pending reviews for high-value accounts detected.</p>
            </div>
            <div className="compliance-list">
              <div className="compliance-item">
                <span>AML Verification</span>
                <strong>ACTIVE</strong>
              </div>
              <div className="compliance-item">
                <span>2FA Enforcement</span>
                <strong>ENFORCED</strong>
              </div>
            </div>
            <button type="button" className="primary-button full-width">RUN SECURITY SCAN</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserManagement;
