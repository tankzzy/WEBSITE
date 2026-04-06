import { useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config/api";

const signupBenefits = [
  "Secure onboarding with encrypted credentials",
  "Access to forex, stocks, and futures markets",
  "Fast deposits, withdrawals, and account support",
];

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return { message: text || "Unexpected server response." };
}

function Signup() {
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
  });
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
      const response = await fetch(apiUrl("/api/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await parseResponse(response);
      if (response.ok) {
        setMessageType("profit");
        setMessage(
          "Account created successfully! Welcome to TGtradringservices.",
        );
        setFormState({ fullName: "", email: "", password: "" });
      } else {
        setMessageType("loss");
        setMessage(data.message || "Signup failed.");
      }
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
    <main className="auth-shell signup-shell">
      <div className="hero-bg-accent" />
      <div className="auth-shell-inner">
        <Link to="/" className="back-link auth-back-link">
          <i className="fa-solid fa-arrow-left" /> Back to Home
        </Link>

        <section className="signup-layout">
          <div className="signup-showcase">
            <span className="auth-eyebrow">Open Your Trading Account</span>
            <h1>Create your account and start trading with confidence.</h1>
            <p className="signup-lead">
              Join a platform built for speed, flexibility, and better market
              access from a single dashboard.
            </p>

            <div className="signup-stats">
              <div className="signup-stat-card">
                <strong>23K+</strong>
                <span>active traders</span>
              </div>
              <div className="signup-stat-card">
                <strong>0.01s</strong>
                <span>avg. execution</span>
              </div>
              <div className="signup-stat-card">
                <strong>40+</strong>
                <span>global exchanges</span>
              </div>
            </div>

            <ul className="signup-benefits">
              {signupBenefits.map((benefit) => (
                <li key={benefit}>
                  <i className="fa-solid fa-circle-check" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="auth-card signup-card">
            <div className="auth-header signup-header">
              <span className="auth-badge">Free Setup</span>
              <h2>Create Account</h2>
              <p>Set up your profile to unlock your trading workspace.</p>
            </div>

            <form onSubmit={handleSubmit} id="signupForm" className="auth-form">
              <div className={`form-message ${messageType}`}>
                {message || " "}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  className="form-input"
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={formState.fullName}
                  onChange={handleChange}
                />
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
                  placeholder="Create a password"
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
                    <i className="fa-solid fa-circle-notch fa-spin" />{" "}
                    Creating account...
                  </>
                ) : (
                  "Create My Account"
                )}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Log In</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Signup;
