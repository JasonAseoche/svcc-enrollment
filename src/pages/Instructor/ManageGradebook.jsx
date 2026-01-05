import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Download, Upload, ArrowLeft, Edit2, RotateCcw, AlertCircle, Save } from 'lucide-react';
import '../../components/InstructorLayout/ManageGradebook.css';

// Mock data for courses
const MOCK_COURSES = [
  {
    id: 1,
    courseName: 'Data Structures and Algorithms',
    enrolledStudents: 35,
    section: 'BSIT-301',
    term: '2025-2026 1st Term',
    prelim: 'Uploaded',
    midterm: 'Uploaded',
    prefinals: 'Not Uploaded',
    finals: 'Not Uploaded'
  },
  {
    id: 2,
    courseName: 'Web Development 2',
    enrolledStudents: 28,
    section: 'BSIT-301',
    term: '2025-2026 1st Term',
    prelim: 'Uploaded',
    midterm: 'Not Uploaded',
    prefinals: 'Not Uploaded',
    finals: 'Not Uploaded'
  },
  {
    id: 3,
    courseName: 'Database Management Systems',
    enrolledStudents: 32,
    section: 'BSIT-302',
    term: '2025-2026 1st Term',
    prelim: 'Uploaded',
    midterm: 'Uploaded',
    prefinals: 'Uploaded',
    finals: 'Not Uploaded'
  },
  {
    id: 4,
    courseName: 'Software Engineering',
    enrolledStudents: 30,
    section: 'BSIT-201',
    term: '2025-2026 1st Term',
    prelim: 'Not Uploaded',
    midterm: 'Not Uploaded',
    prefinals: 'Not Uploaded',
    finals: 'Not Uploaded'
  }
];

// Mock data for student grades
const MOCK_STUDENT_GRADES = {
  1: [
    { id: 1, studentNumber: 'STU-2024-001', studentName: 'Maria Santos', prelim: 85, midterm: 88, prefinals: null, finals: null, finalGrade: null },
    { id: 2, studentNumber: 'STU-2024-002', studentName: 'Juan Dela Cruz', prelim: 90, midterm: 92, prefinals: null, finals: null, finalGrade: null },
    { id: 3, studentNumber: 'STU-2024-003', studentName: 'Ana Reyes', prelim: 87, midterm: 85, prefinals: null, finals: null, finalGrade: null },
    { id: 4, studentNumber: 'STU-2024-004', studentName: 'Carlos Mendez', prelim: 91, midterm: 93, prefinals: null, finals: null, finalGrade: null },
    { id: 5, studentNumber: 'STU-2024-005', studentName: 'Lisa Garcia', prelim: 82, midterm: 86, prefinals: null, finals: null, finalGrade: null }
  ],
  2: [
    { id: 6, studentNumber: 'STU-2024-006', studentName: 'Robert Torres', prelim: 88, midterm: null, prefinals: null, finals: null, finalGrade: null },
    { id: 7, studentNumber: 'STU-2024-007', studentName: 'Elena Martinez', prelim: 92, midterm: null, prefinals: null, finals: null, finalGrade: null },
    { id: 8, studentNumber: 'STU-2024-008', studentName: 'Pedro Gonzales', prelim: 85, midterm: null, prefinals: null, finals: null, finalGrade: null }
  ],
  3: [
    { id: 9, studentNumber: 'STU-2024-009', studentName: 'Sofia Ramirez', prelim: 90, midterm: 92, prefinals: 88, finals: null, finalGrade: null },
    { id: 10, studentNumber: 'STU-2024-010', studentName: 'Diego Rivera', prelim: 87, midterm: 89, prefinals: 91, finals: null, finalGrade: null },
    { id: 11, studentNumber: 'STU-2024-011', studentName: 'Carmen Lopez', prelim: 93, midterm: 95, prefinals: 92, finals: null, finalGrade: null }
  ],
  4: [
    { id: 12, studentNumber: 'STU-2024-012', studentName: 'Miguel Fernandez', prelim: null, midterm: null, prefinals: null, finals: null, finalGrade: null },
    { id: 13, studentNumber: 'STU-2024-013', studentName: 'Isabel Cruz', prelim: null, midterm: null, prefinals: null, finals: null, finalGrade: null }
  ]
};

