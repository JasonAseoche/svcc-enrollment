import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, Eye, Check, XIcon, ArrowLeft, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser } from '../../utils/auth';
import '../../components/InstructorLayout/StudentAdvising.css';

const API_URL = 'http://localhost/svcc-enrollment/student_advising.php';

const StudentAdvising = () => {
  const currentUser = getCurrentUser();
  const [currentView, setCurrentView] = useState('list');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentGrades, setSelectedStudentGrades] = useState(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');
  const [sections, setSections] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [yearLevelFilter, setYearLevelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  useEffect(() => {
    fetchStudents();
    fetchSections();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, yearLevelFilter, statusFilter, students]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}?action=getAssignedStudents&instructorId=${currentUser.user_id}`
      );
      
      if (response.data.success) {
        setStudents(response.data.data || []);
      } else {
        setMessage({ text: 'Failed to load students', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ text: 'Failed to load students', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get(
        'http://localhost/svcc-enrollment/student_advising.php?action=getSections'
      );
      
      if (response.data.success) {
        setSections(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

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

  const handleViewGrades = async (student) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost/svcc-enrollment/student_advising.php?action=getStudentGrades&userId=${student.userId}`
      );
      
      if (response.data.success) {
        setSelectedStudent(student);
        setSelectedStudentGrades(response.data.data);
        setCurrentView('grades');
        setSelectedYearFilter('all');
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setMessage({ text: 'Failed to load grades', type: 'error' });
    } finally {
      setIsLoading(false);
    }
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
      setSelectedStudent(null);
      setActionType('batch');
      setShowSectionModal(true);
    };
  const handleReject = (student) => {
    setSelectedStudent(student);
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedSection) {
      setMessage({ text: 'Please select a section', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      
      if (actionType === 'batch') {
        for (const studentId of selectedStudentIds) {
          const student = students.find(s => s.id === studentId);
          await axios.post(
            'http://localhost/svcc-enrollment/student_advising.php?action=approveStudent',
            {
              applicationId: student.applicationId,
              sectionId: parseInt(selectedSection),
              advisedBy: currentUser.user_id
            },
            { headers: auditHeaders }
          );
        }
        setMessage({ text: `${selectedStudentIds.length} students approved successfully`, type: 'success' });
      } else {
        const response = await axios.post(
          'http://localhost/svcc-enrollment/student_advising.php?action=approveStudent',
          {
            applicationId: selectedStudent.applicationId,
            sectionId: parseInt(selectedSection),
            advisedBy: currentUser.user_id
          },
          { headers: auditHeaders }
        );
        
        if (response.data.success) {
          setMessage({ text: 'Student approved successfully', type: 'success' });
        }
      }

      setShowSectionModal(false);
      setSelectedSection('');
      setSelectedStudentIds([]);
      await fetchStudents();
      
      if (currentView === 'grades') {
        handleBackToList();
      }
    } catch (error) {
      console.error('Error approving student:', error);
      setMessage({ text: 'Failed to approve student', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setMessage({ text: 'Please provide a reason for rejection', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        'http://localhost/svcc-enrollment/student_advising.php?action=rejectStudent',
        {
          applicationId: selectedStudent.applicationId,
          reason: rejectReason.trim(),
          advisedBy: currentUser.user_id
        },
        { headers: auditHeaders }
      );
      
      if (response.data.success) {
        setMessage({ text: 'Student rejected', type: 'success' });
      }

      setShowRejectModal(false);
      setRejectReason('');
      await fetchStudents();
      
      if (currentView === 'grades') {
        handleBackToList();
      }
    } catch (error) {
      console.error('Error rejecting student:', error);
      setMessage({ text: 'Failed to reject student', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderListView = () => (
    <div className="student-advising-container">
      <div className="student-advising-header">
        <h1 className="student-advising-title">Student Advising</h1>
        <p className="student-advising-subtitle">Review and advise students for enrollment</p>
      </div>

      {message.text && (
        <div className={`student-advising-message ${message.type === 'error' ? 'student-advising-message-error' : 'student-advising-message-success'}`}>
          <AlertCircle size={20} />
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="student-advising-message-close">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="student-advising-search-wrapper">
        <div className="student-advising-search-container">
          <Search className="student-advising-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by student number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="student-advising-search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="student-advising-search-clear">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="student-advising-filters">
        <div className="student-advising-dropdown-container">
          <select
            value={yearLevelFilter}
            onChange={(e) => setYearLevelFilter(e.target.value)}
            className="student-advising-filter-select"
          >
            <option value="All">All</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>

        <div className="student-advising-dropdown-container">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="student-advising-filter-select"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button onClick={handleBatchApprove} className="student-advising-btn-primary">
          Approve All Pending
        </button>
      </div>

      {isLoading ? (
        <div className="student-advising-loading">Loading...</div>
      ) : (
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="student-advising-no-data">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.studentNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.yearLevel}</td>
                    <td>{student.dateRequest}</td>
                    <td>{student.gwa.toFixed(2)}</td>
                    <td>
                      <span className={`student-advising-badge ${student.overallEvaluation === 'Passed' ? 'student-advising-badge-success' : 'student-advising-badge-danger'}`}>
                        {student.overallEvaluation}
                      </span>
                    </td>
                    <td>
                      <span className={`student-advising-badge ${
                        student.status === 'Approved' ? 'student-advising-badge-success' :
                        student.status === 'Rejected' ? 'student-advising-badge-danger' :
                        'student-advising-badge-warning'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="student-advising-actions">
                        <button
                            onClick={() => handleViewGrades(student)}
                            className="student-advising-table-action-btn student-advising-view-btn"
                            disabled={isLoading}
                          >
                            View
                          </button>
                        {['Ready','Pending'].includes(student.status) && student.status === 'Ready' && (
                          <>
                            <button 
                              onClick={() => handleApprove(student)}
                                  className="student-advising-table-action-btn student-advising-approve-btn"
                                  disabled={isLoading}
                                >
                                  Approve
                                </button>
                            <button
                              onClick={() => handleReject(student)}
                              className="student-advising-table-action-btn student-advising-reject-btn"
                              disabled={isLoading}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderGradesView = () => {
    if (!selectedStudentGrades) {
      return (
        <div className="student-advising-container">
          <p>No grades available</p>
        </div>
      );
    }

    const yearLevels = Object.keys(selectedStudentGrades.years || {});
    const sortedYears = yearLevels.sort((a, b) => {
      const order = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      return order.indexOf(a) - order.indexOf(b);
    });

    const currentYearIndex = sortedYears.indexOf(selectedStudentGrades.currentYear);
    if (currentYearIndex > 0) {
      sortedYears.splice(currentYearIndex, 1);
      sortedYears.unshift(selectedStudentGrades.currentYear);
    }

    const displayYears = selectedYearFilter === 'all' ? sortedYears : [selectedYearFilter];

    return (
      <div className="student-advising-container">
        <div className="student-advising-header">
          <button onClick={handleBackToList} className="student-advising-back-btn">
            <ArrowLeft size={20} />
            Back to List
          </button>
          <div>
            <h1 className="student-advising-title">{selectedStudent?.name}</h1>
            <p className="student-advising-subtitle">{selectedStudent?.studentNumber}</p>
          </div>
        </div>

        <div className="student-advising-info-card">
          <div className="student-advising-info-item">
            <span className="student-advising-info-label">Year Level:</span>
            <span className="student-advising-info-value">{selectedStudentGrades.currentYear}</span>
          </div>
          <div className="student-advising-info-item">
            <span className="student-advising-info-label">Cumulative GWA:</span>
            <span className="student-advising-info-value">{selectedStudentGrades.cgwa.toFixed(2)}</span>
          </div>
          {selectedStudent?.receiptPath && (
            <div className="student-advising-info-item">
              <span className="student-advising-info-label">Payment Receipt:</span>
              <a href={selectedStudent.receiptPath} target="_blank" rel="noreferrer" className="student-advising-receipt-link">
                View Receipt
              </a>
            </div>
          )}
          <div className="student-advising-info-item">
              <span className="student-advising-info-label">Status:</span>
            <span className={`student-advising-badge ${
              selectedStudent?.status === 'Approved' ? 'student-advising-badge-success' :
              selectedStudent?.status === 'Rejected' ? 'student-advising-badge-danger' :
              'student-advising-badge-warning'
            }`}>
              {selectedStudent?.status}
            </span>
          </div>
        </div>

        <div className="student-advising-year-filter">
          <button
            onClick={() => setSelectedYearFilter('all')}
            className={`student-advising-year-btn ${selectedYearFilter === 'all' ? 'active' : ''}`}
          >
            All Years
          </button>
          {sortedYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYearFilter(year)}
              className={`student-advising-year-btn ${selectedYearFilter === year ? 'active' : ''}`}
            >
              {year.replace('Ter', 'Term')}
            </button>
          ))}
        </div>

        {displayYears.map(year => (
          <div key={year} className="student-advising-year-section">
            <div className="student-advising-year-header">
              <h2 className="student-advising-year-title">{year.replace('Ter', 'Term')}</h2>
              <span className="student-advising-year-gwa">
                GWA: {selectedStudentGrades.years[year].gwa.toFixed(2)}
              </span>
            </div>

            <div className="student-advising-table-container">
              <table className="student-advising-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Prelim</th>
                    <th>Midterm</th>
                    <th>Prefinals</th>
                    <th>Finals</th>
                    <th>Final Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentGrades.years[year].grades.map((grade, idx) => (
                    <tr key={idx}>
                      <td>{grade.courseCode}</td>
                      <td>{grade.courseName}</td>
                      <td>{grade.prelim.toFixed(2)}</td>
                      <td>{grade.midterm.toFixed(2)}</td>
                      <td>{grade.prefinals.toFixed(2)}</td>
                      <td>{grade.finals.toFixed(2)}</td>
                      <td>
                        <span className={`student-advising-grade ${grade.finalGrade >= 3.0 ? 'student-advising-grade-fail' : 'student-advising-grade-pass'}`}>
                          {grade.finalGrade.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {selectedStudent?.status === 'Pending' && (
          <div className="student-advising-grade-actions">
            <button onClick={() => handleReject(selectedStudent)} className="student-advising-btn-danger">
              Reject Student
            </button>
            <button onClick={() => handleApprove(selectedStudent)} className="student-advising-btn-primary">
                Approve Student
              </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {currentView === 'list' ? renderListView() : renderGradesView()}

      {showSectionModal && (
        <div className="student-advising-modal-overlay">
          <div className="student-advising-modal">
            <h3 className="student-advising-modal-title">Assign to Section</h3>
            <p className="student-advising-modal-text">
                {actionType === 'batch' 
                  ? `Assign ${filteredStudents.filter(s => s.status === 'Pending').length} pending students to a section` 
                  : `Assign ${selectedStudent?.name} to a section`}
              </p>
            <div className="student-advising-form-group">
              <label className="student-advising-form-label">Select Section*</label>
              <select 
                value={selectedSection} 
                onChange={(e) => setSelectedSection(e.target.value)} 
                className="student-advising-form-select"
              >
                <option value="">Choose a section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.section} ({section.yearLevel}) - {section.slots} slots available
                  </option>
                ))}
              </select>
            </div>
            <div className="student-advising-modal-actions">
              <button 
                onClick={() => { 
                  setShowSectionModal(false); 
                  setSelectedSection(''); 
                }} 
                className="student-advising-btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={confirmApprove} 
                className="student-advising-btn-primary" 
                disabled={isLoading}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="student-advising-modal-overlay">
          <div className="student-advising-modal">
            <h3 className="student-advising-modal-title">Reject Student</h3>
            <p className="student-advising-modal-text">
              Provide a reason for rejecting {selectedStudent?.name}
            </p>
            <div className="student-advising-form-group">
              <label className="student-advising-form-label">Reason*</label>
              <textarea 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                className="student-advising-form-textarea" 
                placeholder="Enter reason for rejection..." 
                rows="4"
              />
            </div>
            <div className="student-advising-modal-actions">
              <button 
                onClick={() => { 
                  setShowRejectModal(false); 
                  setRejectReason(''); 
                }} 
                className="student-advising-btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReject} 
                className="student-advising-btn-danger" 
                disabled={isLoading}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentAdvising;