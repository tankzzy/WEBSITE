import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, parseApiResponse } from '../config';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetStep, setResetStep] = useState('request');
  const [resetForm, setResetForm] = useState({
    email: '',
    token: '',
    password: '',
  });
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setMessage(data.message || 'Login failed.');
        return;
      }

      if (data.user?.role !== 'admin') {
        setMessage('Admin access required.');
        return;
      }

      localStorage.setItem('adminAuthToken', data.token);
      localStorage.setItem('adminAuthUser', JSON.stringify(data.user));
      navigate('/admin');
    } catch (error) {
      console.error(error);
      setMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setMessage('');

    try {
      const response = await fetch(apiUrl('/api/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetForm.email }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setMessage(data.message || 'Unable to create reset code.');
        return;
      }

      setMessage(
        data.resetToken
          ? `Reset code: ${data.resetToken}`
          : data.message || 'Reset code created. Check your email.',
      );
      setResetForm((prev) => ({ ...prev, token: data.resetToken || prev.token }));
      setResetStep('reset');
    } catch (error) {
      console.error(error);
      setMessage('Unable to connect to the server.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setMessage('');

    try {
      const response = await fetch(apiUrl('/api/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setMessage(data.message || 'Unable to reset password.');
        return;
      }

      setMessage(data.message || 'Password reset successfully.');
      setEmail(resetForm.email);
      setPassword('');
      setResetForm({ email: '', token: '', password: '' });
      setResetStep('request');
      setResetMode(false);
    } catch (error) {
      console.error(error);
      setMessage('Unable to connect to the server.');
    } finally {
      setResetLoading(false);
    }
  };

  const showResetMode = () => {
    setResetMode(true);
    setResetStep('request');
    setResetForm((prev) => ({ ...prev, email }));
    setMessage('');
  };

  const showLoginMode = () => {
    setResetMode(false);
    setResetStep('request');
    setMessage('');
  };

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1>BadAdminLG</h1>
        <p>
          {resetMode
            ? 'Create a reset code and set a new admin password.'
            : 'Admin portal outside the main application.'}
        </p>

        {!resetMode ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="inline-link-button" onClick={showResetMode}>
              Forgot password?
            </button>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Enter Admin Portal'}
          </button>
        </form>
        ) : (
        <form
          onSubmit={resetStep === 'request' ? handleForgotPassword : handleResetPassword}
          className="auth-form"
        >
          <label>
            Email
            <input
              type="email"
              name="email"
              value={resetForm.email}
              onChange={handleResetChange}
              required
            />
          </label>

          {resetStep === 'reset' ? (
            <>
              <label>
                Reset Code
                <input
                  type="text"
                  name="token"
                  value={resetForm.token}
                  onChange={handleResetChange}
                  required
                />
              </label>

              <label>
                New Password
                <input
                  type="password"
                  name="password"
                  value={resetForm.password}
                  onChange={handleResetChange}
                  minLength={6}
                  required
                />
              </label>
            </>
          ) : null}

          <button type="submit" disabled={resetLoading}>
            {resetLoading
              ? 'Please wait...'
              : resetStep === 'request'
                ? 'Create Reset Code'
                : 'Reset Password'}
          </button>

          <button type="button" className="inline-link-button centered" onClick={showLoginMode}>
            Back to login
          </button>
        </form>
        )}

        {message && <div className="message">{message}</div>}
      </div>
    </main>
  );
}

export default Login;
