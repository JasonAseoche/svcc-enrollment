import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, AlertCircle, ArrowLeft, Check, XCircle } from 'lucide-react';
import '../../components/InstructorLayout/StudentEvaluation.css';

// Mock data for evaluations
const MOCK_EVALUATIONS = [
  {
    id: 1,
    courseName: 'Data Structures and Algorithms',
    enrolledStudents: 35,
    evaluationRequests: 35,
    section: 'BSIT-301',
    pending: 8,
    approved: 27
  },
  {
    id: 2,
    courseName: 'Web Development 2',
    enrolledStudents: 28,
    evaluationRequests: 28,
    section: 'BSIT-301',
    pending: 12,
    approved: 16
  },
  {
    id: 3,
    courseName: 'Database Management Systems',
    enrolledStudents: 32,
    evaluationRequests: 32,
    section: 'BSIT-302',
    pending: 5,
    approved: 27
  },
  {
    id: 4,
    courseName: 'Software Engineering',
    enrolledStudents: 30,
    evaluationRequests: 30,
    section: 'BSIT-201',
    pending: 15,
    approved: 15
  },
  {
    id: 5,
    courseName: 'Mobile Application Development',
    enrolledStudents: 25,
    evaluationRequests: 25,
    section: 'BSIT-302',
    pending: 3,
    approved: 22
  },
  {
    id: 6,
    courseName: 'Computer Networks',
    enrolledStudents: 27,
    evaluationRequests: 27,
    section: 'BSIT-201',
    pending: 0,
    approved: 27
  },
  {
    id: 7,
    courseName: 'Information Security',
    enrolledStudents: 29,
    evaluationRequests: 29,
    section: 'BSIT-301',
    pending: 20,
    approved: 9
  },
  {
    id: 8,
    courseName: 'Systems Analysis and Design',
    enrolledStudents: 31,
    evaluationRequests: 31,
    section: 'BSIT-302',
    pending: 7,
    approved: 24
  }
];

// Mock data for students in evaluations
const MOCK_EVALUATION_STUDENTS = {
  1: [
    { id: 1, studentNumber: 'STU-2024-001', name: 'Maria Santos', section: 'BSIT-301', finalGrade: 1.75, status: 'pending' },
    { id: 2, studentNumber: 'STU-2024-002', name: 'Juan Dela Cruz', section: 'BSIT-301', finalGrade: 1.50, status: 'approved' },
    { id: 3, studentNumber: 'STU-2024-003', name: 'Ana Reyes', section: 'BSIT-301', finalGrade: 2.00, status: 'pending' },
    { id: 4, studentNumber: 'STU-2024-004', name: 'Carlos Mendez', section: 'BSIT-301', finalGrade: 1.25, status: 'approved' },
    { id: 5, studentNumber: 'STU-2024-005', name: 'Lisa Garcia', section: 'BSIT-301', finalGrade: 2.25, status: 'pending' }
  ],
  2: [
    { id: 6, studentNumber: 'STU-2024-006', name: 'Robert Torres', section: 'BSIT-301', finalGrade: 1.50, status: 'pending' },
    { id: 7, studentNumber: 'STU-2024-007', name: 'Elena Martinez', section: 'BSIT-301', finalGrade: 2.00, status: 'approved' },
    { id: 8, studentNumber: 'STU-2024-008', name: 'Pedro Gonzales', section: 'BSIT-301', finalGrade: 1.75, status: 'pending' }
  ],
  3: [
    { id: 9, studentNumber: 'STU-2024-009', name: 'Sofia Ramirez', section: 'BSIT-302', finalGrade: 1.25, status: 'approved' },
    { id: 10, studentNumber: 'STU-2024-010', name: 'Diego Rivera', section: 'BSIT-302', finalGrade: 1.50, status: 'approved' },
    { id: 11, studentNumber: 'STU-2024-011', name: 'Carmen Lopez', section: 'BSIT-302', finalGrade: 2.00, status: 'pending' }
  ],
};

