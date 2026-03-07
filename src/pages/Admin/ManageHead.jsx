import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle } from 'lucide-react';
import '../../components/AdminLayout/ManageHead.css';

// Memoized program head row component to prevent re-renders
const ProgramHeadRow = React.memo(({ programHead, onEdit, onDelete, getDepartmentBadgeClass }) => (
  <tr>
    <td data-label="Program Head ID: ">
      <div className="manage-head-id">{programHead.program_head_id}</div>
    </td>
    <td data-label="Name: ">
      <div className="manage-head-name">{programHead.firstName} {programHead.lastName}</div>
    </td>
    <td data-label="Department: ">
      <span className={`manage-head-dept-badge ${getDepartmentBadgeClass(programHead.department)}`}>
        {programHead.department ? programHead.department.toUpperCase() : 'N/A'}
      </span>
    </td>
    <td data-label="Email: " className="manage-head-email">{programHead.email}</td>
    <td data-label="Actions: " className="manage-head-actions-cell">
      <div className="manage-head-actions-buttons">
        <button
          onClick={() => onEdit(programHead)}
          className="manage-head-action-button manage-head-edit-button"
          title="Edit program head"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(programHead.user_id)}
          className="manage-head-action-button manage-head-delete-button"
          title="Delete program head"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </td>
  </tr>
));

ProgramHeadRow.displayName = 'ProgramHeadRow';

