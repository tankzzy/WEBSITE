import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl, parseApiResponse } from "../config/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setMessageType("loss");
        setMessage(data.message || "Admin login failed.");
        return;
      }

      if (data.user.role !== "admin") {
        setMessageType("loss");
        setMessage("This account does not have admin access.");
        return;
      }

      localStorage.setItem("adminAuthToken", data.token);
      localStorage.setItem("adminAuthUser", JSON.stringify(data.user));
      setMessageType("profit");
      setMessage(`Welcome, ${data.user.fullName}.`);
      navigate("/admin-control-center");
    } catch (error) {
      setMessageType("loss");
      setMessage(
        "Unable to reach the admin server. Make sure the backend is running on port 5000.",
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell login-shell">
      <div className="hero-bg-accent" />
      <div className="auth-shell-inner">
        <Link to="/" className="back-link auth-back-link">
          <i className="fa-solid fa-arrow-left" /> Back to Home
        </Link>

        <section className="login-layout">
          <div className="auth-card login-card">
            <div className="auth-header login-header">
              <span className="auth-badge">Restricted Access</span>
              <h2>Admin Login</h2>
              <p>Only administrator accounts can continue to the control center.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className={`form-message ${messageType}`}>
                {message || " "}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-email">
                  Admin Email
                </label>
                <input
                  className="form-input"
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-password">
                  Password
                </label>
                <input
                  className="form-input"
                  id="admin-password"
                  name="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={formState.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn-primary auth-btn" disabled={submitting}>
                {submitting ? "Authorizing..." : "Enter Admin Panel"}
              </button>
            </form>
          </div>

          <div className="login-showcase">
            <span className="auth-eyebrow">Private Entry</span>
            <h1>Manage users from a dedicated admin portal.</h1>
            <p className="login-lead">
              This area is separated from the standard user dashboard and is intended
              only for administrator accounts.
            </p>

            <div className="login-panel">
              <div className="login-panel-row">
                <span>Access route</span>
                <strong>/admin-access</strong>
              </div>
              <div className="login-panel-row">
                <span>Admin panel route</span>
                <strong>/admin-control-center</strong>
              </div>
              <div className="login-panel-row">
                <span>Visibility</span>
                <strong>Hidden from user dashboard</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminLogin;