const StudentEvaluation = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [evaluationSearchTerm, setEvaluationSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setEvaluations(MOCK_EVALUATIONS);
  }, []);

  const filteredEvaluations = useMemo(() => {
    const evalArray = Array.isArray(evaluations) ? evaluations : [];
    if (!evaluationSearchTerm) return evalArray;
    const searchLower = evaluationSearchTerm.toLowerCase();
    return evalArray.filter(evaluation => 
      evaluation.courseName.toLowerCase().includes(searchLower) ||
      evaluation.section.toLowerCase().includes(searchLower)
    );
  }, [evaluations, evaluationSearchTerm]);

  const filteredStudents = useMemo(() => {
    const studentArray = Array.isArray(students) ? students : [];
    if (!studentSearchTerm) return studentArray;
    const searchLower = studentSearchTerm.toLowerCase();
    return studentArray.filter(student => 
      student.name.toLowerCase().includes(searchLower) ||
      student.studentNumber.toLowerCase().includes(searchLower) ||
      student.section.toLowerCase().includes(searchLower)
    );
  }, [students, studentSearchTerm]);

  const handleViewEvaluation = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setCurrentView('students');
    const evalStudents = MOCK_EVALUATION_STUDENTS[evaluation.id] || [];
    setStudents(evalStudents);
    setStudentSearchTerm('');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedEvaluation(null);
    setStudentSearchTerm('');
  };

  const handleApprove = (studentId) => {
    setStudents(students.map(student =>
      student.id === studentId ? { ...student, status: 'approved' } : student
    ));
    setMessage({ text: 'Student evaluation approved successfully', type: 'success' });
  };

  const handleReject = (studentId) => {
    setStudents(students.map(student =>
      student.id === studentId ? { ...student, status: 'rejected' } : student
    ));
    setMessage({ text: 'Student evaluation rejected', type: 'success' });
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderListView = () => (
    <div className="studenteval-container">
      <div className="studenteval-header-card">
        <div className="studenteval-header-content">
          <h1 className="studenteval-page-title">Student Evaluation</h1>
          <div className="studenteval-header-actions">
            <div className="studenteval-search-container">
              <input
                type="text"
                placeholder="Search evaluations..."
                className="studenteval-search-input"
                value={evaluationSearchTerm}
                onChange={(e) => setEvaluationSearchTerm(e.target.value)}
              />
              <Search className="studenteval-search-icon" size={18} />
              {evaluationSearchTerm && (
                <button onClick={() => setEvaluationSearchTerm('')} className="studenteval-search-clear">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="studenteval-evaluations-container">
        {isLoading ? (
          <div className="studenteval-loading-container">
            <div className="studenteval-loading-spinner"></div>
            <p className="studenteval-loading-text">Loading evaluations...</p>
          </div>
        ) : isError ? (
          <div className="studenteval-error-container">
            <AlertCircle size={40} className="studenteval-error-icon" />
            <p className="studenteval-error-text">Failed to load evaluations</p>
            <button onClick={() => { setIsError(false); setEvaluations(MOCK_EVALUATIONS); }} className="studenteval-retry-button">Try Again</button>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="studenteval-empty-container">
            {evaluationSearchTerm ? (
              <>
                <p className="studenteval-empty-text">No evaluations found matching "{evaluationSearchTerm}"</p>
                <button onClick={() => setEvaluationSearchTerm('')} className="studenteval-empty-action">Clear search</button>
              </>
            ) : (
              <p className="studenteval-empty-text">No evaluations available</p>
            )}
          </div>
        ) : (
          <div className="studenteval-evaluations-grid">
            {filteredEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="studenteval-evaluation-card">
                <div className="studenteval-card-header">
                  <h3 className="studenteval-course-name">{evaluation.courseName}</h3>
                  <div className="studenteval-card-actions">
                    <button onClick={() => handleViewEvaluation(evaluation)} className="studenteval-btn studenteval-btn-view">View</button>
                  </div>
                </div>
                <div className="studenteval-card-content">
                  <div className="studenteval-info-item">
                    <span className="studenteval-info-label">No. of Student Enrolled:</span>
                    <span className="studenteval-info-value">{evaluation.enrolledStudents}</span>
                  </div>
                  <div className="studenteval-info-item">
                    <span className="studenteval-info-label">No. of Evaluation Request:</span>
                    <span className="studenteval-info-value">{evaluation.evaluationRequests}</span>
                  </div>
                  <div className="studenteval-info-item">
                    <span className="studenteval-info-label">Section:</span>
                    <span className="studenteval-info-value">{evaluation.section}</span>
                  </div>
                  <div className="studenteval-divider"></div>
                  <div className="studenteval-status-row">
                    <div className="studenteval-status-item">
                      <span className="studenteval-status-label">Pending:</span>
                      <span className="studenteval-status-value studenteval-pending">{evaluation.pending}</span>
                    </div>
                    <div className="studenteval-status-item">
                      <span className="studenteval-status-label">Approved:</span>
                      <span className="studenteval-status-value studenteval-approved">{evaluation.approved}</span>
                    </div>
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
            <button onClick={handleBackToList} className="studenteval-back-button"><ArrowLeft size={20} /></button>
            <h1 className="studenteval-page-title">{selectedEvaluation?.courseName}</h1>
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
                <button onClick={() => setStudentSearchTerm('')} className="studenteval-search-clear"><X size={18} /></button>
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

      <div className="studenteval-table-container">
        {filteredStudents.length === 0 ? (
          <div className="studenteval-empty-container">
            <p className="studenteval-empty-text">No students found</p>
          </div>
        ) : (
          <div className="studenteval-table-scroll">
            <table className="studenteval-table">
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Final Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td data-label="Student Number:"><div className="studenteval-student-number">{student.studentNumber}</div></td>
                    <td data-label="Name:"><div className="studenteval-student-name">{student.name}</div></td>
                    <td data-label="Section:">{student.section}</td>
                    <td data-label="Final Grade:"><div className="studenteval-grade">{student.finalGrade.toFixed(2)}</div></td>
                    <td data-label="Action:" className="studenteval-actions-cell">
                      <div className="studenteval-actions-buttons">
                        {student.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApprove(student.id)} className="studenteval-action-btn studenteval-approve-btn"><Check size={16} />Approve</button>
                            <button onClick={() => handleReject(student.id)} className="studenteval-action-btn studenteval-reject-btn"><XCircle size={16} />Reject</button>
                          </>
                        ) : (
                          <span className={`studenteval-status-badge-action ${student.status}`}>
                            {student.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
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

  return currentView === 'list' ? renderListView() : renderStudentsView();
};

export default StudentEvaluation;