import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import '../../components/AdminLayout/ManageInstructors.css';

// Mock data for departments
const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Computer Science', instructor_count: 5 },
  { id: 2, name: 'Information Technology', instructor_count: 3 },
  { id: 3, name: 'Information Systems', instructor_count: 4 },
];

// Mock data for instructors
const MOCK_INSTRUCTORS = {
  1: [ // Computer Science
    { id: 1, instructorId: 'INS-2024-001', firstName: 'John', lastName: 'Doe', fields: 'Programming, Algorithms', email: 'john.doe@example.com', departmentId: 1 },
    { id: 2, instructorId: 'INS-2024-002', firstName: 'Jane', lastName: 'Smith', fields: 'Database, Data Structures', email: 'jane.smith@example.com', departmentId: 1 },
    { id: 3, instructorId: 'INS-2024-003', firstName: 'Michael', lastName: 'Johnson', fields: 'Web Development, UI/UX', email: 'michael.j@example.com', departmentId: 1 },
    { id: 4, instructorId: 'INS-2024-004', firstName: 'Sarah', lastName: 'Williams', fields: 'Machine Learning, AI', email: 'sarah.w@example.com', departmentId: 1 },
    { id: 5, instructorId: 'INS-2024-005', firstName: 'David', lastName: 'Brown', fields: 'Software Engineering', email: 'david.b@example.com', departmentId: 1 },
  ],
  2: [ // Information Technology
    { id: 6, instructorId: 'INS-2024-006', firstName: 'Emily', lastName: 'Davis', fields: 'Network Security, Cybersecurity', email: 'emily.d@example.com', departmentId: 2 },
    { id: 7, instructorId: 'INS-2024-007', firstName: 'Robert', lastName: 'Miller', fields: 'Cloud Computing, DevOps', email: 'robert.m@example.com', departmentId: 2 },
    { id: 8, instructorId: 'INS-2024-008', firstName: 'Lisa', lastName: 'Wilson', fields: 'IT Infrastructure', email: 'lisa.w@example.com', departmentId: 2 },
  ],
  3: [ // Information Systems
    { id: 9, instructorId: 'INS-2024-009', firstName: 'James', lastName: 'Moore', fields: 'Systems Analysis, Business Intelligence', email: 'james.m@example.com', departmentId: 3 },
    { id: 10, instructorId: 'INS-2024-010', firstName: 'Patricia', lastName: 'Taylor', fields: 'Enterprise Systems, ERP', email: 'patricia.t@example.com', departmentId: 3 },
    { id: 11, instructorId: 'INS-2024-011', firstName: 'Daniel', lastName: 'Anderson', fields: 'Data Analytics, Business Process', email: 'daniel.a@example.com', departmentId: 3 },
    { id: 12, instructorId: 'INS-2024-012', firstName: 'Nancy', lastName: 'Thomas', fields: 'Project Management, Agile', email: 'nancy.t@example.com', departmentId: 3 },
  ],
};

// Memoized instructor row component
const InstructorRow = React.memo(({ instructor, onEdit, onDelete }) => (
  <tr>
    <td data-label="Instructor ID: ">
      <div className="svcc-manage-instructor-id">{instructor.instructorId}</div>
    </td>
    <td data-label="Name: ">
      <div className="svcc-manage-instructor-name">{instructor.firstName} {instructor.lastName}</div>
    </td>
    <td data-label="Fields: ">
      <div className="svcc-manage-instructor-fields">{instructor.fields || 'N/A'}</div>
    </td>
    <td data-label="Actions: " className="svcc-manage-instructor-actions-cell">
      <div className="svcc-manage-instructor-actions-buttons">
        <button
          onClick={() => onEdit(instructor)}
          className="svcc-manage-instructor-action-button svcc-manage-instructor-edit-button"
          title="Edit instructor"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(instructor.id)}
          className="svcc-manage-instructor-action-button svcc-manage-instructor-delete-button"
          title="Delete instructor"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </td>
  </tr>
));

InstructorRow.displayName = 'InstructorRow';