const ManageHead = () => {
  const [programHeads, setProgramHeads] = useState([]);
  const [filteredProgramHeads, setFilteredProgramHeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentProgramHead, setCurrentProgramHead] = useState({
    user_id: '',
    program_head_id: '',
    firstName: '',
    lastName: '',
    department: '',
    birthday: '',
    email: '',
    password: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filter states
  const [sortOrder, setSortOrder] = useState('latest');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const API_URL = 'http://localhost/svcc-enrollment';
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  useEffect(() => {
    fetchProgramHeads();
  }, []);

  // Memoized filter application
  useEffect(() => {
    applyFilters();
  }, [searchTerm, programHeads, sortOrder, departmentFilter]);

  const applyFilters = useCallback(() => {
    let filtered = [...programHeads];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(head => 
        (head.program_head_id || '').toLowerCase().includes(searchLower) ||
        (head.firstName || '').toLowerCase().includes(searchLower) ||
        (head.lastName || '').toLowerCase().includes(searchLower) ||
        (head.department || '').toLowerCase().includes(searchLower) ||
        (head.email || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(head => (head.department || '').toLowerCase() === departmentFilter.toLowerCase());
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const aValue = a.user_id || 0;
      const bValue = b.user_id || 0;
      
      if (sortOrder === 'latest') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    setFilteredProgramHeads(filtered);
  }, [programHeads, searchTerm, sortOrder, departmentFilter]);

  // Generate password based on lastname + birthday (MMDDYYYY format)
  const generatePassword = useCallback((lastName, birthday) => {
    if (!lastName || !birthday) return '';
    
    const date = new Date(birthday);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${lastName.toLowerCase()}${month}${day}${year}`;
  }, []);

  // Auto-generate password when lastName or birthday changes
  useEffect(() => {
    if (modalMode === 'add' && currentProgramHead.lastName && currentProgramHead.birthday) {
      const autoPassword = generatePassword(currentProgramHead.lastName, currentProgramHead.birthday);
      setCurrentProgramHead(prev => ({
        ...prev,
        password: autoPassword
      }));
    }
  }, [currentProgramHead.lastName, currentProgramHead.birthday, modalMode, generatePassword]);

  const fetchProgramHeads = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get(`${API_URL}/fetch_accounts.php?role=program_head`);
    // Check if response.data is an array, if not set empty array
    if (Array.isArray(response.data)) {
      setProgramHeads(response.data);
      setIsError(false);
    } else {
      console.error('API returned non-array:', response.data);
      setProgramHeads([]);
      setIsError(true);
    }
  } catch (error) {
    console.error('Error fetching program heads:', error);
    setProgramHeads([]);
    setIsError(true);
  } finally {
    setIsLoading(false);
  }
};

  const handleInputChange = useCallback((e) => {
    setCurrentProgramHead(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const openAddModal = useCallback(() => {
    setCurrentProgramHead({
      user_id: '',
      program_head_id: '',
      firstName: '',
      lastName: '',
      department: '',
      birthday: '',
      email: '',
      password: ''
    });
    setModalMode('add');
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((programHead) => {
    setCurrentProgramHead({
      ...programHead,
      password: ''
    });
    setModalMode('edit');
    setShowModal(true);
  }, []);

  const confirmDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === 'sort') {
      setSortOrder(value);
    } else if (filterType === 'department') {
      setDepartmentFilter(value);
    }
    setShowFilterDropdown(false);
  }, []);

  const getFilterDisplayText = useMemo(() => {
    const sortText = sortOrder === 'latest' ? 'Latest' : 'Oldest';
    const deptText = departmentFilter === 'all' ? 'All Departments' : departmentFilter.toUpperCase();
    return `${sortText} • ${deptText}`;
  }, [sortOrder, departmentFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentProgramHead.program_head_id || !currentProgramHead.firstName || !currentProgramHead.lastName || 
        !currentProgramHead.department || !currentProgramHead.birthday || !currentProgramHead.email) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentProgramHead.email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    if (modalMode === 'add' && !currentProgramHead.password) {
      setMessage({ text: 'Password could not be generated. Please check last name and birthday.', type: 'error' });
      return;
    }
    
    try {
      const url = modalMode === 'add' ? '/add_account.php' : '/update_accounts.php';
      const payload = {
        ...currentProgramHead,
        role: 'program_head' // Add role parameter
      };
      
      const response = await axios.post(`${API_URL}${url}`, payload, {
        headers: auditHeaders
      });
      
      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        setShowModal(false);
        fetchProgramHeads();
      } else {
        setMessage({ text: response.data.message || `Failed to ${modalMode} program head`, type: 'error' });
      }
    } catch (error) {
      console.error(`Error ${modalMode}ing program head:`, error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage({ text: error.response.data.message, type: 'error' });
      } else {
        setMessage({ text: `An error occurred while ${modalMode}ing the program head`, type: 'error' });
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.post(`${API_URL}/delete_account.php`, 
        { user_id: deleteId },
        { headers: auditHeaders }
      );
      
      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        fetchProgramHeads();
      } else {
        setMessage({ text: response.data.message || 'Failed to delete program head', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting program head:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage({ text: error.response.data.message, type: 'error' });
      } else {
        setMessage({ text: 'An error occurred while deleting the program head', type: 'error' });
      }
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const getDepartmentBadgeClass = useCallback((department) => {
    switch (department?.toLowerCase()) {
      case 'bscs':
        return 'manage-head-dept-bscs';
      case 'bsit':
        return 'manage-head-dept-bsit';
      case 'bsis':
        return 'manage-head-dept-bsis';
      default:
        return 'manage-head-dept-bscs';
    }
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="manage-head-container">
      <div className="manage-head-content-wrapper">
        <div className="manage-head-header-card">
          <div className="manage-head-header-content">
            <h1 className="manage-head-page-title">Manage Program Head Accounts</h1>
            <div className="manage-head-header-actions">
              <div className="manage-head-search-container">
                <input
                  type="text"
                  placeholder="Search program heads..."
                  className="manage-head-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="manage-head-search-icon" size={18} />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="manage-head-search-clear"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

             

              <button
                onClick={openAddModal}
                className="manage-head-add-button"
              >
                <PlusCircle size={18} className="manage-head-button-icon" />
                Add Program Head
              </button>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`manage-head-message ${message.type === 'success' ? 'manage-head-message-success' : 'manage-head-message-error'}`}>
            <AlertCircle size={20} className="manage-head-message-icon" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="manage-head-table-container">
          {isLoading ? (
            <div className="manage-head-loading-container">
              <div className="manage-head-loading-spinner"></div>
              <p className="manage-head-loading-text">Loading program heads...</p>
            </div>
          ) : isError ? (
            <div className="manage-head-error-container">
              <AlertCircle size={40} className="manage-head-error-icon" />
              <p className="manage-head-error-text">Failed to load program heads</p>
              <button 
                onClick={fetchProgramHeads}
                className="manage-head-retry-button"
              >
                Try Again
              </button>
            </div>
          ) : filteredProgramHeads.length === 0 ? (
            <div className="manage-head-empty-container">
              {searchTerm || departmentFilter !== 'all' ? (
                <>
                  <p className="manage-head-empty-text">No program heads found matching current filters</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setDepartmentFilter('all');
                    }}
                    className="manage-head-empty-action"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="manage-head-empty-text">No program heads available</p>
                  <button 
                    onClick={openAddModal}
                    className="manage-head-empty-action"
                  >
                    <PlusCircle size={16} className="manage-head-button-icon-small" />
                    Add your first program head
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="manage-head-table-scroll">
              <table className="manage-head-table">
                <thead>
                  <tr>
                    <th>Program Head ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th className="manage-head-actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProgramHeads.map((head) => (
                    <ProgramHeadRow
                      key={head.user_id}
                      programHead={head}
                      onEdit={openEditModal}
                      onDelete={confirmDelete}
                      getDepartmentBadgeClass={getDepartmentBadgeClass}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="manage-head-modal-overlay">
          <div className="manage-head-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="manage-head-modal-body">
              <h2 className="manage-head-modal-title">
                {modalMode === 'add' ? 'Add New Program Head' : 'Edit Program Head'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="manage-head-form-group">
                  <label htmlFor="program_head_id" className="manage-head-form-label">
                    Program Head ID*
                  </label>
                  <input
                    type="text"
                    id="program_head_id"
                    name="program_head_id"
                    value={currentProgramHead.program_head_id}
                    onChange={handleInputChange}
                    className="manage-head-form-input"
                    placeholder="e.g., PH-2024-001"
                    required
                  />
                </div>
                <div className="manage-head-form-row">
                  <div className="manage-head-form-group">
                    <label htmlFor="firstName" className="manage-head-form-label">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={currentProgramHead.firstName}
                      onChange={handleInputChange}
                      className="manage-head-form-input"
                      required
                    />
                  </div>
                  <div className="manage-head-form-group">
                    <label htmlFor="lastName" className="manage-head-form-label">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={currentProgramHead.lastName}
                      onChange={handleInputChange}
                      className="manage-head-form-input"
                      required
                    />
                  </div>
                </div>
                <div className="manage-head-form-group">
                  <label htmlFor="department" className="manage-head-form-label">
                    Department*
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={currentProgramHead.department}
                    onChange={handleInputChange}
                    className="manage-head-form-select"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="bscs">BSCS - Computer Science</option>
                    <option value="bsit">BSIT - Information Technology</option>
                    <option value="bsis">BSIS - Information Systems</option>
                  </select>
                </div>
                <div className="manage-head-form-group">
                  <label htmlFor="birthday" className="manage-head-form-label">
                    Birthday*
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={currentProgramHead.birthday}
                    onChange={handleInputChange}
                    className="manage-head-form-input"
                    required
                  />
                </div>
                <div className="manage-head-form-group">
                  <label htmlFor="email" className="manage-head-form-label">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={currentProgramHead.email}
                    onChange={handleInputChange}
                    className="manage-head-form-input"
                    required
                  />
                </div>
                {modalMode === 'add' && currentProgramHead.password && (
                  <div className="manage-head-form-group">
                    <label className="manage-head-form-label">
                      Generated Password
                    </label>
                    <input
                      type="text"
                      value={currentProgramHead.password}
                      className="manage-head-form-input"
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                    <p className="manage-head-form-hint">
                      Password format: lastname + birthday (MMDDYYYY). Will be sent to program head's email.
                    </p>
                  </div>
                )}
                {modalMode === 'edit' && (
                  <div className="manage-head-form-group">
                    <label htmlFor="password" className="manage-head-form-label">
                      New Password (leave empty to keep current)
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={currentProgramHead.password}
                      onChange={handleInputChange}
                      className="manage-head-form-input"
                      placeholder="Enter new password or leave empty"
                    />
                  </div>
                )}
                    
                <div className="manage-head-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="manage-head-button manage-head-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="manage-head-button manage-head-button-primary"
                  >
                    <Save size={18} className="manage-head-button-icon" />
                    {modalMode === 'add' ? 'Create Program Head' : 'Update Program Head'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="manage-head-modal-overlay">
          <div className="manage-head-confirm-modal">
            <h3 className="manage-head-confirm-title">Confirm Delete</h3>
            <p className="manage-head-confirm-text">Are you sure you want to delete this program head? This action cannot be undone.</p>
            <div className="manage-head-confirm-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="manage-head-button manage-head-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="manage-head-button manage-head-button-danger"
              >
                <Trash2 size={18} className="manage-head-button-icon" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHead;