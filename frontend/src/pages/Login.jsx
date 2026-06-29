import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl, parseApiResponse } from "../config/api";

const loginHighlights = [
  "Monitor your positions from one dashboard",
  "Review account activity and market access instantly",
  "Get back into your workspace with secure sign in",
];

function Login() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetForm, setResetForm] = useState({
    email: "",
    token: "",
    password: "",
  });
  const [resetStep, setResetStep] = useState("request");
  const [resetLoading, setResetLoading] = useState(false);

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

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        setMessageType("profit");
        setMessage(`Welcome back, ${data.user.fullName}!`);
        navigate("/dashboard");
        return;
      }

      setMessageType("loss");
      setMessage(data.message || "Login failed.");
    } catch (error) {
      setMessageType("loss");
      setMessage(
        "Unable to reach the server. Make sure the backend is running on port 5000.",
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/api/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetForm.email }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setMessageType("loss");
        setMessage(data.message || "Unable to create reset code.");
        return;
      }

      setMessageType("profit");
      setMessage(
        data.resetToken
          ? `Reset code: ${data.resetToken}`
          : data.message || "Reset code created. Check your email.",
      );
      setResetForm((prev) => ({ ...prev, token: data.resetToken || prev.token }));
      setResetStep("reset");
    } catch (error) {
      setMessageType("loss");
      setMessage("Unable to reach the server. Make sure the backend is running.");
      console.error(error);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/api/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetForm),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setMessageType("loss");
        setMessage(data.message || "Unable to reset password.");
        return;
      }

      setMessageType("profit");
      setMessage(data.message || "Password reset successfully.");
      setFormState((prev) => ({ ...prev, email: resetForm.email, password: "" }));
      setResetForm({ email: "", token: "", password: "" });
      setResetStep("request");
      setResetMode(false);
    } catch (error) {
      setMessageType("loss");
      setMessage("Unable to reach the server. Make sure the backend is running.");
      console.error(error);
    } finally {
      setResetLoading(false);
    }
  };

  const showResetMode = () => {
    setResetMode(true);
    setResetStep("request");
    setResetForm((prev) => ({ ...prev, email: formState.email }));
    setMessage("");
  };

  const showLoginMode = () => {
    setResetMode(false);
    setResetStep("request");
    setMessage("");
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
              <span className="auth-badge">Member Access</span>
              <h2>{resetMode ? "Reset Password" : "Log In"}</h2>
              <p>
                {resetMode
                  ? "Create a reset code and choose a new password."
                  : "Enter your details to reopen your trading workspace."}
              </p>
            </div>

            {!resetMode ? (
            <form onSubmit={handleSubmit} id="loginForm" className="auth-form">
              <div className={`form-message ${messageType}`}>
                {message || " "}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="form-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  className="form-input"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={formState.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={showResetMode}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="btn-primary auth-btn"
                id="submitBtn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin" /> Signing
                    in...
                  </>
                ) : (
                  "Access My Account"
                )}
              </button>
            </form>
            ) : (
            <form
              onSubmit={resetStep === "request" ? handleForgotPassword : handleResetPassword}
              className="auth-form"
            >
              <div className={`form-message ${messageType}`}>
                {message || " "}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">
                  Email Address
                </label>
                <input
                  className="form-input"
                  id="reset-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={resetForm.email}
                  onChange={handleResetChange}
                />
              </div>

              {resetStep === "reset" ? (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reset-token">
                      Reset Code
                    </label>
                    <input
                      className="form-input"
                      id="reset-token"
                      name="token"
                      type="text"
                      placeholder="Paste your reset code"
                      required
                      value={resetForm.token}
                      onChange={handleResetChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reset-password">
                      New Password
                    </label>
                    <input
                      className="form-input"
                      id="reset-password"
                      name="password"
                      type="password"
                      placeholder="Enter a new password"
                      minLength={6}
                      required
                      value={resetForm.password}
                      onChange={handleResetChange}
                    />
                  </div>
                </>
              ) : null}

              <button
                type="submit"
                className="btn-primary auth-btn"
                disabled={resetLoading}
              >
                {resetLoading
                  ? "Please wait..."
                  : resetStep === "request"
                    ? "Create Reset Code"
                    : "Reset Password"}
              </button>

              <button type="button" className="auth-inline-link centered" onClick={showLoginMode}>
                Back to login
              </button>
            </form>
            )}

            <div className="auth-footer">
              Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </div>

          <div className="login-showcase">
            <div className="signup-kicker">
              <span className="hero-kicker-pill">
                <i className="fa-solid fa-lock" />
                Secure member access
              </span>
              <span className="hero-kicker-note">Re-enter your live trading workspace</span>
            </div>
            <span className="auth-eyebrow">Secure Returning Access</span>
            <h1>Pick up where you left off in the market.</h1>
            <p className="login-lead">
              Sign in to manage your account, review market movement, and stay
              connected to your trading activity from one place.
            </p>

            <div className="login-panel">
              <div className="login-panel-row">
                <span>Account status</span>
                <strong>Protected</strong>
              </div>
              <div className="login-panel-row">
                <span>Platform availability</span>
                <strong>24/7 access</strong>
              </div>
              <div className="login-panel-row">
                <span>Execution environment</span>
                <strong>Live markets</strong>
              </div>
            </div>

            <ul className="login-highlights">
              {loginHighlights.map((item) => (
                <li key={item}>
                  <i className="fa-solid fa-check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
