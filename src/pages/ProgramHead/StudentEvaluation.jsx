import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, AlertCircle, ArrowLeft, Check, XCircle } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser } from '../../utils/auth';
import '../../components/HeadLayout/StudentEvaluation.css';

const StudentEvaluation = () => {
  const currentUser = getCurrentUser();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };
  const [currentView, setCurrentView] = useState('sections');
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [sectionSearchTerm, setSectionSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [gradeSearchTerm, setGradeSearchTerm] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      console.log('Fetching sections...');
      
      const response = await axios.get(
        'http://localhost/svcc-enrollment/student_evaluation.php?action=getSections'
      );
      
      console.log('Sections response:', response.data);
      
      if (response.data.success) {
        setSections(response.data.data || []);
        console.log('Sections loaded:', response.data.data);
      } else {
        console.error('Failed to load sections:', response.data);
        setIsError(true);
        setMessage({ text: response.data.error || 'Failed to load sections', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      console.error('Error details:', error.response?.data);
      setIsError(true);
      setMessage({ text: 'Network error loading sections. Check console for details.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSections = useMemo(() => {
    const sectionArray = Array.isArray(sections) ? sections : [];
    if (!sectionSearchTerm) return sectionArray;
    const searchLower = sectionSearchTerm.toLowerCase();
    return sectionArray.filter(section => 
      (section.sectionName || '').toLowerCase().includes(searchLower) ||
      (section.program || '').toLowerCase().includes(searchLower)
    );
  }, [sections, sectionSearchTerm]);

  const filteredStudents = useMemo(() => {
    const studentArray = Array.isArray(students) ? students : [];
    if (!studentSearchTerm) return studentArray;
    const searchLower = studentSearchTerm.toLowerCase();
    return studentArray.filter(student => 
      (student.name || '').toLowerCase().includes(searchLower) ||
      (student.studentNumber || '').toLowerCase().includes(searchLower)
    );
  }, [students, studentSearchTerm]);

  const filteredGrades = useMemo(() => {
    const gradeArray = Array.isArray(studentGrades) ? studentGrades : [];
    if (!gradeSearchTerm) return gradeArray;
    const searchLower = gradeSearchTerm.toLowerCase();
    return gradeArray.filter(grade => 
      (grade.courseName || '').toLowerCase().includes(searchLower) ||
      (grade.courseCode || '').toLowerCase().includes(searchLower)
    );
  }, [studentGrades, gradeSearchTerm]);

  const handleViewSection = async (section) => {
    try {
      setSelectedSection(section);
      setCurrentView('students');
      setIsLoading(true);
      setStudents([]); // Clear previous students
      console.log('Fetching students for section:', section.id);
      
      const response = await axios.get(
        `http://localhost/svcc-enrollment/student_evaluation.php?action=getSectionStudents&sectionId=${section.id}`
      );
      
      console.log('Students response:', response.data);
      
      if (response.data.success) {
        const studentsData = response.data.data || [];
        setStudents(studentsData);
        console.log('Students loaded:', studentsData);
        
        if (studentsData.length === 0) {
          setMessage({ text: 'No students with pending applications in this section', type: 'info' });
        }
      } else {
        console.error('Failed to load students:', response.data);
        setMessage({ text: response.data.error || 'Failed to load students', type: 'error' });
      }
      setStudentSearchTerm('');
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error details:', error.response?.data);
      setMessage({ text: 'Error loading students. Check console for details.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const [studentCourseSelections, setStudentCourseSelections] = useState([]);
  const [allCoursesForReplace, setAllCoursesForReplace] = useState([]);
  const [courseEvalState, setCourseEvalState] = useState({}); // { selectionId: { action, replace_course_id } }
  const [selectedCourseRows, setSelectedCourseRows] = useState([]); // for batch checkbox

  const handleViewStudent = async (student) => {
    try {
      setSelectedStudent(student);
      setCurrentView('grades');
      setIsLoading(true);
      setStudentGrades([]);
      setStudentCourseSelections([]);
      setCourseEvalState({});
      setSelectedCourseRows([]);
      console.log('Fetching grades for user:', student.userId);
      
      const [gradesResp, coursesResp, allCoursesResp] = await Promise.all([
        axios.get(`http://localhost/svcc-enrollment/student_evaluation.php?action=getStudentGrades&userId=${student.userId}`),
        axios.get(`http://localhost/svcc-enrollment/student_evaluation.php?action=getStudentCourseSelections&applicationId=${student.applicationId}`),
        axios.get(`http://localhost/svcc-enrollment/submit_enrollment.php?action=getCourses`)
      ]);

      if (gradesResp.data.success) setStudentGrades(gradesResp.data.data || []);
      if (coursesResp.data.success) {
        const sel = coursesResp.data.data || [];
        setStudentCourseSelections(sel);
        const initState = {};
        sel.forEach(c => {
          initState[c.selection_id] = { action: c.status === 'pending' ? '' : c.status, replace_course_id: c.replaced_by_course_id || '' };
        });
        setCourseEvalState(initState);
      }
      if (allCoursesResp.data.success) setAllCoursesForReplace(allCoursesResp.data.data || []);

      const response = gradesResp; // for legacy code below
      
      console.log('Grades response:', response.data);
      
      if (!gradesResp.data.success) {
        setMessage({ text: gradesResp.data.error || 'Failed to load grades', type: 'error' });
      }
      setGradeSearchTerm('');
    } catch (error) {
      console.error('Error fetching grades:', error);
      setMessage({ text: 'Error loading grades. Check console for details.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourseEvaluations = async () => {
    const courses = studentCourseSelections
      .filter(c => c.status === 'pending')
      .map(c => {
        const ev = courseEvalState[c.selection_id] || {};
        return {
          selection_id: c.selection_id,
          action: ev.action || 'approve',
          replace_course_id: ev.replace_course_id || null
        };
      });
    if (courses.some(c => c.action === 'change' && !c.replace_course_id)) {
      setMessage({ text: 'Please select a replacement course for all "Change" actions', type: 'error' });
      return;
    }
    try {
      setIsLoading(true);
      const res = await axios.post(
        'http://localhost/svcc-enrollment/student_evaluation.php?action=evaluateCourses',
        { applicationId: selectedStudent.applicationId, evaluatedBy: currentUser?.user_id, courses },
        { headers: auditHeaders }
      );
      if (res.data.success) {
        setMessage({ text: 'Course evaluations saved!', type: 'success' });
        await handleViewStudent(selectedStudent);
      } else {
        setMessage({ text: res.data.error || 'Failed to save', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchCourseAction = (action) => {
    const updated = { ...courseEvalState };
    selectedCourseRows.forEach(selId => {
      updated[selId] = { ...updated[selId], action };
    });
    setCourseEvalState(updated);
    setSelectedCourseRows([]);
  };

  const handleBackToSections = () => {
    setCurrentView('sections');
    setSelectedSection(null);
    setSectionSearchTerm('');
    setMessage({ text: '', type: '' });
  };

  const handleBackToStudents = () => {
    setCurrentView('students');
    setSelectedStudent(null);
    setGradeSearchTerm('');
    setMessage({ text: '', type: '' });
  };

  const handleApproveStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to approve ${student.name}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('Approving student:', student);
      
      const response = await axios.post(
        'http://localhost/svcc-enrollment/student_evaluation.php?action=approveStudent',
        {
          applicationId: student.applicationId,
          evaluatedBy: currentUser?.user_id
        },
        { headers: auditHeaders }
      );
      
      console.log('Approve response:', response.data);
      
      if (response.data.success) {
        setMessage({ text: 'Student evaluation approved successfully', type: 'success' });
        // Refresh the student list
        await handleViewSection(selectedSection);
        
        // If we're viewing grades, go back to students
        if (currentView === 'grades') {
          setCurrentView('students');
          setSelectedStudent(null);
        }
      } else {
        console.error('Approval failed:', response.data);
        setMessage({ text: response.data.error || 'Failed to approve student', type: 'error' });
      }
    } catch (error) {
      console.error('Error approving student:', error);
      console.error('Error details:', error.response?.data);
      setMessage({ text: 'Error approving student. Check console for details.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectStudent = async (student) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      setMessage({ text: 'Rejection reason is required', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Rejecting student:', student);
      
      const response = await axios.post(
        'http://localhost/svcc-enrollment/student_evaluation.php?action=rejectStudent',
        {
          applicationId: student.applicationId,
          reason: reason.trim(),
          evaluatedBy: currentUser?.user_id
        },
        { headers: auditHeaders }
      );
      
      console.log('Reject response:', response.data);
      
      if (response.data.success) {
        setMessage({ text: 'Student evaluation rejected', type: 'success' });
        // Refresh the student list
        await handleViewSection(selectedSection);
        
        // If we're viewing grades, go back to students
        if (currentView === 'grades') {
          setCurrentView('students');
          setSelectedStudent(null);
        }
      } else {
        console.error('Rejection failed:', response.data);
        setMessage({ text: response.data.error || 'Failed to reject student', type: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting student:', error);
      console.error('Error details:', error.response?.data);
      setMessage({ text: 'Error rejecting student. Check console for details.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderSectionsView = () => (
    <div className="studenteval-container">
      <div className="studenteval-header-card">
        <div className="studenteval-header-content">
          <h1 className="studenteval-page-title">Student Evaluation</h1>
          <div className="studenteval-header-actions">
            <div className="studenteval-search-container">
              <input
                type="text"
                placeholder="Search sections..."
                className="studenteval-search-input"
                value={sectionSearchTerm}
                onChange={(e) => setSectionSearchTerm(e.target.value)}
              />
              <Search className="studenteval-search-icon" size={18} />
              {sectionSearchTerm && (
                <button onClick={() => setSectionSearchTerm('')} className="studenteval-search-clear">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`studenteval-message ${message.type === 'success' ? 'studenteval-message-success' : 'studenteval-message-error'}`}>
          <AlertCircle size={20} className="studenteval-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="studenteval-sections-container">
        {isLoading ? (
          <div className="studenteval-loading-container">
            <div className="studenteval-loading-spinner"></div>
            <p className="studenteval-loading-text">Loading sections...</p>
          </div>
        ) : isError ? (
          <div className="studenteval-error-container">
            <AlertCircle size={40} className="studenteval-error-icon" />
            <p className="studenteval-error-text">Failed to load sections</p>
            <p className="studenteval-error-details">Please check the browser console for details</p>
            <button onClick={fetchSections} className="studenteval-retry-button">Try Again</button>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="studenteval-empty-container">
            {sectionSearchTerm ? (
              <>
                <p className="studenteval-empty-text">No sections found matching "{sectionSearchTerm}"</p>
                <button onClick={() => setSectionSearchTerm('')} className="studenteval-empty-action">Clear search</button>
              </>
            ) : (
              <>
                <p className="studenteval-empty-text">No sections available</p>
                <p className="studenteval-empty-subtext">Sections will appear here once they are created in the system</p>
              </>
            )}
          </div>
        ) : (
          <div className="studenteval-sections-grid">
            {filteredSections.map((section) => (
              <div key={section.id} className="studenteval-section-card">
                <div className="studenteval-card-header">
                  <div className="studenteval-section-title-wrapper">
                    <h3 className="studenteval-section-name">{section.sectionName}</h3>
                    {section.pendingEvaluations > 0 && (
                      <span className="studenteval-notification-badge">{section.pendingEvaluations}</span>
                    )}
                  </div>
                  <button onClick={() => handleViewSection(section)} className="studenteval-btn studenteval-btn-view">View</button>
                </div>
                <div className="studenteval-card-content">
                  <div className="studenteval-info-item">
                    <span className="studenteval-info-label">Program:</span>
                    <span className="studenteval-info-value">{section.program}</span>
                  </div>
                  <div className="studenteval-info-item">
                    <span className="studenteval-info-label">Year Level:</span>
                    <span className="studenteval-info-value">{section.yearLevel}</span>
                  </div>
                  <div className="studenteval-info-item">
                    <span className="studenteval-info-label">Total Students:</span>
                    <span className="studenteval-info-value">{section.totalStudents}</span>
                  </div>
                  <div className="studenteval-info-item">
                    <span className="studenteval-info-label">Sem:</span>
                    <span className="studenteval-info-value">{section.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentsView = () => (
    <div className="studenteval-container">
      <div className="studenteval-header-card">
        <div className="studenteval-header-content">
          <div className="studenteval-title-with-back">
            <button onClick={handleBackToSections} className="studenteval-back-button">
              <ArrowLeft size={20} />
            </button>
            <h1 className="studenteval-page-title">{selectedSection?.sectionName}</h1>
          </div>
          <div className="studenteval-header-actions">
            <div className="studenteval-search-container">
              <input
                type="text"
                placeholder="Search students..."
                className="studenteval-search-input"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
              />
              <Search className="studenteval-search-icon" size={18} />
              {studentSearchTerm && (
                <button onClick={() => setStudentSearchTerm('')} className="studenteval-search-clear">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`studenteval-message ${message.type === 'success' ? 'studenteval-message-success' : message.type === 'info' ? 'studenteval-message-info' : 'studenteval-message-error'}`}>
          <AlertCircle size={20} className="studenteval-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="studenteval-table-container">
        {isLoading ? (
          <div className="studenteval-loading-container">
            <div className="studenteval-loading-spinner"></div>
            <p className="studenteval-loading-text">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="studenteval-empty-container">
            {studentSearchTerm ? (
              <>
                <p className="studenteval-empty-text">No students found matching "{studentSearchTerm}"</p>
                <button onClick={() => setStudentSearchTerm('')} className="studenteval-empty-action">Clear search</button>
              </>
            ) : (
              <>
                <p className="studenteval-empty-text">No students found</p>
                <p className="studenteval-empty-subtext">Students with pending readmission applications will appear here</p>
              </>
            )}
          </div>
        ) : (
          <div className="studenteval-table-scroll">
            <table className="studenteval-table">
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>Name</th>
                  <th>GWA</th>
                  <th>Cumulative GWA</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td data-label="Student Number:">
                      <div className="studenteval-student-number">{student.studentNumber}</div>
                    </td>
                    <td data-label="Name:">
                      <div className="studenteval-student-name">{student.name}</div>
                    </td>
                    <td data-label="GWA:">
                      <span className="studenteval-gwa-cell">{student.gwa ? student.gwa.toFixed(2) : 'N/A'}</span>
                    </td>
                    <td data-label="Cumulative GWA:">
                      <span className="studenteval-cumulative-gwa-cell">{student.cumulativeGwa ? student.cumulativeGwa.toFixed(2) : 'N/A'}</span>
                    </td>
                    <td data-label="Status:">
                      <span className={`studenteval-status-badge ${student.status.toLowerCase()}`}>
                        {student.status}
                      </span>
                    </td>
                    <td data-label="Actions:">
                      <div className="studenteval-actions-group">
                        <button 
                          onClick={() => handleViewStudent(student)}
                          className="studenteval-table-action-btn studenteval-view-btn"
                          disabled={isLoading}
                        >
                          View
                        </button>
                        {student.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveStudent(student)}
                              className="studenteval-table-action-btn studenteval-approve-btn"
                              disabled={isLoading}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectStudent(student)}
                              className="studenteval-table-action-btn studenteval-reject-btn"
                              disabled={isLoading}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderGradesView = () => (
    <div className="studenteval-container">
      <div className="studenteval-header-card">
        <div className="studenteval-header-content">
          <div className="studenteval-title-with-back">
            <button onClick={handleBackToStudents} className="studenteval-back-button">
              <ArrowLeft size={20} />
            </button>
            <div className="studenteval-student-info">
              <h1 className="studenteval-page-title">{selectedStudent?.name}</h1>
              <span className="studenteval-student-number-badge">{selectedStudent?.studentNumber}</span>
            </div>
          </div>
          <div className="studenteval-header-actions">
            <div className="studenteval-search-container">
              <input
                type="text"
                placeholder="Search courses..."
                className="studenteval-search-input"
                value={gradeSearchTerm}
                onChange={(e) => setGradeSearchTerm(e.target.value)}
              />
              <Search className="studenteval-search-icon" size={18} />
              {gradeSearchTerm && (
                <button onClick={() => setGradeSearchTerm('')} className="studenteval-search-clear">
                  <X size={18} />
                </button>
              )}
            </div>
            {selectedStudent?.status === 'pending' && (
              <div className="studenteval-grade-actions">
                <button 
                  onClick={() => handleApproveStudent(selectedStudent)}
                  className="studenteval-approve-btn"
                  disabled={isLoading}
                >
                  <Check size={18} /> Approve All
                </button>
                <button 
                  onClick={() => handleRejectStudent(selectedStudent)}
                  className="studenteval-reject-btn"
                  disabled={isLoading}
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`studenteval-message ${message.type === 'success' ? 'studenteval-message-success' : message.type === 'info' ? 'studenteval-message-info' : 'studenteval-message-error'}`}>
          <AlertCircle size={20} className="studenteval-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      {/* ── Selected Courses Evaluation Panel ── */}
      {studentCourseSelections.length > 0 && (
        <div className="studenteval-table-container" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Selected Courses</h3>
            {selectedCourseRows.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="studenteval-approve-btn" onClick={() => handleBatchCourseAction('approve')}>
                  Batch Approve ({selectedCourseRows.length})
                </button>
                <button className="studenteval-reject-btn" onClick={() => handleBatchCourseAction('decline')}>
                  Batch Decline ({selectedCourseRows.length})
                </button>
              </div>
            )}
          </div>
          <div className="studenteval-table-scroll">
            <table className="studenteval-table">
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={e => {
                    if (e.target.checked) setSelectedCourseRows(studentCourseSelections.filter(c => c.status === 'pending').map(c => c.selection_id));
                    else setSelectedCourseRows([]);
                  }} /></th>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Units</th>
                  <th>Year / Term</th>
                  <th>Action</th>
                  <th>Replace With</th>
                </tr>
              </thead>
              <tbody>
                {studentCourseSelections.map(c => {
                  const ev = courseEvalState[c.selection_id] || {};
                  const isPending = c.status === 'pending';
                  return (
                    <tr key={c.selection_id} style={{ opacity: isPending ? 1 : 0.7 }}>
                      <td>
                        {isPending && (
                          <input type="checkbox"
                            checked={selectedCourseRows.includes(c.selection_id)}
                            onChange={e => {
                              if (e.target.checked) setSelectedCourseRows(prev => [...prev, c.selection_id]);
                              else setSelectedCourseRows(prev => prev.filter(id => id !== c.selection_id));
                            }} />
                        )}
                      </td>
                      <td><strong>{c.course_code}</strong></td>
                      <td>{c.course_name}</td>
                      <td style={{ textAlign: 'center' }}>{c.units}</td>
                      <td>{c.year_level} – {c.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</td>
                      <td>
                        {isPending ? (
                          <select value={ev.action || ''} onChange={e => setCourseEvalState(prev => ({ ...prev, [c.selection_id]: { ...prev[c.selection_id], action: e.target.value } }))}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Choose --</option>
                            <option value="approve">Approve</option>
                            <option value="decline">Decline</option>
                            <option value="change">Change</option>
                          </select>
                        ) : (
                          <span style={{
                            padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                            background: c.status === 'approved' ? '#e8f5e9' : c.status === 'declined' ? '#fce4ec' : '#fff3e0',
                            color: c.status === 'approved' ? '#2e7d32' : c.status === 'declined' ? '#c62828' : '#e65100'
                          }}>{c.status}</span>
                        )}
                      </td>
                      <td>
                        {isPending && ev.action === 'change' ? (
                          <select value={ev.replace_course_id || ''} onChange={e => setCourseEvalState(prev => ({ ...prev, [c.selection_id]: { ...prev[c.selection_id], replace_course_id: e.target.value } }))}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}>
                            <option value="">-- Select replacement --</option>
                            {allCoursesForReplace.map(rc => (
                              <option key={rc.id} value={rc.id}>{rc.course_code} – {rc.course_name} ({rc.year_level})</option>
                            ))}
                          </select>
                        ) : c.status === 'changed' ? (
                          <span style={{ color: '#e65100' }}>{c.replaced_by_course_code} – {c.replaced_by_course_name}</span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {studentCourseSelections.some(c => c.status === 'pending') && selectedStudent?.status === 'pending' && (
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="studenteval-approve-btn" onClick={handleSaveCourseEvaluations} disabled={isLoading}>
                Save Course Evaluations & Advance to Advising
              </button>
            </div>
          )}
        </div>
      )}

      <div className="studenteval-table-container">
        {isLoading ? (
          <div className="studenteval-loading-container">
            <div className="studenteval-loading-spinner"></div>
            <p className="studenteval-loading-text">Loading grades...</p>
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="studenteval-empty-container">
            {gradeSearchTerm ? (
              <>
                <p className="studenteval-empty-text">No courses found matching "{gradeSearchTerm}"</p>
                <button onClick={() => setGradeSearchTerm('')} className="studenteval-empty-action">Clear search</button>
              </>
            ) : (
              <>
                <p className="studenteval-empty-text">No grades found</p>
                <p className="studenteval-empty-subtext">This student has no recorded grades in the system</p>
              </>
            )}
          </div>
        ) : (
          <div className="studenteval-table-scroll">
            <table className="studenteval-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Year Level</th>
                  <th>Prelim</th>
                  <th>Midterm</th>
                  <th>Pre-Finals</th>
                  <th>Finals</th>
                  <th>Final Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className={grade.finalGrade >= 3.0 ? 'studenteval-failing-grade' : ''}>
                    <td data-label="Course Code:">
                      <div className="studenteval-course-code">{grade.courseCode}</div>
                    </td>
                    <td data-label="Course Name:">
                      <div className="studenteval-course-name-cell">{grade.courseName}</div>
                    </td>
                    <td data-label="Year Level:">
                      <span className="studenteval-year-level-cell">{grade.yearLevel || 'N/A'}</span>
                    </td>
                    <td data-label="Prelim:">
                      <span className="studenteval-grade-cell">{grade.prelim || '—'}</span>
                    </td>
                    <td data-label="Midterm:">
                      <span className="studenteval-grade-cell">{grade.midterm || '—'}</span>
                    </td>
                    <td data-label="Pre-Finals:">
                      <span className="studenteval-grade-cell">{grade.prefinals || '—'}</span>
                    </td>
                    <td data-label="Finals:">
                      <span className="studenteval-grade-cell">{grade.finals || '—'}</span>
                    </td>
                    <td data-label="Final Grade:">
                      <span className={`studenteval-final-grade-cell ${grade.finalGrade >= 3.0 ? 'studenteval-failing' : ''}`}>
                        {grade.finalGrade ? grade.finalGrade.toFixed(2) : '—'}
                        {grade.finalGrade >= 3.0 && ' ⚠️'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (currentView === 'sections') return renderSectionsView();
  if (currentView === 'students') return renderStudentsView();
  return renderGradesView();
};

export default StudentEvaluation;