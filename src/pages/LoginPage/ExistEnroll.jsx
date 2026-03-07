import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExistEnroll.css';
import { getCurrentUser, updateUserData } from '../../utils/auth';

const ExistEnroll = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

 const [formData, setFormData] = useState({
    studentNumber: user?.student_number || '',
    program: 'Bachelor of Science in Information Technology', // Fixed to BSIT
    schoolYear: '',
    yearLevel: '',
    term: '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: '', // ADDED BACK
    suffix: ''
  });

  const [schoolYears, setSchoolYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [step, setStep] = useState(1); // 1 = info form, 2 = course selection
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
 const [coursesLoading, setCoursesLoading] = useState(false);
  const [rejectionModal, setRejectionModal] = useState({ show: false, reason: '' });

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

  // Fetch active academic year and terms
  // Fetch active academic year and terms
  useEffect(() => {
    fetchAcademicData();
    fetchStudentCurrentData();
  }, []);

  const fetchStudentCurrentData = async () => {
    try {
      const response = await axios.get(
        `http://localhost/svcc-enrollment/submit_enrollment.php?action=getStudentCurrentData&user_id=${user.user_id}`
      );
      if (response.data.success && response.data.data) {
        const { yearLevel, current_term } = response.data.data;
        setStudentData({ yearLevel, current_term });

        // Normalize: treat "1st Semester" == "1st Term", "2nd Semester" == "2nd Term"
        const normalize = (t) => {
          if (!t) return '';
          return t
            .replace('1st Semester', '1st Term')
            .replace('2nd Semester', '2nd Term')
            .replace('3rd Semester', 'Summer')
            .trim();
        };

       const termOrder = ['1st Term', '2nd Term'];
        const yearOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

        const normalizedTerm = normalize(current_term);
        const termIdx = termOrder.indexOf(normalizedTerm);
        const yearIdx = yearOrder.indexOf(yearLevel);

        let nextYear = yearLevel;
        let nextTerm = '';

        if (termIdx !== -1 && yearIdx !== -1) {
          if (termIdx < termOrder.length - 1) {
            // Same year, next term (1st Term → 2nd Term)
            nextTerm = termOrder[termIdx + 1];
          } else {
            // 2nd Term → next year, 1st Term
            nextTerm = termOrder[0];
            nextYear = yearIdx < yearOrder.length - 1
              ? yearOrder[yearIdx + 1]
              : yearLevel;
          }
        }

        // Wait for terms to be loaded then set — use a small defer
        // so that fetchAcademicData has populated `terms` state already
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            yearLevel: nextYear,
            term: nextTerm
          }));
        }, 300);
      }
    } catch (error) {
      console.error('Error fetching student current data:', error);
    }
  };

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/svcc-enrollment/academic_calendar.php?action=getActiveYear');
      
      if (response.data.success && response.data.data) {
        const activeYear = response.data.data;
        
        // Set school year
        setSchoolYears([activeYear.year]);
        setFormData(prev => ({
          ...prev,
          schoolYear: activeYear.year
        }));
        
        // Set available terms
       // Set available terms — normalize to "1st Term / 2nd Term" format
        const normalizeTermName = (t) => {
          const name = t.name || t;
          return name
            .replace('1st Semester', '1st Term')
            .replace('2nd Semester', '2nd Term')
            .replace('3rd Semester', 'Summer')
            .trim() || name;
        };
        if (activeYear.terms && activeYear.terms.length > 0) {
          const filtered = activeYear.terms
            .map(normalizeTermName)
            .filter(t => t !== 'Summer');
          setTerms(filtered.length > 0 ? filtered : ['1st Term', '2nd Term']);
        } else {
          setTerms(['1st Term', '2nd Term']);
        }
      } else {
        // Fallback data
        setSchoolYears(['2025-2026']);
        setTerms(['1st Semester', '2nd Semester', 'Summer']);
        setFormData(prev => ({
          ...prev,
          schoolYear: '2025-2026'
        }));
      }
     } catch (error) {
      console.error('Error fetching academic data:', error);
      // Fallback data
      setSchoolYears(['2025-2026']);
      setTerms(['1st Term', '2nd Term', 'Summer']);
      setFormData(prev => ({
        ...prev,
        schoolYear: '2025-2026'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already enrolled or has pending application
    if (user && user.enrollment_status !== 'unenrolled') {
      navigate('/dashboard-student');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage('');
  };

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await axios.get('http://localhost/svcc-enrollment/submit_enrollment.php?action=getCourses');
      if (res.data.success) {
        setAllCourses(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.yearLevel || !formData.term || !formData.schoolYear) {
      setErrorMessage('Please fill all required fields.');
      return;
    }
    setErrorMessage('');
    setStep(2);
    fetchCourses();
  };

  const toggleCourse = (course) => {
    setSelectedCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      if (exists) return prev.filter(c => c.id !== course.id);
      return [...prev, course];
    });
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      setErrorMessage('Please select at least one course.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const response = await axios.post('http://localhost/svcc-enrollment/submit_enrollment.php', {
        user_id: user.user_id,
        ...formData,
        selectedCourses: selectedCourses.map(c => ({
          course_id: c.id,
          course_code: c.course_code,
          course_name: c.course_name,
          units: c.units_required,
          year_level: c.year_level,
          term: c.term
        }))
      }, { headers: auditHeaders });

      if (response.data.success) {
        const updatedUser = { ...user, enrollment_status: 'pending' };
        updateUserData(updatedUser);
        alert('Enrollment application submitted successfully!');
        navigate('/dashboard-student');
      } else {
        if (response.data.auto_rejected) {
          setRejectionModal({ show: true, reason: response.data.reason || response.data.message });
        } else {
          setErrorMessage(response.data.message || 'Failed to submit enrollment application');
        }
      }
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="svcc-exist-enroll-container">
        <div className="svcc-exist-enroll-loading">
          <div className="svcc-exist-enroll-spinner"></div>
          <p>Loading enrollment form...</p>
        </div>
      </div>
    );
  }

  // ── Step 2: Course Selection ──────────────────────────────────────────────
  if (step === 2) {
    // Group courses: applying year/term first, then the rest
    const applyingKey = `${formData.yearLevel}||${formData.term}`;
    const grouped = allCourses.reduce((acc, c) => {
      const key = `${c.year_level}||${c.term}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});
    // Sort keys so applying year/term is first
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === applyingKey) return -1;
      if (b === applyingKey) return 1;
      return 0;
    });
    return (
      <div className="svcc-exist-enroll-container">
        {rejectionModal.show && (
          <div className="svcc-rejection-overlay">
            <div className="svcc-rejection-modal">
              <div className="svcc-rejection-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h2 className="svcc-rejection-title">Enrollment Application Not Approved</h2>
              <p className="svcc-rejection-body">
                We regret to inform you that your enrollment application cannot be processed at this time due to the following reason:
              </p>
              <div className="svcc-rejection-reason">{rejectionModal.reason}</div>
              <p className="svcc-rejection-contact">
                For assistance, please contact the <strong>Registrar's Office</strong> or reach out to your <strong>Program Administrator</strong> to discuss your options and next steps.
              </p>
              <button
                className="svcc-rejection-btn"
                onClick={() => { setRejectionModal({ show: false, reason: '' }); navigate('/dashboard-student'); }}
              >
                Understood, Return to Dashboard
              </button>
            </div>
          </div>
        )}
        <div className="svcc-exist-enroll-wrapper">
          <div className="svcc-exist-enroll-header">
            <h1 className="svcc-exist-enroll-title">Select Your Courses</h1>
            <p className="svcc-exist-enroll-subtitle">
              Applying for: <strong>{formData.yearLevel} – {formData.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</strong>
            </p>
          </div>
          {errorMessage && (
            <div className="svcc-exist-enroll-error">{errorMessage}</div>
          )}
          {coursesLoading ? (
            <div className="svcc-exist-enroll-loading">
              <div className="svcc-exist-enroll-spinner"></div>
              <p>Loading courses...</p>
            </div>
          ) : (
            <>
              {sortedKeys.map(key => {
                const [yl, tm] = key.split('||');
                const isApplying = key === applyingKey;
                return (
                  <div key={key} style={{ marginBottom: '24px' }}>
                    <h3 style={{
                      padding: '8px 12px',
                      background: isApplying ? '#1a73e8' : '#f0f0f0',
                      color: isApplying ? '#fff' : '#333',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      {yl} – {tm.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')} {isApplying ? '(Your Applying Term)' : ''}
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Select</th>
                          <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Code</th>
                          <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Course Name</th>
                          <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Units</th>
                          <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Prerequisite</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped[key].map(course => {
                          const checked = !!selectedCourses.find(c => c.id === course.id);
                          return (
                            <tr key={course.id} style={{ background: checked ? '#e8f0fe' : '#fff' }}>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                <input type="checkbox" checked={checked} onChange={() => toggleCourse(course)} />
                              </td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 600 }}>{course.course_code}</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{course.course_name}</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{course.units_required}</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', color: '#666' }}>{course.prerequisite || 'None'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={() => setStep(1)}
                  className="svcc-exist-enroll-submit-btn"
                  style={{ background: '#6c757d' }}
                  disabled={isSubmitting}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="svcc-exist-enroll-submit-btn"
                  disabled={isSubmitting || selectedCourses.length === 0}
                >
                  {isSubmitting ? 'Submitting...' : `Submit Application (${selectedCourses.length} courses selected)`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="svcc-exist-enroll-container">
      <div className="svcc-exist-enroll-wrapper">
        <div className="svcc-exist-enroll-header">
          <svg 
            className="svcc-exist-enroll-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="svcc-exist-enroll-title">Enrollment Application</h1>
          <p className="svcc-exist-enroll-subtitle">Complete all required fields to submit your enrollment application</p>
        </div>

        {errorMessage && (
          <div className="svcc-exist-enroll-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}

        <form className="svcc-exist-enroll-form" onSubmit={handleNextStep}>
          {/* Row 1: Student Number and Program */}
          <div className="svcc-exist-enroll-row">
            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="studentNumber">
                Student Number <span className="svcc-exist-enroll-required">*</span>
              </label>
              <input
                type="text"
                id="studentNumber"
                name="studentNumber"
                className="svcc-exist-enroll-input"
                value={formData.studentNumber}
                onChange={handleChange}
                placeholder="Enter student number"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="program">
                Program <span className="svcc-exist-enroll-required">*</span>
              </label>
              <input
                type="text"
                id="program"
                name="program"
                className="svcc-exist-enroll-input"
                value={formData.program}
                disabled
                style={{backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
              />
              <p className="svcc-exist-enroll-field-hint">BSIT program only</p>
            </div>
          </div>

          {/* Row 2: School Year, Year Level and Term */}
          <div className="svcc-exist-enroll-row svcc-exist-enroll-row-term">
            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="schoolYear">
                School Year <span className="svcc-exist-enroll-required">*</span>
              </label>
              <select
                id="schoolYear"
                name="schoolYear"
                className="svcc-exist-enroll-select"
                value={formData.schoolYear}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select school year</option>
                {schoolYears.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="yearLevel">
                Year Level <span className="svcc-exist-enroll-required">*</span>
              </label>
              <select
                id="yearLevel"
                name="yearLevel"
                className="svcc-exist-enroll-select"
                value={formData.yearLevel}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select year level</option>
                {yearLevels.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="term">
                Term <span className="svcc-exist-enroll-required">*</span>
              </label>
              <select
                id="term"
                name="term"
                className="svcc-exist-enroll-select"
                value={formData.term}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select term</option>
                {terms.map((term, index) => (
                  <option key={index} value={term}>{term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: First Name, Last Name, Middle Name, Suffix */}
          <div className="svcc-exist-enroll-row svcc-exist-enroll-row-names">
            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="firstName">
                First Name <span className="svcc-exist-enroll-required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="svcc-exist-enroll-input"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="lastName">
                Last Name <span className="svcc-exist-enroll-required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="svcc-exist-enroll-input"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="middleName">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                className="svcc-exist-enroll-input"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Middle name"
                disabled={isSubmitting}
              />
            </div>

            <div className="svcc-exist-enroll-field svcc-exist-enroll-field-suffix">
              <label className="svcc-exist-enroll-label" htmlFor="suffix">
                Suffix
              </label>
              <select
                id="suffix"
                name="suffix"
                className="svcc-exist-enroll-select"
                value={formData.suffix}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {suffixes.map((suffix, index) => (
                  <option key={index} value={suffix}>{suffix || 'None'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="svcc-exist-enroll-submit-wrapper">
            <button 
              type="submit" 
              className="svcc-exist-enroll-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="svcc-exist-enroll-spinner" viewBox="0 0 24 24">
                    <circle className="svcc-exist-enroll-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Next: Select Courses →'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExistEnroll;