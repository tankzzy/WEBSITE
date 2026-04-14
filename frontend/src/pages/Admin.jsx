import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  apiUrl,
  createAuthHeaders,
  parseApiResponse,
} from "../config/api";

const emptyForm = {
  fullName: "",
  email: "",
  role: "user",
  status: "active",
  mainBalance: 0,
  interestBalance: 0,
  totalDeposit: 0,
  totalEarn: 0,
  totalInvest: 0,
  totalPayout: 0,
  totalTicket: 0,
  totalReferralBonus: 0,
  lastReferralBonus: 0,
};

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function Admin() {
  const storedAdmin = localStorage.getItem("adminAuthUser");
  const adminToken = localStorage.getItem("adminAuthToken");
  const currentUser = storedAdmin ? JSON.parse(storedAdmin) : null;
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formState, setFormState] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [users, selectedUserId],
  );

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(apiUrl("/api/admin/users"), {
          headers: createAuthHeaders("adminAuthToken"),
        });
        const data = await parseApiResponse(response);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load users.");
        }

        setUsers(data.users);

        if (data.users.length > 0) {
          setSelectedUserId((current) => current || data.users[0].id);
        }
      } catch (error) {
        setMessageType("loss");
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setFormState(emptyForm);
      return;
    }

    setFormState({
      fullName: selectedUser.fullName,
      email: selectedUser.email,
      role: selectedUser.role,
      status: selectedUser.status,
      mainBalance: selectedUser.mainBalance,
      interestBalance: selectedUser.interestBalance,
      totalDeposit: selectedUser.totalDeposit,
      totalEarn: selectedUser.totalEarn,
      totalInvest: selectedUser.totalInvest,
      totalPayout: selectedUser.totalPayout,
      totalTicket: selectedUser.totalTicket,
      totalReferralBonus: selectedUser.totalReferralBonus,
      lastReferralBonus: selectedUser.lastReferralBonus,
    });
  }, [selectedUser]);

  if (!currentUser || !adminToken) {
    return <Navigate to="/admin-access" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!selectedUserId) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl(`/api/admin/users/${selectedUserId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders("adminAuthToken"),
        },
        body: JSON.stringify(formState),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user.");
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === data.user.id ? data.user : user)),
      );

      if (currentUser.id === data.user.id) {
        localStorage.setItem("adminAuthUser", JSON.stringify(data.user));
      }

      setMessageType("profit");
      setMessage(data.message);
    } catch (error) {
      setMessageType("loss");
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this user account? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl(`/api/admin/users/${selectedUserId}`), {
        method: "DELETE",
        headers: createAuthHeaders("adminAuthToken"),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user.");
      }

      const nextUsers = users.filter((user) => user.id !== selectedUserId);
      setUsers(nextUsers);
      setSelectedUserId(nextUsers[0]?.id || "");
      setMessageType("profit");
      setMessage(data.message);
    } catch (error) {
      setMessageType("loss");
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dashboard-shell dashboard-reference-shell">
      <div className="dashboard-reference admin-reference">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <Link to="/" className="dashboard-header-link">
              Home
            </Link>
            <Link to="/dashboard" className="dashboard-header-link">
              Dashboard
            </Link>
            <span className="dashboard-header-link">Admin</span>
          </div>
          <div className="dashboard-header-right">
            <div className="dashboard-avatar">
              {currentUser.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <div className="dashboard-breadcrumbs">
          <span>Admin</span>
          <i className="fa-solid fa-angle-right" />
          <span>User Management</span>
        </div>

        <div className="dashboard-layout admin-layout">
          <aside className="dashboard-sidebar admin-sidebar">
            <div className="dashboard-sidebar-list">
              <div className="admin-sidebar-heading">
                <h2>User Accounts</h2>
                <span>{users.length} total</span>
              </div>

              {loading ? (
                <p className="admin-empty-state">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="admin-empty-state">No users found yet.</p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`admin-user-item ${
                      selectedUserId === user.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setMessage("");
                    }}
                  >
                    <div>
                      <strong>{user.fullName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <small className={`admin-status ${user.status}`}>
                      {user.status}
                    </small>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="dashboard-main admin-main">
            <div className="dashboard-balance-grid admin-summary-grid">
              <article className="dashboard-balance-card">
                <div className="dashboard-balance-icon">
                  <i className="fa-solid fa-users" />
                </div>
                <h3>Total Users</h3>
                <strong>{users.length}</strong>
              </article>
              <article className="dashboard-balance-card">
                <div className="dashboard-balance-icon">
                  <i className="fa-solid fa-user-check" />
                </div>
                <h3>Active Users</h3>
                <strong>
                  {users.filter((user) => user.status === "active").length}
                </strong>
              </article>
              <article className="dashboard-balance-card">
                <div className="dashboard-balance-icon">
                  <i className="fa-solid fa-user-clock" />
                </div>
                <h3>Pending Users</h3>
                <strong>
                  {users.filter((user) => user.status === "pending").length}
                </strong>
              </article>
              <article className="dashboard-balance-card">
                <div className="dashboard-balance-icon">
                  <i className="fa-solid fa-ban" />
                </div>
                <h3>Suspended Users</h3>
                <strong>
                  {users.filter((user) => user.status === "suspended").length}
                </strong>
              </article>
            </div>

            <section className="dashboard-panel admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Manage User Account</h2>
                  <p>
                    Update balances, role, and account status for the selected
                    user.
                  </p>
                </div>
                {selectedUser ? (
                  <div className="admin-selected-badge">
                    {selectedUser.fullName}
                  </div>
                ) : null}
              </div>

              <div className={`form-message ${messageType}`}>{message || " "}</div>

              {selectedUser ? (
                <form className="admin-form" onSubmit={handleSave}>
                  <div className="admin-form-grid">
                    {[
                      ["fullName", "Full Name", "text"],
                      ["email", "Email", "email"],
                      ["role", "Role", "select"],
                      ["status", "Status", "select"],
                      ["mainBalance", "Main Balance", "number"],
                      ["interestBalance", "Interest Balance", "number"],
                      ["totalDeposit", "Total Deposit", "number"],
                      ["totalEarn", "Total Earn", "number"],
                      ["totalInvest", "Total Invest", "number"],
                      ["totalPayout", "Total Payout", "number"],
                      ["totalTicket", "Total Ticket", "number"],
                      ["totalReferralBonus", "Total Referral Bonus", "number"],
                      ["lastReferralBonus", "Last Referral Bonus", "number"],
                    ].map(([name, label, type]) => (
                      <div className="form-group" key={name}>
                        <label className="form-label" htmlFor={name}>
                          {label}
                        </label>
                        {type === "select" ? (
                          <select
                            className="form-input"
                            id={name}
                            name={name}
                            value={formState[name]}
                            onChange={handleChange}
                          >
                            {name === "role" ? (
                              <>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </>
                            ) : (
                              <>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <input
                            className="form-input"
                            id={name}
                            name={name}
                            type={type}
                            value={formState[name]}
                            onChange={handleChange}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="admin-form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      Delete User
                    </button>
                  </div>
                </form>
              ) : (
                <p className="admin-empty-state">
                  Select a user from the left to manage the account.
                </p>
              )}
            </section>

            {selectedUser ? (
              <section className="dashboard-panel admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <h2>Account Snapshot</h2>
                    <p>Quick summary for the currently selected account.</p>
                  </div>
                </div>

                <div className="admin-snapshot-grid">
                  <div className="admin-snapshot-card">
                    <span>Main Balance</span>
                    <strong>{formatCurrency(selectedUser.mainBalance)}</strong>
                  </div>
                  <div className="admin-snapshot-card">
                    <span>Total Deposit</span>
                    <strong>{formatCurrency(selectedUser.totalDeposit)}</strong>
                  </div>
                  <div className="admin-snapshot-card">
                    <span>Total Earn</span>
                    <strong>{formatCurrency(selectedUser.totalEarn)}</strong>
                  </div>
                  <div className="admin-snapshot-card">
                    <span>Joined</span>
                    <strong>
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </section>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

export default Admin;
