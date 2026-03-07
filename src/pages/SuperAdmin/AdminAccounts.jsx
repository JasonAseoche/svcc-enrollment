import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle } from 'lucide-react';
import '../../components/SuperAdminLayout/AdminAccounts.css';

const API_URL = 'http://localhost/svcc-enrollment';

// ── Memoised table row ─────────────────────────────────────────────────────
const AdminRow = React.memo(({ account, onEdit, onDelete }) => {
  const initials = `${account.firstName?.[0] ?? ''}${account.lastName?.[0] ?? ''}`.toUpperCase();
  const isSuperAdmin = account.role === 'superadmin';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <tr>
      <td data-label="Name: ">
        <div className="admin-acct-name-cell">
          <div className={`admin-acct-avatar ${isSuperAdmin ? 'admin-acct-avatar-super' : 'admin-acct-avatar-admin'}`}>
            {initials}
          </div>
          <div>
            <div className="admin-acct-full-name">{account.firstName} {account.lastName}</div>
          </div>
        </div>
      </td>
      <td data-label="Email: ">
        <span className="admin-acct-email-text">{account.email}</span>
      </td>
      <td data-label="Role: ">
        <span className={`admin-acct-role-badge ${isSuperAdmin ? 'admin-acct-badge-superadmin' : 'admin-acct-badge-admin'}`}>
          {isSuperAdmin ? 'Super Admin' : 'Admin'}
        </span>
      </td>
      <td data-label="Birthday: ">
        <span className="admin-acct-date-text">{formatDate(account.birthday)}</span>
      </td>
      <td data-label="Created: ">
        <span className="admin-acct-date-text">{formatDate(account.created_at)}</span>
      </td>
      <td data-label="Actions: ">
        <div className="admin-acct-actions-wrap">
          <button
            onClick={() => onEdit(account)}
            className="admin-acct-icon-btn admin-acct-edit-btn"
            title="Edit account"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(account.user_id)}
            className="admin-acct-icon-btn admin-acct-delete-btn"
            title="Delete account"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

AdminRow.displayName = 'AdminRow';

// ── Main component ─────────────────────────────────────────────────────────
const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentAccount, setCurrentAccount] = useState({
    user_id: '',
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    role: 'admin',
    password: '',
  });

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Audit headers from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await axios.get(`${API_URL}/admin_accounts.php?action=fetch`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setAccounts(res.data.data);
      } else {
        setIsError(true);
        setAccounts([]);
      }
    } catch {
      setIsError(true);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // Auto-dismiss message after 5s
  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    return () => clearTimeout(t);
  }, [message]);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return accounts;
    const q = searchTerm.toLowerCase();
    return accounts.filter(a =>
      (a.firstName || '').toLowerCase().includes(q) ||
      (a.lastName  || '').toLowerCase().includes(q) ||
      (a.email     || '').toLowerCase().includes(q) ||
      (a.role      || '').toLowerCase().includes(q)
    );
  }, [accounts, searchTerm]);


  const openAddModal = useCallback(() => {
    setCurrentAccount({ user_id:'', firstName:'', lastName:'', email:'', birthday:'', role:'admin', password:'' });
    setModalMode('add');
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((account) => {
    setCurrentAccount({ ...account, password: '' });
    setModalMode('edit');
    setShowModal(true);
  }, []);

  const confirmDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentAccount(prev => ({ ...prev, [name]: value }));
  }, []);

  // ── Submit (create / update) ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, birthday, role, password } = currentAccount;

    if (!firstName || !lastName || !email || !birthday || !role) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    if (modalMode === 'add' && !password) {
      setMessage({ text: 'Password is required when creating a new account.', type: 'error' });
      return;
    }

    try {
      const payload = {
        action: modalMode === 'add' ? 'create' : 'update',
        ...currentAccount,
      };

      const res = await axios.post(`${API_URL}/admin_accounts.php`, payload, { headers: auditHeaders });

      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        setShowModal(false);
        fetchAccounts();
      } else {
        setMessage({ text: res.data.message || 'Operation failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'An error occurred.', type: 'error' });
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/admin_accounts.php`,
        { action: 'delete', user_id: deleteId },
        { headers: auditHeaders }
      );

      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        fetchAccounts();
      } else {
        setMessage({ text: res.data.message || 'Failed to delete account.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'An error occurred while deleting.', type: 'error' });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-acct-container">
      <div className="admin-acct-wrapper">

        {/* Header */}
        <div className="admin-acct-header-card">
          <div className="admin-acct-header-row">
            <div>
              <h1 className="admin-acct-title">Admin Accounts</h1>
              <p className="admin-acct-subtitle">Manage administrator and super administrator accounts</p>
            </div>
            <div className="admin-acct-header-actions">
              <div className="admin-acct-search-wrap">
                <Search className="admin-acct-search-icon" size={16} />
                <input
                  type="text"
                  className="admin-acct-search-input"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="admin-acct-search-clear" onClick={() => setSearchTerm('')}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <button className="admin-acct-add-btn" onClick={openAddModal}>
                <PlusCircle size={16} />
                Add Account
              </button>
            </div>
          </div>
        </div>



        {/* Alert */}
        {message.text && (
          <div className={`admin-acct-alert ${message.type === 'success' ? 'admin-acct-alert-success' : 'admin-acct-alert-error'}`}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{message.text}</span>
          </div>
        )}

        {/* Table */}
        <div className="admin-acct-table-card">
          {isLoading ? (
            <div className="admin-acct-state-box">
              <div className="admin-acct-spinner" />
              <p className="admin-acct-state-text">Loading accounts...</p>
            </div>
          ) : isError ? (
            <div className="admin-acct-state-box">
              <AlertCircle size={36} color="#ef4444" />
              <p className="admin-acct-state-text admin-acct-state-error">Failed to load accounts</p>
              <button className="admin-acct-retry-btn" onClick={fetchAccounts}>Try Again</button>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="admin-acct-state-box">
              {searchTerm ? (
                <>
                  <p className="admin-acct-state-text">No accounts match your search.</p>
                  <button className="admin-acct-state-action" onClick={() => setSearchTerm('')}>Clear search</button>
                </>
              ) : (
                <>
                  <p className="admin-acct-state-text">No admin accounts yet.</p>
                  <button className="admin-acct-state-action" onClick={openAddModal}>
                    <PlusCircle size={14} style={{ marginRight: 4 }} />
                    Add first account
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="admin-acct-table-scroll">
              <table className="admin-acct-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Birthday</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map(account => (
                    <AdminRow
                      key={account.user_id}
                      account={account}
                      onEdit={openEditModal}
                      onDelete={confirmDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-acct-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-acct-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-acct-modal-header">
              <h2 className="admin-acct-modal-title">
                {modalMode === 'add' ? 'Add New Account' : 'Edit Account'}
              </h2>
              <button className="admin-acct-modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-acct-modal-body">
              <form onSubmit={handleSubmit}>

                <div className="admin-acct-form-row">
                  <div className="admin-acct-form-group">
                    <label className="admin-acct-form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      className="admin-acct-form-input"
                      value={currentAccount.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="admin-acct-form-group">
                    <label className="admin-acct-form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      className="admin-acct-form-input"
                      value={currentAccount.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div className="admin-acct-form-group">
                  <label className="admin-acct-form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="admin-acct-form-input"
                    value={currentAccount.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="admin-acct-form-row">
                  <div className="admin-acct-form-group">
                    <label className="admin-acct-form-label">Role *</label>
                    <select
                      name="role"
                      className="admin-acct-form-select"
                      value={currentAccount.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                  <div className="admin-acct-form-group">
                    <label className="admin-acct-form-label">Birthday *</label>
                    <input
                      type="date"
                      name="birthday"
                      className="admin-acct-form-input"
                      value={currentAccount.birthday}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-acct-form-group">
                  <label className="admin-acct-form-label">
                    {modalMode === 'add' ? 'Password *' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="admin-acct-form-input"
                    value={currentAccount.password}
                    onChange={handleInputChange}
                    placeholder={modalMode === 'edit' ? 'Leave empty to keep current password' : 'Enter password'}
                    required={modalMode === 'add'}
                  />
                  {modalMode === 'edit' && (
                    <p className="admin-acct-form-hint">Leave blank to keep the existing password unchanged.</p>
                  )}
                </div>

                <div className="admin-acct-modal-footer">
                  <button type="button" className="admin-acct-btn admin-acct-btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-acct-btn admin-acct-btn-primary">
                    <Save size={15} />
                    {modalMode === 'add' ? 'Create Account' : 'Save Changes'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="admin-acct-modal-overlay">
          <div className="admin-acct-confirm-modal">
            <h3 className="admin-acct-confirm-title">Confirm Delete</h3>
            <p className="admin-acct-confirm-text">
              Are you sure you want to delete this admin account? This action cannot be undone.
            </p>
            <div className="admin-acct-confirm-footer">
              <button className="admin-acct-btn admin-acct-btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="admin-acct-btn admin-acct-btn-danger" onClick={handleDelete}>
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;