import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle } from 'lucide-react';
import '../../components/AdminLayout/ManageStudents.css';

// Memoized student row component to prevent re-renders
const StudentRow = React.memo(({ student, onEdit, onDelete, getYearLevelBadgeClass }) => (
  <tr>
    <td data-label="Student Number: ">
      <div className="manage-students-student-number">{student.studentNumber}</div>
    </td>
    <td data-label="Name: ">
      <div className="manage-students-student-name">{student.firstName} {student.lastName}</div>
    </td>
    <td data-label="Year Level: ">
      <span className={`manage-students-year-badge ${getYearLevelBadgeClass(student.yearLevel)}`}>
        Year {student.yearLevel}
      </span>
    </td>
    <td data-label="Program: " className="manage-students-program">{student.program ? student.program.toUpperCase() : 'N/A'}</td>
    <td data-label="Birthday: " className="manage-students-birthday">
      {student.birthday ? new Date(student.birthday).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'N/A'}
    </td>
    <td data-label="Actions: " className="manage-students-actions-cell">
      <div className="manage-students-actions-buttons">
        <button
          onClick={() => onEdit(student)}
          className="manage-students-action-button manage-students-edit-button"
          title="Edit student"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(student.id)}
          className="manage-students-action-button manage-students-delete-button"
          title="Delete student"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </td>
  </tr>
));

