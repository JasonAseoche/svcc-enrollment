import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle, ChevronDown, Clock } from 'lucide-react';
import axios from 'axios';
import '../../components/HeadLayout/ManageCourses.css';

const API_URL = 'http://localhost/svcc-enrollment/manage_courses.php';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [modalMode, setModalMode] = useState('add');
  const [currentCourse, setCurrentCourse] = useState({ 
    id: '', courseCode: '', courseName: '', unitsRequired: '', 
    prerequisite: '', yearLevel: '', term: '' 
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [yearLevelFilter, setYearLevelFilter] = useState('All');
  const [termFilter, setTermFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('latest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role': storedUser?.role || storedUser?.user?.role || '',
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?action=all`);
      if (response.data.success) setCourses(response.data.data);
    } catch {
      setMessage({ text: 'Failed to fetch courses', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { applyFilters(); }, [searchTerm, courses, sortOrder, yearLevelFilter, termFilter]);

  const applyFilters = useCallback(() => {
    let filtered = [...courses];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.course_code || '').toLowerCase().includes(s) ||
        (c.course_name || '').toLowerCase().includes(s) ||
        (c.prerequisite || '').toLowerCase().includes(s)
      );
    }
    if (yearLevelFilter !== 'All') filtered = filtered.filter(c => c.year_level === yearLevelFilter);
    if (termFilter !== 'All') filtered = filtered.filter(c => c.term === termFilter);
    filtered.sort((a, b) => sortOrder === 'latest' ? b.id - a.id : a.id - b.id);
    setFilteredCourses(filtered);
  }, [courses, searchTerm, sortOrder, yearLevelFilter, termFilter]);

  const openAddCourseModal = useCallback(() => {
    setCurrentCourse({ id: '', courseCode: '', courseName: '', unitsRequired: '', prerequisite: '', yearLevel: '', term: '' });
    setModalMode('add');
    setShowCourseModal(true);
  }, []);

  const openEditCourseModal = useCallback((course) => {
    setCurrentCourse({
      id: course.id, courseCode: course.course_code, courseName: course.course_name,
      unitsRequired: course.units_required,
      prerequisite: course.prerequisite === 'None' ? '' : course.prerequisite,
      yearLevel: course.year_level, term: course.term
    });
    setModalMode('edit');
    setShowCourseModal(true);
  }, []);

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!currentCourse.courseCode || !currentCourse.courseName || !currentCourse.unitsRequired || !currentCourse.yearLevel || !currentCourse.term) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      const payload = {
        courseCode: currentCourse.courseCode, courseName: currentCourse.courseName,
        unitsRequired: currentCourse.unitsRequired, prerequisite: currentCourse.prerequisite || 'None',
        yearLevel: currentCourse.yearLevel, term: currentCourse.term
      };
      let response;
      if (modalMode === 'add') {
        response = await axios.post(API_URL, payload, { headers: auditHeaders });
      } else {
        response = await axios.put(API_URL, { id: currentCourse.id, ...payload }, { headers: auditHeaders });
      }
      if (response.data.success) {
        setMessage({ text: modalMode === 'add' ? 'Course created and submitted for approval' : 'Course updated and submitted for approval', type: 'success' });
        fetchCourses();
        setShowCourseModal(false);
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Operation failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = useCallback((course) => {
    if (course.status === 'pending') {
      setMessage({ text: 'Cannot delete pending courses. Please wait for approval or rejection.', type: 'error' });
      return;
    }
    setDeleteId(course.id);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(API_URL, { data: { id: deleteId }, headers: auditHeaders });
      if (response.data.success) {
        setMessage({ text: 'Course deleted successfully', type: 'success' });
        fetchCourses();
        setShowDeleteConfirm(false);
        setDeleteId(null);
      }
    } catch {
      setMessage({ text: 'Failed to delete course', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <div className="manage-courses-container">
        {/* Header */}
        <div className="manage-courses-header-card">
          <div className="manage-courses-header-top">
            <h1 className="manage-courses-page-title">Manage Courses</h1>
            <button onClick={openAddCourseModal} className="manage-courses-add-button">
              <PlusCircle size={16} className="manage-courses-button-icon" />
              Add Course
            </button>
          </div>
          <div className="manage-courses-filters-row">
            <div className="manage-courses-search-container">
              <Search className="manage-courses-search-icon" size={16} />
              <input
                type="text"
                placeholder="Search courses..."
                className="manage-courses-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="manage-courses-search-clear">
                  <X size={14} />
                </button>
              )}
            </div>
            <select value={yearLevelFilter} onChange={(e) => setYearLevelFilter(e.target.value)} className="manage-courses-filter-select">
              <option value="All">All Year Levels</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
            <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} className="manage-courses-filter-select">
              <option value="All">All Sems</option>
              <option value="1st Term">1st Sem</option>
              <option value="2nd Term">2nd Sem</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="manage-courses-filter-select">
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`manage-courses-message ${message.type === 'success' ? 'manage-courses-message-success' : 'manage-courses-message-error'}`}>
            <AlertCircle size={16} className="manage-courses-message-icon" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Table */}
        <div className="manage-courses-table-wrapper">
          {loading ? (
            <div className="manage-courses-loading">Loading...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="manage-courses-empty-container">
              <p className="manage-courses-empty-text">
                {searchTerm ? 'No courses match your search.' : 'No courses available.'}
              </p>
              {searchTerm
                ? <button onClick={() => setSearchTerm('')} className="manage-courses-empty-action">Clear search</button>
                : <button onClick={openAddCourseModal} className="manage-courses-empty-action"><PlusCircle size={14} /> Add your first course</button>
              }
            </div>
          ) : (
            <table className="manage-courses-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Year Level</th>
                  <th>Term</th>
                  <th>Units</th>
                  <th>Pre-Requisite</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td><span className="manage-courses-code-badge">{course.course_code}</span></td>
                    <td className="manage-courses-name-cell">{course.course_name}</td>
                    <td>{course.year_level}</td>
                    <td>{course.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</td>
                    <td className="manage-courses-units-cell">{course.units_required}</td>
                    <td>{course.prerequisite}</td>
                    <td>
                      {course.status === 'pending' ? (
                        <span className="manage-courses-pending-badge">
                          <Clock size={11} /> Pending
                        </span>
                      ) : (
                        <span className="manage-courses-approved-badge">Approved</span>
                      )}
                    </td>
                    <td>
                      <div className="manage-courses-action-group">
                        <button
                          onClick={() => openEditCourseModal(course)}
                          className="manage-courses-action-button manage-courses-edit-button"
                          title="Edit course"
                          disabled={course.status === 'pending'}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => confirmDelete(course)}
                          className="manage-courses-action-button manage-courses-delete-button"
                          title="Delete course"
                          disabled={course.status === 'pending'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="manage-courses-table-footer">
          {filteredCourses.length > 0 && (
            <span className="manage-courses-count">{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found</span>
          )}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="manage-courses-modal-overlay">
          <div className="manage-courses-modal-content">
            <div className="manage-courses-modal-body">
              <h2 className="manage-courses-modal-title">
                {modalMode === 'add' ? 'Add New Course' : 'Edit Course'}
              </h2>
              {modalMode === 'edit' && (
                <div className="manage-courses-modal-notice">
                  <AlertCircle size={14} />
                  <span>Updating this course will require admin approval before changes take effect.</span>
                </div>
              )}
              <form onSubmit={handleCourseSubmit}>
                <div className="manage-courses-form-group">
                  <label className="manage-courses-form-label">Course Code *</label>
                  <input type="text" value={currentCourse.courseCode}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, courseCode: e.target.value })}
                    className="manage-courses-form-input" placeholder="e.g., IT 111" required />
                </div>
                <div className="manage-courses-form-group">
                  <label className="manage-courses-form-label">Name of Course *</label>
                  <input type="text" value={currentCourse.courseName}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, courseName: e.target.value })}
                    className="manage-courses-form-input" placeholder="e.g., Introduction to Computing" required />
                </div>
                <div className="manage-courses-form-row">
                  <div className="manage-courses-form-group">
                    <label className="manage-courses-form-label">Year Level *</label>
                    <select value={currentCourse.yearLevel}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, yearLevel: e.target.value })}
                      className="manage-courses-form-select" required>
                      <option value="">Select Year Level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="manage-courses-form-group">
                    <label className="manage-courses-form-label">Term *</label>
                    <select value={currentCourse.term}
                      onChange={(e) => setCurrentCourse({ ...currentCourse, term: e.target.value })}
                      className="manage-courses-form-select" required>
                        <option value="">Select Sem</option>
                        <option value="1st Term">1st Sem</option>
                        <option value="2nd Term">2nd Sem</option>
                    </select>
                  </div>
                </div>
                <div className="manage-courses-form-group">
                  <label className="manage-courses-form-label">Units Required *</label>
                  <input type="number" min="1" max="10" value={currentCourse.unitsRequired}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, unitsRequired: e.target.value })}
                    className="manage-courses-form-input" placeholder="e.g., 3" required />
                </div>
                <div className="manage-courses-form-group">
                  <label className="manage-courses-form-label">Pre-Requisite / Co-Requisite</label>
                  <select value={currentCourse.prerequisite}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, prerequisite: e.target.value })}
                    className="manage-courses-form-select">
                    <option value="">None</option>
                    {courses.filter(c => c.id !== currentCourse.id && c.status === 'approved').map(c => (
                      <option key={c.id} value={c.course_code}>{c.course_code} - {c.course_name}</option>
                    ))}
                  </select>
                  <p className="manage-courses-form-hint">Select a prerequisite course or leave as "None"</p>
                </div>
                <div className="manage-courses-modal-actions">
                  <button type="button" onClick={() => setShowCourseModal(false)} className="manage-courses-button manage-courses-button-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="manage-courses-button manage-courses-button-primary" disabled={loading}>
                    <Save size={15} className="manage-courses-button-icon" />
                    {modalMode === 'add' ? 'Create Course' : 'Update Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="manage-courses-modal-overlay">
          <div className="manage-courses-confirm-modal">
            <h3 className="manage-courses-confirm-title">Confirm Delete</h3>
            <p className="manage-courses-confirm-text">Are you sure you want to delete this course? This action cannot be undone.</p>
            <div className="manage-courses-confirm-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="manage-courses-button manage-courses-button-secondary">Cancel</button>
              <button onClick={handleDelete} className="manage-courses-button manage-courses-button-danger" disabled={loading}>
                <Trash2 size={15} className="manage-courses-button-icon" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageCourses;