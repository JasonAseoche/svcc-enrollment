import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle, ChevronDown } from 'lucide-react';
import '../../components/HeadLayout/ManageCourses.css';

const MOCK_COURSES = [
  { id: 1, courseCode: 'IT 111', courseName: 'Introduction to Computing', unitsRequired: 3, prerequisite: 'None', yearLevel: '1st Year', term: '1st Term' },
  { id: 2, courseCode: 'IT 112', courseName: 'Computer Programming 1', unitsRequired: 3, prerequisite: 'IT 111', yearLevel: '1st Year', term: '2nd Term' },
  { id: 3, courseCode: 'IT 121', courseName: 'Data Structures and Algorithms', unitsRequired: 3, prerequisite: 'IT 112', yearLevel: '2nd Year', term: '1st Term' },
  { id: 4, courseCode: 'IT 122', courseName: 'Object-Oriented Programming', unitsRequired: 3, prerequisite: 'IT 112', yearLevel: '2nd Year', term: '2nd Term' },
  { id: 5, courseCode: 'IT 211', courseName: 'Database Management Systems', unitsRequired: 3, prerequisite: 'IT 121', yearLevel: '3rd Year', term: '1st Term' },
  { id: 6, courseCode: 'IT 212', courseName: 'Web Development', unitsRequired: 3, prerequisite: 'IT 122', yearLevel: '3rd Year', term: '2nd Term' },
  { id: 7, courseCode: 'EUTH 2', courseName: 'Euthenics 2', unitsRequired: 1, prerequisite: 'EUTH 1', yearLevel: '1st Year', term: '1st Term' },
  { id: 8, courseCode: 'PE 101', courseName: 'Physical Education 1', unitsRequired: 2, prerequisite: 'None', yearLevel: '1st Year', term: '1st Term' }
];

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [nextCourseId, setNextCourseId] = useState(9);
  
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [modalMode, setModalMode] = useState('add');
  const [currentCourse, setCurrentCourse] = useState({ id: '', courseCode: '', courseName: '', unitsRequired: '', prerequisite: '', yearLevel: '', term: '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [yearLevelFilter, setYearLevelFilter] = useState('All');
  const [termFilter, setTermFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('latest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setCourses(MOCK_COURSES);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, courses, sortOrder, yearLevelFilter, termFilter]);

  const applyFilters = useCallback(() => {
    let filtered = [...courses];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        (course.courseCode || '').toLowerCase().includes(searchLower) ||
        (course.courseName || '').toLowerCase().includes(searchLower) ||
        (course.prerequisite || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply year level filter
    if (yearLevelFilter !== 'All') {
      filtered = filtered.filter(course => course.yearLevel === yearLevelFilter);
    }

    // Apply term filter
    if (termFilter !== 'All') {
      filtered = filtered.filter(course => course.term === termFilter);
    }

    filtered.sort((a, b) => {
      return sortOrder === 'latest' ? b.id - a.id : a.id - b.id;
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, sortOrder, yearLevelFilter, termFilter]);

  const openAddCourseModal = useCallback(() => {
    setCurrentCourse({ id: '', courseCode: '', courseName: '', unitsRequired: '', prerequisite: '', yearLevel: '', term: '' });
    setModalMode('add');
    setShowCourseModal(true);
  }, []);

  const openEditCourseModal = useCallback((course) => {
    setCurrentCourse(course);
    setModalMode('edit');
    setShowCourseModal(true);
  }, []);

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentCourse.courseCode || !currentCourse.courseName || !currentCourse.unitsRequired || !currentCourse.yearLevel || !currentCourse.term) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    if (modalMode === 'add') {
      const newCourse = { ...currentCourse, id: nextCourseId, prerequisite: currentCourse.prerequisite || 'None' };
      setCourses([...courses, newCourse]);
      setNextCourseId(nextCourseId + 1);
      setMessage({ text: 'Course added successfully', type: 'success' });
    } else {
      setCourses(courses.map(course => 
        course.id === currentCourse.id ? { ...currentCourse, prerequisite: currentCourse.prerequisite || 'None' } : course
      ));
      setMessage({ text: 'Course updated successfully', type: 'success' });
    }
    
    setShowCourseModal(false);
  };

  const confirmDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = async () => {
    setCourses(courses.filter(course => course.id !== deleteId));
    setMessage({ text: 'Course deleted successfully', type: 'success' });
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleFilterChange = useCallback((value) => {
    setSortOrder(value);
    setShowFilterDropdown(false);
  }, []);

  const getFilterDisplayText = useMemo(() => {
    return sortOrder === 'latest' ? 'Latest' : 'Oldest';
  }, [sortOrder]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <div className="manage-courses-container">
        <div className="manage-courses-header-card">
          <div className="manage-courses-header-content">
            <h1 className="manage-courses-page-title">Manage Courses</h1>
            <div className="manage-courses-header-actions">
              <div className="manage-courses-search-container">
                <input type="text" placeholder="Search courses..." className="manage-courses-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="manage-courses-search-icon" size={18} />
                {searchTerm && (<button onClick={() => setSearchTerm('')} className="manage-courses-search-clear"><X size={18} /></button>)}
              </div>

              <div className="manage-courses-filter-select-container">
                <select value={yearLevelFilter} onChange={(e) => setYearLevelFilter(e.target.value)} className="manage-courses-filter-select">
                  <option value="All">All Year Levels</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="manage-courses-filter-select-container">
                <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} className="manage-courses-filter-select">
                  <option value="All">All Terms</option>
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                </select>
              </div>

              <div className="manage-courses-mobile-filter-container">
                <button className="manage-courses-filter-button" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
                  <span className="manage-courses-filter-text">{getFilterDisplayText}</span>
                  <ChevronDown size={12} className={`manage-courses-filter-chevron ${showFilterDropdown ? 'manage-courses-filter-chevron-open' : ''}`} />
                </button>
                {showFilterDropdown && (
                  <div className="manage-courses-filter-dropdown">
                    <div className="manage-courses-filter-section">
                      <h4 className="manage-courses-filter-section-title">Sort</h4>
                      <button className={`manage-courses-filter-option ${sortOrder === 'latest' ? 'manage-courses-filter-option-active' : ''}`} onClick={() => handleFilterChange('latest')}>Latest</button>
                      <button className={`manage-courses-filter-option ${sortOrder === 'oldest' ? 'manage-courses-filter-option-active' : ''}`} onClick={() => handleFilterChange('oldest')}>Oldest</button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={openAddCourseModal} className="manage-courses-add-button"><PlusCircle size={18} className="manage-courses-button-icon" />Add Course</button>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`manage-courses-message ${message.type === 'success' ? 'manage-courses-message-success' : 'manage-courses-message-error'}`}>
            <AlertCircle size={20} className="manage-courses-message-icon" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="manage-courses-cards-container">
          {filteredCourses.length === 0 ? (
            <div className="manage-courses-empty-container">
              {searchTerm ? (
                <><p className="manage-courses-empty-text">No courses found</p><button onClick={() => setSearchTerm('')} className="manage-courses-empty-action">Clear search</button></>
              ) : (
                <><p className="manage-courses-empty-text">No courses available</p><button onClick={openAddCourseModal} className="manage-courses-empty-action"><PlusCircle size={16} />Add your first course</button></>
              )}
            </div>
          ) : (
            <div className="manage-courses-cards-grid">
              {filteredCourses.map((course) => (
                <div key={course.id} className="manage-courses-card">
                  <div className="manage-courses-card-header">
                    <div className="manage-courses-card-title-section">
                      <div className="manage-courses-code-badge">{course.courseCode}</div>
                      <h3 className="manage-courses-card-title">{course.courseName}</h3>
                    </div>
                    <div className="manage-courses-card-actions">
                      <button onClick={() => openEditCourseModal(course)} className="manage-courses-action-button manage-courses-edit-button" title="Edit course"><Edit2 size={18} /></button>
                      <button onClick={() => confirmDelete(course.id)} className="manage-courses-action-button manage-courses-delete-button" title="Delete course"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="manage-courses-card-divider"></div>
                  <div className="manage-courses-card-content">
                    <div className="manage-courses-card-info">
                      <span className="manage-courses-info-label">Year Level:</span>
                      <span className="manage-courses-info-value">{course.yearLevel}</span>
                    </div>
                    <div className="manage-courses-card-info">
                      <span className="manage-courses-info-label">Term:</span>
                      <span className="manage-courses-info-value">{course.term}</span>
                    </div>
                    <div className="manage-courses-card-info">
                      <span className="manage-courses-info-label">Units Required:</span>
                      <span className="manage-courses-info-value">{course.unitsRequired}</span>
                    </div>
                    <div className="manage-courses-card-info">
                      <span className="manage-courses-info-label">Pre-Requisite:</span>
                      <span className="manage-courses-info-value">{course.prerequisite}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCourseModal && (
        <div className="manage-courses-modal-overlay">
          <div className="manage-courses-modal-content">
            <div className="manage-courses-modal-body">
              <h2 className="manage-courses-modal-title">{modalMode === 'add' ? 'Add New Course' : 'Edit Course'}</h2>
              <form onSubmit={handleCourseSubmit}>
                <div className="manage-courses-form-group">
                  <label className="manage-courses-form-label">Course Code*</label>
                  <input type="text" value={currentCourse.courseCode} onChange={(e) => setCurrentCourse({...currentCourse, courseCode: e.target.value})} className="manage-courses-form-input" placeholder="e.g., IT 111" required />
                </div>
                <div className="manage-courses-form-group">
                  <label className="manage-courses-form-label">Name of Course*</label>
                  <input type="text" value={currentCourse.courseName} onChange={(e) => setCurrentCourse({...currentCourse, courseName: e.target.value})} className="manage-courses-form-input" placeholder="e.g., Introduction to Computing" required />
                </div>
                <div className="manage-courses-form-row">
                  <div className="manage-courses-form-group">
                    <label className="manage-courses-form-label">Year Level*</label>
                    <select value={currentCourse.yearLevel} onChange={(e) => setCurrentCourse({...currentCourse, yearLevel: e.target.value})} className="manage-courses-form-select" required>
                      <option value="">Select Year Level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="manage-courses-form-group">
                    <label className="manage-courses-form-label">Term*</label>
                    <select value={currentCourse.term} onChange={(e) => setCurrentCourse({...currentCourse, term: e.target.value})} className="manage-courses-form-select" required>
                      <option value="">Select Term</option>
                      <option value="1st Term">1st Term</option>
                      <option value="2nd Term">2nd Term</option>
                    </select>
                  </div>
                </div>
                <div className="manage-courses-form-group">
                  <label className="manage-courses-form-label">Number of Units Required*</label>
                  <input type="number" min="1" max="10" value={currentCourse.unitsRequired} onChange={(e) => setCurrentCourse({...currentCourse, unitsRequired: e.target.value})} className="manage-courses-form-input" placeholder="e.g., 3" required />
                </div>
                <div className="manage-courses-form-group">
                  <label className="manage-courses-form-label">Pre-Requisite/Co-Requisite</label>
                  <select value={currentCourse.prerequisite} onChange={(e) => setCurrentCourse({...currentCourse, prerequisite: e.target.value})} className="manage-courses-form-select">
                    <option value="">None</option>
                    {courses.filter(c => c.id !== currentCourse.id).map(course => (
                      <option key={course.id} value={course.courseCode}>{course.courseCode} - {course.courseName}</option>
                    ))}
                  </select>
                  <p className="manage-courses-form-hint">Select a prerequisite course or leave as "None"</p>
                </div>
                <div className="manage-courses-modal-actions">
                  <button type="button" onClick={() => setShowCourseModal(false)} className="manage-courses-button manage-courses-button-secondary">Cancel</button>
                  <button type="submit" className="manage-courses-button manage-courses-button-primary"><Save size={18} className="manage-courses-button-icon" />{modalMode === 'add' ? 'Create Course' : 'Update Course'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="manage-courses-modal-overlay">
          <div className="manage-courses-confirm-modal">
            <h3 className="manage-courses-confirm-title">Confirm Delete</h3>
            <p className="manage-courses-confirm-text">Are you sure you want to delete this course? This action cannot be undone.</p>
            <div className="manage-courses-confirm-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="manage-courses-button manage-courses-button-secondary">Cancel</button>
              <button onClick={handleDelete} className="manage-courses-button manage-courses-button-danger"><Trash2 size={18} className="manage-courses-button-icon" />Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageCourses;