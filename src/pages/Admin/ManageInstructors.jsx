import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import '../../components/AdminLayout/ManageInstructors.css';

// Memoized instructor row component
const InstructorRow = React.memo(({ instructor, onEdit, onDelete }) => (
  <tr>
    <td data-label="Instructor ID: ">
      <div className="svcc-manage-instructor-id">{instructor.instructor_id}</div>
    </td>
    <td data-label="Name: ">
      <div className="svcc-manage-instructor-name">{instructor.firstName} {instructor.lastName}</div>
    </td>
    <td data-label="Email: ">
      <div className="svcc-manage-instructor-email">{instructor.email || 'N/A'}</div>
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
          onClick={() => onDelete(instructor.user_id)}
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
  const [currentView, setCurrentView] = useState('list');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [programHeads, setProgramHeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Modal states
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignHeadModal, setShowAssignHeadModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  
  // Form states
  const [modalMode, setModalMode] = useState('add');
  const [currentDepartment, setCurrentDepartment] = useState({
    department_id: '',
    department_name: '',
    department_code: ''
  });
  const [currentInstructor, setCurrentInstructor] = useState({
    user_id: '',
    instructor_id: '',
    firstName: '',
    lastName: '',
    birthday: '',
    email: '',
    password: ''
  });
  const [selectedHeadId, setSelectedHeadId] = useState('');
  
  // Search states
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [instructorSearchTerm, setInstructorSearchTerm] = useState('');
  
  // Message state
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_URL = 'http://localhost/svcc-enrollment';

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  // Fetch departments
  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/departments.php`);
      if (Array.isArray(response.data)) {
        setDepartments(response.data);
        setIsError(false);
      } else {
        console.error('API returned non-array:', response.data);
        setDepartments([]);
        setIsError(true);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch instructors for specific department
  const fetchInstructors = async (departmentCode) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fetch_accounts.php?role=instructor`);
      if (Array.isArray(response.data)) {
        const deptInstructors = response.data.filter(
          inst => inst.department === departmentCode
        );
        setInstructors(deptInstructors);
        setIsError(false);
      } else {
        console.error('API returned non-array:', response.data);
        setInstructors([]);
        setIsError(true);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructors([]);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch program heads for assignment
  const fetchProgramHeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/fetch_accounts.php?role=program_head`);
      if (Array.isArray(response.data)) {
        setProgramHeads(response.data);
      }
    } catch (error) {
      console.error('Error fetching program heads:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchProgramHeads();
  }, []);

  // Apply filters to instructors
  useEffect(() => {
    if (currentView === 'view') {
      applyFilters();
    }
  }, [instructorSearchTerm, instructors]);

  const applyFilters = useCallback(() => {
    let filtered = [...instructors];

    if (instructorSearchTerm) {
      const searchLower = instructorSearchTerm.toLowerCase();
      filtered = filtered.filter(instructor => 
        (instructor.instructor_id || '').toLowerCase().includes(searchLower) ||
        (instructor.firstName || '').toLowerCase().includes(searchLower) ||
        (instructor.lastName || '').toLowerCase().includes(searchLower) ||
        (instructor.email || '').toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => (b.user_id || 0) - (a.user_id || 0));

    setFilteredInstructors(filtered);
  }, [instructors, instructorSearchTerm]);

  // Generate password based on lastname + birthday
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
    if (modalMode === 'add' && currentInstructor.lastName && currentInstructor.birthday) {
      const autoPassword = generatePassword(currentInstructor.lastName, currentInstructor.birthday);
      setCurrentInstructor(prev => ({
        ...prev,
        password: autoPassword
      }));
    }
  }, [currentInstructor.lastName, currentInstructor.birthday, modalMode, generatePassword]);

  // Department handlers
  const openAddDepartmentModal = useCallback(() => {
    setCurrentDepartment({ department_id: '', department_name: '', department_code: '' });
    setModalMode('add');
    setShowDepartmentModal(true);
  }, []);

  const openEditDepartmentModal = useCallback((department) => {
    setCurrentDepartment({
      department_id: department.department_id,
      department_name: department.department_name,
      department_code: department.department_code
    });
    setModalMode('edit');
    setShowDepartmentModal(true);
  }, []);

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentDepartment.department_name || !currentDepartment.department_code) {
      setMessage({ text: 'Please fill all fields', type: 'error' });
      return;
    }
    
    try {
      if (modalMode === 'add') {
        const response = await axios.post(`${API_URL}/departments.php`, {
          department_name: currentDepartment.department_name,
          department_code: currentDepartment.department_code
        });
        
        if (response.data.success) {
          setMessage({ text: 'Department added successfully', type: 'success' });
          fetchDepartments();
        } else {
          setMessage({ text: response.data.message, type: 'error' });
        }
      } else {
        const response = await axios.put(`${API_URL}/departments.php`, {
          department_id: currentDepartment.department_id,
          department_name: currentDepartment.department_name
        });
        
        if (response.data.success) {
          setMessage({ text: 'Department updated successfully', type: 'success' });
          fetchDepartments();
          if (selectedDepartment?.department_id === currentDepartment.department_id) {
            setSelectedDepartment({...selectedDepartment, department_name: currentDepartment.department_name});
          }
        } else {
          setMessage({ text: response.data.message, type: 'error' });
        }
      }
      setShowDepartmentModal(false);
    } catch (error) {
      console.error('Error saving department:', error);
      setMessage({ text: 'An error occurred', type: 'error' });
    }
  };

  // Instructor handlers
  const openAddInstructorModal = useCallback(() => {
    setCurrentInstructor({
      user_id: '',
      instructor_id: '',
      firstName: '',
      lastName: '',
      birthday: '',
      email: '',
      password: ''
    });
    setModalMode('add');
    setShowInstructorModal(true);
  }, []);

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
    
    if (!currentInstructor.firstName || !currentInstructor.lastName || 
        !currentInstructor.birthday || !currentInstructor.email) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentInstructor.email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    if (modalMode === 'add' && !currentInstructor.password) {
      setMessage({ text: 'Password could not be generated', type: 'error' });
      return;
    }
    
    try {
      const url = modalMode === 'add' ? '/add_account.php' : '/update_accounts.php';
      const payload = {
        ...currentInstructor,
        role: 'instructor',
        department: selectedDepartment.department_code
      };
      
      const response = await axios.post(`${API_URL}${url}`, payload, { headers: auditHeaders });
      
      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        setShowInstructorModal(false);
        fetchInstructors(selectedDepartment.department_code);
        fetchDepartments();
      } else {
        setMessage({ text: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error saving instructor:', error);
      setMessage({ text: 'An error occurred', type: 'error' });
    }
  };

  // Assign program head
  const openAssignHeadModal = useCallback((department) => {
    setCurrentDepartment(department);
    setSelectedHeadId(department.assigned_head || '');
    setShowAssignHeadModal(true);
  }, []);

  const handleAssignHead = async () => {
    try {
      const response = await axios.put(`${API_URL}/departments.php`, {
        department_id: currentDepartment.department_id,
        assigned_head: selectedHeadId ? parseInt(selectedHeadId) : 0
      });
      
      if (response.data.success) {
        setMessage({ text: 'Program head assigned successfully', type: 'success' });
        fetchDepartments();
        setShowAssignHeadModal(false);
      } else {
        setMessage({ text: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error assigning head:', error);
      setMessage({ text: 'An error occurred', type: 'error' });
    }
  };

  // Delete handlers
  const confirmDelete = useCallback((id, type) => {
    setDeleteId(id);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = async () => {
    try {
      if (deleteType === 'department') {
        const response = await axios.delete(`${API_URL}/departments.php`, {
          data: { department_id: deleteId },
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data.success) {
          setMessage({ text: 'Department deleted successfully', type: 'success' });
          fetchDepartments();
          if (selectedDepartment?.department_id === deleteId) {
            setCurrentView('list');
            setSelectedDepartment(null);
          }
        } else {
          setMessage({ text: response.data.message, type: 'error' });
        }
      } else {
        const response = await axios.post(`${API_URL}/delete_account.php`,
          { user_id: deleteId },
          { headers: auditHeaders }  // ← replace existing headers
        );
        
        if (response.data.success) {
          setMessage({ text: 'Instructor deleted successfully', type: 'success' });
          fetchInstructors(selectedDepartment.department_code);
          fetchDepartments();
        } else {
          setMessage({ text: response.data.message, type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage({ text: 'An error occurred', type: 'error' });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setDeleteType('');
    }
  };

  // View handlers
  const handleViewDepartment = (department) => {
    setSelectedDepartment(department);
    setCurrentView('view');
    fetchInstructors(department.department_code);
    setInstructorSearchTerm('');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDepartment(null);
    setInstructorSearchTerm('');
  };

  // Filter departments by search
  const filteredDepartments = useMemo(() => {
    const deptArray = Array.isArray(departments) ? departments : [];
    if (!departmentSearchTerm) return deptArray;
    const searchLower = departmentSearchTerm.toLowerCase();
    return deptArray.filter(dept => 
      dept.department_name.toLowerCase().includes(searchLower)
    );
  }, [departments, departmentSearchTerm]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
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
                <button onClick={() => setDepartmentSearchTerm('')} className="svcc-manage-instructor-search-clear">
                  <X size={18} />
                </button>
              )}
            </div>
            <button onClick={openAddDepartmentModal} className="svcc-manage-instructor-add-button">
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
            <button onClick={fetchDepartments} className="svcc-manage-instructor-retry-button">Try Again</button>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="svcc-manage-instructor-empty-container">
            {departmentSearchTerm ? (
              <>
                <p className="svcc-manage-instructor-empty-text">No departments found</p>
                <button onClick={() => setDepartmentSearchTerm('')} className="svcc-manage-instructor-empty-action">
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p className="svcc-manage-instructor-empty-text">No departments available</p>
                <button onClick={openAddDepartmentModal} className="svcc-manage-instructor-empty-action">
                  <PlusCircle size={16} />
                  Add your first department
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="svcc-manage-instructor-departments-grid">
            {filteredDepartments.map((department) => (
              <div key={department.department_id} className="svcc-manage-instructor-department-card">
                <div className="svcc-manage-instructor-card-header">
                  <h3 className="svcc-manage-instructor-department-name">{department.department_name}</h3>
                  <div className="svcc-manage-instructor-card-actions">
                    <button
                      onClick={() => handleViewDepartment(department)}
                      className="svcc-manage-instructor-btn svcc-manage-instructor-btn-view"
                    >
                      View
                    </button>
                    <div className="svcc-manage-instructor-manage-dropdown">
                      <button
                        onClick={(e) => {
                          const dropdown = e.currentTarget.closest('.svcc-manage-instructor-manage-dropdown');
                          document.querySelectorAll('.svcc-manage-instructor-manage-dropdown.open').forEach(d => {
                            if (d !== dropdown) d.classList.remove('open');
                          });
                          dropdown.classList.toggle('open');
                        }}
                        className="svcc-manage-instructor-btn svcc-manage-instructor-btn-manage"
                      >
                        Manage
                        <ChevronDown size={16} className="svcc-manage-instructor-manage-chevron" />
                      </button>
                      <div className="svcc-manage-instructor-manage-dropdown-menu">
                        <button
                          onClick={() => {
                            document.querySelectorAll('.svcc-manage-instructor-manage-dropdown.open').forEach(d => d.classList.remove('open'));
                            openEditDepartmentModal(department);
                          }}
                          className="svcc-manage-instructor-manage-dropdown-item"
                        >
                          <Edit2 size={16} />
                          Edit Department
                        </button>
                        <button
                          onClick={() => {
                            document.querySelectorAll('.svcc-manage-instructor-manage-dropdown.open').forEach(d => d.classList.remove('open'));
                            openAssignHeadModal(department);
                          }}
                          className="svcc-manage-instructor-manage-dropdown-item"
                        >
                          <PlusCircle size={16} />
                          Assign Program Head
                        </button>
                        <button
                          onClick={() => {
                            document.querySelectorAll('.svcc-manage-instructor-manage-dropdown.open').forEach(d => d.classList.remove('open'));
                            confirmDelete(department.department_id, 'department');
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
                    <span className="svcc-manage-instructor-info-label">Instructors:</span>
                    <span className="svcc-manage-instructor-info-value">{department.instructor_count || 0}</span>
                  </div>
                  <div className="svcc-manage-instructor-info-item">
                    <span className="svcc-manage-instructor-info-label">Program Head:</span>
                    <span className="svcc-manage-instructor-info-value">
                      {department.assigned_head_name || 'Not Assigned'}
                    </span>
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
            <button onClick={handleBackToList} className="svcc-manage-instructor-back-button">
              <ArrowLeft size={20} />
            </button>
            <h1 className="svcc-manage-instructor-page-title">{selectedDepartment?.department_name}</h1>
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
                <button onClick={() => setInstructorSearchTerm('')} className="svcc-manage-instructor-search-clear">
                  <X size={18} />
                </button>
              )}
            </div>
            <button onClick={openAddInstructorModal} className="svcc-manage-instructor-add-button">
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
            <button onClick={() => fetchInstructors(selectedDepartment.department_code)} className="svcc-manage-instructor-retry-button">
              Try Again
            </button>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="svcc-manage-instructor-empty-container">
            {instructorSearchTerm ? (
              <>
                <p className="svcc-manage-instructor-empty-text">No instructors found</p>
                <button onClick={() => setInstructorSearchTerm('')} className="svcc-manage-instructor-empty-action">
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p className="svcc-manage-instructor-empty-text">No instructors available</p>
                <button onClick={openAddInstructorModal} className="svcc-manage-instructor-empty-action">
                  <PlusCircle size={16} />
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
                  <th>Email</th>
                  <th className="svcc-manage-instructor-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.map((instructor) => (
                  <InstructorRow
                    key={instructor.user_id}
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
                    value={currentDepartment.department_name}
                    onChange={(e) => setCurrentDepartment({...currentDepartment, department_name: e.target.value})}
                    className="svcc-manage-instructor-form-input"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                {modalMode === 'add' && (
                  <div className="svcc-manage-instructor-form-group">
                    <label htmlFor="departmentCode" className="svcc-manage-instructor-form-label">
                      Department Code*
                    </label>
                    <select
                      id="departmentCode"
                      value={currentDepartment.department_code}
                      onChange={(e) => setCurrentDepartment({...currentDepartment, department_code: e.target.value})}
                      className="svcc-manage-instructor-form-select"
                      required
                    >
                      <option value="">Select Code</option>
                      <option value="bscs">BSCS</option>
                      <option value="bsit">BSIT</option>
                      <option value="bsis">BSIS</option>
                    </select>
                  </div>
                )}
                <div className="svcc-manage-instructor-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowDepartmentModal(false)}
                    className="svcc-manage-instructor-button svcc-manage-instructor-button-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="svcc-manage-instructor-button svcc-manage-instructor-button-primary">
                    <Save size={18} />
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
                    value={currentInstructor.instructor_id}
                    onChange={(e) => setCurrentInstructor({...currentInstructor, instructor_id: e.target.value})}
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
                      value={currentInstructor.lastName}
                      onChange={(e) => setCurrentInstructor({...currentInstructor, lastName: e.target.value})}
                      className="svcc-manage-instructor-form-input"
                      required
                    />
                  </div>
                </div>
                <div className="svcc-manage-instructor-form-group">
                  <label htmlFor="birthday" className="svcc-manage-instructor-form-label">
                    Birthday*
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    value={currentInstructor.birthday}
                    onChange={(e) => setCurrentInstructor({...currentInstructor, birthday: e.target.value})}
                    className="svcc-manage-instructor-form-input"
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
                    value={currentInstructor.email}
                    onChange={(e) => setCurrentInstructor({...currentInstructor, email: e.target.value})}
                    className="svcc-manage-instructor-form-input"
                    required
                  />
                </div>
                {modalMode === 'add' && currentInstructor.password && (
                  <div className="svcc-manage-instructor-form-group">
                    <label className="svcc-manage-instructor-form-label">
                      Generated Password
                    </label>
                    <input
                      type="text"
                      value={currentInstructor.password}
                      className="svcc-manage-instructor-form-input"
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                    <p className="svcc-manage-instructor-form-hint">
                      Password format: lastname + birthday (MMDDYYYY)
                    </p>
                  </div>
                )}
                {modalMode === 'edit' && (
                  <div className="svcc-manage-instructor-form-group">
                    <label htmlFor="password" className="svcc-manage-instructor-form-label">
                      New Password (leave empty to keep current)
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={currentInstructor.password}
                      onChange={(e) => setCurrentInstructor({...currentInstructor, password: e.target.value})}
                      className="svcc-manage-instructor-form-input"
                      placeholder="Enter new password or leave empty"
                    />
                  </div>
                )}
                <div className="svcc-manage-instructor-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowInstructorModal(false)}
                    className="svcc-manage-instructor-button svcc-manage-instructor-button-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="svcc-manage-instructor-button svcc-manage-instructor-button-primary">
                    <Save size={18} />
                    {modalMode === 'add' ? 'Create Instructor' : 'Update Instructor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Program Head Modal */}
      {showAssignHeadModal && (
        <div className="svcc-manage-instructor-modal-overlay">
          <div className="svcc-manage-instructor-confirm-modal">
            <h3 className="svcc-manage-instructor-confirm-title">Assign Program Head</h3>
            <p className="svcc-manage-instructor-confirm-text">
              Select a program head for {currentDepartment.department_name}
            </p>
            <div className="svcc-manage-instructor-form-group">
              <select
                value={selectedHeadId}
                onChange={(e) => setSelectedHeadId(e.target.value)}
                className="svcc-manage-instructor-form-select"
              >
                <option value="">No Program Head</option>
                {programHeads.map(head => (
                  <option key={head.user_id} value={head.user_id}>
                    {head.firstName} {head.lastName} ({head.program_head_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="svcc-manage-instructor-confirm-actions">
              <button
                onClick={() => setShowAssignHeadModal(false)}
                className="svcc-manage-instructor-button svcc-manage-instructor-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignHead}
                className="svcc-manage-instructor-button svcc-manage-instructor-button-primary"
              >
                <Save size={18} />
                Assign
              </button>
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
                <Trash2 size={18} />
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