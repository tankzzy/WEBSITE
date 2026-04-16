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

  return (
    <main className="auth-shell login-shell">
      <div className="hero-bg-accent" />
      <div className="auth-shell-inner">
        <Link to="/" className="back-link auth-back-link">
          <i className="fa-solid fa-arrow-left" /> Back to Home
        </Link>

        <section className="login-layout">
          <div className="auth-card login-card">
            <div className="a uth-header login-header">
              <span className="auth-badge">Member Access</span>
              <h2>Log In</h2>
              <p>Enter your details to reopen your trading workspace.</p>
            </div>

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