const ManageInstructors = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'view'
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // ID counters for new items
  const [nextDepartmentId, setNextDepartmentId] = useState(4);
  const [nextInstructorId, setNextInstructorId] = useState(13);
  
  // Modal states
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'department' or 'instructor'
  
  // Form states
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentDepartment, setCurrentDepartment] = useState({
    id: '',
    name: ''
  });
  const [currentInstructor, setCurrentInstructor] = useState({
    id: '',
    instructorId: '',
    firstName: '',
    lastName: '',
    fields: '',
    email: '',
    password: ''
  });
  
  // Search and filter states
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [instructorSearchTerm, setInstructorSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Message state
  const [message, setMessage] = useState({ text: '', type: '' });

  // Initialize with mock data
  useEffect(() => {
    setDepartments(MOCK_DEPARTMENTS);
  }, []);

  // Apply filters to instructors
  useEffect(() => {
    if (currentView === 'view') {
      applyFilters();
    }
  }, [instructorSearchTerm, instructors, sortOrder]);

  const applyFilters = useCallback(() => {
    let filtered = [...instructors];

    // Apply search filter
    if (instructorSearchTerm) {
      const searchLower = instructorSearchTerm.toLowerCase();
      filtered = filtered.filter(instructor => 
        (instructor.instructorId || '').toLowerCase().includes(searchLower) ||
        (instructor.firstName || '').toLowerCase().includes(searchLower) ||
        (instructor.lastName || '').toLowerCase().includes(searchLower) ||
        (instructor.fields || '').toLowerCase().includes(searchLower)
      );
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

    setFilteredInstructors(filtered);
  }, [instructors, instructorSearchTerm, sortOrder]);

  // Generate random password
  const generateRandomPassword = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }, []);

  // Department handlers
  const openAddDepartmentModal = useCallback(() => {
    setCurrentDepartment({ id: '', name: '' });
    setModalMode('add');
    setShowDepartmentModal(true);
  }, []);

  const openEditDepartmentModal = useCallback((department) => {
    setCurrentDepartment(department);
    setModalMode('edit');
    setShowDepartmentModal(true);
  }, []);

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentDepartment.name) {
      setMessage({ text: 'Please enter department name', type: 'error' });
      return;
    }
    
    if (modalMode === 'add') {
      // Add new department
      const newDept = {
        id: nextDepartmentId,
        name: currentDepartment.name,
        instructor_count: 0
      };
      setDepartments([...departments, newDept]);
      setNextDepartmentId(nextDepartmentId + 1);
      setMessage({ text: 'Department added successfully', type: 'success' });
    } else {
      // Edit existing department
      setDepartments(departments.map(dept => 
        dept.id === currentDepartment.id 
          ? { ...dept, name: currentDepartment.name }
          : dept
      ));
      setMessage({ text: 'Department updated successfully', type: 'success' });
      
      // Update selected department if viewing it
      if (selectedDepartment && selectedDepartment.id === currentDepartment.id) {
        setSelectedDepartment({ ...selectedDepartment, name: currentDepartment.name });
      }
    }
    
    setShowDepartmentModal(false);
  };

  // Instructor handlers
  const openAddInstructorModal = useCallback(() => {
    const generatedPassword = generateRandomPassword();
    setCurrentInstructor({
      id: '',
      instructorId: '',
      firstName: '',
      lastName: '',
      fields: '',
      email: '',
      password: generatedPassword
    });
    setModalMode('add');
    setShowInstructorModal(true);
  }, [generateRandomPassword]);

  const openEditInstructorModal = useCallback((instructor) => {
    setCurrentInstructor({
      ...instructor,
      password: ''
    });
    setModalMode('edit');
    setShowInstructorModal(true);
  }, []);

  const handleInstructorSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentInstructor.instructorId || !currentInstructor.firstName || 
        !currentInstructor.lastName || !currentInstructor.fields || !currentInstructor.email) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentInstructor.email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    if (modalMode === 'add' && (!currentInstructor.password || currentInstructor.password.length < 12)) {
      setMessage({ text: 'Password must be at least 12 characters', type: 'error' });
      return;
    }
    
    if (modalMode === 'add') {
      // Add new instructor
      const newInstructor = {
        ...currentInstructor,
        id: nextInstructorId,
        departmentId: selectedDepartment.id
      };
      setInstructors([...instructors, newInstructor]);
      setNextInstructorId(nextInstructorId + 1);
      
      // Update department instructor count
      setDepartments(departments.map(dept =>
        dept.id === selectedDepartment.id
          ? { ...dept, instructor_count: dept.instructor_count + 1 }
          : dept
      ));
      
      setMessage({ text: 'Instructor added successfully', type: 'success' });
    } else {
      // Edit existing instructor
      setInstructors(instructors.map(inst =>
        inst.id === currentInstructor.id
          ? { ...inst, ...currentInstructor }
          : inst
      ));
      setMessage({ text: 'Instructor updated successfully', type: 'success' });
    }
    
    setShowInstructorModal(false);
  };

  // Delete handlers
  const confirmDelete = useCallback((id, type) => {
    setDeleteId(id);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = async () => {
    if (deleteType === 'department') {
      // Delete department
      setDepartments(departments.filter(dept => dept.id !== deleteId));
      setMessage({ text: 'Department deleted successfully', type: 'success' });
      
      if (selectedDepartment && selectedDepartment.id === deleteId) {
        setCurrentView('list');
        setSelectedDepartment(null);
      }
    } else {
      // Delete instructor
      setInstructors(instructors.filter(inst => inst.id !== deleteId));
      
      // Update department instructor count
      setDepartments(departments.map(dept =>
        dept.id === selectedDepartment.id
          ? { ...dept, instructor_count: Math.max(0, dept.instructor_count - 1) }
          : dept
      ));
      
      setMessage({ text: 'Instructor deleted successfully', type: 'success' });
    }
    
    setShowDeleteConfirm(false);
    setDeleteId(null);
    setDeleteType('');
  };

  // View handlers
  const handleViewDepartment = (department) => {
    setSelectedDepartment(department);
    setCurrentView('view');
    // Load instructors from mock data
    const deptInstructors = MOCK_INSTRUCTORS[department.id] || [];
    setInstructors(deptInstructors);
    setInstructorSearchTerm('');
    setSortOrder('latest');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDepartment(null);
    setInstructorSearchTerm('');
  };

  const handleFilterChange = useCallback((value) => {
    setSortOrder(value);
    setShowFilterDropdown(false);
  }, []);

  const getFilterDisplayText = useMemo(() => {
    return sortOrder === 'latest' ? 'Latest' : 'Oldest';
  }, [sortOrder]);

  // Filter departments by search term
  const filteredDepartments = useMemo(() => {
    // Ensure departments is always an array
    const deptArray = Array.isArray(departments) ? departments : [];
    if (!departmentSearchTerm) return deptArray;
    const searchLower = departmentSearchTerm.toLowerCase();
    return deptArray.filter(dept => 
      dept.name.toLowerCase().includes(searchLower)
    );
  }, [departments, departmentSearchTerm]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Render department list view
  const renderListView = () => (
    <div className="svcc-manage-instructor-container">
      <div className="svcc-manage-instructor-header-card">
        <div className="svcc-manage-instructor-header-content">
          <h1 className="svcc-manage-instructor-page-title">Manage Instructor Accounts</h1>
          <div className="svcc-manage-instructor-header-actions">
            <div className="svcc-manage-instructor-search-container">
              <input
                type="text"
                placeholder="Search departments..."
                className="svcc-manage-instructor-search-input"
                value={departmentSearchTerm}
                onChange={(e) => setDepartmentSearchTerm(e.target.value)}
              />
              <Search className="svcc-manage-instructor-search-icon" size={18} />
              {departmentSearchTerm && (
                <button 
                  onClick={() => setDepartmentSearchTerm('')}
                  className="svcc-manage-instructor-search-clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              onClick={openAddDepartmentModal}
              className="svcc-manage-instructor-add-button"
            >
              <PlusCircle size={18} className="svcc-manage-instructor-button-icon" />
              Add Department
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`svcc-manage-instructor-message ${message.type === 'success' ? 'svcc-manage-instructor-message-success' : 'svcc-manage-instructor-message-error'}`}>
          <AlertCircle size={20} className="svcc-manage-instructor-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="svcc-manage-instructor-departments-container">
        {isLoading ? (
          <div className="svcc-manage-instructor-loading-container">
            <div className="svcc-manage-instructor-loading-spinner"></div>
            <p className="svcc-manage-instructor-loading-text">Loading departments...</p>
          </div>
        ) : isError ? (
          <div className="svcc-manage-instructor-error-container">
            <AlertCircle size={40} className="svcc-manage-instructor-error-icon" />
            <p className="svcc-manage-instructor-error-text">Failed to load departments</p>
            <button 
              onClick={() => {
                setIsError(false);
                setDepartments(MOCK_DEPARTMENTS);
              }}
              className="svcc-manage-instructor-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="svcc-manage-instructor-empty-container">
            {departmentSearchTerm ? (
              <>
                <p className="svcc-manage-instructor-empty-text">No departments found matching "{departmentSearchTerm}"</p>
                <button 
                  onClick={() => setDepartmentSearchTerm('')}
                  className="svcc-manage-instructor-empty-action"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p className="svcc-manage-instructor-empty-text">No departments available</p>
                <button 
                  onClick={openAddDepartmentModal}
                  className="svcc-manage-instructor-empty-action"
                >
                  <PlusCircle size={16} className="svcc-manage-instructor-button-icon-small" />
                  Add your first department
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="svcc-manage-instructor-departments-grid">
            {filteredDepartments.map((department) => (
              <div key={department.id} className="svcc-manage-instructor-department-card">
               <div className="svcc-manage-instructor-card-header">
                  <h3 className="svcc-manage-instructor-department-name">{department.name}</h3>
                  <div className="svcc-manage-instructor-card-actions">
                    <button
                      onClick={() => handleViewDepartment(department)}
                      className="svcc-manage-instructor-btn svcc-manage-instructor-btn-view"
                    >
                      View
                    </button>
                    <div className="svcc-manage-instructor-manage-dropdown">
                      <button
                        onClick={() => {
                          const currentOpen = document.querySelector('.svcc-manage-instructor-manage-dropdown.open');
                          if (currentOpen && currentOpen !== document.querySelector(`[data-dept-id="${department.id}"]`)?.closest('.svcc-manage-instructor-manage-dropdown')) {
                            currentOpen.classList.remove('open');
                          }
                          document.querySelector(`[data-dept-id="${department.id}"]`)?.closest('.svcc-manage-instructor-manage-dropdown')?.classList.toggle('open');
                        }}
                        className="svcc-manage-instructor-btn svcc-manage-instructor-btn-manage"
                        data-dept-id={department.id}
                      >
                        Manage
                        <ChevronDown size={16} className="svcc-manage-instructor-manage-chevron" />
                      </button>
                      <div className="svcc-manage-instructor-manage-dropdown-menu">
                        <button
                          onClick={() => {
                            document.querySelector(`[data-dept-id="${department.id}"]`)?.closest('.svcc-manage-instructor-manage-dropdown')?.classList.remove('open');
                            openEditDepartmentModal(department);
                          }}
                          className="svcc-manage-instructor-manage-dropdown-item"
                        >
                          <Edit2 size={16} />
                          Edit Department
                        </button>
                        <button
                          onClick={() => {
                            document.querySelector(`[data-dept-id="${department.id}"]`)?.closest('.svcc-manage-instructor-manage-dropdown')?.classList.remove('open');
                            /* Add your assign program head handler here */
                          }}
                          className="svcc-manage-instructor-manage-dropdown-item"
                        >
                          <PlusCircle size={16} />
                          Assign Program Head
                        </button>
                        <button
                          onClick={() => {
                            document.querySelector(`[data-dept-id="${department.id}"]`)?.closest('.svcc-manage-instructor-manage-dropdown')?.classList.remove('open');
                            confirmDelete(department.id, 'department');
                          }}
                          className="svcc-manage-instructor-manage-dropdown-item svcc-manage-instructor-manage-dropdown-item-delete"
                        >
                          <Trash2 size={16} />
                          Delete Department
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="svcc-manage-instructor-card-content">
                  <div className="svcc-manage-instructor-info-item">
                    <span className="svcc-manage-instructor-info-label">No. of Instructors:</span>
                    <span className="svcc-manage-instructor-info-value">{department.instructor_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render department view with instructors
  const renderDepartmentView = () => (
    <div className="svcc-manage-instructor-container">
      <div className="svcc-manage-instructor-header-card">
        <div className="svcc-manage-instructor-header-content">
          <div className="svcc-manage-instructor-title-with-back">
            <button
              onClick={handleBackToList}
              className="svcc-manage-instructor-back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="svcc-manage-instructor-page-title">{selectedDepartment?.name}</h1>
          </div>
          <div className="svcc-manage-instructor-header-actions">
            <div className="svcc-manage-instructor-search-container">
              <input
                type="text"
                placeholder="Search instructors..."
                className="svcc-manage-instructor-search-input"
                value={instructorSearchTerm}
                onChange={(e) => setInstructorSearchTerm(e.target.value)}
              />
              <Search className="svcc-manage-instructor-search-icon" size={18} />
              {instructorSearchTerm && (
                <button 
                  onClick={() => setInstructorSearchTerm('')}
                  className="svcc-manage-instructor-search-clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Mobile Filter */}
            <div className="svcc-manage-instructor-mobile-filter-container">
              <button
                className="svcc-manage-instructor-filter-button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                <span className="svcc-manage-instructor-filter-text">{getFilterDisplayText}</span>
                <ChevronDown
                  size={12}
                  className={`svcc-manage-instructor-filter-chevron ${showFilterDropdown ? 'svcc-manage-instructor-filter-chevron-open' : ''}`}
                />
              </button>
              
              {showFilterDropdown && (
                <div className="svcc-manage-instructor-filter-dropdown">
                  <div className="svcc-manage-instructor-filter-section">
                    <h4 className="svcc-manage-instructor-filter-section-title">Sort</h4>
                    <button
                      className={`svcc-manage-instructor-filter-option ${sortOrder === 'latest' ? 'svcc-manage-instructor-filter-option-active' : ''}`}
                      onClick={() => handleFilterChange('latest')}
                    >
                      Latest
                    </button>
                    <button
                      className={`svcc-manage-instructor-filter-option ${sortOrder === 'oldest' ? 'svcc-manage-instructor-filter-option-active' : ''}`}
                      onClick={() => handleFilterChange('oldest')}
                    >
                      Oldest
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={openAddInstructorModal}
              className="svcc-manage-instructor-add-button"
            >
              <PlusCircle size={18} className="svcc-manage-instructor-button-icon" />
              Add Instructor
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`svcc-manage-instructor-message ${message.type === 'success' ? 'svcc-manage-instructor-message-success' : 'svcc-manage-instructor-message-error'}`}>
          <AlertCircle size={20} className="svcc-manage-instructor-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="svcc-manage-instructor-table-container">
        {isLoading ? (
          <div className="svcc-manage-instructor-loading-container">
            <div className="svcc-manage-instructor-loading-spinner"></div>
            <p className="svcc-manage-instructor-loading-text">Loading instructors...</p>
          </div>
        ) : isError ? (
          <div className="svcc-manage-instructor-error-container">
            <AlertCircle size={40} className="svcc-manage-instructor-error-icon" />
            <p className="svcc-manage-instructor-error-text">Failed to load instructors</p>
            <button 
              onClick={() => {
                setIsError(false);
                const deptInstructors = MOCK_INSTRUCTORS[selectedDepartment.id] || [];
                setInstructors(deptInstructors);
              }}
              className="svcc-manage-instructor-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="svcc-manage-instructor-empty-container">
            {instructorSearchTerm ? (
              <>
                <p className="svcc-manage-instructor-empty-text">No instructors found matching current filters</p>
                <button 
                  onClick={() => setInstructorSearchTerm('')}
                  className="svcc-manage-instructor-empty-action"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="svcc-manage-instructor-empty-text">No instructors available</p>
                <button 
                  onClick={openAddInstructorModal}
                  className="svcc-manage-instructor-empty-action"
                >
                  <PlusCircle size={16} className="svcc-manage-instructor-button-icon-small" />
                  Add your first instructor
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="svcc-manage-instructor-table-scroll">
            <table className="svcc-manage-instructor-table">
              <thead>
                <tr>
                  <th>Instructor ID</th>
                  <th>Name</th>
                  <th>Fields</th>
                  <th className="svcc-manage-instructor-actions-header">
                    <div className="svcc-manage-instructor-filter-header">
                      Actions
                      <div className="svcc-manage-instructor-filter-container">
                        <button
                          className="svcc-manage-instructor-filter-button"
                          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                          </svg>
                          <span className="svcc-manage-instructor-filter-text">{getFilterDisplayText}</span>
                          <ChevronDown
                            size={12}
                            className={`svcc-manage-instructor-filter-chevron ${showFilterDropdown ? 'svcc-manage-instructor-filter-chevron-open' : ''}`}
                          />
                        </button>
                        
                        {showFilterDropdown && (
                          <div className="svcc-manage-instructor-filter-dropdown">
                            <div className="svcc-manage-instructor-filter-section">
                              <h4 className="svcc-manage-instructor-filter-section-title">Sort</h4>
                              <button
                                className={`svcc-manage-instructor-filter-option ${sortOrder === 'latest' ? 'svcc-manage-instructor-filter-option-active' : ''}`}
                                onClick={() => handleFilterChange('latest')}
                              >
                                Latest
                              </button>
                              <button
                                className={`svcc-manage-instructor-filter-option ${sortOrder === 'oldest' ? 'svcc-manage-instructor-filter-option-active' : ''}`}
                                onClick={() => handleFilterChange('oldest')}
                              >
                                Oldest
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
                {filteredInstructors.map((instructor) => (
                  <InstructorRow
                    key={instructor.id}
                    instructor={instructor}
                    onEdit={openEditInstructorModal}
                    onDelete={(id) => confirmDelete(id, 'instructor')}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {currentView === 'list' ? renderListView() : renderDepartmentView()}

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="svcc-manage-instructor-modal-overlay">
          <div className="svcc-manage-instructor-modal-content">
            <div className="svcc-manage-instructor-modal-body">
              <h2 className="svcc-manage-instructor-modal-title">
                {modalMode === 'add' ? 'Add New Department' : 'Edit Department'}
              </h2>
              <form onSubmit={handleDepartmentSubmit}>
                <div className="svcc-manage-instructor-form-group">
                  <label htmlFor="departmentName" className="svcc-manage-instructor-form-label">
                    Department Name*
                  </label>
                  <input
                    type="text"
                    id="departmentName"
                    name="name"
                    value={currentDepartment.name}
                    onChange={(e) => setCurrentDepartment({...currentDepartment, name: e.target.value})}
                    className="svcc-manage-instructor-form-input"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                    
                <div className="svcc-manage-instructor-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowDepartmentModal(false)}
                    className="svcc-manage-instructor-button svcc-manage-instructor-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="svcc-manage-instructor-button svcc-manage-instructor-button-primary"
                  >
                    <Save size={18} className="svcc-manage-instructor-button-icon" />
                    {modalMode === 'add' ? 'Create Department' : 'Update Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Instructor Modal */}
      {showInstructorModal && (
        <div className="svcc-manage-instructor-modal-overlay">
          <div className="svcc-manage-instructor-modal-content">
            <div className="svcc-manage-instructor-modal-body">
              <h2 className="svcc-manage-instructor-modal-title">
                {modalMode === 'add' ? 'Add New Instructor' : 'Edit Instructor'}
              </h2>
              <form onSubmit={handleInstructorSubmit}>
                <div className="svcc-manage-instructor-form-group">
                  <label htmlFor="instructorId" className="svcc-manage-instructor-form-label">
                    Instructor ID*
                  </label>
                  <input
                    type="text"
                    id="instructorId"
                    name="instructorId"
                    value={currentInstructor.instructorId}
                    onChange={(e) => setCurrentInstructor({...currentInstructor, instructorId: e.target.value})}
                    className="svcc-manage-instructor-form-input"
                    placeholder="e.g., INS-2024-001"
                    required
                  />
                </div>
                <div className="svcc-manage-instructor-form-row">
                  <div className="svcc-manage-instructor-form-group">
                    <label htmlFor="firstName" className="svcc-manage-instructor-form-label">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={currentInstructor.firstName}
                      onChange={(e) => setCurrentInstructor({...currentInstructor, firstName: e.target.value})}
                      className="svcc-manage-instructor-form-input"
                      required
                    />
                  </div>
                  <div className="svcc-manage-instructor-form-group">
                    <label htmlFor="lastName" className="svcc-manage-instructor-form-label">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={currentInstructor.lastName}
                      onChange={(e) => setCurrentInstructor({...currentInstructor, lastName: e.target.value})}
                      className="svcc-manage-instructor-form-input"
                      required
                    />
                  </div>
                </div>
                <div className="svcc-manage-instructor-form-group">
                  <label htmlFor="fields" className="svcc-manage-instructor-form-label">
                    Fields of Specialization*
                  </label>
                  <input
                    type="text"
                    id="fields"
                    name="fields"
                    value={currentInstructor.fields}
                    onChange={(e) => setCurrentInstructor({...currentInstructor, fields: e.target.value})}
                    className="svcc-manage-instructor-form-input"
                    placeholder="e.g., Programming, Database, Networking"
                    required
                  />
                </div>
                <div className="svcc-manage-instructor-form-group">
                  <label htmlFor="email" className="svcc-manage-instructor-form-label">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={currentInstructor.email}
                    onChange={(e) => setCurrentInstructor({...currentInstructor, email: e.target.value})}
                    className="svcc-manage-instructor-form-input"
                    required
                  />
                </div>
                <div className="svcc-manage-instructor-form-group">
                  <label htmlFor="password" className="svcc-manage-instructor-form-label">
                    {modalMode === 'add' ? 'Password*' : 'Password (leave empty to keep current)'}
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      id="password"
                      name="password"
                      value={currentInstructor.password}
                      onChange={(e) => setCurrentInstructor({...currentInstructor, password: e.target.value})}
                      className="svcc-manage-instructor-form-input"
                      required={modalMode === 'add'}
                      readOnly={modalMode === 'add'}
                      style={{ flex: 1 }}
                    />
                    {modalMode === 'add' && (
                      <button
                        type="button"
                        onClick={() => setCurrentInstructor({...currentInstructor, password: generateRandomPassword()})}
                        className="svcc-manage-instructor-button-generate"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                  {modalMode === 'add' && (
                    <p className="svcc-manage-instructor-form-hint">Password auto-generated (12 characters). Will be sent to instructor's email.</p>
                  )}
                </div>
                    
                <div className="svcc-manage-instructor-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowInstructorModal(false)}
                    className="svcc-manage-instructor-button svcc-manage-instructor-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="svcc-manage-instructor-button svcc-manage-instructor-button-primary"
                  >
                    <Save size={18} className="svcc-manage-instructor-button-icon" />
                    {modalMode === 'add' ? 'Create Instructor' : 'Update Instructor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="svcc-manage-instructor-modal-overlay">
          <div className="svcc-manage-instructor-confirm-modal">
            <h3 className="svcc-manage-instructor-confirm-title">Confirm Delete</h3>
            <p className="svcc-manage-instructor-confirm-text">
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </p>
            <div className="svcc-manage-instructor-confirm-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="svcc-manage-instructor-button svcc-manage-instructor-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="svcc-manage-instructor-button svcc-manage-instructor-button-danger"
              >
                <Trash2 size={18} className="svcc-manage-instructor-button-icon" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageInstructors;