import { NavLink, Navigate, useNavigate } from "react-router-dom";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";

const sidebarItems = [
  { icon: "fa-gauge-high", label: "Dashboard", to: "/dashboard" },
  { icon: "fa-chart-column", label: "Invest History", to: "/invest-history" },
  { icon: "fa-wallet", label: "Add Fund", to: "/add-fund" },
  { icon: "fa-clock-rotate-left", label: "Fund History", to: "/fund-history" },
  { icon: "fa-arrow-right-arrow-left", label: "Transfer", to: "/transfer" },
  { icon: "fa-file-invoice-dollar", label: "Transaction", to: "/transaction" },
  { icon: "fa-money-bill-wave", label: "Withdrawal", to: "/withdrawal" },
  { icon: "fa-receipt", label: "Withdrawal History", to: "/withdrawal-history" },
  { icon: "fa-user-group", label: "My Referral", to: "/my-referral" },
  { icon: "fa-gift", label: "Referral Bonus", to: "/referral-bonus" },
  { icon: "fa-user-gear", label: "Profile Settings", to: "/profile-settings" },
  { icon: "fa-headset", label: "Support Ticket", to: "/support-ticket" },
];

function UserDashboardLayout({ title, children }) {
  const navigate = useNavigate();
  const { user, token, message } = useAuthenticatedUser();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  return (
    <main className="dashboard-shell dashboard-reference-shell">
      <div className="dashboard-reference">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <span className="dashboard-mobile-brand">
              TG <small>Prime</small>
            </span>
            <nav className="dashboard-topnav">
              <NavLink to="/dashboard" className="dashboard-header-link">
                Dashboard
              </NavLink>
              <NavLink to="/add-fund" className="dashboard-header-link">
                Wallet
              </NavLink>
              <a href="#markets" className="dashboard-header-link">
                Markets
              </a>
              <NavLink to="/invest-history" className="dashboard-header-link">
                Portfolio
              </NavLink>
            </nav>
          </div>

          <div className="dashboard-header-right">
            <label className="dashboard-search">
              <i className="fa-solid fa-magnifying-glass" />
              <input type="text" placeholder="Search markets..." />
            </label>
            <button
              type="button"
              className="dashboard-bell"
              aria-label="Notifications"
            >
              <i className="fa-solid fa-bell" />
            </button>
            <div className="dashboard-avatar">
              {user.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div className="dashboard-sidebar-brand">
              <h1>
                TG <span>Prime</span>
              </h1>
            </div>
            <div className="dashboard-sidebar-list">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `dashboard-sidebar-item dashboard-sidebar-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <span className="dashboard-sidebar-icon">
                    <i className={`fa-solid ${item.icon}`} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
            <div className="dashboard-security-card">
              <div className="dashboard-security-head">
                <i className="fa-solid fa-shield-halved" />
                <span>Security Health</span>
              </div>
              <p>Shield: Verified</p>
              <div className="dashboard-security-bar">
                <span />
              </div>
              <strong>2FA: Enabled</strong>
            </div>
          </aside>

          <section className="dashboard-main">
            <div className="dashboard-breadcrumbs">
              <span>Home</span>
              <i className="fa-solid fa-angle-right" />
              <span>{title}</span>
            </div>
            {message ? <div className="form-message loss">{message}</div> : null}
            {children}
            <footer className="dashboard-footer-bar">
              <p>Signed in as {user.email}</p>
              <div className="dashboard-footer-links">
                <a href="#legal">Legal</a>
                <a href="#privacy">Privacy Policy</a>
                <a href="#support">Support Center</a>
              </div>
              <button
                type="button"
                className="btn-outline dashboard-logout"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </footer>
          </section>
        </div>

        <nav className="dashboard-mobile-nav">
          <NavLink to="/dashboard" className="dashboard-mobile-nav-item">
            <i className="fa-solid fa-gauge-high" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/invest-history" className="dashboard-mobile-nav-item">
            <i className="fa-solid fa-chart-column" />
            <span>Markets</span>
          </NavLink>
          <NavLink to="/add-fund" className="dashboard-mobile-nav-item">
            <i className="fa-solid fa-wallet" />
            <span>Wallet</span>
          </NavLink>
          <NavLink to="/profile-settings" className="dashboard-mobile-nav-item">
            <i className="fa-solid fa-gear" />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>
    </main>
  );
}

export default UserDashboardLayout;
