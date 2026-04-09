import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Translator from "./components/Translator";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InvestmentPlanPage from "./pages/InvestmentPlan";
import {
  AddFundPage,
  FundHistoryPage,
  InvestHistoryPage,
  MyReferralPage,
  ProfileSettingsPage,
  ReferralBonusPage,
  SupportTicketPage,
  TransactionPage,
  TransferPage,
  WithdrawalHistoryPage,
  WithdrawalPage,
} from "./pages/UserSections";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      const nextTheme = event.detail?.theme;

      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme(nextTheme);
      }
    };

    window.addEventListener("app-theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("app-theme-change", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light",
    );
  };

  const isDashboardRoute =
    location.pathname === "/dashboard" ||
    location.pathname === "/invest-history" ||
    location.pathname === "/add-fund" ||
    location.pathname === "/fund-history" ||
    location.pathname === "/transfer" ||
    location.pathname === "/transaction" ||
    location.pathname === "/withdrawal" ||
    location.pathname === "/withdrawal-history" ||
    location.pathname === "/my-referral" ||
    location.pathname === "/referral-bonus" ||
    location.pathname === "/profile-settings" ||
    location.pathname === "/investment-plan" ||
    location.pathname === "/support-ticket" ||
    location.pathname === "/admin-control-center";

  return (
    <>
      <Translator />
      {!isDashboardRoute ? (
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
      ) : null}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-access" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investment-plan" element={<InvestmentPlanPage />} />
        <Route path="/invest-history" element={<InvestHistoryPage />} />
        <Route path="/add-fund" element={<AddFundPage />} />
        <Route path="/fund-history" element={<FundHistoryPage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/transaction" element={<TransactionPage />} />
        <Route path="/withdrawal" element={<WithdrawalPage />} />
        <Route
          path="/withdrawal-history"
          element={<WithdrawalHistoryPage />}
        />
        <Route path="/my-referral" element={<MyReferralPage />} />
        <Route path="/referral-bonus" element={<ReferralBonusPage />} />
        <Route path="/profile-settings" element={<ProfileSettingsPage />} />
        <Route path="/support-ticket" element={<SupportTicketPage />} />
        <Route path="/admin-control-center" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
