import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardLayout from "../components/UserDashboardLayout";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";
import { apiUrl, createAuthHeaders, parseApiResponse } from "../config/api";

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function InvestmentPlanPage() {
  const navigate = useNavigate();
  useAuthenticatedUser();
  const [plans, setPlans] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch(apiUrl("/api/investment-plans"), {
          headers: createAuthHeaders("authToken"),
        });
        const data = await parseApiResponse(response);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load investment plans.");
        }

        setPlans(data.plans || []);
        setAmounts(
          (data.plans || []).reduce((accumulator, plan) => {
            accumulator[plan.id] = String(plan.minimum);
            return accumulator;
          }, {}),
        );
      } catch (error) {
        setMessageType("loss");
        setMessage(error.message);
      }
    };

    loadPlans();
  }, []);

  const totalPlanCount = useMemo(() => plans.length, [plans]);

  const handleAmountChange = (planId, value) => {
    setAmounts((prev) => ({ ...prev, [planId]: value }));
  };

  const handleJoinPlan = (plan) => {
    const selectedAmount = Number(amounts[plan.id] || plan.minimum);

    if (
      !Number.isFinite(selectedAmount) ||
      selectedAmount < plan.minInvestment ||
      selectedAmount > plan.maxInvestment
    ) {
      setMessageType("loss");
      setMessage(
        `Enter an amount between ${formatCurrency(plan.minInvestment)} and ${formatCurrency(plan.maxInvestment)} for ${plan.name}.`,
      );
      return;
    }

    const searchParams = new URLSearchParams({
      intent: "investment-plan",
      planId: plan.id,
      planName: plan.name,
      amount: String(selectedAmount),
    });

    navigate(`/add-fund?${searchParams.toString()}`);
  };

  return (
    <UserDashboardLayout title="Investment Plan">
      <section className="dashboard-panel investment-plans-page">
        <div className="investment-plans-head">
          <div>
            <span className="auth-eyebrow">User Account</span>
            <h2>Investment Plans</h2>
            <p>
              Upgrade your account with structured investment opportunities from
              a dedicated plans workspace.
            </p>
          </div>
          <div className="investment-plans-meta">
            <span>Available plans</span>
            <strong>{totalPlanCount}</strong>
          </div>
        </div>

        <div className={`form-message ${messageType}`}>{message || " "}</div>

        <div className="investment-plans-grid">
          {plans.map((plan) => (
            <article key={plan.id} className="investment-plan-card">
              <div className="investment-plan-card-top">
                <div>
                  <h3>{plan.name}</h3>
                  <strong>{formatCurrency(plan.minimum)}</strong>
                  <span>minimum</span>
                </div>
                <small>{plan.roi}</small>
              </div>

              <div className="investment-plan-features">
                <p>
                  <i className="fa-solid fa-circle-check" />
                  <span>Min Investment: {formatCurrency(plan.minInvestment)}</span>
                </p>
                <p>
                  <i className="fa-solid fa-circle-check" />
                  <span>Max Investment: {formatCurrency(plan.maxInvestment)}</span>
                </p>
                <p>
                  <i className="fa-solid fa-circle-check" />
                  <span>Return Rate: {plan.returnRateLabel}</span>
                </p>
                <p>
                  <i className="fa-solid fa-circle-check" />
                  <span>Duration: {plan.durationDays} Days</span>
                </p>
              </div>

              <div className="investment-plan-input-group">
                <label className="form-label" htmlFor={`plan-${plan.id}`}>
                  Investment Amount ($)
                </label>
                <input
                  id={`plan-${plan.id}`}
                  className="form-input"
                  type="number"
                  min={plan.minInvestment}
                  max={plan.maxInvestment}
                  value={amounts[plan.id] || ""}
                  onChange={(event) => handleAmountChange(plan.id, event.target.value)}
                />
              </div>

              <div className="investment-plan-meter">
                <div className="investment-plan-meter-bar" />
                <div className="investment-plan-meter-labels">
                  <span>Min: {formatCurrency(plan.minInvestment)}</span>
                  <span>
                    Potential Return: {formatCurrency(plan.potentialReturn)} Daily
                  </span>
                </div>
              </div>

                <button
                  type="button"
                  className="btn-primary investment-plan-button"
                  onClick={() => handleJoinPlan(plan)}
                >
                  <i className="fa-solid fa-lock" /> Fund & Join Investment Plan
                </button>
              </article>
            ))}
        </div>

        <section className="investment-guide-panel">
          <div className="user-panel-head">
            <h3>Investment Guide</h3>
            <p>Choose a plan, set your amount, and join directly from your account dashboard.</p>
          </div>
          <div className="investment-guide-grid">
            <article>
              <i className="fa-solid fa-circle-check" />
              <strong>Choose your plan</strong>
              <p>Select an investment plan that matches your capital goals.</p>
            </article>
            <article>
              <i className="fa-solid fa-shield-halved" />
              <strong>Fund securely</strong>
              <p>Open a funding screen with your selected plan and amount already attached.</p>
            </article>
            <article>
              <i className="fa-solid fa-chart-line" />
              <strong>Track progress</strong>
              <p>Deposit requests and plan records are saved together on the backend for tracking.</p>
            </article>
          </div>
        </section>
      </section>
    </UserDashboardLayout>
  );
}

export default InvestmentPlanPage;