const ManageGradebook = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const [showImportModal, setShowImportModal] = useState(false);
  const [showManageGradeModal, setShowManageGradeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    prelim: '',
    midterm: '',
    prefinals: '',
    finals: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setCourses(MOCK_COURSES);
  }, []);

  const filteredCourses = useMemo(() => {
    const courseArray = Array.isArray(courses) ? courses : [];
    if (!courseSearchTerm) return courseArray;
    const searchLower = courseSearchTerm.toLowerCase();
    return courseArray.filter(course => 
      course.courseName.toLowerCase().includes(searchLower) ||
      course.section.toLowerCase().includes(searchLower)
    );
  }, [courses, courseSearchTerm]);

  const filteredStudents = useMemo(() => {
    const studentArray = Array.isArray(studentGrades) ? studentGrades : [];
    if (!studentSearchTerm) return studentArray;
    const searchLower = studentSearchTerm.toLowerCase();
    return studentArray.filter(student => 
      student.studentName.toLowerCase().includes(searchLower) ||
      student.studentNumber.toLowerCase().includes(searchLower)
    );
  }, [studentGrades, studentSearchTerm]);

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setCurrentView('grades');
    const grades = MOCK_STUDENT_GRADES[course.id] || [];
    setStudentGrades(grades);
    setStudentSearchTerm('');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCourse(null);
    setStudentSearchTerm('');
  };

  const handleDownloadTemplate = () => {
    setMessage({ text: 'Excel template downloaded successfully', type: 'success' });
  };

  const handleImportExcel = () => {
    setShowImportModal(false);
    setMessage({ text: 'Grades imported successfully', type: 'success' });
  };

  const handleRevertUpload = () => {
    setMessage({ text: 'Upload reverted successfully', type: 'success' });
  };

  const openManageGradeModal = (student) => {
    setSelectedStudent(student);
    setGradeForm({
      prelim: student.prelim || '',
      midterm: student.midterm || '',
      prefinals: student.prefinals || '',
      finals: student.finals || ''
    });
    setShowManageGradeModal(true);
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    
    setStudentGrades(studentGrades.map(student =>
      student.id === selectedStudent.id
        ? {
            ...student,
            prelim: gradeForm.prelim ? parseFloat(gradeForm.prelim) : null,
            midterm: gradeForm.midterm ? parseFloat(gradeForm.midterm) : null,
            prefinals: gradeForm.prefinals ? parseFloat(gradeForm.prefinals) : null,
            finals: gradeForm.finals ? parseFloat(gradeForm.finals) : null
          }
        : student
    ));
    
    setMessage({ text: 'Grades updated successfully', type: 'success' });
    setShowManageGradeModal(false);
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
    <div className="managegradebook-container">
      <div className="managegradebook-header-card">
        <div className="managegradebook-header-content">
          <h1 className="managegradebook-page-title">Manage Gradebook</h1>
          <div className="managegradebook-header-actions">
            <div className="managegradebook-search-container">
              <input type="text" placeholder="Search courses..." className="managegradebook-search-input" value={courseSearchTerm} onChange={(e) => setCourseSearchTerm(e.target.value)} />
              <Search className="managegradebook-search-icon" size={18} />
              {courseSearchTerm && (<button onClick={() => setCourseSearchTerm('')} className="managegradebook-search-clear"><X size={18} /></button>)}
            </div>
          </div>
        </div>
      </div>

      <div className="managegradebook-courses-container">
        {filteredCourses.length === 0 ? (
          <div className="managegradebook-empty-container"><p className="managegradebook-empty-text">No courses found</p></div>
        ) : (
          <div className="managegradebook-courses-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className="managegradebook-course-card">
                <div className="managegradebook-card-header">
                  <h3 className="managegradebook-course-name">{course.courseName}</h3>
                  <button onClick={() => handleViewCourse(course)} className="managegradebook-btn managegradebook-btn-view">View</button>
                </div>
                <div className="managegradebook-card-content">
                  <div className="managegradebook-info-item"><span className="managegradebook-info-label">No. of Enrolled Students:</span><span className="managegradebook-info-value">{course.enrolledStudents}</span></div>
                  <div className="managegradebook-info-item"><span className="managegradebook-info-label">Section:</span><span className="managegradebook-info-value">{course.section}</span></div>
                  <div className="managegradebook-info-item"><span className="managegradebook-info-label">Term:</span><span className="managegradebook-info-value">{course.term}</span></div>
                  <div className="managegradebook-divider"></div>
                  <div className="managegradebook-upload-status">
                    <div className="managegradebook-status-item"><span className="managegradebook-status-label">Prelim:</span><span className={`managegradebook-status-badge ${course.prelim === 'Uploaded' ? 'uploaded' : 'not-uploaded'}`}>{course.prelim}</span></div>
                    <div className="managegradebook-status-item"><span className="managegradebook-status-label">Midterm:</span><span className={`managegradebook-status-badge ${course.midterm === 'Uploaded' ? 'uploaded' : 'not-uploaded'}`}>{course.midterm}</span></div>
                    <div className="managegradebook-status-item"><span className="managegradebook-status-label">Pre-Finals:</span><span className={`managegradebook-status-badge ${course.prefinals === 'Uploaded' ? 'uploaded' : 'not-uploaded'}`}>{course.prefinals}</span></div>
                    <div className="managegradebook-status-item"><span className="managegradebook-status-label">Finals:</span><span className={`managegradebook-status-badge ${course.finals === 'Uploaded' ? 'uploaded' : 'not-uploaded'}`}>{course.finals}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGradesView = () => (
    <div className="managegradebook-container">
      <div className="managegradebook-header-card">
        <div className="managegradebook-header-content">
          <div className="managegradebook-title-with-back">
            <button onClick={handleBackToList} className="managegradebook-back-button"><ArrowLeft size={20} /></button>
            <h1 className="managegradebook-page-title">{selectedCourse?.courseName}</h1>
          </div>
          <div className="managegradebook-header-actions">
            <div className="managegradebook-search-container">
              <input type="text" placeholder="Search students..." className="managegradebook-search-input" value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)} />
              <Search className="managegradebook-search-icon" size={18} />
              {studentSearchTerm && (<button onClick={() => setStudentSearchTerm('')} className="managegradebook-search-clear"><X size={18} /></button>)}
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`managegradebook-message ${message.type === 'success' ? 'managegradebook-message-success' : 'managegradebook-message-error'}`}>
          <AlertCircle size={20} className="managegradebook-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="managegradebook-actions-bar">
        <button onClick={handleDownloadTemplate} className="managegradebook-action-btn managegradebook-download-btn"><Download size={18} />Download Excel Template</button>
        <button onClick={() => setShowImportModal(true)} className="managegradebook-action-btn managegradebook-import-btn"><Upload size={18} />Import Excel Grade</button>
        <button onClick={handleRevertUpload} className="managegradebook-action-btn managegradebook-revert-btn"><RotateCcw size={18} />Revert Upload</button>
      </div>

      <div className="managegradebook-students-grid">
        {filteredStudents.map((student) => (
          <div key={student.id} className="managegradebook-student-card">
            <div className="managegradebook-student-card-header">
              <div className="managegradebook-student-info">
                <h3 className="managegradebook-student-code">{student.studentNumber}</h3>
                <p className="managegradebook-student-name">{student.studentName}</p>
              </div>
              <button onClick={() => openManageGradeModal(student)} className="managegradebook-manage-btn"><Edit2 size={16} />Manage</button>
            </div>
            <div className="managegradebook-student-divider"></div>
            
            <div className="managegradebook-grades-row">
              <div className="managegradebook-grade-item"><span className="managegradebook-grade-label">Prelim</span><span className="managegradebook-grade-value">{student.prelim || '—'}</span></div>
              <div className="managegradebook-grade-item"><span className="managegradebook-grade-label">Midterm</span><span className="managegradebook-grade-value">{student.midterm || '—'}</span></div>
              <div className="managegradebook-grade-item"><span className="managegradebook-grade-label">Prefinals</span><span className="managegradebook-grade-value">{student.prefinals || '—'}</span></div>
              <div className="managegradebook-grade-item"><span className="managegradebook-grade-label">Finals</span><span className="managegradebook-grade-value">{student.finals || '—'}</span></div>
            </div>

            <div className="managegradebook-student-divider"></div>
            
            <div className="managegradebook-final-row">
              <span className="managegradebook-final-label">Final Grade</span>
              <span className="managegradebook-final-value">{student.finalGrade ? student.finalGrade.toFixed(2) : '—'}</span>
            </div>
          </div>
        ))}
      </div>

      {showImportModal && (
        <div className="managegradebook-modal-overlay">
          <div className="managegradebook-modal-content">
            <div className="managegradebook-modal-body">
              <h2 className="managegradebook-modal-title">Import Excel Grade</h2>
              <div className="managegradebook-import-reminder">
                <AlertCircle size={20} className="managegradebook-reminder-icon" />
                <p className="managegradebook-reminder-text">This only works with the provided excel template. Make sure to double check the name and grades of students before importing.</p>
              </div>
              <div className="managegradebook-file-upload">
                <input type="file" accept=".xlsx,.xls" className="managegradebook-file-input" />
              </div>
              <div className="managegradebook-modal-actions">
                <button onClick={() => setShowImportModal(false)} className="managegradebook-button managegradebook-button-secondary">Cancel</button>
                <button onClick={handleImportExcel} className="managegradebook-button managegradebook-button-primary"><Upload size={18} className="managegradebook-button-icon" />Import</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showManageGradeModal && (
        <div className="managegradebook-modal-overlay">
          <div className="managegradebook-modal-content">
            <div className="managegradebook-modal-body">
              <h2 className="managegradebook-modal-title">Manage Grades - {selectedStudent?.studentName}</h2>
              <form onSubmit={handleGradeSubmit}>
                <div className="managegradebook-form-row">
                  <div className="managegradebook-form-group"><label className="managegradebook-form-label">Prelim</label><input type="number" step="0.01" min="0" max="100" value={gradeForm.prelim} onChange={(e) => setGradeForm({...gradeForm, prelim: e.target.value})} className="managegradebook-form-input" placeholder="Enter grade" /></div>
                  <div className="managegradebook-form-group"><label className="managegradebook-form-label">Midterm</label><input type="number" step="0.01" min="0" max="100" value={gradeForm.midterm} onChange={(e) => setGradeForm({...gradeForm, midterm: e.target.value})} className="managegradebook-form-input" placeholder="Enter grade" /></div>
                </div>
                <div className="managegradebook-form-row">
                  <div className="managegradebook-form-group"><label className="managegradebook-form-label">Pre-Finals</label><input type="number" step="0.01" min="0" max="100" value={gradeForm.prefinals} onChange={(e) => setGradeForm({...gradeForm, prefinals: e.target.value})} className="managegradebook-form-input" placeholder="Enter grade" /></div>
                  <div className="managegradebook-form-group"><label className="managegradebook-form-label">Finals</label><input type="number" step="0.01" min="0" max="100" value={gradeForm.finals} onChange={(e) => setGradeForm({...gradeForm, finals: e.target.value})} className="managegradebook-form-input" placeholder="Enter grade" /></div>
                </div>
                <div className="managegradebook-modal-actions">
                  <button type="button" onClick={() => setShowManageGradeModal(false)} className="managegradebook-button managegradebook-button-secondary">Cancel</button>
                  <button type="submit" className="managegradebook-button managegradebook-button-primary"><Save size={18} className="managegradebook-button-icon" />Save Grades</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return currentView === 'list' ? renderListView() : renderGradesView();
};

export default ManageGradebook;