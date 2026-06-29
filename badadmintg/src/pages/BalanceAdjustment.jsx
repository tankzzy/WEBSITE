import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { apiUrl, createAuthHeaders, parseApiResponse } from '../config';

const navItems = [
  { label: 'Analytics', icon: 'dashboard', path: '/admin' },
  { label: 'Users', icon: 'group', path: '/admin/users' },
  { label: 'Wallets', icon: 'account_balance_wallet', path: '/admin/wallets' },
  { label: 'Withdrawals', icon: 'payments', path: '/admin/withdrawals' },
  { label: 'Security', icon: 'shield', path: '/admin/security' },
  { label: 'Adjustments', icon: 'account_balance', path: '/admin/adjustment' },
];

function BalanceAdjustment() {
  const token = localStorage.getItem('adminAuthToken');
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    if (!toastOpen) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setToastOpen(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [toastOpen]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleNavClick = (path) => {
    if (path !== location.pathname) {
      navigate(path);
    }
  };

  const openConfirmationModal = (event) => {
    event.preventDefault();
    
    const formElements = formRef.current?.elements;
    if (!formElements) return;

    setFormData({
      userIdentifier: formElements.userIdentifier?.value || '',
      asset: formElements.asset?.value || 'USDT',
      amount: formElements.amount?.value || '',
      reason: formElements.reason?.value || '',
      notes: formElements.notes?.value || '',
    });

    setModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setModalOpen(false);
  };

  const handleExecute = async () => {
    setProcessing(true);

    try {
      const response = await fetch(apiUrl('/api/admin/balance-adjust'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Balance adjustment failed');
      }

      setToastError(false);
      setToastMessage(data.message || 'Balance adjustment completed successfully');
      setToastOpen(true);
      closeConfirmationModal();
      formRef.current?.reset();
    } catch (error) {
      setToastError(true);
      setToastMessage(error.message || 'Unable to process balance adjustment');
      setToastOpen(true);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="balance-page">
      <header className="balance-topbar">
        <div>
          <p className="balance-eyebrow">Security Command</p>
          <h1>Financial Top-Up Engine</h1>
          <p className="balance-description">
            Manual credit protocol for institutional balance modifications. Every adjustment requires mandatory justification
            and is logged for internal audit.
          </p>
        </div>

        <div className="balance-topbar-actions">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search Adjustments..." type="text" />
          </div>
          <button type="button" className="icon-button" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button type="button" className="icon-button" aria-label="Help">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button type="button" className="icon-button" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button type="button" className="profile-button" onClick={() => localStorage.removeItem('adminAuthToken') || navigate('/') }>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBri_vqPncJpNWCjimpVd_oUjZx-idvT1UYWmk6ASj3x3dN6NZYI0b3M-RL8o4i1BP_VKZ80EG_bgx9omXpQby8K1wwn90pOpoeyuA_WwQt_YtKmy2YbMY3kJqam3T__nLtZhUx24b8za5IdY8WdwvKA1Xc_avxslStlO-YHqQh2z8VgiNQyzastnhQQ6aiIv4yWTKEe27jnkOIP-FzLRAyXcK10hzRobE5L2ow4KoRsAsIUCjaMrmL-FFUx8o20B8_Z_VToQfh48M"
              alt="Admin profile"
            />
          </button>
        </div>
      </header>

      <div className="balance-layout">
        <aside className="balance-sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div>
              <p className="brand-title">Admin Console</p>
              <p className="brand-subtitle">V2.4.0 High-Priority Access</p>
            </div>
          </div>

          <div className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.path}
                type="button"
                className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <button type="button" className="emergency-button">
            <span className="material-symbols-outlined">lock</span>
            Emergency Freeze
          </button>

          <div className="sidebar-footer">
            <button type="button" className="sidebar-footer-item">
              <span className="material-symbols-outlined">history</span>
              Logs
            </button>
            <button type="button" className="sidebar-footer-item" onClick={() => navigate('/') }>
              <span className="material-symbols-outlined">logout</span>
              Log Out
            </button>
          </div>
        </aside>

        <main className="balance-main">
          <section className="section-headline">
            <div className="breadcrumb">
              <span>Console</span>
              <span className="material-symbols-outlined">chevron_right</span>
              <span className="breadcrumb-active">Balance Adjustment</span>
            </div>
            <h2>Financial Top-Up Engine</h2>
            <p className="section-description">
              Manual credit protocol for institutional balance modifications. Every adjustment requires mandatory justification and is logged for
              internal audit.
            </p>
          </section>

          <div className="balance-grid">
            <section className="balance-form-card glass-card">
              <div className="form-card-header">
                <div className="form-card-icon">
                  <span className="material-symbols-outlined fill-icon">add_card</span>
                </div>
                <div>
                  <h3>Credit Adjustment Form</h3>
                  <p className="form-subtitle">
                    Transaction ID: <span>TX-M770-9821</span>
                  </p>
                </div>
              </div>

              <form ref={formRef} className="adjustment-form" onSubmit={openConfirmationModal}>
                <div className="field-group">
                  <label>
                    User Identifier (Email or UUID)
                    <div className="input-icon-wrapper">
                      <span className="material-symbols-outlined">person_search</span>
                      <input name="userIdentifier" placeholder="e.g. admin@enterprise.com" required type="text" />
                    </div>
                  </label>

                  <label>
                    Digital Asset (Coin Selector)
                    <select name="asset" defaultValue="USDT">
                      <option value="USDT">USDT (Tether USD)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                    </select>
                  </label>
                </div>

                <div className="field-group">
                  <label>
                    Credit Amount
                    <div className="input-icon-wrapper">
                      <input name="amount" placeholder="0.00" required step="0.0001" type="number" />
                      <span className="amount-tag">CREDIT (+)</span>
                    </div>
                  </label>

                  <label>
                    Reason for Adjustment
                    <select name="reason" defaultValue="" required>
                      <option disabled value="">
                        Select adjustment type...
                      </option>
                      <option value="REF">Customer Support Refund</option>
                      <option value="PRO">Promotional Bonus</option>
                      <option value="COR">Data Entry Correction</option>
                      <option value="INS">Institutional Grant</option>
                    </select>
                  </label>
                </div>

                <label className="full-width">
                  Internal Notes (Optional)
                  <textarea name="notes" rows="3" placeholder="Provide detailed context for compliance teams..." />
                </label>

                <div className="disclaimer-card">
                  <span className="material-symbols-outlined">warning</span>
                  <p>
                    Balance adjustments are immediate and irreversible once verified. Confirm user identification and asset type before proceeding.
                  </p>
                </div>

                <button type="submit" className="primary-submit-button">
                  <span className="material-symbols-outlined fill-icon">bolt</span>
                  Initiate Credit Protocol
                </button>
              </form>
            </section>

            <section className="balance-summary-card glass-card">
              <div className="summary-header">
                <h3>SESSION SUMMARY</h3>
              </div>
              <div className="summary-grid">
                <div className="summary-item">
                  <p>Daily Limit Used</p>
                  <strong>$12,450.00</strong>
                  <div className="summary-progress">
                    <span />
                  </div>
                </div>
                <div className="summary-item priority">
                  <p>Pending Approvals</p>
                  <strong>02</strong>
                  <span className="priority-badge">HIGH PRIORITY</span>
                </div>
              </div>
            </section>

            <section className="balance-log-card glass-card">
              <div className="log-header">
                <h3>MODIFICATION LOG</h3>
                <button type="button" className="icon-button mini">
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>

              <div className="log-list">
                {[
                  { label: 'CREDIT SUCCESS', time: '14:22:10 UTC', amount: '500.00 USDT', note: 'Admin: ID-442 | User: U-9021', icon: 'open_in_new' },
                  { label: 'CREDIT SUCCESS', time: '12:15:45 UTC', amount: '0.025 BTC', note: 'Admin: ID-442 | User: U-3115', icon: 'open_in_new' },
                  { label: 'CREDIT SUCCESS', time: '09:10:02 UTC', amount: '1.400 ETH', note: 'Admin: ID-109 | User: U-7728', icon: 'open_in_new' },
                  { label: 'HISTORY', time: 'Yesterday', amount: '2,500.00 USDT', note: 'Admin: ID-442 | User: U-1102', icon: 'lock_clock', faded: true },
                ].map((item, index) => (
                  <div key={index} className={`log-item ${item.faded ? 'faded' : ''}`}>
                    <div className="log-meta">
                      <span>{item.label}</span>
                      <span>{item.time}</span>
                    </div>
                    <div className="log-row">
                      <div>
                        <p>{item.amount}</p>
                        <small>{item.note}</small>
                      </div>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="audit-history-button">
                View Full Audit History
              </button>
            </section>
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-icon">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div className="modal-copy">
              <h3>Final Verification</h3>
              <p>You are about to credit the following account. This action will be tagged with your Administrator ID and logged for audit.</p>
            </div>
            <div className="modal-summary">
              <div>
                <span>Target User</span>
                <strong>{formData.userIdentifier || 'N/A'}</strong>
              </div>
              <div>
                <span>Asset</span>
                <strong>{formData.asset || 'USDT'}</strong>
              </div>
              <div>
                <span>Amount</span>
                <strong>+ {formData.amount || '0.00'}</strong>
              </div>
              <div className="modal-protocol">
                <span>Reason</span>
                <strong>{formData.reason || 'Not specified'}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="modal-secondary-button" onClick={closeConfirmationModal} disabled={processing}>
                Cancel
              </button>
              <button type="button" className="modal-primary-button" onClick={handleExecute} disabled={processing}>
                {processing ? 'Processing...' : 'Execute Credit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast-notification ${toastOpen ? 'visible' : ''} ${toastError ? 'error' : ''}`}>
        <span className="material-symbols-outlined toast-icon">{toastError ? 'error' : 'check'}</span>
        <div>
          <p>{toastError ? 'Adjustment Failed' : 'Adjustment Successful'}</p>
          <small>{toastMessage || (toastError ? 'Check your input and try again.' : 'Transaction has been logged for audit.')}</small>
        </div>
      </div>
    </div>
  );
}

export default BalanceAdjustment;