StudentRow.displayName = 'StudentRow';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentStudent, setCurrentStudent] = useState({
    id: '',
    studentNumber: '',
    firstName: '',
    lastName: '',
    yearLevel: '1',
    program: '',
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
  const [yearLevelFilter, setYearLevelFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchStudents();
  }, []);

  // Memoized filter application
  useEffect(() => {
    applyFilters();
  }, [searchTerm, students, sortOrder, yearLevelFilter, programFilter]);

  const applyFilters = useCallback(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        (student.studentNumber || '').toLowerCase().includes(searchLower) ||
        (student.firstName || '').toLowerCase().includes(searchLower) ||
        (student.lastName || '').toLowerCase().includes(searchLower) ||
        (student.program || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply year level filter
    if (yearLevelFilter !== 'all') {
      filtered = filtered.filter(student => student.yearLevel === yearLevelFilter);
    }

    // Apply program filter
    if (programFilter !== 'all') {
      filtered = filtered.filter(student => (student.program || '').toLowerCase() === programFilter.toLowerCase());
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const aValue = a.id || 0;
      const bValue = b.id || 0;
      
      if (sortOrder === 'latest') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, sortOrder, yearLevelFilter, programFilter]);

  const generateRandomPassword = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fetch_students.php`);
      setStudents(response.data);
      setIsError(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    setCurrentStudent(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const openAddModal = useCallback(() => {
    const generatedPassword = generateRandomPassword();
    setCurrentStudent({
      id: '',
      studentNumber: '',
      firstName: '',
      lastName: '',
      yearLevel: '1',
      program: '',
      birthday: '',
      email: '',
      password: generatedPassword
    });
    setModalMode('add');
    setShowModal(true);
  }, [generateRandomPassword]);

  const openEditModal = useCallback((student) => {
    setCurrentStudent({
      ...student,
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
    } else if (filterType === 'yearLevel') {
      setYearLevelFilter(value);
    } else if (filterType === 'program') {
      setProgramFilter(value);
    }
    setShowFilterDropdown(false);
  }, []);

  const getFilterDisplayText = useMemo(() => {
    const sortText = sortOrder === 'latest' ? 'Latest' : 'Oldest';
    const yearText = yearLevelFilter === 'all' ? 'All Years' : `Year ${yearLevelFilter}`;
    const programText = programFilter === 'all' ? 'All Programs' : programFilter;
    return `${sortText} • ${yearText} • ${programText}`;
  }, [sortOrder, yearLevelFilter, programFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentStudent.studentNumber || !currentStudent.firstName || !currentStudent.lastName || 
        !currentStudent.program || !currentStudent.birthday || !currentStudent.email) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentStudent.email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    if (modalMode === 'add' && (!currentStudent.password || currentStudent.password.length < 12)) {
      setMessage({ text: 'Password must be at least 12 characters', type: 'error' });
      return;
    }
    
    try {
      const formData = new FormData();
      Object.keys(currentStudent).forEach(key => {
        formData.append(key, currentStudent[key]);
      });
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const url = modalMode === 'add' ? '/add_student.php' : '/update_student.php';
      const response = await axios.post(`${API_URL}${url}`, formData, config);
      
      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        setShowModal(false);
        fetchStudents();
      } else {
        setMessage({ text: response.data.message || `Failed to ${modalMode} student`, type: 'error' });
      }
    } catch (error) {
      console.error(`Error ${modalMode}ing student:`, error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage({ text: error.response.data.message, type: 'error' });
      } else {
        setMessage({ text: `An error occurred while ${modalMode}ing the student`, type: 'error' });
      }
    }
  };

  const handleDelete = async () => {
    try {
      const formData = new FormData();
      formData.append('id', deleteId);
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(`${API_URL}/delete_student.php`, formData, config);
      
      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        fetchStudents();
      } else {
        setMessage({ text: response.data.message || 'Failed to delete student', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage({ text: error.response.data.message, type: 'error' });
      } else {
        setMessage({ text: 'An error occurred while deleting the student', type: 'error' });
      }
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const getYearLevelBadgeClass = useCallback((yearLevel) => {
    switch (yearLevel) {
      case '1':
        return 'manage-students-year-1';
      case '2':
        return 'manage-students-year-2';
      case '3':
        return 'manage-students-year-3';
      case '4':
        return 'manage-students-year-4';
      default:
        return 'manage-students-year-1';
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
    <div className="manage-students-container">
      <div className="manage-students-content-wrapper">
        <div className="manage-students-header-card">
          <div className="manage-students-header-content">
            <h1 className="manage-students-page-title">Manage Student Accounts</h1>
            <div className="manage-students-header-actions">
              <div className="manage-students-search-container">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="manage-students-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="manage-students-search-icon" size={18} />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="manage-students-search-clear"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Mobile Filter - Only visible on mobile */}
              <div className="manage-students-mobile-filter-container">
                <button
                  className="manage-students-filter-button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  <span className="manage-students-filter-text">{getFilterDisplayText}</span>
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    className={`manage-students-filter-chevron ${showFilterDropdown ? 'manage-students-filter-chevron-open' : ''}`}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showFilterDropdown && (
                  <div className="manage-students-filter-dropdown">
                    <div className="manage-students-filter-section">
                      <h4 className="manage-students-filter-section-title">Sort</h4>
                      <button
                        className={`manage-students-filter-option ${sortOrder === 'latest' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('sort', 'latest')}
                      >
                        Latest
                      </button>
                      <button
                        className={`manage-students-filter-option ${sortOrder === 'oldest' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('sort', 'oldest')}
                      >
                        Oldest
                      </button>
                    </div>
                    
                    <div className="manage-students-filter-section">
                      <h4 className="manage-students-filter-section-title">Year Level</h4>
                      <button
                        className={`manage-students-filter-option ${yearLevelFilter === 'all' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('yearLevel', 'all')}
                      >
                        All Years
                      </button>
                      <button
                        className={`manage-students-filter-option ${yearLevelFilter === '1' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('yearLevel', '1')}
                      >
                        Year 1
                      </button>
                      <button
                        className={`manage-students-filter-option ${yearLevelFilter === '2' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('yearLevel', '2')}
                      >
                        Year 2
                      </button>
                      <button
                        className={`manage-students-filter-option ${yearLevelFilter === '3' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('yearLevel', '3')}
                      >
                        Year 3
                      </button>
                      <button
                        className={`manage-students-filter-option ${yearLevelFilter === '4' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('yearLevel', '4')}
                      >
                        Year 4
                      </button>
                    </div>

                    <div className="manage-students-filter-section">
                      <h4 className="manage-students-filter-section-title">Program</h4>
                      <button
                        className={`manage-students-filter-option ${programFilter === 'all' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('program', 'all')}
                      >
                        All Programs
                      </button>
                      <button
                        className={`manage-students-filter-option ${programFilter === 'bscs' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('program', 'bscs')}
                      >
                        BSCS
                      </button>
                      <button
                        className={`manage-students-filter-option ${programFilter === 'bsit' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('program', 'bsit')}
                      >
                        BSIT
                      </button>
                      <button
                        className={`manage-students-filter-option ${programFilter === 'bsis' ? 'manage-students-filter-option-active' : ''}`}
                        onClick={() => handleFilterChange('program', 'bsis')}
                      >
                        BSIS
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={openAddModal}
                className="manage-students-add-button"
              >
                <PlusCircle size={18} className="manage-students-button-icon" />
                Add Account
              </button>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`manage-students-message ${message.type === 'success' ? 'manage-students-message-success' : 'manage-students-message-error'}`}>
            <AlertCircle size={20} className="manage-students-message-icon" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="manage-students-table-container">
          {isLoading ? (
            <div className="manage-students-loading-container">
              <div className="manage-students-loading-spinner"></div>
              <p className="manage-students-loading-text">Loading students...</p>
            </div>
          ) : isError ? (
            <div className="manage-students-error-container">
              <AlertCircle size={40} className="manage-students-error-icon" />
              <p className="manage-students-error-text">Failed to load students</p>
              <button 
                onClick={fetchStudents}
                className="manage-students-retry-button"
              >
                Try Again
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="manage-students-empty-container">
              {searchTerm || yearLevelFilter !== 'all' || programFilter !== 'all' ? (
                <>
                  <p className="manage-students-empty-text">No students found matching current filters</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setYearLevelFilter('all');
                      setProgramFilter('all');
                    }}
                    className="manage-students-empty-action"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="manage-students-empty-text">No students available</p>
                  <button 
                    onClick={openAddModal}
                    className="manage-students-empty-action"
                  >
                    <PlusCircle size={16} className="manage-students-button-icon-small" />
                    Add your first student
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="manage-students-table-scroll">
              <table className="manage-students-table">
                <thead>
                  <tr>
                    <th>Student Number</th>
                    <th>Name</th>
                    <th>Year Level</th>
                    <th>Program</th>
                    <th>Birthday</th>
                    <th className="manage-students-actions-header">
                      <div className="manage-students-filter-header">
                        Actions
                        <div className="manage-students-filter-container">
                          <button
                            className="manage-students-filter-button"
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                          >
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                            <span className="manage-students-filter-text">{getFilterDisplayText}</span>
                            <svg 
                              width="12" 
                              height="12" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                              className={`manage-students-filter-chevron ${showFilterDropdown ? 'manage-students-filter-chevron-open' : ''}`}
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {showFilterDropdown && (
                            <div className="manage-students-filter-dropdown">
                              <div className="manage-students-filter-section">
                                <h4 className="manage-students-filter-section-title">Sort</h4>
                                <button
                                  className={`manage-students-filter-option ${sortOrder === 'latest' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('sort', 'latest')}
                                >
                                  Latest
                                </button>
                                <button
                                  className={`manage-students-filter-option ${sortOrder === 'oldest' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('sort', 'oldest')}
                                >
                                  Oldest
                                </button>
                              </div>
                              
                              <div className="manage-students-filter-section">
                                <h4 className="manage-students-filter-section-title">Year Level</h4>
                                <button
                                  className={`manage-students-filter-option ${yearLevelFilter === 'all' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('yearLevel', 'all')}
                                >
                                  All Years
                                </button>
                                <button
                                  className={`manage-students-filter-option ${yearLevelFilter === '1' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('yearLevel', '1')}
                                >
                                  Year 1
                                </button>
                                <button
                                  className={`manage-students-filter-option ${yearLevelFilter === '2' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('yearLevel', '2')}
                                >
                                  Year 2
                                </button>
                                <button
                                  className={`manage-students-filter-option ${yearLevelFilter === '3' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('yearLevel', '3')}
                                >
                                  Year 3
                                </button>
                                <button
                                  className={`manage-students-filter-option ${yearLevelFilter === '4' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('yearLevel', '4')}
                                >
                                  Year 4
                                </button>
                              </div>

                              <div className="manage-students-filter-section">
                                <h4 className="manage-students-filter-section-title">Program</h4>
                                <button
                                  className={`manage-students-filter-option ${programFilter === 'all' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('program', 'all')}
                                >
                                  All Programs
                                </button>
                                <button
                                  className={`manage-students-filter-option ${programFilter === 'bscs' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('program', 'bscs')}
                                >
                                  BSCS
                                </button>
                                <button
                                  className={`manage-students-filter-option ${programFilter === 'bsit' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('program', 'bsit')}
                                >
                                  BSIT
                                </button>
                                <button
                                  className={`manage-students-filter-option ${programFilter === 'bsis' ? 'manage-students-filter-option-active' : ''}`}
                                  onClick={() => handleFilterChange('program', 'bsis')}
                                >
                                  BSIS
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      onEdit={openEditModal}
                      onDelete={confirmDelete}
                      getYearLevelBadgeClass={getYearLevelBadgeClass}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="manage-students-modal-overlay">
          <div className="manage-students-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="manage-students-modal-body">
              <h2 className="manage-students-modal-title">
                {modalMode === 'add' ? 'Add New Student' : 'Edit Student'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="manage-students-form-group">
                  <label htmlFor="studentNumber" className="manage-students-form-label">
                    Student Number*
                  </label>
                  <input
                    type="text"
                    id="studentNumber"
                    name="studentNumber"
                    value={currentStudent.studentNumber}
                    onChange={handleInputChange}
                    className="manage-students-form-input"
                    placeholder="e.g., 2024-00001"
                    required
                  />
                </div>
                <div className="manage-students-form-row">
                  <div className="manage-students-form-group">
                    <label htmlFor="firstName" className="manage-students-form-label">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={currentStudent.firstName}
                      onChange={handleInputChange}
                      className="manage-students-form-input"
                      required
                    />
                  </div>
                  <div className="manage-students-form-group">
                    <label htmlFor="lastName" className="manage-students-form-label">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={currentStudent.lastName}
                      onChange={handleInputChange}
                      className="manage-students-form-input"
                      required
                    />
                  </div>
                </div>
                <div className="manage-students-form-row">
                  <div className="manage-students-form-group">
                    <label htmlFor="yearLevel" className="manage-students-form-label">
                      Year Level*
                    </label>
                    <select
                      id="yearLevel"
                      name="yearLevel"
                      value={currentStudent.yearLevel}
                      onChange={handleInputChange}
                      className="manage-students-form-select"
                      required
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                  <div className="manage-students-form-group">
                    <label htmlFor="program" className="manage-students-form-label">
                      Program*
                    </label>
                    <select
                      id="program"
                      name="program"
                      value={currentStudent.program}
                      onChange={handleInputChange}
                      className="manage-students-form-select"
                      required
                    >
                      <option value="">Select Program</option>
                      <option value="bscs">BSCS - Computer Science</option>
                      <option value="bsit">BSIT - Information Technology</option>
                      <option value="bsis">BSIS - Information Systems</option>
                    </select>
                  </div>
                </div>
                <div className="manage-students-form-group">
                  <label htmlFor="birthday" className="manage-students-form-label">
                    Birthday*
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={currentStudent.birthday}
                    onChange={handleInputChange}
                    className="manage-students-form-input"
                    required
                  />
                </div>
                <div className="manage-students-form-group">
                  <label htmlFor="email" className="manage-students-form-label">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={currentStudent.email}
                    onChange={handleInputChange}
                    className="manage-students-form-input"
                    required
                  />
                </div>
                <div className="manage-students-form-group">
                  <label htmlFor="password" className="manage-students-form-label">
                    {modalMode === 'add' ? 'Password*' : 'Password (leave empty to keep current)'}
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      id="password"
                      name="password"
                      value={currentStudent.password}
                      onChange={handleInputChange}
                      className="manage-students-form-input"
                      required={modalMode === 'add'}
                      readOnly={modalMode === 'add'}
                      style={{ flex: 1 }}
                    />
                    {modalMode === 'add' && (
                      <button
                        type="button"
                        onClick={() => setCurrentStudent({...currentStudent, password: generateRandomPassword()})}
                        className="manage-students-button-generate"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                  {modalMode === 'add' && (
                    <p className="manage-students-form-hint">Password auto-generated (12 characters). Will be sent to student's email.</p>
                  )}
                </div>
                    
                <div className="manage-students-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="manage-students-button manage-students-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="manage-students-button manage-students-button-primary"
                  >
                    <Save size={18} className="manage-students-button-icon" />
                    {modalMode === 'add' ? 'Create Student' : 'Update Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="manage-students-modal-overlay">
          <div className="manage-students-confirm-modal">
            <h3 className="manage-students-confirm-title">Confirm Delete</h3>
            <p className="manage-students-confirm-text">Are you sure you want to delete this student? This action cannot be undone.</p>
            <div className="manage-students-confirm-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="manage-students-button manage-students-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="manage-students-button manage-students-button-danger"
              >
                <Trash2 size={18} className="manage-students-button-icon" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;