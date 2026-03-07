import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../components/AdminLayout/AcademicCalendar.css';

const AcademicCalendar = () => {
  const API_URL = 'http://localhost/svcc-enrollment/academic_calendar.php';

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termGradeProgress, setTermGradeProgress] = useState({});
  const [showModal, setShowModal] = useState(false);
  // modalType: 'year' | 'term' | 'editTerm' | 'editYear' | 'deleteTerm' | 'deleteYear'
  const [modalType, setModalType] = useState('');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    termName: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}?action=getAllYears`);
      if (response.data.success) {
        setAcademicYears(response.data.data);
        // Fetch grade progress for all active terms
        const allTerms = response.data.data.flatMap(y => y.terms).filter(t => t.status === 'active');
        const progressResults = await Promise.all(
          allTerms.map(t => axios.get(`${API_URL}?action=getTermGradeProgress&termId=${t.id}`))
        );
        const progressMap = {};
        allTerms.forEach((t, i) => {
          if (progressResults[i].data.success) {
            progressMap[t.id] = progressResults[i].data.data;
          }
        });
        setTermGradeProgress(progressMap);
      } else {
        setError('Failed to fetch academic years');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load academic calendar');
    } finally {
      setLoading(false);
    }
  };

  // ── Open helpers ──────────────────────────────────────────────────────────

  const handleOpenModal = (type, year = null, term = null) => {
    setModalType(type);
    setSelectedYear(year);
    setSelectedTerm(term);

    if (type === 'editTerm' && term) {
      setFormData({
        year: '',
        termName: term.name,
        startDate: term.startDate,
        endDate: term.endDate
      });
    } else if (type === 'editYear' && year) {
      setFormData({ year: year.year, termName: '', startDate: '', endDate: '' });
    } else {
      setFormData({ year: '', termName: '', startDate: '', endDate: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedYear(null);
    setSelectedTerm(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let response;

      if (modalType === 'year') {
        response = await axios.post(`${API_URL}?action=createYear`,
          { year: formData.year },
          { headers: auditHeaders }  // ← add
        );

      } else if (modalType === 'term') {
        response = await axios.post(`${API_URL}?action=createTerm`, {
          yearId: selectedYear.id,
          name: formData.termName,
          startDate: formData.startDate,
          endDate: formData.endDate
        }, { headers: auditHeaders });

      } else if (modalType === 'editYear') {
        response = await axios.put(`${API_URL}?action=updateYear`, {
          yearId: selectedYear.id,
          year: formData.year
        }, { headers: auditHeaders });

      } else if (modalType === 'editTerm') {
        response = await axios.put(`${API_URL}?action=updateTerm`, {
          termId: selectedTerm.id,
          name: formData.termName,
          startDate: formData.startDate,
          endDate: formData.endDate
        }, { headers: auditHeaders });
      }

      if (response?.data?.success) {
        await fetchAcademicYears();
        handleCloseModal();
      } else {
        setError(response?.data?.error || 'Failed to save');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while saving');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleConfirmDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      let response;
      if (modalType === 'deleteTerm') {
        response = await axios.delete(
          `${API_URL}?action=deleteTerm&termId=${selectedTerm.id}`,
          { headers: auditHeaders }  // ← add
        );
      } else if (modalType === 'deleteYear') {
        response = await axios.delete(
          `${API_URL}?action=deleteYear&yearId=${selectedYear.id}`,
          { headers: auditHeaders }  // ← add
        );
      }

      if (response?.data?.success) {
        await fetchAcademicYears();
        handleCloseModal();
      } else {
        setError(response?.data?.error || 'Failed to delete');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // ── End term / year ───────────────────────────────────────────────────────

  const handleEndTerm = async (termId) => {
    if (!window.confirm('Are you sure you want to end this term? All enrolled students will be unenrolled.')) return;
    try {
      setLoading(true);
      const response = await axios.put(
          `${API_URL}?action=endTerm`,
          { termId },
          { headers: auditHeaders }  // ← add
        );
      if (response.data.success) {
        await fetchAcademicYears();
      } else {
        setError(response.data.error || 'Failed to end term');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end term');
    } finally {
      setLoading(false);
    }
  };

  const handleEndYear = async (yearId) => {
    if (!window.confirm('Are you sure you want to end this academic year? All terms will be ended and students unenrolled.')) return;
    try {
      setLoading(true);
      const response = await axios.put(
          `${API_URL}?action=endYear`,
          { yearId },
          { headers: auditHeaders }  // ← add
        );
      if (response.data.success) {
        await fetchAcademicYears();
      } else {
        setError(response.data.error || 'Failed to end academic year');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end academic year');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'year':      return 'Add New Academic Year';
      case 'term':      return 'Add New Sem';
      case 'editYear':  return 'Edit Academic Year';
      case 'editTerm':  return 'Edit Sem';
      case 'deleteTerm':return 'Delete Sem';
      case 'deleteYear':return 'Delete Academic Year';
      default:          return '';
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading && academicYears.length === 0) {
    return (
      <div className="svcc-acad-calendar-container">
        <div className="svcc-acad-calendar-loading">
          <div className="svcc-acad-calendar-spinner"></div>
          <p>Loading academic calendar...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="svcc-acad-calendar-container">
      {/* Header */}
      <div className="svcc-acad-calendar-header">
        <h1>Academic Calendar</h1>
        <button
          className="svcc-acad-calendar-btn-primary"
          onClick={() => handleOpenModal('year')}
          disabled={loading}
        >
          <svg className="svcc-acad-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Academic Year
        </button>
      </div>

      {/* Inline error */}
      {error && !showModal && (
        <div className="svcc-acad-calendar-error">
          <svg className="svcc-acad-calendar-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="svcc-acad-calendar-error-close">×</button>
        </div>
      )}

      {/* Content */}
      <div className="svcc-acad-calendar-content">
        {academicYears.length === 0 ? (
          <div className="svcc-acad-calendar-empty-state">
            <svg className="svcc-acad-calendar-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3>No Academic Years Yet</h3>
            <p>Get started by creating your first academic year</p>
            <button className="svcc-acad-calendar-btn-primary" onClick={() => handleOpenModal('year')}>
              Create Academic Year
            </button>
          </div>
        ) : (
          academicYears.map(year => (
            <div key={year.id} className="svcc-acad-calendar-year-card">
              {/* Year header */}
              <div className="svcc-acad-calendar-year-header">
                <div className="svcc-acad-calendar-year-info">
                  <h2>{year.year}</h2>
                  <span className={`svcc-acad-calendar-badge ${year.status === 'active' ? 'svcc-acad-calendar-badge-active' : 'svcc-acad-calendar-badge-ended'}`}>
                    {year.status === 'active' ? 'Active' : 'Ended'}
                  </span>
                </div>

                <div className="svcc-acad-calendar-year-actions">
                  {/* Manage Year button — always visible */}
                  <button
                    className="svcc-acad-calendar-btn-manage"
                    onClick={() => handleOpenModal('editYear', year)}
                    disabled={loading}
                    title="Edit or delete this academic year"
                  >
                    <svg className="svcc-acad-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Manage Year
                  </button>

                  {year.status === 'active' && (
                    <>
                      <button
                        className="svcc-acad-calendar-btn-secondary"
                        onClick={() => handleOpenModal('term', year)}
                        disabled={loading}
                      >
                        <svg className="svcc-acad-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Sem
                      </button>
                      <button
                        className="svcc-acad-calendar-btn-danger"
                        onClick={() => handleEndYear(year.id)}
                        disabled={loading}
                      >
                        End Year
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Terms grid */}
              <div className="svcc-acad-calendar-terms-grid">
                {year.terms.length === 0 ? (
                  <div className="svcc-acad-calendar-empty">
                    <svg className="svcc-acad-calendar-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No sems added yet</p>
                  </div>
                ) : (
                  year.terms.map(term => (
                    <div key={term.id} className="svcc-acad-calendar-term-card">
                      <div className="svcc-acad-calendar-term-header">
                        <h3>{term.name.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`svcc-acad-calendar-badge ${term.status === 'active' ? 'svcc-acad-calendar-badge-active' : 'svcc-acad-calendar-badge-ended'}`}>
                            {term.status === 'active' ? 'Active' : 'Ended'}
                          </span>
                          {term.status === 'active' && (
                            <span
                              className={`svcc-acad-calendar-badge ${
                                !termGradeProgress[term.id] || termGradeProgress[term.id]?.total_courses === 0 || termGradeProgress[term.id]?.completed_courses >= termGradeProgress[term.id]?.total_courses
                                  ? 'svcc-acad-calendar-badge-active'
                                  : 'svcc-acad-calendar-badge-ended'
                              }`}
                              title="Courses with final grades uploaded / total courses"
                            >
                              {termGradeProgress[term.id] ? `${termGradeProgress[term.id].completed_courses}/${termGradeProgress[term.id].total_courses} graded` : '...'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="svcc-acad-calendar-term-dates">
                        <div className="svcc-acad-calendar-date-item">
                          <span className="svcc-acad-calendar-date-label">Start:</span>
                          <span className="svcc-acad-calendar-date-value">{formatDate(term.startDate)}</span>
                        </div>
                        <div className="svcc-acad-calendar-date-item">
                          <span className="svcc-acad-calendar-date-label">End:</span>
                          <span className="svcc-acad-calendar-date-value">{formatDate(term.endDate)}</span>
                        </div>
                      </div>

                      {/* Term action buttons */}
                      <div className="svcc-acad-calendar-term-actions">
                        <button
                          className="svcc-acad-calendar-btn-term-manage"
                          onClick={() => handleOpenModal('editTerm', year, term)}
                          disabled={loading}
                          title="Edit this term"
                        >
                          <svg className="svcc-acad-calendar-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="svcc-acad-calendar-btn-term-delete"
                          onClick={() => handleOpenModal('deleteTerm', year, term)}
                          disabled={loading}
                          title="Delete this term"
                        >
                          <svg className="svcc-acad-calendar-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                        {term.status === 'active' && (() => {
                          const progress = termGradeProgress[term.id];
                          const allDone = progress && progress.total_courses > 0 && progress.completed_courses >= progress.total_courses;
                          const noCourses = !progress || progress.total_courses === 0;
                          return (
                            <>
  
                              <button
                                className="svcc-acad-calendar-btn-end-term"
                                onClick={() => handleEndTerm(term.id)}
                                disabled={loading || (!allDone && !noCourses)}
                                title={!allDone && !noCourses ? `Cannot end term: only ${progress?.completed_courses}/${progress?.total_courses} courses have final grades uploaded` : 'End this sem'}
                              >
                                End Sem
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="svcc-acad-calendar-modal-overlay" onClick={handleCloseModal}>
          <div className="svcc-acad-calendar-modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="svcc-acad-calendar-modal-header">
              <h2>{getModalTitle()}</h2>
              <button className="svcc-acad-calendar-modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="svcc-acad-calendar-modal-error">{error}</div>}

            {/* ── Delete confirmation ── */}
            {(modalType === 'deleteTerm' || modalType === 'deleteYear') ? (
              <div className="svcc-acad-calendar-modal-form">
                <div className="svcc-acad-calendar-delete-warning">
                  <svg className="svcc-acad-calendar-delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>
                    {modalType === 'deleteTerm'
                      ? <>Are you sure you want to delete <strong>{selectedTerm?.name}</strong>? This cannot be undone.</>
                      : <>Are you sure you want to delete the academic year <strong>{selectedYear?.year}</strong> and all its terms? This cannot be undone.</>
                    }
                  </p>
                </div>
                <div className="svcc-acad-calendar-modal-actions">
                  <button type="button" className="svcc-acad-calendar-btn-cancel" onClick={handleCloseModal} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="button" className="svcc-acad-calendar-btn-delete-confirm" onClick={handleConfirmDelete} disabled={submitting}>
                    {submitting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Edit / Create form ── */
              <form onSubmit={handleSubmit} className="svcc-acad-calendar-modal-form">

                {/* Year form */}
                {(modalType === 'year' || modalType === 'editYear') && (
                  <div className="svcc-acad-calendar-form-group">
                    <label htmlFor="year">Academic Year</label>
                    <input
                      type="text"
                      id="year"
                      name="year"
                      placeholder="e.g., 2025-2026"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    />
                    <small>Format: YYYY-YYYY</small>
                  </div>
                )}

                {/* Term form */}
                {(modalType === 'term' || modalType === 'editTerm') && (
                  <>
                    <div className="svcc-acad-calendar-form-group">
                      <label htmlFor="termName">Sem Name</label>
                      <select
                        id="termName"
                        name="termName"
                        value={formData.termName}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      >
                        <option value="">Select Term</option>
                        <option value="1st Term">1st Sem</option>
                        <option value="2nd Term">2nd Sem</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                    <div className="svcc-acad-calendar-form-group">
                      <label htmlFor="startDate">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="svcc-acad-calendar-form-group">
                      <label htmlFor="endDate">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </>
                )}

                <div className="svcc-acad-calendar-modal-actions">
                  <button type="button" className="svcc-acad-calendar-btn-cancel" onClick={handleCloseModal} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="svcc-acad-calendar-btn-submit" disabled={submitting}>
                    {submitting ? 'Saving...' : (
                      modalType === 'year' ? 'Create Year' :
                      modalType === 'term' ? 'Add Sem' :
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;