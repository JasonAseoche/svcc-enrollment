import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, Eye, Check, XIcon, ArrowLeft, AlertCircle } from 'lucide-react';
import '../../components/HeadLayout/StudentAdvising.css';

// Mock data for students
const MOCK_STUDENTS = [
  { 
    id: 1, 
    studentNumber: '2021-00123', 
    name: 'Juan Dela Cruz', 
    yearLevel: '3rd Year', 
    dateRequest: '2024-01-15', 
    gwa: 1.75, 
    overallEvaluation: 'Passed', 
    status: 'Pending'
  },
  { 
    id: 2, 
    studentNumber: '2021-00124', 
    name: 'Maria Santos', 
    yearLevel: '2nd Year', 
    dateRequest: '2024-01-16', 
    gwa: 1.85, 
    overallEvaluation: 'Passed', 
    status: 'Pending'
  },
  { 
    id: 3, 
    studentNumber: '2021-00125', 
    name: 'Pedro Garcia', 
    yearLevel: '3rd Year', 
    dateRequest: '2024-01-14', 
    gwa: 1.50, 
    overallEvaluation: 'Passed', 
    status: 'Approved'
  },
  { 
    id: 4, 
    studentNumber: '2021-00126', 
    name: 'Ana Reyes', 
    yearLevel: '1st Year', 
    dateRequest: '2024-01-17', 
    gwa: 2.25, 
    overallEvaluation: 'Passed', 
    status: 'Pending'
  },
  { 
    id: 5, 
    studentNumber: '2021-00127', 
    name: 'Jose Cruz', 
    yearLevel: '4th Year', 
    dateRequest: '2024-01-13', 
    gwa: 1.65, 
    overallEvaluation: 'Passed', 
    status: 'Pending'
  },
  { 
    id: 6, 
    studentNumber: '2021-00128', 
    name: 'Rosa Mendoza', 
    yearLevel: '2nd Year', 
    dateRequest: '2024-01-18', 
    gwa: 3.00, 
    overallEvaluation: 'Not Passed', 
    status: 'Rejected'
  }
];

// Mock grades data
const MOCK_GRADES = {
  1: {
    currentYear: '3rd Year',
    cgwa: 1.82,
    years: {
      '1st Year': {
        gwa: 1.90,
        grades: [
          { courseCode: 'IT 111', courseName: 'Introduction to Computing', prelim: 1.75, midterm: 1.50, prefinals: 2.00, finals: 1.75, finalGrade: 1.75 },
          { courseCode: 'IT 112', courseName: 'Computer Programming 1', prelim: 2.00, midterm: 1.75, prefinals: 2.00, finals: 2.25, finalGrade: 2.00 }
        ]
      },
      '2nd Year': {
        gwa: 1.80,
        grades: [
          { courseCode: 'IT 211', courseName: 'Data Structures', prelim: 1.50, midterm: 1.75, prefinals: 2.00, finals: 1.75, finalGrade: 1.75 },
          { courseCode: 'IT 212', courseName: 'Database Systems', prelim: 1.75, midterm: 2.00, prefinals: 1.75, finals: 1.50, finalGrade: 1.75 }
        ]
      },
      '3rd Year': {
        gwa: 1.75,
        grades: [
          { courseCode: 'IT 311', courseName: 'Web Development', prelim: 1.50, midterm: 1.75, prefinals: 1.75, finals: 2.00, finalGrade: 1.75 },
          { courseCode: 'IT 312', courseName: 'Software Engineering', prelim: 1.75, midterm: 1.50, prefinals: 2.00, finals: 1.75, finalGrade: 1.75 }
        ]
      }
    }
  }
};

// Mock sections
const MOCK_SECTIONS = [
  { id: 1, section: 'BSIT-301', yearLevel: '3rd Year', slots: 5 },
  { id: 2, section: 'BSIT-302', yearLevel: '3rd Year', slots: 3 },
  { id: 3, section: 'BSIT-201', yearLevel: '2nd Year', slots: 8 },
  { id: 4, section: 'BSIT-202', yearLevel: '2nd Year', slots: 4 }
];

const StudentAdvising = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'grades'
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentGrades, setSelectedStudentGrades] = useState(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [yearLevelFilter, setYearLevelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Modals
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState(''); // 'single' or 'batch'
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  // Message
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setStudents(MOCK_STUDENTS);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, yearLevelFilter, statusFilter, students]);

  const applyFilters = useCallback(() => {
    let filtered = [...students];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.studentNumber.toLowerCase().includes(searchLower) ||
        student.name.toLowerCase().includes(searchLower)
      );
    }

    if (yearLevelFilter !== 'All') {
      filtered = filtered.filter(student => student.yearLevel === yearLevelFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, yearLevelFilter, statusFilter]);

  const handleViewGrades = (student) => {
    setSelectedStudent(student);
    setSelectedStudentGrades(MOCK_GRADES[student.id] || null);
    setCurrentView('grades');
    setSelectedYearFilter(student.yearLevel);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedStudent(null);
    setSelectedStudentGrades(null);
    setSelectedYearFilter('all');
  };

  const handleApprove = (student, isBatch = false) => {
    setSelectedStudent(student);
    setActionType(isBatch ? 'batch' : 'single');
    setShowSectionModal(true);
  };

  const handleBatchApprove = () => {
    const pendingStudents = filteredStudents.filter(s => s.status === 'Pending');
    if (pendingStudents.length === 0) {
      setMessage({ text: 'No pending students to approve', type: 'error' });
      return;
    }
    setSelectedStudentIds(pendingStudents.map(s => s.id));
    setActionType('batch');
    setShowSectionModal(true);
  };

  const handleReject = (student) => {
    setSelectedStudent(student);
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    if (!selectedSection) {
      setMessage({ text: 'Please select a section', type: 'error' });
      return;
    }

    if (actionType === 'batch') {
      setStudents(students.map(student => 
        selectedStudentIds.includes(student.id) 
          ? { ...student, status: 'Approved' }
          : student
      ));
      setMessage({ text: `${selectedStudentIds.length} students approved successfully`, type: 'success' });
    } else {
      setStudents(students.map(student => 
        student.id === selectedStudent.id 
          ? { ...student, status: 'Approved' }
          : student
      ));
      setMessage({ text: 'Student approved successfully', type: 'success' });
    }

    setShowSectionModal(false);
    setSelectedSection('');
    setSelectedStudentIds([]);
    if (currentView === 'grades') {
      handleBackToList();
    }
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      setMessage({ text: 'Please provide a reason for rejection', type: 'error' });
      return;
    }

    setStudents(students.map(student => 
      student.id === selectedStudent.id 
        ? { ...student, status: 'Rejected' }
        : student
    ));

    setMessage({ text: 'Student rejected', type: 'success' });
    setShowRejectModal(false);
    setRejectReason('');
    if (currentView === 'grades') {
      handleBackToList();
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Render List View
  const renderListView = () => (
    <div className="student-advising-container">
      <div className="student-advising-header-card">
        <div className="student-advising-header-content">
          <h1 className="student-advising-page-title">Student Advising</h1>
          <div className="student-advising-header-actions">
            <div className="student-advising-search-container">
              <input type="text" placeholder="Search students..." className="student-advising-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="student-advising-search-icon" size={18} />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="student-advising-search-clear"><X size={18} /></button>}
            </div>

            <div className="student-advising-filter-group">
              <div className="student-advising-filter-container">
                <button className="student-advising-filter-btn" onClick={() => setShowYearDropdown(!showYearDropdown)}>
                  <span>{yearLevelFilter === 'All' ? 'Year Level' : yearLevelFilter}</span>
                  <ChevronDown size={16} className={showYearDropdown ? 'rotated' : ''} />
                </button>
                {showYearDropdown && (
                  <div className="student-advising-dropdown">
                    <button onClick={() => { setYearLevelFilter('All'); setShowYearDropdown(false); }} className={yearLevelFilter === 'All' ? 'active' : ''}>All Year Levels</button>
                    <button onClick={() => { setYearLevelFilter('1st Year'); setShowYearDropdown(false); }} className={yearLevelFilter === '1st Year' ? 'active' : ''}>1st Year</button>
                    <button onClick={() => { setYearLevelFilter('2nd Year'); setShowYearDropdown(false); }} className={yearLevelFilter === '2nd Year' ? 'active' : ''}>2nd Year</button>
                    <button onClick={() => { setYearLevelFilter('3rd Year'); setShowYearDropdown(false); }} className={yearLevelFilter === '3rd Year' ? 'active' : ''}>3rd Year</button>
                    <button onClick={() => { setYearLevelFilter('4th Year'); setShowYearDropdown(false); }} className={yearLevelFilter === '4th Year' ? 'active' : ''}>4th Year</button>
                  </div>
                )}
              </div>

              <div className="student-advising-filter-container">
                <button className="student-advising-filter-btn" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                  <span>{statusFilter === 'All' ? 'Status' : statusFilter}</span>
                  <ChevronDown size={16} className={showStatusDropdown ? 'rotated' : ''} />
                </button>
                {showStatusDropdown && (
                  <div className="student-advising-dropdown">
                    <button onClick={() => { setStatusFilter('All'); setShowStatusDropdown(false); }} className={statusFilter === 'All' ? 'active' : ''}>All Status</button>
                    <button onClick={() => { setStatusFilter('Pending'); setShowStatusDropdown(false); }} className={statusFilter === 'Pending' ? 'active' : ''}>Pending</button>
                    <button onClick={() => { setStatusFilter('Approved'); setShowStatusDropdown(false); }} className={statusFilter === 'Approved' ? 'active' : ''}>Approved</button>
                    <button onClick={() => { setStatusFilter('Rejected'); setShowStatusDropdown(false); }} className={statusFilter === 'Rejected' ? 'active' : ''}>Rejected</button>
                  </div>
                )}
              </div>

              <button onClick={handleBatchApprove} className="student-advising-batch-btn">
                <Check size={18} />
                Batch Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`student-advising-message ${message.type === 'success' ? 'student-advising-message-success' : 'student-advising-message-error'}`}>
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      <div className="student-advising-table-container">
        <table className="student-advising-table">
          <thead>
            <tr>
              <th>Student Number</th>
              <th>Name</th>
              <th>Year Level</th>
              <th>Date Request</th>
              <th>GWA</th>
              <th>Overall Evaluation</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="student-advising-empty">No students found</td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td data-label="Student Number">{student.studentNumber}</td>
                  <td data-label="Name">{student.name}</td>
                  <td data-label="Year Level">{student.yearLevel}</td>
                  <td data-label="Date Request">{student.dateRequest}</td>
                  <td data-label="GWA"><span className="student-advising-gwa">{student.gwa.toFixed(2)}</span></td>
                  <td data-label="Overall Evaluation">
                    <span className={`student-advising-evaluation ${student.overallEvaluation === 'Passed' ? 'passed' : 'not-passed'}`}>
                      {student.overallEvaluation}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`student-advising-status status-${student.status.toLowerCase()}`}>
                      {student.status}
                    </span>
                  </td>
                  <td data-label="Action" className="student-advising-actions">
                    <button onClick={() => handleViewGrades(student)} className="student-advising-action-btn view-btn" title="View Grades"><Eye size={16} /></button>
                    {student.status === 'Pending' && (
                      <>
                        <button onClick={() => handleApprove(student)} className="student-advising-action-btn approve-btn" title="Approve"><Check size={16} /></button>
                        <button onClick={() => handleReject(student)} className="student-advising-action-btn reject-btn" title="Reject"><XIcon size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Grades View
  const renderGradesView = () => {
    if (!selectedStudentGrades) {
      return <div className="student-advising-container"><p>No grades available</p></div>;
    }

    const yearLevels = Object.keys(selectedStudentGrades.years);
    const sortedYears = yearLevels.sort((a, b) => {
      const order = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      return order.indexOf(a) - order.indexOf(b);
    });

    // Put current year first
    const currentYearIndex = sortedYears.indexOf(selectedStudentGrades.currentYear);
    if (currentYearIndex > 0) {
      sortedYears.splice(currentYearIndex, 1);
      sortedYears.unshift(selectedStudentGrades.currentYear);
    }

    const displayYears = selectedYearFilter === 'all' ? sortedYears : [selectedYearFilter];

    return (
      <div className="student-advising-container">
        <div className="student-advising-header-card">
          <div className="student-advising-header-content">
            <div className="student-advising-title-with-back">
              <button onClick={handleBackToList} className="student-advising-back-btn"><ArrowLeft size={20} /></button>
              <div>
                <h1 className="student-advising-page-title">{selectedStudent.name}</h1>
                <p className="student-advising-subtitle">{selectedStudent.studentNumber} - {selectedStudent.yearLevel}</p>
              </div>
            </div>
            <div className="student-advising-header-actions">
              <div className="student-advising-filter-container">
                <select value={selectedYearFilter} onChange={(e) => setSelectedYearFilter(e.target.value)} className="student-advising-year-select">
                  <option value="all">All Years</option>
                  {sortedYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              {selectedStudent.status === 'Pending' && (
                <div className="student-advising-grade-actions">
                  <button onClick={() => handleApprove(selectedStudent)} className="student-advising-approve-btn"><Check size={18} />Approve</button>
                  <button onClick={() => handleReject(selectedStudent)} className="student-advising-reject-btn"><XIcon size={18} />Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`student-advising-message ${message.type === 'success' ? 'student-advising-message-success' : 'student-advising-message-error'}`}>
            <AlertCircle size={20} />
            <span>{message.text}</span>
          </div>
        )}

        <div className="student-advising-gwa-summary">
          <div className="student-advising-gwa-card">
            <div className="student-advising-gwa-label">Current GWA</div>
            <div className="student-advising-gwa-value">{selectedStudent.gwa.toFixed(2)}</div>
          </div>
          <div className="student-advising-gwa-card">
            <div className="student-advising-gwa-label">CGWA</div>
            <div className="student-advising-gwa-value">{selectedStudentGrades.cgwa.toFixed(2)}</div>
          </div>
        </div>

        {displayYears.map(year => (
          <div key={year} className="student-advising-year-section">
            <div className="student-advising-year-header">
              <h2>{year}</h2>
              <span className="student-advising-year-gwa">GWA: {selectedStudentGrades.years[year].gwa.toFixed(2)}</span>
            </div>
            <div className="student-advising-grades-grid">
              {selectedStudentGrades.years[year].grades.map((grade, index) => (
                <div key={index} className="student-advising-grade-card">
                  <div className="student-advising-grade-header">
                    <span className="student-advising-course-code">{grade.courseCode}</span>
                    <span className="student-advising-final-grade">{grade.finalGrade.toFixed(2)}</span>
                  </div>
                  <div className="student-advising-course-name">{grade.courseName}</div>
                  <div className="student-advising-grade-breakdown">
                    <div className="student-advising-grade-item">
                      <span className="label">Prelim</span>
                      <span className="value">{grade.prelim.toFixed(2)}</span>
                    </div>
                    <div className="student-advising-grade-item">
                      <span className="label">Midterm</span>
                      <span className="value">{grade.midterm.toFixed(2)}</span>
                    </div>
                    <div className="student-advising-grade-item">
                      <span className="label">Pre-Finals</span>
                      <span className="value">{grade.prefinals.toFixed(2)}</span>
                    </div>
                    <div className="student-advising-grade-item">
                      <span className="label">Finals</span>
                      <span className="value">{grade.finals.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {currentView === 'list' ? renderListView() : renderGradesView()}

      {/* Section Assignment Modal */}
      {showSectionModal && (
        <div className="student-advising-modal-overlay">
          <div className="student-advising-modal">
            <h3 className="student-advising-modal-title">Assign to Section</h3>
            <p className="student-advising-modal-text">
              {actionType === 'batch' 
                ? `Assign ${selectedStudentIds.length} students to a section` 
                : `Assign ${selectedStudent?.name} to a section`}
            </p>
            <div className="student-advising-form-group">
              <label className="student-advising-form-label">Select Section*</label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="student-advising-form-select">
                <option value="">Choose a section</option>
                {MOCK_SECTIONS.map(section => (
                  <option key={section.id} value={section.section}>
                    {section.section} ({section.yearLevel}) - {section.slots} slots available
                  </option>
                ))}
              </select>
            </div>
            <div className="student-advising-modal-actions">
              <button onClick={() => { setShowSectionModal(false); setSelectedSection(''); }} className="student-advising-btn-secondary">Cancel</button>
              <button onClick={confirmApprove} className="student-advising-btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="student-advising-modal-overlay">
          <div className="student-advising-modal">
            <h3 className="student-advising-modal-title">Reject Student</h3>
            <p className="student-advising-modal-text">Provide a reason for rejecting {selectedStudent?.name}</p>
            <div className="student-advising-form-group">
              <label className="student-advising-form-label">Reason*</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="student-advising-form-textarea" placeholder="Enter reason for rejection..." rows="4"></textarea>
            </div>
            <div className="student-advising-modal-actions">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="student-advising-btn-secondary">Cancel</button>
              <button onClick={confirmReject} className="student-advising-btn-danger">Reject</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentAdvising;