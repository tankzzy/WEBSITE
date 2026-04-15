import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl, parseApiResponse } from "../config/api";

function Signup() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    referralCode: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referredCode = params.get("ref");

    if (referredCode) {
      setFormState((prev) => ({ ...prev, referralCode: referredCode }));
    }
  }, []);

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

      const data = await parseApiResponse(response);
      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        navigate("/dashboard");
        return;
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
            <div className="signup-kicker">
              <span className="hero-kicker-pill">
                <i className="fa-solid fa-shield-halved" />
                Premium onboarding
              </span>
              <span className="hero-kicker-note">Secure access to global markets</span>
            </div>
            <span className="auth-eyebrow">Open Your Trading Account</span>
            <h1>Create your account and start trading with confidence.</h1>
            <p className="signup-lead">
              Join a platform built for speed, flexibility, and better market
              access from a single dashboard.
            </p>
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

              {formState.referralCode ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="referralCode">
                    Referral Code
                  </label>
                  <input
                    className="form-input"
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={formState.referralCode}
                    readOnly
                  />
                </div>
              ) : null}

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
              Already have an account? <Link to="/login" replace>Log In</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Signup;
