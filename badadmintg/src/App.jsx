import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import BalanceAdjustment from './pages/BalanceAdjustment';
import UserManagement from './pages/UserManagement';
import WalletManagement from './pages/WalletManagement';
import WithdrawalManagement from './pages/WithdrawalManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/wallets" element={<WalletManagement />} />
      <Route path="/admin/withdrawals" element={<WithdrawalManagement />} />
      <Route path="/admin/adjustment" element={<BalanceAdjustment />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
